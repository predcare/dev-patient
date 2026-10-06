import NetInfo from '@react-native-community/netinfo';
import { useNetworkStore } from '../../zustand/stores/useNetworkStore';

export const useNetworkStatus = () => {
  const isConnected = useNetworkStore(state => state.isConnected);
  const isInternetReachable = useNetworkStore(state => state.isInternetReachable);
  const connectionType = useNetworkStore(state => state.connectionType);
  const isOffline = useNetworkStore(state => state.isOffline);
  const wasOffline = useNetworkStore(state => state.wasOffline);

  const checkConnectivity = async () => {
    const state = await NetInfo.fetch();
    useNetworkStore.getState().setNetworkState(state);
    return state;
  };

  return {
    isConnected,
    isInternetReachable,
    connectionType,
    isOffline,
    wasOffline,
    checkConnectivity,
  };
};

export default useNetworkStatus;
