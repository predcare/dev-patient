/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { initializeI18n } from './src/config/i18n.config';
import { registerBackgroundNotificationHandler } from './src/services/notifications';

initializeI18n();
registerBackgroundNotificationHandler();

AppRegistry.registerComponent(appName, () => App);

