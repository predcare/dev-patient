import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BackdropLoader from './src/components/commons/BackdropLoader/BackdropLoader';
import EventListener from './src/components/commons/EventListener/EventListener';
import GlobalPopupAlert from './src/components/commons/PopupAlert/GlobalPopupAlert';
import GlobalToast from './src/components/commons/Toast/GlobalToast';
import ReactQueryProvider from './src/components/providers/ReactQueryProvider';
import AppNavigator from './src/navigation/AppNavigator';
import theme from './src/styled/theme.styled';
import { GlobalMeetingManager } from './src/components/Modules/PatientMeeting';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <ReactQueryProvider>
      <SafeAreaProvider>
        <AppNavigator />
        <GlobalMeetingManager />
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        <GlobalToast />
        <GlobalPopupAlert />
        <BackdropLoader />
        <EventListener />
      </SafeAreaProvider>
    </ReactQueryProvider>
  );
}

export default App;
