import { useCallback, useEffect, useState } from 'react';
import {
  getDeviceSessionFields,
  listenForTokenRefresh,
  requestNotificationPermission,
} from '../utils/notificationService';

export interface DeviceSessionInfo {
  platform: string;
  device_name: string;
  device_id: string;
  os_version: string;
  app_version: string;
  fcm_token: string;
}

export interface UseFcmTokenReturn {
  fcmToken: string | null;
  deviceInfo: DeviceSessionInfo | null;
  permissionGranted: boolean;
  permissionStatus: number | null;
  loading: boolean;
  error: string | null;
  refreshFcmToken: () => Promise<DeviceSessionInfo | null>;
}

export function useFcmToken(autoRequest: boolean = true): UseFcmTokenReturn {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceSessionInfo | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessionData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (autoRequest) {
        const { isGranted, status, token } = await requestNotificationPermission();
        setPermissionGranted(isGranted);
        setPermissionStatus(status ?? null);
        if (token) {
          setFcmToken(token);
        }
      }

      const session = await getDeviceSessionFields();
      setDeviceInfo(session);
      if (session.fcm_token) {
        setFcmToken(session.fcm_token);
      }
      return session;
    } catch (err: any) {
      const msg = err?.message || 'Error initializing FCM token';
      console.error('[useFcmToken]', msg);
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [autoRequest]);

  useEffect(() => {
    fetchSessionData();

    const unsubscribe = listenForTokenRefresh((newToken: string) => {
      console.log('[useFcmToken] Token refreshed:', newToken);
      setFcmToken(newToken);
      setDeviceInfo(prev => (prev ? { ...prev, fcm_token: newToken } : null));
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [fetchSessionData]);

  return {
    fcmToken,
    deviceInfo,
    permissionGranted,
    permissionStatus,
    loading,
    error,
    refreshFcmToken: fetchSessionData,
  };
}

export default useFcmToken;
