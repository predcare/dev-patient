import { useMeeting, useParticipant } from '@videosdk.live/react-native-sdk';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { CALL_QUALITY_SAMPLE_MS } from '../../../config/meeting.constants';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';
import useNetworkStore from '../../../zustand/stores/useNetworkStore';
import {
  applyHysteresis,
  classifySample,
  lossRatio,
  sumStats,
  THysteresis,
  TStatsRow,
  TStatsTotals,
} from './callQuality.utils';

type TSide = 'up' | 'down';

type TSampleParticipant = {
  participant?: unknown;
  webcamOn?: boolean;
  getVideoStats?: () => Promise<unknown[]>;
  getAudioStats?: () => Promise<unknown[]>;
};

const freshHysteresis = (): THysteresis => ({ current: 'GOOD', candidate: null, streak: 0 });

/**
 * Samples the patient's upload (local) and the doctor's stream (remote) every few seconds and
 * writes a smoothed GOOD / FAIR / WEAK / OFFLINE per direction to the store. Uses audio stats
 * when there is no video (camera off, or the doctor's video is not consumed in audio-only).
 */
export const useCallQualityMonitor = () => {
  const hysteresisRef = useRef<Record<TSide, THysteresis>>({
    up: freshHysteresis(),
    down: freshHysteresis(),
  });
  // Keyed by side and kind, so switching between video and audio stats never mixes totals.
  const previousRef = useRef<Record<string, TStatsTotals | null>>({});

  const doctorParticipantId = useMeetingStore(state => state.doctorParticipantId);
  const setCallQualities = useMeetingStore(state => state.setCallQualities);
  const { localParticipant } = useMeeting({});
  const local = useParticipant(localParticipant?.id || '');
  const remote = useParticipant(doctorParticipantId || '');

  // Refs keep the interval alive across SDK updates (useParticipant returns new objects).
  const localRef = useRef(local);
  const remoteRef = useRef(remote);
  localRef.current = local;
  remoteRef.current = remote;

  useEffect(() => {
    let cancelled = false;

    /** Loss and RTT since the last sample, or null when the side has no stats yet. */
    const readSide = async (side: TSide, p: TSampleParticipant | undefined) => {
      if (!p?.participant || typeof p.getAudioStats !== 'function') return null;
      try {
        let kind = 'video';
        let rows = p.webcamOn && p.getVideoStats ? await p.getVideoStats() : [];
        if (!rows?.length) {
          kind = 'audio';
          rows = await p.getAudioStats();
        }
        if (!rows?.length) return null;
        const key = `${side}:${kind}`;
        const totals = sumStats(rows as unknown as TStatsRow[]);
        const loss = lossRatio(totals, previousRef.current[key] ?? null);
        previousRef.current[key] = totals;
        return { loss, rtt: totals.rtt };
      } catch {
        // a missed sample is ignored
        return null;
      }
    };

    const sample = async () => {
      const { isOffline } = useNetworkStore.getState();
      const { callState, pipMode } = useMeetingStore.getState();
      // Keep sampling in native PiP (the call is visible); skip a plain background app.
      if (AppState.currentState !== 'active' && pipMode !== 'NATIVE_PIP') return;

      if (isOffline || callState === 'RECONNECTING' || callState === 'DISCONNECTED') {
        // Restart from GOOD, so the first good sample after the reconnect shows a good link
        // right away instead of climbing out of OFFLINE for several samples.
        hysteresisRef.current = { up: freshHysteresis(), down: freshHysteresis() };
        previousRef.current = {};
        setCallQualities('OFFLINE', 'OFFLINE');
        return;
      }

      const [upReading, downReading] = await Promise.all([
        readSide('up', localRef.current as TSampleParticipant),
        readSide('down', remoteRef.current as TSampleParticipant),
      ]);
      if (cancelled) return;

      // With no stats for a side (yet), treat it as fine.
      const up = applyHysteresis(
        hysteresisRef.current.up,
        upReading ? classifySample(upReading.loss, upReading.rtt) : 'GOOD',
      );
      const down = applyHysteresis(
        hysteresisRef.current.down,
        downReading ? classifySample(downReading.loss, downReading.rtt) : 'GOOD',
      );
      hysteresisRef.current = { up, down };
      setCallQualities(up.current, down.current);
    };

    const intervalId = setInterval(sample, CALL_QUALITY_SAMPLE_MS);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [setCallQualities]);
};

export default useCallQualityMonitor;
