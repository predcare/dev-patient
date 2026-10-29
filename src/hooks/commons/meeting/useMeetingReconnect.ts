import { useCallback, useEffect, useRef } from 'react';
import { MEETING_REJOIN_BACKOFF_MS } from '../../../config/meeting.constants';
import { useAlertStore } from '../../../zustand/stores/useAlertStore';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';
import useNetworkStore from '../../../zustand/stores/useNetworkStore';
import { useGetToken } from '../../react-query/appointments/appointments.hooks';
import { createCameraTrack, createMicTrack, setPendingTracks } from './meetingMediaTracks';
import { openMeetingStatusOnce } from './openMeetingStatus';

const isClientError = (error: unknown) => {
  const status = (error as { response?: { status?: number } })?.response?.status;
  return !!status && status >= 400 && status < 500;
};

/**
 * Mounted in MeetingSessionHost, outside the provider (the provider is remounted on rejoin).
 * While the call is DISCONNECTED and the device is online, fetches a fresh token and
 * remounts the session, with backoff. Gives up to Consultation Completed.
 */
export const useMeetingReconnect = () => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);

  const callState = useMeetingStore(state => state.callState);
  const isOffline = useNetworkStore(state => state.isOffline);
  const { mutateAsync: getToken } = useGetToken();

  const giveUp = useCallback(() => {
    useAlertStore
      .getState()
      .showInfo('Could not reconnect to the consultation.', 'Connection lost', () => {
        openMeetingStatusOnce();
      });
  }, []);

  const rejoin = useCallback(async () => {
    const store = useMeetingStore.getState();
    if (inFlightRef.current || store.isEndRequested || !store.appointmentId) return;
    if (store.callState !== 'DISCONNECTED') return;
    if (useNetworkStore.getState().isOffline) return; // wait for NetInfo to report online

    inFlightRef.current = true;
    const attempt = store.rejoinAttempt + 1;
    store.setRejoinAttempt(attempt);
    try {
      const res = await getToken({ appointmentId: String(store.appointmentId) });
      if (!res?.success || !res?.data?.token || !res?.data?.meeting_id) {
        throw new Error('Missing video session token');
      }
      const latest = useMeetingStore.getState();
      if (latest.isEndRequested || latest.callState !== 'DISCONNECTED') return;

      const [camera, mic] = await Promise.all([
        latest.isCamOn ? createCameraTrack(latest.sendTier).catch(() => undefined) : undefined,
        createMicTrack().catch(() => undefined),
      ]);
      setPendingTracks({ camera, mic });
      latest.rejoinCallInfo({
        token: res.data.token,
        meetingId: res.data.meeting_id,
        callElapsedSeconds: res.data.appointment?.call_elapsed_seconds,
      });
    } catch (error) {
      // A 4xx means the appointment is closed or time is up: stop at once.
      if (isClientError(error) || attempt >= MEETING_REJOIN_BACKOFF_MS.length) {
        giveUp();
        return;
      }
      timerRef.current = setTimeout(rejoin, MEETING_REJOIN_BACKOFF_MS[attempt - 1]);
    } finally {
      inFlightRef.current = false;
    }
  }, [getToken, giveUp]);

  // Start (or continue) rejoining while DISCONNECTED; re-runs when the network comes back.
  useEffect(() => {
    if (callState !== 'DISCONNECTED' || isOffline) return;
    const attempt = useMeetingStore.getState().rejoinAttempt;
    timerRef.current = setTimeout(rejoin, MEETING_REJOIN_BACKOFF_MS[attempt] ?? 15000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [callState, isOffline, rejoin]);

  return { rejoin };
};

export default useMeetingReconnect;
