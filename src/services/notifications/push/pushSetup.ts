import {
  getMessaging,
  onMessage,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import { displayPush } from './pushDisplay';
import { ensurePushToken, listenForTokenRefresh } from './pushToken';

// Runs outside React, so it's registered from index.js.
export const registerBackgroundPushHandler = () => {
  setBackgroundMessageHandler(getMessaging(), async () => {});
};

// Returns a function that stops the foreground and token listeners.
export const setupPush = async () => {
  // A token failure (e.g. on the iOS Simulator) shouldn't stop the listeners below.
  await ensurePushToken().catch(err => console.warn('[Push] Token setup failed:', err));

  const stopMessages = onMessage(getMessaging(), displayPush);
  const stopTokenRefresh = listenForTokenRefresh();

  return () => {
    stopMessages();
    stopTokenRefresh();
  };
};
