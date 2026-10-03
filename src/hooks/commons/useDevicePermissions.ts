import {
  Alert,
  PermissionsAndroid,
  Platform,
  Permission as RNAndroidPermission,
} from 'react-native';
import {
  check,
  checkNotifications,
  openSettings,
  Permission,
  PERMISSIONS,
  PermissionStatus,
  request,
  requestMultiple,
  requestNotifications,
  RESULTS,
} from 'react-native-permissions';

export interface PermissionOptions {
  title?: string;
  message?: string;
  buttonPositive?: string;
  buttonNegative?: string;
  buttonNeutral?: string;
  // Blocked / Settings prompt options
  blockedTitle?: string;
  blockedMessage?: string;
  openSettingsText?: string;
  cancelText?: string;
  showAlertOnDenied?: boolean;
}

const isGranted = (status: PermissionStatus): boolean => {
  return status === RESULTS.GRANTED || status === RESULTS.LIMITED;
};

export const useDevicePermissions = () => {
  /**
   * Helper to prompt user to open Settings when permission is permanently blocked
   */
  const promptOpenSettings = (
    title: string,
    message: string,
    openSettingsText = 'Open Settings',
    cancelText = 'Cancel'
  ) => {
    Alert.alert(title, message, [
      { text: cancelText, style: 'cancel' },
      {
        text: openSettingsText,
        onPress: () => {
          openSettings().catch(err => console.warn('Failed to open app settings:', err));
        },
      },
    ]);
  };

  /**
   * Generic cross-platform check and request function
   */
  const requestDevicePermission = async (
    permission: Permission | null,
    options?: PermissionOptions,
    defaultConfig?: {
      deniedTitle?: string;
      deniedMessage?: string;
      blockedMessage?: string;
    }
  ): Promise<boolean> => {
    if (!permission) return true;

    try {
      const currentStatus = await check(permission);

      if (isGranted(currentStatus)) {
        return true;
      }

      if (currentStatus === RESULTS.BLOCKED) {
        promptOpenSettings(
          options?.blockedTitle || defaultConfig?.deniedTitle || 'Permission Required',
          options?.blockedMessage ||
            defaultConfig?.blockedMessage ||
            'Permission is required. Please enable it in device settings.',
          options?.openSettingsText,
          options?.cancelText
        );
        return false;
      }

      if (currentStatus === RESULTS.UNAVAILABLE) {
        console.warn(`Permission ${permission} is unavailable on this device.`);
        return false;
      }

      // Request permission
      const requestResult = await request(
        permission,
        options?.title && options?.message
          ? {
              title: options.title,
              message: options.message,
              buttonPositive: options.buttonPositive || 'OK',
              buttonNegative: options.buttonNegative || 'Cancel',
            }
          : undefined
      );

      if (isGranted(requestResult)) {
        return true;
      }

      if (requestResult === RESULTS.BLOCKED) {
        promptOpenSettings(
          options?.blockedTitle || defaultConfig?.deniedTitle || 'Permission Required',
          options?.blockedMessage ||
            defaultConfig?.blockedMessage ||
            'Permission is required. Please enable it in device settings.',
          options?.openSettingsText,
          options?.cancelText
        );
        return false;
      }

      if (options?.showAlertOnDenied !== false) {
        Alert.alert(
          defaultConfig?.deniedTitle || 'Permission Denied',
          options?.message || defaultConfig?.deniedMessage || 'Permission is required to proceed.'
        );
      }

      return false;
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  };

  /**
   * Request generic Android permission with options (Kept for backwards compatibility)
   */
  const requestAndroidPermission = async (
    permission: RNAndroidPermission,
    options?: PermissionOptions
  ): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.request(permission, {
        title: options?.title || 'Permission Required',
        message: options?.message || 'App requires permission to proceed with this action.',
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
   * Request Camera permission (iOS & Android)
   */
  const requestCameraPermission = async (options?: PermissionOptions): Promise<boolean> => {
    const permission =
      Platform.select({
        ios: PERMISSIONS.IOS.CAMERA,
        android: PERMISSIONS.ANDROID.CAMERA,
      }) || null;

    return requestDevicePermission(permission, options, {
      deniedTitle: 'Camera Permission Denied',
      deniedMessage: 'Camera permission is required to take photos.',
      blockedMessage:
        'Camera access is disabled. Please enable camera access in your device settings to take photos.',
    });
  };

  /**
   * Request Storage / Photo Library permission (iOS & Android)
   */
  const requestStoragePermission = async (options?: PermissionOptions): Promise<boolean> => {
    let permission: Permission | null = null;

    if (Platform.OS === 'ios') {
      permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
    } else if (Platform.OS === 'android') {
      permission =
        Number(Platform.Version) >= 33
          ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
          : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
    }

    return requestDevicePermission(permission, options, {
      deniedTitle: 'Storage Permission Denied',
      deniedMessage: 'Storage / Photo access is required to select files.',
      blockedMessage:
        'Photo library access is disabled. Please enable photo access in your device settings to select files.',
    });
  };

  /**
   * Request Microphone permission (iOS & Android)
   */
  const requestMicrophonePermission = async (options?: PermissionOptions): Promise<boolean> => {
    const permission =
      Platform.select({
        ios: PERMISSIONS.IOS.MICROPHONE,
        android: PERMISSIONS.ANDROID.RECORD_AUDIO,
      }) || null;

    return requestDevicePermission(permission, options, {
      deniedTitle: 'Microphone Permission Denied',
      deniedMessage: 'Microphone permission is required for audio features.',
      blockedMessage:
        'Microphone access is disabled. Please enable microphone access in your device settings.',
    });
  };

  /**
   * Request Bluetooth permission (For wireless headsets & call routing)
   */
  const requestBluetoothPermission = async (options?: PermissionOptions): Promise<boolean> => {
    let permission: Permission | null = null;

    if (Platform.OS === 'ios') {
      permission = PERMISSIONS.IOS.BLUETOOTH;
    } else if (Platform.OS === 'android') {
      if (Number(Platform.Version) >= 31) {
        permission = PERMISSIONS.ANDROID.BLUETOOTH_CONNECT;
      } else {
        // Pre-Android 12 Bluetooth is an install-time permission
        return true;
      }
    }

    return requestDevicePermission(permission, options, {
      deniedTitle: 'Bluetooth Permission Denied',
      deniedMessage: 'Bluetooth permission is required to connect wireless headsets.',
      blockedMessage:
        'Bluetooth access is disabled. Please enable Bluetooth in your device settings.',
    });
  };

  /**
   * Request Location permission (iOS & Android)
   */
  const requestLocationPermission = async (options?: PermissionOptions): Promise<boolean> => {
    const permission =
      Platform.select({
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      }) || null;

    return requestDevicePermission(permission, options, {
      deniedTitle: 'Location Permission Denied',
      deniedMessage: 'Location permission is required to find nearby services.',
      blockedMessage:
        'Location access is disabled. Please enable location access in your device settings.',
    });
  };

  /**
   * Request Notifications permission (iOS & Android)
   */
  const requestNotificationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await requestNotifications(['alert', 'badge', 'sound']);
      return isGranted(status);
    } catch (err) {
      console.warn('Notification permission request error:', err);
      return false;
    }
  };

  /**
   * Request both Camera and Microphone permissions for video calls
   */
  const requestAudioVideoPermissions = async (options?: PermissionOptions): Promise<boolean> => {
    const cameraPerm = Platform.select({
      ios: PERMISSIONS.IOS.CAMERA,
      android: PERMISSIONS.ANDROID.CAMERA,
    });
    const micPerm = Platform.select({
      ios: PERMISSIONS.IOS.MICROPHONE,
      android: PERMISSIONS.ANDROID.RECORD_AUDIO,
    });

    if (!cameraPerm || !micPerm) return true;

    try {
      const statuses = await requestMultiple([cameraPerm, micPerm]);
      const cameraGranted = isGranted(statuses[cameraPerm]);
      const micGranted = isGranted(statuses[micPerm]);

      if (cameraGranted && micGranted) {
        return true;
      }

      const isBlocked =
        statuses[cameraPerm] === RESULTS.BLOCKED || statuses[micPerm] === RESULTS.BLOCKED;

      if (isBlocked) {
        promptOpenSettings(
          options?.blockedTitle || 'Permissions Required',
          options?.blockedMessage ||
            'Camera and Microphone access are required for video consultations. Please enable them in your device settings.',
          options?.openSettingsText,
          options?.cancelText
        );
      } else if (options?.showAlertOnDenied !== false) {
        Alert.alert(
          'Permissions Required',
          'Both Camera and Microphone permissions are required to start or join a video consultation.'
        );
      }

      return false;
    } catch (err) {
      console.warn('Audio/Video permission request error:', err);
      return false;
    }
  };

  /**
   * Check methods (without triggering prompts)
   */
  const checkCameraPermission = async (): Promise<boolean> => {
    const perm = Platform.select({
      ios: PERMISSIONS.IOS.CAMERA,
      android: PERMISSIONS.ANDROID.CAMERA,
    });
    return perm ? isGranted(await check(perm)) : true;
  };

  const checkMicrophonePermission = async (): Promise<boolean> => {
    const perm = Platform.select({
      ios: PERMISSIONS.IOS.MICROPHONE,
      android: PERMISSIONS.ANDROID.RECORD_AUDIO,
    });
    return perm ? isGranted(await check(perm)) : true;
  };

  const checkStoragePermission = async (): Promise<boolean> => {
    const perm =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : Number(Platform.Version) >= 33
        ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
    return isGranted(await check(perm));
  };

  const checkNotificationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await checkNotifications();
      return isGranted(status);
    } catch {
      return false;
    }
  };

  return {
    openAppSettings: openSettings,
    requestAndroidPermission,
    requestCameraPermission,
    requestStoragePermission,
    requestMicrophonePermission,
    requestBluetoothPermission,
    requestLocationPermission,
    requestNotificationPermission,
    requestAudioVideoPermissions,
    checkCameraPermission,
    checkMicrophonePermission,
    checkStoragePermission,
    checkNotificationPermission,
  };
};

export default useDevicePermissions;
