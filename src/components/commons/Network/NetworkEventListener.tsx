import React, { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { useNetworkStore } from '../../../zustand/stores/useNetworkStore';

export const NetworkEventListener: React.FC = () => {
  const setNetworkState = useNetworkStore(state => state.setNetworkState);

  useEffect(() => {
    // 1. Sync TanStack Query's onlineManager with NetInfo
    onlineManager.setEventListener(setOnline => {
      return NetInfo.addEventListener(state => {
        const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);
        setOnline(isOnline);
      });
    });

    // 2. Fetch current state immediately on mount
    NetInfo.fetch().then(state => {
      setNetworkState(state);
    });

    // 3. Listen to network changes for application UI
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkState(state);
    });

    return () => {
      unsubscribe();
    };
  }, [setNetworkState]);

  return null;
};

export default NetworkEventListener;
