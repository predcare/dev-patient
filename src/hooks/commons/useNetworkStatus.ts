import NetInfo, {
  NetInfoState,
  NetInfoStateType,
  NetInfoSubscription,
} from '@react-native-community/netinfo';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface NetworkStatus {
  /** Whether device has any network connectivity */
  isConnected: boolean;
  /** Whether internet is actually reachable (not just connected to WiFi) */
  isInternetReachable: boolean;
  /** Network type: wifi, cellular, ethernet, none, unknown, etc. */
  type: NetInfoStateType;
  /** Cellular generation: 2g, 3g, 4g, 5g (only if type is cellular) */
  cellularGeneration: string | null;
  /** Whether connection is expensive (metered like cellular) */
  isConnectionExpensive: boolean;
  /** Details from NetInfo (IP, subnet, strength, etc.) */
  details: NetInfoState['details'];
  /** True when we have a real working internet connection */
  isOnline: boolean;
  /** True when device is connected to a local network but no internet (captive portal etc.) */
  isOffline: boolean;
}

const INITIAL_STATE: NetworkStatus = {
  isConnected: false,
  isInternetReachable: false,
  type: NetInfoStateType.unknown,
  cellularGeneration: null,
  isConnectionExpensive: false,
  details: null,
  isOnline: false,
  isOffline: true,
};

/**
 * Global, optimized hook to track network connectivity.
 * Uses a single shared subscription across the app.
 */
export const useNetworkStatus = (): NetworkStatus => {
  const [status, setStatus] = useState<NetworkStatus>(INITIAL_STATE);
  const isMountedRef = useRef(true);

  // Memoized handler to avoid unnecessary re-renders
  const handleChange = useCallback((state: NetInfoState) => {
    if (!isMountedRef.current) return;

    const isConnected = state.isConnected ?? false;
    const isInternetReachable = state.isInternetReachable ?? false;

    // Only truly online if both flags are true
    const isOnline = isConnected && isInternetReachable !== false;
    const isOffline = !isConnected || isInternetReachable === false;

    setStatus(prev => {
      // Prevent unnecessary state updates (avoids re-renders)
      if (
        prev.isConnected === isConnected &&
        prev.isInternetReachable === isInternetReachable &&
        prev.type === state.type &&
        prev.isConnectionExpensive === (state.details as any)?.isConnectionExpensive &&
        prev.cellularGeneration === (state.details as any)?.cellularGeneration
      ) {
        return prev;
      }

      return {
        isConnected,
        isInternetReachable,
        type: state.type,
        cellularGeneration: (state.details as any)?.cellularGeneration ?? null,
        isConnectionExpensive: (state.details as any)?.isConnectionExpensive ?? false,
        details: state.details,
        isOnline,
        isOffline,
      };
    });
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    // 1. Fetch initial state immediately
    NetInfo.fetch()
      .then(handleChange)
      .catch(err => {
        if (__DEV__) console.warn('[useNetworkStatus] fetch error:', err);
      });

    // 2. Subscribe to changes
    const unsubscribe: NetInfoSubscription = NetInfo.addEventListener(handleChange);

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, [handleChange]);

  return status;
};

export default useNetworkStatus;
