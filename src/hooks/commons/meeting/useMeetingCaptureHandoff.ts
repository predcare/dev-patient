import { useMeeting } from '@videosdk.live/react-native-sdk';
import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';
import { registerMeetingCaptureHandoff } from './meetingCaptureHandoff';

const CAMERA_RELEASE_MS = 400;
const CAMERA_REACQUIRE_MS = 250;

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const waitUntilAppActive = (timeoutMs = 3000) =>
  new Promise<void>(resolve => {
    if (AppState.currentState === 'active') {
      resolve();
      return;
    }

    let timeout: ReturnType<typeof setTimeout>;
    const sub = AppState.addEventListener('change', state => {
      if (state !== 'active') {
        return;
      }
      clearTimeout(timeout);
      sub.remove();
      resolve();
    });

    timeout = setTimeout(() => {
      sub.remove();
      resolve();
    }, timeoutMs);
  });

/** Android only: lets the image picker borrow the meeting camera, then restores it. */
export const useMeetingCaptureHandoff = () => {
  const { disableWebcam, enableWebcam } = useMeeting({});
  const bumpCameraSessionEpoch = useMeetingStore(state => state.bumpCameraSessionEpoch);
  const disabledForCaptureRef = useRef(false);
  const disableWebcamRef = useRef(disableWebcam);
  const enableWebcamRef = useRef(enableWebcam);

  disableWebcamRef.current = disableWebcam;
  enableWebcamRef.current = enableWebcam;

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const restoreWebcam = async () => {
      const { isCamOn, isCameraPausedForCapture } = useMeetingStore.getState();
      if (!isCamOn || isCameraPausedForCapture || !enableWebcamRef.current) {
        return;
      }

      await delay(CAMERA_REACQUIRE_MS);
      try {
        if (disableWebcamRef.current) {
          try {
            await disableWebcamRef.current();
          } catch {
            // Session may already be dead after another app stole the camera.
          }
          await delay(CAMERA_RELEASE_MS);
        }
        await enableWebcamRef.current();
        bumpCameraSessionEpoch();
      } catch (e) {
        console.warn('[useMeetingCaptureHandoff] restoreWebcam error:', e);
        try {
          await delay(300);
          await enableWebcamRef.current();
          bumpCameraSessionEpoch();
        } catch (retryErr) {
          console.warn('[useMeetingCaptureHandoff] restoreWebcam retry error:', retryErr);
        }
      }
    };

    registerMeetingCaptureHandoff({
      restoreWebcam,
      pauseForCapture: async () => {
        const { isCamOn } = useMeetingStore.getState();
        if (!isCamOn || !disableWebcamRef.current) {
          await delay(CAMERA_RELEASE_MS);
          return;
        }

        try {
          await disableWebcamRef.current();
          disabledForCaptureRef.current = true;
        } catch (e) {
          console.warn('[useMeetingCaptureHandoff] disableWebcam error:', e);
        }
        await delay(CAMERA_RELEASE_MS);
      },
      resumeAfterCapture: async () => {
        const { isCamOn } = useMeetingStore.getState();
        if (!isCamOn || !enableWebcamRef.current) {
          disabledForCaptureRef.current = false;
          return;
        }

        await waitUntilAppActive();
        await delay(CAMERA_REACQUIRE_MS);
        try {
          await enableWebcamRef.current();
          bumpCameraSessionEpoch();
        } catch (e) {
          console.warn('[useMeetingCaptureHandoff] enableWebcam error:', e);
          try {
            await delay(300);
            await enableWebcamRef.current();
            bumpCameraSessionEpoch();
          } catch (retryErr) {
            console.warn('[useMeetingCaptureHandoff] enableWebcam retry error:', retryErr);
          }
        } finally {
          disabledForCaptureRef.current = false;
        }
      },
    });

    return () => {
      registerMeetingCaptureHandoff(null);
    };
  }, [bumpCameraSessionEpoch]);
};

export default useMeetingCaptureHandoff;
