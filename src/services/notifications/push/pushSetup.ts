import {
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import { handlePushNotificationPress } from '../handlers/pushNotification.handler';
import { displayPush } from './pushDisplay';
import { ensurePushToken, listenForTokenRefresh } from './pushToken';

// Runs outside React, so it's registered from index.js.
export const registerBackgroundPushHandler = () => {
  setBackgroundMessageHandler(getMessaging(), async message => {
    if (__DEV__) console.log('[Push] Background message:', JSON.stringify(message, null, 2));
  });
};

// Returns a function that stops the message, tap and token listeners.
export const setupPush = async () => {
  // A token failure (e.g. on the iOS Simulator) shouldn't stop the listeners below.
  await ensurePushToken().catch(err => console.warn('[Push] Token setup failed:', err));

  const stopMessages = onMessage(getMessaging(), message => {
    if (__DEV__) console.log('[Push] Foreground message:', JSON.stringify(message, null, 2));
    return displayPush(message);
  });
  // A tap on a notification the phone showed while the app was in the background.
  const stopOpened = onNotificationOpenedApp(getMessaging(), message =>
    handlePushNotificationPress(message.data),
  );
  const stopTokenRefresh = listenForTokenRefresh();

  return () => {
    stopMessages();
    stopOpened();
    stopTokenRefresh();
  };
};
