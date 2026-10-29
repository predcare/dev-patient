import { MediaStream, useMeeting } from '@videosdk.live/react-native-sdk';
import { useCallback, useRef } from 'react';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';
import { createCameraTrack } from './meetingMediaTracks';

const TOGGLE_LOCK_MS = 400;

/** A camera track at the current video tier; undefined lets the SDK open its default camera. */
const createTierCameraTrack = async (): Promise<MediaStream | undefined> => {
  try {
    return await createCameraTrack(useMeetingStore.getState().sendTier);
  } catch (err) {
    console.warn('[useMeetingCamera] createCameraTrack error:', err);
    return undefined;
  }
};

export const useMeetingCamera = () => {
  const toggleLockRef = useRef(false);

  const { toggleMic: sdkToggleMic, toggleWebcam: sdkToggleWebcam, changeWebcam: sdkChangeWebcam } =
    useMeeting({});

  const isMuted = useMeetingStore(state => state.isMuted);
  const isCamOn = useMeetingStore(state => state.isCamOn);
  const isFrontCamera = useMeetingStore(state => state.isFrontCamera);
  const setIsMuted = useMeetingStore(state => state.setIsMuted);
  const setIsCamOn = useMeetingStore(state => state.setIsCamOn);
  const setIsFrontCamera = useMeetingStore(state => state.setIsFrontCamera);

  // Ignore taps while a toggle is still in flight (double taps on a slow network).
  const runLocked = useCallback(async (action: () => Promise<void>) => {
    if (toggleLockRef.current) return;
    toggleLockRef.current = true;
    try {
      await action();
    } finally {
      setTimeout(() => {
        toggleLockRef.current = false;
      }, TOGGLE_LOCK_MS);
    }
  }, []);

  const toggleMic = useCallback(
    () =>
      runLocked(async () => {
        try {
          const nextMuted = !isMuted;
          setIsMuted(nextMuted);
          if (sdkToggleMic) {
            await sdkToggleMic();
          }
        } catch (err) {
          console.error('[useMeetingCamera] toggleMic error:', err);
        }
      }),
    [isMuted, runLocked, setIsMuted, sdkToggleMic]
  );

  const toggleCamera = useCallback(
    () =>
      runLocked(async () => {
        try {
          const nextCamOn = !isCamOn;
          // Turning on: open the camera at the current tier, not the SDK's HD default.
          const track = nextCamOn ? await createTierCameraTrack() : undefined;
          setIsCamOn(nextCamOn);
          if (sdkToggleWebcam) {
            await sdkToggleWebcam(track);
          }
        } catch (err) {
          console.error('[useMeetingCamera] toggleCamera error:', err);
        }
      }),
    [isCamOn, runLocked, setIsCamOn, sdkToggleWebcam]
  );

  const flipCamera = useCallback(
    () =>
      runLocked(async () => {
        try {
          setIsFrontCamera(!isFrontCamera);
          if (!sdkChangeWebcam) return;
          if (!useMeetingStore.getState().isCamOn) return;
          // createCameraTrack reads the new isFrontCamera, so this opens the other camera at the
          // current tier. If that fails, fall back to the SDK's next-device switch.
          const track = await createTierCameraTrack();
          await sdkChangeWebcam(track);
        } catch (err) {
          console.error('[useMeetingCamera] flipCamera error:', err);
        }
      }),
    [isFrontCamera, runLocked, setIsFrontCamera, sdkChangeWebcam]
  );

  return {
    isMuted,
    isCamOn,
    isFrontCamera,
    toggleMic,
    toggleCamera,
    flipCamera,
  };
};

export default useMeetingCamera;
