import { useEffect } from 'react';
import { AppState } from 'react-native';
import {
  CONNECTION_CHECK_MS,
  CONNECTION_PROBE_EVERY,
  CONNECTION_PROBE_TIMEOUT_MS,
  CONNECTION_SLOW_MS,
  CONNECTION_STABLE_AFTER,
  CONNECTION_UNSTABLE_AFTER,
} from '../../config/network.constants';
import { baseUrl } from '../../services/api/endpoints';
import useMeetingStore from '../../zustand/stores/useMeetingStore';
import useNetworkStore from '../../zustand/stores/useNetworkStore';
import { getLinkSignalCap } from './meeting/callQuality.utils';

/** Times a small HEAD request to the API server. Any response counts; only time matters. */
const probeIsSlow = async (): Promise<boolean> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONNECTION_PROBE_TIMEOUT_MS);
  const startedAt = Date.now();
  try {
    await fetch(baseUrl, {
      method: 'HEAD',
      headers: { 'Cache-Control': 'no-cache' },
      signal: controller.signal,
    });
    return Date.now() - startedAt > CONNECTION_SLOW_MS;
  } catch {
    return true;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Marks the connection unstable when it is online but too weak to work reliably:
 * a very weak link (wifi under 30 % or 2G), a slow / failing API probe, or a weak live call.
 * Mounted once, globally.
 */
export const useUnstableConnectionMonitor = () => {
  useEffect(() => {
    let tick = 0;
    let probeBad = false;
    let probeInFlight = false;
    let badStreak = 0;
    let goodStreak = 0;
    let cancelled = false;

    const evaluate = async () => {
      if (
        AppState.currentState !== 'active' &&
        useMeetingStore.getState().pipMode !== 'NATIVE_PIP'
      ) {
        return;
      }

      const network = useNetworkStore.getState();
      if (network.isOffline) {
        // The offline blocker handles this; start fresh when the connection returns.
        probeBad = false;
        badStreak = 0;
        goodStreak = 0;
        tick = 0;
        network.setIsUnstable(false);
        return;
      }

      if (tick % CONNECTION_PROBE_EVERY === 0 && !probeInFlight) {
        probeInFlight = true;
        probeBad = await probeIsSlow();
        probeInFlight = false;
        if (cancelled) return;
      }
      tick += 1;

      const linkCap = getLinkSignalCap(
        false,
        String(network.connectionType),
        network.wifiStrength,
        network.cellularGeneration
      );
      const meeting = useMeetingStore.getState();
      const isCallWeak = Boolean(meeting.callInfo?.meetingId) && meeting.networkQuality === 'WEAK';
      const isBad = linkCap <= 1 || probeBad || isCallWeak;

      if (isBad) {
        goodStreak = 0;
        badStreak += 1;
        if (badStreak >= CONNECTION_UNSTABLE_AFTER) network.setIsUnstable(true);
      } else {
        badStreak = 0;
        goodStreak += 1;
        if (goodStreak >= CONNECTION_STABLE_AFTER) network.setIsUnstable(false);
      }
    };

    evaluate();
    const intervalId = setInterval(evaluate, CONNECTION_CHECK_MS);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);
};

export default useUnstableConnectionMonitor;
