import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import NativePip from '../../../native/NativePip';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';
import { restoreMeetingWebcam } from './meetingCaptureHandoff';

const RESTORE_COOLDOWN_MS = 1200;

const canRestoreWebcam = () => {
  const state = useMeetingStore.getState();
  if (Platform.OS !== 'android') {
    return false;
  }
  if (!state.callInfo?.meetingId) {
    return false;
  }
  if (!state.isCamOn) {
    return false;
  }
  if (state.isCameraPausedForCapture) {
    return false;
  }
  if (state.callState === 'IDLE' || state.callState === 'ENDED') {
    return false;
  }
  return true;
};

/** Android only: after WhatsApp / system Camera closes, rebuild the native PiP webcam. */
export const useAndroidPipCameraRestore = () => {
  const pipMode = useMeetingStore(state => state.pipMode);
  const interruptedRef = useRef(false);
  const restoreInFlightRef = useRef(false);
  const cooldownUntilRef = useRef(0);
  const pipModeRef = useRef(pipMode);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const restoreIfNeeded = async () => {
      if (!interruptedRef.current) {
        return;
      }
      if (restoreInFlightRef.current) {
        return;
      }
      if (Date.now() < cooldownUntilRef.current) {
        return;
      }
      if (!canRestoreWebcam()) {
        if (!useMeetingStore.getState().isCamOn) {
          interruptedRef.current = false;
        }
        return;
      }

      restoreInFlightRef.current = true;
      try {
        await restoreMeetingWebcam();
        interruptedRef.current = false;
        cooldownUntilRef.current = Date.now() + RESTORE_COOLDOWN_MS;
      } catch (e) {
        console.warn('[useAndroidPipCameraRestore] restore error:', e);
      } finally {
        restoreInFlightRef.current = false;
      }
    };

    const unavailableSub = NativePip.addAndroidCameraUnavailableListener(() => {
      if (restoreInFlightRef.current || Date.now() < cooldownUntilRef.current) {
        return;
      }
      const state = useMeetingStore.getState();
      if (!state.callInfo?.meetingId || !state.isCamOn || state.isCameraPausedForCapture) {
        return;
      }
      if (state.callState === 'IDLE' || state.callState === 'ENDED') {
        return;
      }
      if (state.pipMode !== 'NATIVE_PIP') {
        return;
      }
      interruptedRef.current = true;
    });

    const availableSub = NativePip.addAndroidCameraAvailableListener(() => {
      if (restoreInFlightRef.current) {
        return;
      }
      void restoreIfNeeded();
    });

    return () => {
      unavailableSub?.remove();
      availableSub?.remove();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const prev = pipModeRef.current;
    pipModeRef.current = pipMode;
    if (prev === 'NATIVE_PIP' && pipMode === 'NORMAL' && interruptedRef.current) {
      if (restoreInFlightRef.current) {
        return;
      }
      restoreInFlightRef.current = true;
      void restoreMeetingWebcam()
        .then(() => {
          interruptedRef.current = false;
          cooldownUntilRef.current = Date.now() + RESTORE_COOLDOWN_MS;
        })
        .finally(() => {
          restoreInFlightRef.current = false;
        });
    }
  }, [pipMode]);
};

export default useAndroidPipCameraRestore;
