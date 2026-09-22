import { useCallback, useEffect, useRef, useState } from 'react';
import { useMeetingStore } from '../../zustand/stores/useMeetingStore';

export const useMeetingHeartbeat = (onServerEndCall?: () => void) => {
  const { appointmentId, callState, remoteParticipantId } = useMeetingStore();

  const callTimerStartedAt = useRef<string | null>(null);
  const callElapsedSeconds = useRef<number>(0);
  const callTimerPaused = useRef<boolean>(false);
  const isHeartbeatPendingRef = useRef<boolean>(false);

  const [heartbeatData, setHeartbeatData] = useState<any | null>(null);

  // Both Doctor AND Patient must be connected for heartbeat to fire
  const isBothConnected =
    callState === 'CONNECTED' && Boolean(remoteParticipantId) && Boolean(appointmentId);

  const applyHeartbeatResponse = useCallback(
    (data: any) => {
      if (!data) return;

      setHeartbeatData(data);

      if (typeof data.call_timer_paused === 'boolean') {
        callTimerPaused.current = data.call_timer_paused;
      }

      if (typeof data.call_elapsed_seconds === 'number' && data.call_elapsed_seconds > 0) {
        callElapsedSeconds.current = data.call_elapsed_seconds;
      }

      if (data.appointment_status === 'completed' || data.appointment_status === 'cancelled') {
        onServerEndCall?.();
      }
    },
    [onServerEndCall]
  );

  const sendHeartbeatOnce = useCallback(
    async (opts?: { paused?: boolean }) => {
      if (!isBothConnected || isHeartbeatPendingRef.current) {
        return;
      }
      isHeartbeatPendingRef.current = true;

      try {
        if (!callTimerStartedAt.current) {
          callTimerStartedAt.current = new Date().toISOString();
        }

        // Calculate accurate elapsed seconds based on call start timestamp
        if (callTimerStartedAt.current && !callTimerPaused.current) {
          const startedMs = Date.parse(callTimerStartedAt.current);
          if (!isNaN(startedMs)) {
            callElapsedSeconds.current = Math.max(0, Math.floor((Date.now() - startedMs) / 1000));
          }
        }

        const payload = {
          appointment_id: appointmentId!,
          role: 'doctor',
          call_timer_started_at: callTimerStartedAt.current,
          call_elapsed_seconds: Math.floor(callElapsedSeconds.current),
          call_timer_paused: opts?.paused ?? callTimerPaused.current,
        };

        // const res = await sendHeartbeatMutation.mutateAsync(payload);
        // const responseData = res?.data || (res as any);
        // applyHeartbeatResponse(responseData);
      } catch (err) {
        console.warn('[Heartbeat Error]:', err);
      } finally {
        isHeartbeatPendingRef.current = false;
      }
    },
    [appointmentId, isBothConnected, applyHeartbeatResponse]
  );

  const sendHeartbeatOnceRef = useRef(sendHeartbeatOnce);
  useEffect(() => {
    sendHeartbeatOnceRef.current = sendHeartbeatOnce;
  }, [sendHeartbeatOnce]);

  // 30-Second Interval timer loop - Runs ONLY when BOTH doctor and patient are connected
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (isBothConnected) {
      if (!callTimerStartedAt.current) {
        callTimerStartedAt.current = new Date().toISOString();
      }

      // Initial immediate trigger
      sendHeartbeatOnceRef.current();

      intervalId = setInterval(() => {
        sendHeartbeatOnceRef.current();
      }, 30000); // 30 seconds gap
    } else {
      // Pause/Stop interval when patient leaves or call drops out of CONNECTED
      if (callState === 'ENDED' || callState === 'IDLE' || callState === 'ERROR') {
        callTimerStartedAt.current = null;
        callElapsedSeconds.current = 0;
        callTimerPaused.current = false;
        setHeartbeatData(null);
      }
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isBothConnected, callState]);

  return {
    sendHeartbeatOnce,
    callTimerStartedAt,
    callElapsedSeconds,
    callTimerPaused,
    heartbeatData,
    isBothConnected,
  };
};

export default useMeetingHeartbeat;
