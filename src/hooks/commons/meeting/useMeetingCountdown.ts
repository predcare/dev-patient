import { useEffect, useMemo, useRef } from 'react';
import { AppState } from 'react-native';
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

    const startRemaining = useMeetingStore.getState().remainingSeconds;
    notifyTwoMinPending(startRemaining);

    if (startRemaining <= 0) {
      return;
    }

    // Count down from an end timestamp so slow or skipped ticks (background, busy JS thread) catch up.
    const endsAt = Date.now() + startRemaining * 1000;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const tick = () => {
      const current = useMeetingStore.getState().remainingSeconds;
      const next = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      if (next !== current) {
        setRemainingSeconds(next);
        notifyTwoMinPending(next);
      }
      if (next === 0) {
        if (intervalId) clearInterval(intervalId);
        intervalId = null;
        if (current > 0 && onTimeUpRef.current) {
          onTimeUpRef.current();
        }
      }
    };

    intervalId = setInterval(tick, 1000);
    const appStateSub = AppState.addEventListener('change', state => {
      if (state === 'active' && intervalId) tick();
    });

    return () => {
      if (intervalId) clearInterval(intervalId);
      appStateSub.remove();
    };
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
