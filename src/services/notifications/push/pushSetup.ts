import {
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import type { PushData } from '../../calls/call.types';
import { callFromPush, cancelFromPush } from '../../calls/callPayload';
import { cancelCall, ringIncomingCall } from '../../calls/callService';
import { syncPushToken } from '../../calls/deviceSync';
import { handlePushNotificationPress } from '../handlers/pushNotification.handler';
import { displayPush } from './pushDisplay';
import { ensurePushToken, listenForTokenRefresh } from './pushToken';

// Call ring and cancel pushes. Returns true when the message was a call message.
export const handleCallMessage = async (data?: PushData): Promise<boolean> => {
  const call = callFromPush(data);
  if (call) {
    await ringIncomingCall(call);
    return true;
  }
  const cancel = cancelFromPush(data);
  if (cancel) {
    await cancelCall(cancel);
    return true;
  }
  return false;
};

// Runs outside React, so it's registered from index.js.
export const registerBackgroundPushHandler = () => {
  setBackgroundMessageHandler(getMessaging(), async message => {
    if (__DEV__) console.log('[Push] Background message:', JSON.stringify(message, null, 2));
    await handleCallMessage(message.data).catch(err =>
      console.warn('[Push] Background call message failed:', err),
    );
  });
};

// Returns a function that stops the message, tap and token listeners.
export const setupPush = async () => {
  // A token failure (e.g. on the iOS Simulator) shouldn't stop the listeners below.
  await ensurePushToken().catch(err => console.warn('[Push] Token setup failed:', err));
  // Keeps the backend's copy current; does nothing until the patient is logged in.
  syncPushToken();

  const stopMessages = onMessage(getMessaging(), async message => {
    if (__DEV__) console.log('[Push] Foreground message:', JSON.stringify(message, null, 2));
    // A call shows the in-app banner instead of a notification banner.
    const isCallMessage = await handleCallMessage(message.data).catch(err => {
      console.warn('[Push] Foreground call message failed:', err);
      return false;
    });
    if (isCallMessage) return;
    return displayPush(message);
  });
  // A tap on a notification the phone showed while the app was in the background.
  const stopOpened = onNotificationOpenedApp(getMessaging(), message =>
    handlePushNotificationPress(message.data),
  );
  const stopTokenRefresh = listenForTokenRefresh();
  // Sends a refreshed token to the backend, so calls keep ringing on this phone.
  const stopTokenSync = onTokenRefresh(getMessaging(), token => syncPushToken(token));

  return () => {
    stopMessages();
    stopOpened();
    stopTokenRefresh();
    stopTokenSync();
  };
};
