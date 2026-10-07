import { useEffect, useMemo, useRef } from 'react';
import { showInfoToast } from '../../../lib/common/toast.utils';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';

const TWO_MINUTES_SECONDS = 120;


export const useMeetingCountdownTicker = (onTimeUp?: () => void) => {
  const doctorParticipantId = useMeetingStore(state => state.doctorParticipantId);
  const setRemainingSeconds = useMeetingStore(state => state.setRemainingSeconds);

  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;
  const twoMinToastShown = useRef(false);

  const bothConnected = Boolean(doctorParticipantId);

  useEffect(() => {
    if (!bothConnected) {
      return;
    }

    const notifyTwoMinPending = (seconds: number) => {
      if (twoMinToastShown.current || seconds <= 0 || seconds > TWO_MINUTES_SECONDS) {
        return;
      }
      twoMinToastShown.current = true;
      showInfoToast('2 min pending');
    };

    notifyTwoMinPending(useMeetingStore.getState().remainingSeconds);

    if (useMeetingStore.getState().remainingSeconds <= 0) {
      return;
    }

    const interval = setInterval(() => {
      const current = useMeetingStore.getState().remainingSeconds;
      if (current <= 1) {
        setRemainingSeconds(0);
        if (current > 0 && onTimeUpRef.current) {
          onTimeUpRef.current();
        }
        clearInterval(interval);
        return;
      }
      const next = current - 1;
      setRemainingSeconds(next);
      notifyTwoMinPending(next);
    }, 1000);

    return () => clearInterval(interval);
  }, [bothConnected, setRemainingSeconds]);
};

export const useMeetingCountdown = () => {
  const remainingSeconds = useMeetingStore(state => state.remainingSeconds);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(minutes)}:${pad(seconds)}`;
  }, [remainingSeconds]);

  const isWarning = remainingSeconds > 0 && remainingSeconds <= 300;
  const isUrgent = remainingSeconds > 0 && remainingSeconds <= 60;

  return {
    formattedTime,
    remainingSeconds,
    isWarning,
    isUrgent,
  };
};

export default useMeetingCountdown;
