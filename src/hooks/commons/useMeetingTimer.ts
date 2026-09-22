import { useEffect, useMemo, useRef, useState } from 'react';
import type { TCallState } from '../../zustand/stores/useMeetingStore';

const parseTimeToSeconds = (time: string): number => {
  const parts = time.split(':').map(Number);
  const h = parts[0] || 0;
  const m = parts[1] || 0;
  const s = parts[2] || 0;
  return h * 3600 + m * 60 + s;
};

const formatMMSS = (totalSeconds: number): string => {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

interface UseMeetingTimerResult {
  elapsedText: string;
  remainingText: string;
  remainingSeconds: number;
  isTimeUp: boolean;
}

export const useMeetingTimer = (
  callState: TCallState,
  startTime: string | null,
  endTime: string | null,
  callDurationSeconds: number = 0
): UseMeetingTimerResult => {
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalDuration = useMemo(
    () =>
      startTime && endTime
        ? Math.max(0, parseTimeToSeconds(endTime) - parseTimeToSeconds(startTime))
        : 0,
    [startTime, endTime]
  );

  const remainingAtStart = useMemo(
    () => Math.max(0, totalDuration - callDurationSeconds),
    [totalDuration, callDurationSeconds]
  );

  useEffect(() => {
    if (callState === 'CONNECTED') {
      intervalRef.current = setInterval(() => {
        setSessionElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [callState]);

  const totalElapsed = callDurationSeconds + sessionElapsed;
  const remaining = remainingAtStart - sessionElapsed;

  return {
    elapsedText: formatMMSS(totalElapsed),
    remainingText: totalDuration > 0 ? formatMMSS(remaining) : '--:--',
    remainingSeconds: totalDuration > 0 ? Math.max(0, remaining) : -1,
    isTimeUp: totalDuration > 0 && remaining <= 0,
  };
};
