import { useEffect } from 'react';
import { showInfoToast } from '../../lib/common/toast.utils';
import {
  checkInitialNotification,
  onBackgroundNotificationTap,
  onForegroundNotification,
  requestNotificationPermission,
} from '../../utils/firebaseMessaging';

/**
 * Custom hook to initialize notification permissions and subscribe to push notification lifecycle events.
 *
 * @param navigationRef Optional navigation container reference for routing on notification tap (defaults to global navigationRef).
 */
export function useNotificationListeners(navigationRef: any) {
  useEffect(() => {
    const activeNavRef = navigationRef;

    // 1. Initial permission check & FCM token log
    requestNotificationPermission().then(res => {
      if (res?.token) {
        console.log('[useNotificationListeners] FCM Token initialized successfully:', res.token);
      }
    });

    // 2. Foreground Notification Listener
    const unsubForeground = onForegroundNotification(
      (notification: { title: string; body: string; data?: any }) => {
        console.log('[useNotificationListeners] Foreground Notification received:', notification);
        showInfoToast(notification.body, notification.title);
      }
    );

    // 3. Background Notification Tap Listener
    const unsubBackgroundTap = onBackgroundNotificationTap(activeNavRef);

    // 4. Killed App Initial Notification Handler
    checkInitialNotification(activeNavRef);

    return () => {
      if (typeof unsubForeground === 'function') unsubForeground();
      if (typeof unsubBackgroundTap === 'function') unsubBackgroundTap();
    };
  }, [navigationRef]);
}

export default useNotificationListeners;
