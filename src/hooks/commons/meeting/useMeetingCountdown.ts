import { useEffect, useMemo, useRef } from 'react';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';

export const useMeetingCountdown = (onTimeUp?: () => void) => {
  const callInfo = useMeetingStore(state => state.callInfo);
  const callState = useMeetingStore(state => state.callState);
  const remainingSeconds = useMeetingStore(state => state.remainingSeconds);
  const setRemainingSeconds = useMeetingStore(state => state.setRemainingSeconds);

  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  // Initialize remaining seconds based on appointment info
  useEffect(() => {
    const apt = callInfo?.appointment;
    if (!apt) return;

    if (apt.appointmentDate && apt.endTime) {
      try {
        const endDateTimeStr = `${apt.appointmentDate}T${apt.endTime}`;
        const endTimestamp = new Date(endDateTimeStr).getTime();
        if (!isNaN(endTimestamp)) {
          const diffSeconds = Math.max(0, Math.floor((endTimestamp - Date.now()) / 1000));
          if (diffSeconds > 0) {
            setRemainingSeconds(diffSeconds);
            return;
          }
        }
      } catch (e) {
        console.warn('[useMeetingCountdown] Error parsing end time:', e);
      }
    }

    if (apt.slotDuration) {
      setRemainingSeconds(apt.slotDuration * 60);
    } else {
      setRemainingSeconds(600); // 10 minutes default fallback
    }
  }, [callInfo?.appointment, setRemainingSeconds]);

  // Active ticker
  useEffect(() => {
    if (callState !== 'CONNECTED' && callState !== 'WAITING_FOR_DOCTOR') {
      return;
    }

    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onTimeUpRef.current) {
            onTimeUpRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [callState, setRemainingSeconds]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(minutes)}:${pad(seconds)}`;
  }, [remainingSeconds]);

  const isWarning = remainingSeconds > 0 && remainingSeconds <= 300; // < 5 mins
  const isUrgent = remainingSeconds > 0 && remainingSeconds <= 60; // < 1 min

  return {
    formattedTime,
    remainingSeconds,
    isWarning,
    isUrgent,
  };
};

export default useMeetingCountdown;
