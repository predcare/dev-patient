import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import BackdropLoader from './src/components/commons/BackdropLoader/BackdropLoader';
import EventListener from './src/components/commons/EventListener/EventListener';
import ReactQueryProvider from './src/components/providers/ReactQueryProvider';
import AppNavigator from './src/navigation/AppNavigator';

function App(): React.JSX.Element {
  return (
    <ReactQueryProvider>
      <SafeAreaProvider>
        <AppNavigator />
        <Toast position="top" />
        <EventListener />
        <BackdropLoader />
      </SafeAreaProvider>
    </ReactQueryProvider>
  );
}

export default App;
