import notifee, { EventType } from '@notifee/react-native';
import { useEffect } from 'react';
import {
  onBackgroundNotificationTap,
  onForegroundNotification,
  requestNotificationPermission,
} from '../../utils/firebaseMessaging';
import { handleNotificationClick } from '../../utils/notificationRouter';

/**
 * Custom hook to initialize notification permissions and subscribe to push notification lifecycle events.
 *
 * @param navigationRef Optional navigation container reference for routing on notification tap (defaults to global navigationRef).
 */
export function useNotificationListeners(navigationRef?: any) {
  useEffect(() => {
    const activeNavRef = navigationRef;

    // 1. Initial permission check & FCM token log
    requestNotificationPermission().then(res => {
      if (res?.token) {
        console.log('[useNotificationListeners] FCM Token initialized successfully:', res.token);
      }
    });

    // 2. Foreground Notification Listener (FCM message incoming)
    const unsubForeground = onForegroundNotification(
      (notification: { title: string; body: string; data?: any }) => {
        console.log('[useNotificationListeners] Foreground Notification received:', notification);
      }
    );

    // 3. Foreground Notification Tap Listener (User clicks Notifee banner in foreground)
    const unsubNotifeeForeground = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS && detail.notification) {
        handleNotificationClick(
          'Notifee onForegroundEvent (Foreground Click)',
          detail.notification
        );
      }
    });

    // 4. Background Notification Tap Listener
    const unsubBackgroundTap = onBackgroundNotificationTap(activeNavRef);

    return () => {
      if (typeof unsubForeground === 'function') unsubForeground();
      if (typeof unsubNotifeeForeground === 'function') unsubNotifeeForeground();
      if (typeof unsubBackgroundTap === 'function') unsubBackgroundTap();
    };
  }, [navigationRef]);
}

export default useNotificationListeners;
