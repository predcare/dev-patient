import { Alert, Permission, PermissionsAndroid, Platform } from 'react-native';

export interface PermissionOptions {
  title?: string;
  message?: string;
  buttonPositive?: string;
  buttonNegative?: string;
  buttonNeutral?: string;
}

export const useDevicePermissions = () => {
  /**
   * Request generic Android permission with options
   */
  const requestAndroidPermission = async (
    permission: Permission,
    options?: PermissionOptions,
  ): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.request(permission, {
        title: options?.title || 'Permission Required',
        message:
          options?.message ||
          'App requires permission to proceed with this action.',
        buttonPositive: options?.buttonPositive || 'OK',
        buttonNegative: options?.buttonNegative || 'Cancel',
        buttonNeutral: options?.buttonNeutral || 'Ask Me Later',
      });

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  };

  /**
   * Request Camera permission
   */
  const requestCameraPermission = async (
    options?: PermissionOptions,
  ): Promise<boolean> => {
    if (Platform.OS === 'android') {
      const granted = await requestAndroidPermission(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        options || {
          title: 'Camera Permission Required',
          message:
            'App requires access to your camera to capture profile picture.',
        },
      );
      if (!granted) {
        Alert.alert(
          'Permission Denied',
          'Camera permission is required to take a photo.',
        );
      }
      return granted;
    }
    return true;
  };

  /**
   * Request Storage / Media Read permission
   */
  const requestStoragePermission = async (
    options?: PermissionOptions,
  ): Promise<boolean> => {
    if (Platform.OS === 'android') {
      const permission: Permission =
        Number(Platform.Version) >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

      const granted = await requestAndroidPermission(
        permission,
        options || {
          title: 'Storage Permission Required',
          message:
            'App requires access to your photos/storage to select media files.',
        },
      );
      if (!granted) {
        Alert.alert(
          'Permission Denied',
          'Storage permission is required to select photos.',
        );
      }
      return granted;
    }
    return true;
  };

  /**
   * Request Microphone permission
   */
  const requestMicrophonePermission = async (
    options?: PermissionOptions,
  ): Promise<boolean> => {
    if (Platform.OS === 'android') {
      const granted = await requestAndroidPermission(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        options || {
          title: 'Microphone Permission Required',
          message: 'App requires access to your microphone for audio features.',
        },
      );
      if (!granted) {
        Alert.alert('Permission Denied', 'Microphone permission is required.');
      }
      return granted;
    }
    return true;
  };

  /**
   * Request Location permission
   */
  const requestLocationPermission = async (
    options?: PermissionOptions,
  ): Promise<boolean> => {
    if (Platform.OS === 'android') {
      const granted = await requestAndroidPermission(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        options || {
          title: 'Location Permission Required',
          message:
            'App requires access to your location to find nearby services.',
        },
      );
      if (!granted) {
        Alert.alert('Permission Denied', 'Location permission is required.');
      }
      return granted;
    }
    return true;
  };

  /**
   * Request both Camera and Microphone permissions for video calls
   */
  const requestAudioVideoPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        const cameraGranted =
          grants[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED;
        const micGranted =
          grants[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED;

        return cameraGranted && micGranted;
      } catch (err) {
        console.warn('Audio/Video permission request error:', err);
        return false;
      }
    }
    return true;
  };

  return {
    requestAndroidPermission,
    requestCameraPermission,
    requestStoragePermission,
    requestMicrophonePermission,
    requestLocationPermission,
    requestAudioVideoPermissions,
  };
};

export default useDevicePermissions;
