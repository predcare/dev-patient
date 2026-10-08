import { Platform } from 'react-native';
import NativePip from '../../../native/NativePip';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';

type CaptureHandoffApi = {
  pauseForCapture: () => Promise<void>;
  resumeAfterCapture: () => Promise<void>;
  restoreWebcam: () => Promise<void>;
};

let handoffApi: CaptureHandoffApi | null = null;
let resumeInFlight: Promise<void> | null = null;
let safetyTimer: ReturnType<typeof setTimeout> | null = null;

const CAPTURE_SAFETY_MS = 120_000;

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export const registerMeetingCaptureHandoff = (api: CaptureHandoffApi | null) => {
  handoffApi = api;
};

const clearSafetyTimer = () => {
  if (!safetyTimer) {
    return;
  }
  clearTimeout(safetyTimer);
  safetyTimer = null;
};

const armSafetyTimer = (onTimeout: () => void) => {
  clearSafetyTimer();
  safetyTimer = setTimeout(onTimeout, CAPTURE_SAFETY_MS);
};

/** Android only: block system PiP so camera/gallery Activities do not steal the call. */
export const beginAndroidPickerGuard = async () => {
  if (Platform.OS !== 'android') {
    return;
  }

  useMeetingStore.getState().setIsCameraPausedForCapture(true);
  await NativePip.setSuppressAutoEnter(true);
  armSafetyTimer(() => {
    void endAndroidPickerGuard();
  });
};

export const endAndroidPickerGuard = async () => {
  if (Platform.OS !== 'android') {
    return;
  }

  clearSafetyTimer();
  useMeetingStore.getState().setIsCameraPausedForCapture(false);
  await NativePip.setSuppressAutoEnter(false);
};

/** Android only: release the meeting webcam so the system camera can open. */
export const pauseMeetingCameraForCapture = async () => {
  if (Platform.OS !== 'android') {
    return;
  }

  await beginAndroidPickerGuard();
  armSafetyTimer(() => {
    void resumeMeetingCameraAfterCapture();
  });

  try {
    if (handoffApi) {
      await handoffApi.pauseForCapture();
    } else {
      await delay(400);
    }
  } catch (e) {
    console.warn('[meetingCaptureHandoff] pause error:', e);
    await delay(400);
  }
};

/** Android only: turn the meeting webcam back on after the system camera closes. */
export const resumeMeetingCameraAfterCapture = async () => {
  if (Platform.OS !== 'android') {
    return;
  }
  if (resumeInFlight) {
    return resumeInFlight;
  }

  resumeInFlight = (async () => {
    try {
      if (handoffApi) {
        await handoffApi.resumeAfterCapture();
      }
    } catch (e) {
      console.warn('[meetingCaptureHandoff] resume error:', e);
    } finally {
      await endAndroidPickerGuard();
      resumeInFlight = null;
    }
  })();

  return resumeInFlight;
};

/**
 * Android only: rebuild the meeting webcam after another app (WhatsApp / system Camera)
 * stole the sensor. Does not wait for AppState active, so it works while still in native PiP.
 */
export const restoreMeetingWebcam = async () => {
  if (Platform.OS !== 'android') {
    return;
  }
  if (!handoffApi?.restoreWebcam) {
    return;
  }
  try {
    await handoffApi.restoreWebcam();
  } catch (e) {
    console.warn('[meetingCaptureHandoff] restoreWebcam error:', e);
  }
};
