import { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';
import { create } from 'zustand';

export interface NetworkStoreState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: NetInfoStateType;
  isOffline: boolean;
  wasOffline: boolean;
  lastChangedAt: number | null;
  setNetworkState: (state: NetInfoState) => void;
  dismissWasOffline: () => void;
}

export const useNetworkStore = create<NetworkStoreState>((set, get) => ({
  isConnected: true,
  isInternetReachable: true,
  connectionType: NetInfoStateType.unknown,
  isOffline: false,
  wasOffline: false,
  lastChangedAt: null,

  setNetworkState: (state: NetInfoState) => {
    const isConnected = state.isConnected ?? true;
    const isInternetReachable = state.isInternetReachable;
    const isOffline = isConnected === false || isInternetReachable === false;
    const currentOffline = get().isOffline;

    const wasOffline = currentOffline && !isOffline;

    set({
      isConnected,
      isInternetReachable,
      connectionType: state.type,
      isOffline,
      wasOffline: wasOffline ? true : get().wasOffline,
      lastChangedAt: Date.now(),
    });
  },

  dismissWasOffline: () => {
    set({ wasOffline: false });
  },
}));

export default useNetworkStore;
