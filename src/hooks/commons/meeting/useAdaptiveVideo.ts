import { useMeeting, useParticipant } from '@videosdk.live/react-native-sdk';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import {
  CONSUME_MISSING_WARN_MS,
  CONSUME_RETRY_MS,
  QUALITY_LIMITATION_STALE_MS,
  VIDEO_TIER_TICK_MS,
} from '../../../config/meeting.constants';
import { showInfoToast, showWarningToast } from '../../../lib/common/toast.utils';
import { MeetingCallState, TVideoTier } from '../../../zustand/interfaces/meeting.interfaces';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';
import {
  advanceTierSince,
  decideReceiveTier,
  decideSendTier,
  freshTierSince,
  readTierClocks,
} from './callQuality.utils';
import { createCameraTrack, stopStream } from './meetingMediaTracks';
import { logMeetingRecovery, warnMeetingRecovery } from './meetingRecoveryLog';

const RECONNECT_STATES: MeetingCallState[] = ['RECONNECTING', 'DISCONNECTED'];

/**
 * Two ladders, one per direction:
 * - receive (`videoTier`): what to request from the doctor, from download stats only.
 *   Only this one may reach audio-only and stop the doctor's video.
 * - send (`sendTier`): what the patient's camera sends, from upload stats and the SDK's
 *   quality limitation (which describes the upload encoder only).
 * Also keeps the doctor's video subscribed: retries consume until the video arrives.
 */
export const useAdaptiveVideo = () => {
  const toastedRef = useRef<Set<TVideoTier>>(new Set());
  // The session's first camera track was created at the current send tier.
  const appliedSendTierRef = useRef(useMeetingStore.getState().sendTier);
  const stoppedConsumingRef = useRef(false);

  const videoTier = useMeetingStore(state => state.videoTier);
  const sendTier = useMeetingStore(state => state.sendTier);
  const pipMode = useMeetingStore(state => state.pipMode);
  const callState = useMeetingStore(state => state.callState);
  const isCamOn = useMeetingStore(state => state.isCamOn);
  const isCameraPausedForCapture = useMeetingStore(state => state.isCameraPausedForCapture);
  const doctorParticipantId = useMeetingStore(state => state.doctorParticipantId);
  const bumpCameraSessionEpoch = useMeetingStore(state => state.bumpCameraSessionEpoch);
  const bumpRemoteVideoEpoch = useMeetingStore(state => state.bumpRemoteVideoEpoch);
  const { changeWebcam } = useMeeting({});
  const remote = useParticipant(doctorParticipantId || '');

  const changeWebcamRef = useRef(changeWebcam);
  const remoteRef = useRef(remote);
  changeWebcamRef.current = changeWebcam;
  remoteRef.current = remote;

  const remoteWebcamOn = Boolean(remote?.webcamOn);
  const remoteTrackId = remote?.webcamStream?.track?.id ?? null;
  const wantVideo = videoTier !== 'audio';

  // 1. Decide both tiers. Reads the store on each tick, so the interval is never restarted.
  useEffect(() => {
    let receiveSince = freshTierSince();
    let sendSince = freshTierSince();

    const tick = () => {
      const state = useMeetingStore.getState();
      const now = Date.now();

      // Drop a limitation the SDK never resolved (e.g. it ended with a reconnect).
      if (
        state.qualityLimitationAt != null &&
        now - state.qualityLimitationAt >= QUALITY_LIMITATION_STALE_MS &&
        state.uplinkQuality === 'GOOD'
      ) {
        logMeetingRecovery('limitation stale, cleared', { limitations: state.qualityLimitations });
        state.clearQualityLimitations();
      }

      // Receive ladder: download only.
      if (state.downlinkQuality === 'OFFLINE') {
        // Reconnect handles a drop; keep the tier and restart the clocks.
        receiveSince = freshTierSince();
      } else {
        receiveSince = advanceTierSince(
          receiveSince,
          { bad: state.downlinkQuality !== 'GOOD', weak: state.downlinkQuality === 'WEAK' },
          now,
        );
        const target = decideReceiveTier(state.videoTier, readTierClocks(receiveSince, now));
        if (target !== state.videoTier) {
          logMeetingRecovery('receive tier', {
            from: state.videoTier,
            to: target,
            downlink: state.downlinkQuality,
          });
          state.setVideoTier(target);
          // The next step up needs a fresh good period.
          receiveSince = { ...receiveSince, goodSince: now, notWeakSince: now };
        }
      }

      // Send ladder: upload stats plus the SDK's (upload) limitation.
      if (state.uplinkQuality === 'OFFLINE') {
        sendSince = freshTierSince();
      } else {
        const { bandwidth, congestion, cpu } = state.qualityLimitations;
        const isLimited = bandwidth || congestion;
        sendSince = advanceTierSince(
          sendSince,
          {
            bad: state.uplinkQuality !== 'GOOD' || isLimited,
            weak: state.uplinkQuality === 'WEAK' || isLimited,
          },
          now,
        );
        const target = decideSendTier(state.sendTier, readTierClocks(sendSince, now), cpu);
        if (target !== state.sendTier) {
          logMeetingRecovery('send tier', {
            from: state.sendTier,
            to: target,
            uplink: state.uplinkQuality,
            limitations: state.qualityLimitations,
          });
          state.setSendTier(target);
          sendSince = { ...sendSince, goodSince: now, notWeakSince: now };
        }
      }
    };

    tick();
    const intervalId = setInterval(tick, VIDEO_TIER_TICK_MS);
    return () => clearInterval(intervalId);
  }, []);

  // Runs before the swap below: a camera turned back on (CAM ON, capture handoff, restore)
  // is already created at the current send tier.
  useEffect(() => {
    if (isCamOn && !isCameraPausedForCapture) {
      appliedSendTierRef.current = useMeetingStore.getState().sendTier;
    }
  }, [isCamOn, isCameraPausedForCapture]);

  // 2. Outgoing camera follows the send tier
  useEffect(() => {
    if (sendTier === appliedSendTierRef.current) return;
    // Do not fight the Android capture handoff or swap the camera inside system PiP;
    // the swap runs once those end (the deps re-run this effect).
    if (!isCamOn || isCameraPausedForCapture) return;
    if (Platform.OS === 'android' && pipMode === 'NATIVE_PIP') return;

    let cancelled = false;
    createCameraTrack(sendTier)
      .then(async stream => {
        if (cancelled || !changeWebcamRef.current) {
          stopStream(stream);
          return;
        }
        await changeWebcamRef.current(stream);
        appliedSendTierRef.current = sendTier;
        bumpCameraSessionEpoch();
      })
      .catch(error => warnMeetingRecovery('change camera quality failed', { error: String(error) }));

    return () => {
      cancelled = true;
    };
  }, [sendTier, pipMode, isCamOn, isCameraPausedForCapture, bumpCameraSessionEpoch]);

  // 3a. Audio-only stops the doctor's video; leaving it asks for the video again at once.
  useEffect(() => {
    const p = remoteRef.current;
    if (!doctorParticipantId || !p) return;

    if (!wantVideo) {
      stoppedConsumingRef.current = true;
      p.stopConsumingWebcamStreams?.()
        .then(() => logMeetingRecovery('stop consuming doctor video'))
        .catch(error => warnMeetingRecovery('stop consuming failed', { error: String(error) }));
      return;
    }
    if (stoppedConsumingRef.current) {
      stoppedConsumingRef.current = false;
      // A failure here is retried by 3b until the video arrives.
      p.consumeWebcamStreams?.()
        .then(() => logMeetingRecovery('consume doctor video (audio-only exit)'))
        .catch(error => warnMeetingRecovery('consume failed (audio-only exit)', { error: String(error) }));
      bumpRemoteVideoEpoch();
    }
  }, [doctorParticipantId, wantVideo, bumpRemoteVideoEpoch]);

  // 3b. The doctor's camera is on but no video arrived (failed consume, network switch,
  //     reconnect): keep asking until it does. consumeWebcamStreams is safe to repeat.
  const isVideoMissing =
    wantVideo &&
    Boolean(doctorParticipantId) &&
    remoteWebcamOn &&
    !remoteTrackId &&
    !RECONNECT_STATES.includes(callState);

  useEffect(() => {
    if (!isVideoMissing) return;

    let cancelled = false;
    let attempt = 0;
    let warned = false;
    const startedAt = Date.now();
    let timerId: ReturnType<typeof setTimeout>;

    const run = async () => {
      const p = remoteRef.current;
      if (cancelled || !p?.consumeWebcamStreams) return;
      attempt += 1;
      try {
        await p.consumeWebcamStreams();
        logMeetingRecovery('consume retry sent', { attempt });
      } catch (error) {
        warnMeetingRecovery('consume retry failed', { attempt, error: String(error) });
      }
      if (cancelled) return;
      if (!warned && Date.now() - startedAt >= CONSUME_MISSING_WARN_MS) {
        warned = true;
        warnMeetingRecovery('doctor camera on but no video', { attempt });
      }
      timerId = setTimeout(run, CONSUME_RETRY_MS[Math.min(attempt, CONSUME_RETRY_MS.length - 1)]);
    };

    timerId = setTimeout(run, CONSUME_RETRY_MS[0]);
    return () => {
      cancelled = true;
      clearTimeout(timerId);
    };
  }, [isVideoMissing]);

  // 3c. After an SDK reconnect, ask for the video once more (the server's subscription may
  //     not have survived) and re-attach the views.
  const prevCallStateRef = useRef(callState);
  useEffect(() => {
    const prev = prevCallStateRef.current;
    prevCallStateRef.current = callState;
    if (!RECONNECT_STATES.includes(prev) || RECONNECT_STATES.includes(callState)) return;
    if (callState !== 'CONNECTED' && callState !== 'WAITING_FOR_DOCTOR') return;

    logMeetingRecovery('reconnected', { from: prev, to: callState, wantVideo });
    bumpRemoteVideoEpoch();
    if (!wantVideo) return;
    remoteRef.current?.consumeWebcamStreams?.().catch(error =>
      warnMeetingRecovery('consume after reconnect failed', { error: String(error) }),
    );
    // wantVideo is read for this transition only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callState, bumpRemoteVideoEpoch]);

  // 3d. Layer for the doctor's video
  useEffect(() => {
    const p = remoteRef.current;
    if (!wantVideo || !remoteWebcamOn || !remoteTrackId || typeof p?.setQuality !== 'function') {
      return;
    }
    // The PiP windows are small, so the high layer only costs bandwidth there.
    const quality =
      pipMode !== 'NORMAL' || videoTier === 'low' ? 'low' : videoTier === 'sd' ? 'med' : 'high';
    p.setQuality(quality).catch(error => {
      warnMeetingRecovery(`setQuality(${quality}) failed`, { error: String(error) });
    });
  }, [doctorParticipantId, wantVideo, videoTier, pipMode, remoteWebcamOn, remoteTrackId]);

  // 4. One toast per tier per call
  useEffect(() => {
    if (toastedRef.current.has(videoTier)) return;
    if (videoTier === 'low') {
      toastedRef.current.add(videoTier);
      showWarningToast('Weak connection. Video quality lowered to keep audio clear.');
    } else if (videoTier === 'audio') {
      toastedRef.current.add(videoTier);
      showInfoToast('Switched to audio only to keep the call going.');
    } else if (videoTier === 'hd' && toastedRef.current.size > 0) {
      toastedRef.current.clear();
      showInfoToast('Connection improved. Video restored.');
    }
  }, [videoTier]);
};

export default useAdaptiveVideo;
