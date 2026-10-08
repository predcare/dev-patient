import React from 'react';
import { Platform } from 'react-native';
import useMeetingStore from '../../zustand/stores/useMeetingStore';

/** Keeps app-wide banners, toasts and modals out of the Android system PiP window. */
export const HideDuringAndroidPip: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAndroidPip = useMeetingStore(
    state => Platform.OS === 'android' && state.pipMode === 'NATIVE_PIP'
  );

  if (isAndroidPip) {
    return null;
  }

  return <>{children}</>;
};

export default HideDuringAndroidPip;
