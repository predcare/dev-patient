import notifee from '@notifee/react-native';
import { register } from '@videosdk.live/react-native-sdk';
import { AppRegistry, Platform } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { initializeI18n } from './src/config/i18n.config';
import { registerBackgroundNotificationHandler } from './src/services/notifications';

initializeI18n();
registerBackgroundNotificationHandler();
register();

if (Platform.OS === 'android') {
  // Keeps the call's camera|microphone foreground service alive until stopForegroundService().
  notifee.registerForegroundService(() => new Promise(() => {}));
}

AppRegistry.registerComponent(appName, () => App);
