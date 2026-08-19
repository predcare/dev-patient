/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging, { isFirebaseNativeReady } from './src/utils/firebaseMessaging';

// Register background message handler for FCM
if (isFirebaseNativeReady) {
  try {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('[Background FCM] Message handled in background:', remoteMessage?.notification?.title || remoteMessage?.data?.title);
    });
  } catch (error) {
    console.warn('[Background FCM] Could not register background handler:', error?.message || error);
  }
}

AppRegistry.registerComponent(appName, () => App);
