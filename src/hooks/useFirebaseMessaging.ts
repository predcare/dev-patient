import { useCallback, useEffect, useState } from 'react';
import {
  checkInitialNotification,
  getFirebaseToken,
  listenForTokenRefresh,
  onBackgroundNotificationTap,
  onForegroundNotification,
  requestPermissionAndGetToken,
  setupNotificationChannel,
} from '../utils/firebaseMessaging';

export interface UseFirebaseMessagingReturn {
  fcmToken: string | null;
  isPermissionGranted: boolean;
  isLoading: boolean;
  requestPermissionAnytime: () => Promise<{ granted: boolean; token: string | null }>;
  refreshToken: () => Promise<string | null>;
}

/**
 * Custom hook to handle Firebase Cloud Messaging setup, permissions, token management,
 * and push notification navigation listeners automatically on app startup.
 */
export function useFirebaseMessaging(): UseFirebaseMessagingReturn {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Request permission anytime on user request
  const requestPermissionAnytime = useCallback(async () => {
    setIsLoading(true);
    const { granted, token } = await requestPermissionAndGetToken();
    setIsPermissionGranted(granted);
    if (token) {
      setFcmToken(token);
    }
    setIsLoading(false);
    return { granted, token };
  }, []);

  // Refresh token manually if needed
  const refreshToken = useCallback(async () => {
    const token = await getFirebaseToken();
    if (token) {
      setFcmToken(token);
    }
    return token;
  }, []);

  useEffect(() => {
    let unsubscribeForeground: (() => void) | undefined;
    let unsubscribeBackgroundTap: (() => void) | undefined;
    let unsubscribeTokenRefresh: (() => void) | undefined;

    const initializeMessaging = async () => {
      try {
        console.log('[FCM Hook] Initializing Firebase Push Messaging listeners...');

        // 0. Ensure Android notification channel is created
        await setupNotificationChannel();

        // 1. Check initial notification (quit state launch)
        await checkInitialNotification();

        // 2. Initial Permission & Token check on app start
        const { granted, token } = await requestPermissionAndGetToken();
        setIsPermissionGranted(granted);
        if (token) {
          setFcmToken(token);
        }

        // 3. Register foreground message listener
        unsubscribeForeground = onForegroundNotification();

        // 4. Register background notification tap listener
        unsubscribeBackgroundTap = onBackgroundNotificationTap();

        // 5. Register token refresh listener
        unsubscribeTokenRefresh = listenForTokenRefresh(newToken => {
          setFcmToken(newToken);
        });
      } catch (error) {
        console.error('[FCM Hook] Error initializing push messaging:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeMessaging();

    return () => {
      if (unsubscribeForeground) unsubscribeForeground();
      if (unsubscribeBackgroundTap) unsubscribeBackgroundTap();
      if (unsubscribeTokenRefresh) unsubscribeTokenRefresh();
    };
  }, []);

  return {
    fcmToken,
    isPermissionGranted,
    isLoading,
    requestPermissionAnytime,
    refreshToken,
  };
}

export default useFirebaseMessaging;
