import { getDeviceInfo } from '../../hooks/commons/useDeviceInfo';
import { useAuthStore } from '../../zustand/stores/useAuthStore';
import axiosInstance from '../api/apiClient';
import { endpoints } from '../api/endpoints';

/**
 * Sends this phone's FCM token to the backend, so call pushes reach it after a token refresh.
 * Login and register already send the token; this covers the times in between.
 * Pass the new token when it's known, because local storage may not be updated yet.
 */
export const syncPushToken = async (freshToken?: string): Promise<void> => {
  const userId = useAuthStore.getState().userData?.id;
  if (!userId) return;

  try {
    const info = await getDeviceInfo();
    const fcmToken = freshToken || info.fcm_token;
    if (!fcmToken) return;

    await axiosInstance.post(endpoints.notifications.registerToken, {
      user_id: String(userId),
      user_type: 'patient',
      fcm_token: fcmToken,
      platform: info.platform,
      device_id: info.device_id,
      device_name: info.device_name,
    });
  } catch (err) {
    console.warn('[DeviceSync] register-token failed:', err);
  }
};
