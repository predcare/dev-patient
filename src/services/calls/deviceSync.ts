import { Platform } from 'react-native';
import { getDeviceInfo } from '../../hooks/commons/useDeviceInfo';
import { getItem, setItem } from '../../lib/common/asyncStorage';
import { useAuthStore } from '../../zustand/stores/useAuthStore';
import axiosInstance from '../api/apiClient';
import { endpoints } from '../api/endpoints';

const VOIP_TOKEN_KEY = '@voip_token';

/**
 * Sends this phone's push tokens to the backend, so call pushes reach it after a token refresh.
 * Login and register already send the FCM token; this covers the times in between.
 * Pass a new token when it's known, because local storage may not be updated yet.
 * `voip_token` (iOS) is for CallKit when the app is closed; the backend needs to store it.
 */
export const syncPushToken = async (freshToken?: string, freshVoipToken?: string): Promise<void> => {
  if (freshVoipToken) await setItem(VOIP_TOKEN_KEY, freshVoipToken);

  const userId = useAuthStore.getState().userData?.id;
  if (!userId) return;

  try {
    const info = await getDeviceInfo();
    const fcmToken = freshToken || info.fcm_token;
    if (!fcmToken) return;
    const voipToken = Platform.OS === 'ios' ? (await getItem(VOIP_TOKEN_KEY)) || undefined : undefined;

    await axiosInstance.post(endpoints.notifications.registerToken, {
      user_id: String(userId),
      user_type: 'patient',
      fcm_token: fcmToken,
      platform: info.platform,
      device_id: info.device_id,
      device_name: info.device_name,
      ...(voipToken ? { voip_token: voipToken, apns_env: __DEV__ ? 'sandbox' : 'production' } : {}),
    });
  } catch (err) {
    console.warn('[DeviceSync] register-token failed:', err);
  }
};
