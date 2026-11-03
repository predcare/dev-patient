import { Platform } from 'react-native';
import VoipPushNotification from 'react-native-voip-push-notification';
import { syncPushToken } from './deviceSync';

let started = false;

/**
 * iOS: gets the PushKit VoIP token and sends it to the backend. The backend needs it to send
 * VoIP pushes, which wake a closed iPhone and show the CallKit call screen.
 * AppDelegate registers PushKit at launch; registerVoipToken() re-sends the cached token.
 */
export const startVoipToken = (): void => {
  if (Platform.OS !== 'ios' || started) return;
  started = true;
  VoipPushNotification.addEventListener('register', token => {
    if (token) syncPushToken(undefined, token);
  });
  VoipPushNotification.registerVoipToken();
};
