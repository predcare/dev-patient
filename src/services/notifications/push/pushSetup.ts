import {
  getMessaging,
  getToken,
  onMessage,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import { requestNotificationPermission } from '../notification.core';

// Runs outside React, so it's registered from index.js.
export const registerBackgroundPushHandler = () => {
  setBackgroundMessageHandler(getMessaging(), async () => {});
};

// Returns the foreground listener's unsubscribe function.
export const setupPush = async () => {
  await requestNotificationPermission();
  const token = await getToken(getMessaging());
  if (__DEV__) console.log('FCM token:', token);
  return onMessage(getMessaging(), async message => {
    if (__DEV__) console.log('Push in foreground:', message);
  });
};
