import { Platform } from 'react-native';
import { APP_VERSION } from '../../config/constants';
import { getItem, setItem, STORAGE_KEYS } from '../../lib/common/asyncStorage';
import { getSavedPushToken } from '../../services/notifications/push/pushToken';

export type TDeviceInfo = {
  device_id: string;
  device_name: string;
  platform: string;
  fcm_token: string;
  os_version: string;
  app_version: string;
};

// React Native has no device ID, so generate one and keep it. It stays through
// logout, and a reinstall creates a new one. It identifies the install; it isn't a secret.
const getDeviceId = async (): Promise<string> => {
  const savedId = await getItem(STORAGE_KEYS.DEVICE_ID);
  if (savedId) return savedId;

  const newId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
  await setItem(STORAGE_KEYS.DEVICE_ID, newId);
  return newId;
};

export const getDeviceInfo = async (): Promise<TDeviceInfo> => {
  const [deviceId, fcmToken] = await Promise.all([getDeviceId(), getSavedPushToken()]);

  if (Platform.OS === 'android') {
    const { Brand, Model, Release } = Platform.constants;
    return {
      device_id: deviceId,
      device_name: `${Brand} ${Model}`,
      platform: Platform.OS,
      fcm_token: fcmToken,
      os_version: Release,
      app_version: APP_VERSION,
    };
  }

  return {
    device_id: deviceId,
    // iOS only exposes the device type here, not the exact model.
    device_name: Platform.OS === 'ios' && Platform.isPad ? 'iPad' : 'iPhone',
    platform: Platform.OS,
    fcm_token: fcmToken,
    os_version: String(Platform.Version),
    app_version: APP_VERSION,
  };
};

// Call getDeviceInfo() when submitting, so the payload has the latest FCM token.
export const useDeviceInfo = () => ({ getDeviceInfo });
