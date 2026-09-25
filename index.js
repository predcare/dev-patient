/**
 * @format
 */

import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { register } from '@videosdk.live/react-native-sdk';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { initializeI18n } from './src/config/i18n.config';
import { displayLocalSystemNotification } from './src/utils/firebaseMessaging';

// Register VideoSDK service
register();
initializeI18n();

// Register background messaging handler for when app is killed or in background
const messagingInstance = getMessaging();
setBackgroundMessageHandler(messagingInstance, async remoteMessage => {
  console.log('[FCM] Background Message Handler Received:', remoteMessage);

  // If remoteMessage.notification exists, the OS/Firebase SDK has ALREADY displayed
  // a system notification in the status bar. Displaying another local notification causes duplicates.
  // We only manually display a local notification for pure data-only messages (remoteMessage.data).
  const isDataOnlyMessage = !remoteMessage.notification;
  const title = remoteMessage.data?.title;
  const body = remoteMessage.data?.body;

  if (isDataOnlyMessage && (title || body)) {
    await displayLocalSystemNotification(
      String(title || 'New Notification'),
      String(body || ''),
      remoteMessage.data
    );
  }
});

AppRegistry.registerComponent(appName, () => App);
