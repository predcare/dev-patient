import notifee from '@notifee/react-native';
import { register } from '@videosdk.live/react-native-sdk';
import { AppRegistry, Platform } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { initializeI18n } from './src/config/i18n.config';
import { startCallKeepListeners } from './src/services/calls/callService';
import {
  registerBackgroundNotificationHandler,
  registerBackgroundPushHandler,
} from './src/services/notifications';

initializeI18n();
registerBackgroundNotificationHandler();
registerBackgroundPushHandler();
// Answer and Decline on the system call screen, also when only the background JS is running.
startCallKeepListeners().catch(err => console.warn('[CallKeep] Listener setup failed:', err));
register();

if (Platform.OS === 'android') {
  // Keeps the call's camera|microphone foreground service alive until stopForegroundService().
  notifee.registerForegroundService(() => new Promise(() => {}));
}

AppRegistry.registerComponent(appName, () => App);
