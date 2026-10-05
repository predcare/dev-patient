import notifee, { EventType } from '@notifee/react-native';
import React, { useEffect } from 'react';
import { initNotificationChannels } from '../notification.core';
import { routeNotificationPress } from '../notificationDispatcher';

/**
 * Headless listener component that manages notification lifecycles:
 * 1. Initializes Android notification channels on app startup.
 * 2. Handles foreground notification interactions (tap to open).
 * 3. Handles cold-start initial notification if app was opened via notification tap.
 */
export const NotificationEventListener: React.FC = () => {
  useEffect(() => {
    // 1. Initialize notification channels
    initNotificationChannels();

    // 2. Handle cold start if app opened via notification tap
    notifee
      .getInitialNotification()
      .then(initial => {
        if (initial?.notification?.data) {
          routeNotificationPress({
            type: EventType.PRESS,
            detail: {
              notification: initial.notification,
              pressAction: initial.pressAction,
            },
          });
        }
      })
      .catch(err => {
        console.warn('[NotificationEventListener] getInitialNotification error:', err);
      });

    // 3. Subscribe to foreground notification events
    const unsubscribe = notifee.onForegroundEvent(event => {
      routeNotificationPress(event);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return null;
};

export default NotificationEventListener;
