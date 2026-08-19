import { useEffect } from 'react';
import Toast from 'react-native-toast-message';
import {
  checkInitialNotification,
  onBackgroundNotificationTap,
  onForegroundNotification,
  requestNotificationPermission,
} from '../utils/notificationService';

/**
 * Custom hook to initialize notification permissions and subscribe to push notification lifecycle events.
 *
 * @param navigationRef Navigation container reference for routing on notification tap.
 */
export function useNotificationListeners(navigationRef: any) {
  useEffect(() => {
    // 1. Initial permission check & FCM token log
    requestNotificationPermission().then(res => {
      if (res?.token) {
        console.log('[useNotificationListeners] FCM Token initialized successfully');
      }
    });

    // 2. Foreground Notification Listener
    const unsubForeground = onForegroundNotification(
      (notification: { title: string; body: string; data?: any }) => {
        console.log('[useNotificationListeners] Foreground Notification received:', notification);
        Toast.show({
          type: 'info',
          text1: notification.title,
          text2: notification.body,
        });
      }
    );

    // 3. Background Notification Tap Listener
    const unsubBackgroundTap = onBackgroundNotificationTap(navigationRef);

    // 4. Killed App Initial Notification Handler
    checkInitialNotification(navigationRef);

    return () => {
      if (typeof unsubForeground === 'function') unsubForeground();
      if (typeof unsubBackgroundTap === 'function') unsubBackgroundTap();
    };
  }, [navigationRef]);
}

export default useNotificationListeners;
