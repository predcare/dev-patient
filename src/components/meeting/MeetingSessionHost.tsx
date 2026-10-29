import { MeetingConsumer, MeetingProvider } from '@videosdk.live/react-native-sdk';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Platform } from 'react-native';
import {
  MEETING_NETWORK_LEAVE_CODES,
  MEETING_SDK_RECOVERY_MS,
} from '../../config/meeting.constants';
import MeetingStageOverlay from '../../Features/Dashboard/MeetingScreen/Components/MeetingStageOverlay';
import { stopStream, takePendingTracks } from '../../hooks/commons/meeting/meetingMediaTracks';
import { logMeetingRecovery } from '../../hooks/commons/meeting/meetingRecoveryLog';
import { useRegisterMeetingLeave } from '../../hooks/commons/meeting/meetingSessionLeave';
import {
  openMeetingStatusOnce,
  resetMeetingStatusGuard,
} from '../../hooks/commons/meeting/openMeetingStatus';
import useAdaptiveVideo from '../../hooks/commons/meeting/useAdaptiveVideo';
import useAndroidCallForegroundService from '../../hooks/commons/meeting/useAndroidCallForegroundService';
import useAndroidPipCameraRestore from '../../hooks/commons/meeting/useAndroidPipCameraRestore';
import useAndroidPipLifecycle from '../../hooks/commons/meeting/useAndroidPipLifecycle';
import useCallQualityMonitor from '../../hooks/commons/meeting/useCallQualityMonitor';
import useMeetingAppState from '../../hooks/commons/meeting/useMeetingAppState';
import useMeetingCaptureHandoff from '../../hooks/commons/meeting/useMeetingCaptureHandoff';
import { useMeetingCountdownTicker } from '../../hooks/commons/meeting/useMeetingCountdown';
import useMeetingParticipants from '../../hooks/commons/meeting/useMeetingParticipants';
import useMeetingReconnect from '../../hooks/commons/meeting/useMeetingReconnect';
import usePipRemoteTrack from '../../hooks/commons/meeting/usePipRemoteTrack';
import NativePip from '../../native/NativePip';
import { useAuthStore } from '../../zustand/stores/useAuthStore';
import useMeetingStore from '../../zustand/stores/useMeetingStore';
import AndroidPipStage from './AndroidPipStage';
import InAppPipWindow from './InAppPipWindow';

const MeetingSessionController: React.FC = () => {
  useRegisterMeetingLeave();
  useMeetingAppState();
  useMeetingParticipants();
  usePipRemoteTrack();
  useMeetingCountdownTicker();
  useAndroidPipLifecycle();
  useMeetingCaptureHandoff();
  useAndroidPipCameraRestore();
  useCallQualityMonitor();
  useAdaptiveVideo();
  const pipMode = useMeetingStore(state => state.pipMode);

  if (pipMode === 'IN_APP_PIP') {
    return <InAppPipWindow />;
  }

  // NATIVE_PIP draws nothing on iOS: the system window is the video. Android's PiP window
  // shrinks the activity itself, so it gets a dedicated compact layout. This component stays
  // mounted either way so the meeting hooks above keep running.
  if (pipMode === 'NATIVE_PIP' && Platform.OS === 'android') {
    return <AndroidPipStage />;
  }

  if (pipMode === 'NORMAL') {
    return <MeetingStageOverlay />;
  }

  return null;
};

export const MeetingSessionHost: React.FC = () => {
  // Lives outside the provider so it survives the remount on rejoin.
  const hasConnectedRef = useRef(false);
  const sdkRecoveryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const callInfo = useMeetingStore(state => state.callInfo);
  const sessionKey = useMeetingStore(state => state.sessionKey);
  const isFrontCamera = useMeetingStore(state => state.isFrontCamera);
  const setCallState = useMeetingStore(state => state.setCallState);
  const userData = useAuthStore((state) => state.userData)

  // Outside the provider: rejoin remounts the provider, and neither hook needs the SDK.
  useMeetingReconnect();
  useAndroidCallForegroundService();

  const token = callInfo?.token;
  const meetingId = callInfo?.meetingId;

  const patientParticipantId = userData?.patient_id
    ? `patient_${userData.patient_id}`
    : userData?.id
      ? `patient_${userData.id}`
      : 'patient_guest';
  const patientDisplayName = userData?.name || 'Patient';
  const sessionKeyId = `${meetingId}_${patientParticipantId}_${sessionKey}`;

  // Tracks opened by join / rejoin are handed to the provider once per session.
  // Mic and camera state are read at mount on purpose: the SDK only uses them at join.
  const initialMedia = useMemo(() => {
    const { isMuted, isCamOn } = useMeetingStore.getState();
    const { camera, mic } = takePendingTracks();
    if (!isCamOn) stopStream(camera);
    return {
      micEnabled: !isMuted,
      webcamEnabled: isCamOn,
      cameraTrack: isCamOn ? camera : undefined,
      micTrack: mic,
    };
    // Recompute only when a new session starts (new meeting or rejoin).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId, sessionKey]);

  const clearRecoveryTimer = useCallback(() => {
    if (sdkRecoveryTimerRef.current) clearTimeout(sdkRecoveryTimerRef.current);
    sdkRecoveryTimerRef.current = null;
  }, []);

  // If the SDK has not recovered on its own, hand over to useMeetingReconnect (fresh session).
  const armRecoveryTimer = useCallback(() => {
    if (sdkRecoveryTimerRef.current) return;
    sdkRecoveryTimerRef.current = setTimeout(() => {
      sdkRecoveryTimerRef.current = null;
      const { callState, isEndRequested } = useMeetingStore.getState();
      if (!isEndRequested && callState === 'RECONNECTING') setCallState('DISCONNECTED');
    }, MEETING_SDK_RECOVERY_MS);
  }, [setCallState]);

  useEffect(() => {
    hasConnectedRef.current = false;
    return clearRecoveryTimer;
  }, [meetingId, clearRecoveryTimer]);

  useEffect(() => {
    if (meetingId) {
      NativePip.setMeetingScreenState(true);
    } else {
      NativePip.setMeetingScreenState(false);
    }
    return () => {
      NativePip.setMeetingScreenState(false);
    };
  }, [meetingId]);

  if (!token || !meetingId) {
    return null;
  }

  return (
    <MeetingProvider
      key={sessionKeyId}
      config={{
        meetingId,
        micEnabled: initialMedia.micEnabled,
        webcamEnabled: initialMedia.webcamEnabled,
        customCameraVideoTrack: initialMedia.cameraTrack,
        customMicrophoneAudioTrack: initialMedia.micTrack,
        participantId: patientParticipantId,
        name: patientDisplayName,
        defaultCamera: isFrontCamera ? 'front' : 'back',
        maxResolution: 'hd',
        // Publish several layers so the doctor app can step down on a weak link.
        multiStream: true,
        preferredProtocol: 'UDP_OVER_TCP',
        mode: 'SEND_AND_RECV',
        debugMode: false,
        notification: {
          title: 'PredCare Consultation',
          message: 'Video consultation in progress',
        },
        codecSwitchEnabled: true
      }}
      token={token}
      joinWithoutUserInteraction={true}
    >
      <MeetingConsumer
        onMeetingJoined={() => {
          resetMeetingStatusGuard();
          clearRecoveryTimer();
          const state = useMeetingStore.getState();
          state.setRejoinAttempt(0);
          // A new session starts clean: old limitations never get a "resolved" event.
          state.resetCallQuality();
          if (hasConnectedRef.current && state.doctorParticipantId) {
            // Rejoined after a drop and the doctor is still in the room.
            setCallState('CONNECTED');
          } else {
            setCallState('WAITING_FOR_DOCTOR');
          }
          hasConnectedRef.current = true;
        }}
        onMeetingLeft={reason => {
          clearRecoveryTimer();
          const { isEndRequested } = useMeetingStore.getState();
          const isNetworkDrop = MEETING_NETWORK_LEAVE_CODES.includes(Number(reason?.code));
          if (!isEndRequested && hasConnectedRef.current && isNetworkDrop) {
            // Dropped, not ended: useMeetingReconnect takes over.
            setCallState('DISCONNECTED');
            return;
          }
          openMeetingStatusOnce();
        }}
        onError={({ code, message }) => {
          console.warn(`[VideoSDK] Meeting error (${code}): ${message}`);
        }}
        onQualityLimitation={({ type, state }) => {
          // Describes the patient's upload encoder only; each type is detected / resolved on its own.
          logMeetingRecovery('quality limitation', { type, state });
          useMeetingStore.getState().setQualityLimitationEvent(type, state === 'detected');
        }}
        onMeetingStateChanged={({ state }) => {
          const { callState, isEndRequested, doctorParticipantId } = useMeetingStore.getState();
          if (callState === 'ENDED') return;

          // Before the first connect, keep the old behaviour: a failure ends the call.
          if (!hasConnectedRef.current) {
            if (state === 'CONNECTING') {
              setCallState('CONNECTING');
            } else if (state === 'CONNECTED') {
              hasConnectedRef.current = true;
              setCallState('CONNECTED');
            } else if (state === 'FAILED' || state === 'CLOSED' || state === 'DISCONNECTED') {
              setCallState('ENDED');
            }
            return;
          }

          if (state === 'CONNECTING') {
            setCallState('RECONNECTING');
            armRecoveryTimer();
          } else if (state === 'CONNECTED') {
            clearRecoveryTimer();
            if (callState === 'RECONNECTING' || callState === 'DISCONNECTED') {
              // Readings from before the drop no longer apply.
              useMeetingStore.getState().resetCallQuality();
            }
            setCallState(doctorParticipantId ? 'CONNECTED' : 'WAITING_FOR_DOCTOR');
          } else if (state === 'FAILED' || state === 'DISCONNECTED') {
            if (isEndRequested) {
              setCallState('ENDED');
            } else {
              setCallState('RECONNECTING');
              armRecoveryTimer();
            }
          } else if (state === 'CLOSING' || state === 'CLOSED') {
            // Only an intentional end closes the call here; onMeetingLeft decides the rest.
            if (isEndRequested) setCallState('ENDED');
          }
        }}
      >
        {() => <MeetingSessionController />}
      </MeetingConsumer>
    </MeetingProvider>
  );
};

export default MeetingSessionHost;
