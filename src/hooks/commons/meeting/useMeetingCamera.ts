import { useMeeting } from '@videosdk.live/react-native-sdk';
import { useCallback } from 'react';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';

export const useMeetingCamera = () => {
  const { toggleMic: sdkToggleMic, toggleWebcam: sdkToggleWebcam, changeWebcam: sdkChangeWebcam } =
    useMeeting({});

  const isMuted = useMeetingStore(state => state.isMuted);
  const isCamOn = useMeetingStore(state => state.isCamOn);
  const isFrontCamera = useMeetingStore(state => state.isFrontCamera);
  const setIsMuted = useMeetingStore(state => state.setIsMuted);
  const setIsCamOn = useMeetingStore(state => state.setIsCamOn);
  const setIsFrontCamera = useMeetingStore(state => state.setIsFrontCamera);

  const toggleMic = useCallback(async () => {
    try {
      const nextMuted = !isMuted;
      setIsMuted(nextMuted);
      if (sdkToggleMic) {
        await sdkToggleMic();
      }
    } catch (err) {
      console.error('[useMeetingCamera] toggleMic error:', err);
    }
  }, [isMuted, setIsMuted, sdkToggleMic]);

  const toggleCamera = useCallback(async () => {
    try {
      const nextCamOn = !isCamOn;
      setIsCamOn(nextCamOn);
      if (sdkToggleWebcam) {
        await sdkToggleWebcam();
      }
    } catch (err) {
      console.error('[useMeetingCamera] toggleCamera error:', err);
    }
  }, [isCamOn, setIsCamOn, sdkToggleWebcam]);

  const flipCamera = useCallback(async () => {
    try {
      setIsFrontCamera(!isFrontCamera);
      if (sdkChangeWebcam) {
        await sdkChangeWebcam();
      }
    } catch (err) {
      console.error('[useMeetingCamera] flipCamera error:', err);
    }
  }, [isFrontCamera, setIsFrontCamera, sdkChangeWebcam]);

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
