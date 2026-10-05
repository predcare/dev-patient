import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { initializeI18n } from './src/config/i18n.config';
import { registerBackgroundNotificationHandler } from './src/services/notifications';
import { register } from '@videosdk.live/react-native-sdk';

initializeI18n();
registerBackgroundNotificationHandler();
register();

AppRegistry.registerComponent(appName, () => App);

