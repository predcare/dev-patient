import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BackdropLoader from './src/components/commons/BackdropLoader/BackdropLoader';
import EventListener from './src/components/commons/EventListener/EventListener';
import GlobalIncomingCallBanner from './src/components/commons/IncomingCallBanner/GlobalIncomingCallBanner';
import GlobalNoInternetBlocker from './src/components/commons/Network/GlobalNoInternetBlocker';
import GlobalOfflineBanner from './src/components/commons/Network/GlobalOfflineBanner';
import NetworkEventListener from './src/components/commons/Network/NetworkEventListener';
import GlobalPopupAlert from './src/components/commons/PopupAlert/GlobalPopupAlert';
import SocketListeners from './src/components/commons/Sockets/SocketListeners';
import SocketProvider from './src/components/commons/Sockets/SocketProvider';
import GlobalToast from './src/components/commons/Toast/GlobalToast';
import HideDuringAndroidPip from './src/components/meeting/HideDuringAndroidPip';
import MeetingSessionHost from './src/components/meeting/MeetingSessionHost';
import ReactQueryProvider from './src/components/providers/ReactQueryProvider';
import { LanguageProvider } from './src/contexts/LanguageContext';
import AppNavigator from './src/navigation/AppNavigator';
import NotificationEventListener from './src/services/notifications/components/NotificationEventListener';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <ReactQueryProvider>
      <SafeAreaProvider>
        <LanguageProvider>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <NetworkEventListener />
          <SocketProvider />
          <SocketListeners />
          <AppNavigator />
          <MeetingSessionHost />
          <EventListener />
          <NotificationEventListener />
          <HideDuringAndroidPip>
            <GlobalIncomingCallBanner />
            <GlobalOfflineBanner />
            <GlobalToast />
            <GlobalPopupAlert />
            <BackdropLoader />
            <GlobalNoInternetBlocker />
          </HideDuringAndroidPip>
        </LanguageProvider>
      </SafeAreaProvider>
    </ReactQueryProvider>
  );
}

export default App;
