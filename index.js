/**
 * @format
 */

import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { register } from '@videosdk.live/react-native-sdk';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { displayLocalSystemNotification } from './src/utils/firebaseMessaging';

// Register VideoSDK service
register();

// Register background messaging handler for when app is killed or in background
const messagingInstance = getMessaging();
setBackgroundMessageHandler(messagingInstance, async remoteMessage => {
  console.log('[FCM] Background Message Handler Received:', remoteMessage);
  const title = remoteMessage.notification?.title || remoteMessage.data?.title;
  const body = remoteMessage.notification?.body || remoteMessage.data?.body;
  if (title || body) {
    await displayLocalSystemNotification(
      String(title || 'New Notification'),
      String(body || ''),
      remoteMessage.data
    );
  }
});

AppRegistry.registerComponent(appName, () => App);
