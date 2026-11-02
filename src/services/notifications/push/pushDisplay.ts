import notifee from '@notifee/react-native';
import type { RemoteMessage } from '@react-native-firebase/messaging';
import { NOTIFICATION_CHANNELS } from '../notification.core';

// Only used while the app is open; the system shows pushes in the background and closed states.
export const displayPush = async (message: RemoteMessage) => {
  // Data-only messages have nothing to show and would otherwise appear as a blank notification.
  if (!message.notification) return;

  await notifee.displayNotification({
    title: message.notification.title,
    body: message.notification.body,
    // Needed so tapping the banner can open the right screen.
    data: message.data,
    android: {
      channelId: NOTIFICATION_CHANNELS.DEFAULT.id,
      smallIcon: 'ic_launcher',
      pressAction: { id: 'default' },
      autoCancel: true,
    },
    ios: {
      sound: 'default',
      foregroundPresentationOptions: { banner: true, badge: true, sound: true },
    },
  });
};
