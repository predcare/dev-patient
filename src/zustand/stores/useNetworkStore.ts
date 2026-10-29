import { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';
import { create } from 'zustand';

export interface NetworkStoreState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: NetInfoStateType;
  isOffline: boolean;
  wasOffline: boolean;
  lastChangedAt: number | null;
  /** Wifi signal 0-100 (Android only, null elsewhere). */
  wifiStrength: number | null;
  /** '2g' | '3g' | '4g' | '5g' on cellular, null otherwise. */
  cellularGeneration: string | null;
  /** Online, but too weak or slow to work reliably. */
  isUnstable: boolean;
  setNetworkState: (state: NetInfoState) => void;
  dismissWasOffline: () => void;
  setIsUnstable: (isUnstable: boolean) => void;
}

export const useNetworkStore = create<NetworkStoreState>((set, get) => ({
  isConnected: true,
  isInternetReachable: true,
  connectionType: NetInfoStateType.unknown,
  isOffline: false,
  wasOffline: false,
  lastChangedAt: null,
  wifiStrength: null,
  cellularGeneration: null,
  isUnstable: false,

  setNetworkState: (state: NetInfoState) => {
    const isConnected = state.isConnected ?? true;
    const isInternetReachable = state.isInternetReachable;
    const isOffline = isConnected === false || isInternetReachable === false;
    const currentOffline = get().isOffline;

    const wasOffline = currentOffline && !isOffline;
    const details = (state.details ?? null) as {
      strength?: number | null;
      cellularGeneration?: string | null;
    } | null;

    set({
      isConnected,
      isInternetReachable,
      connectionType: state.type,
      isOffline,
      wasOffline: wasOffline ? true : get().wasOffline,
      lastChangedAt: Date.now(),
      wifiStrength: typeof details?.strength === 'number' ? details.strength : null,
      cellularGeneration: details?.cellularGeneration ?? null,
    });
  },

  dismissWasOffline: () => {
    set({ wasOffline: false });
  },

  setIsUnstable: (isUnstable: boolean) => {
    if (get().isUnstable !== isUnstable) {
      set({ isUnstable });
    }
  },
}));

export default useNetworkStore;
