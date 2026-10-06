import { useCallback, useState } from 'react';
import useDevicePermissions from '../useDevicePermissions';

export const useMeetingPermissions = () => {
  const {
    checkCameraPermission,
    checkMicrophonePermission,
    requestAudioVideoPermissions,
    openAppSettings,
  } = useDevicePermissions();

  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkPermissions = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    try {
      const [cam, mic] = await Promise.all([
        checkCameraPermission(),
        checkMicrophonePermission(),
      ]);
      const granted = cam && mic;
      setHasPermissions(granted);
      return granted;
    } catch (err) {
      console.warn('[useMeetingPermissions] Check failed:', err);
      setHasPermissions(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [checkCameraPermission, checkMicrophonePermission]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    try {
      const granted = await requestAudioVideoPermissions();
      setHasPermissions(granted);
      return granted;
    } catch (err) {
      console.warn('[useMeetingPermissions] Request failed:', err);
      setHasPermissions(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [requestAudioVideoPermissions]);

  return {
    hasPermissions,
    isChecking,
    checkPermissions,
    requestPermissions,
    openAppSettings,
  };
};

export default useMeetingPermissions;
