import {
  getMessaging,
  getToken,
  onTokenRefresh,
} from '@react-native-firebase/messaging';
import { getItem, setItem, STORAGE_KEYS } from '../../../lib/common/asyncStorage';
import { requestNotificationPermission } from '../notification.core';

// Returns the saved token, or '' so login and registration still work without one.
export const getSavedPushToken = async (): Promise<string> => {
  return (await getItem(STORAGE_KEYS.FCM_TOKEN)) ?? '';
};

// Asks for permission and fetches a token only when none is saved yet.
// If permission is denied, nothing is saved and this tries again on the next app open.
export const ensurePushToken = async (): Promise<void> => {
  let token = await getSavedPushToken();

  if (!token) {
    const granted = await requestNotificationPermission();
    if (!granted) return;

    token = await getToken(getMessaging());
    await setItem(STORAGE_KEYS.FCM_TOKEN, token);
  }

  if (__DEV__) console.log('FCM token:', token);
};

// Returns the listener's unsubscribe function.
export const listenForTokenRefresh = () => {
  return onTokenRefresh(getMessaging(), token => setItem(STORAGE_KEYS.FCM_TOKEN, token));
};
