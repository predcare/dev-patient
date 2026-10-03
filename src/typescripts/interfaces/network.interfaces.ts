export type ConnectionType = 'wifi' | 'cellular' | 'ethernet' | 'bluetooth' | 'wimax' | 'vpn' | 'other' | 'none' | 'unknown';

export interface IActiveNetworkRequest {
  id: string;
  url: string;
  method: string;
  startTime: number;
  tag?: string;
}

export interface INetworkState {
  isOnline: boolean;
  isInternetReachable: boolean | null;
  connectionType: ConnectionType;
  activeRequests: IActiveNetworkRequest[];
  isNetworkBusy: boolean;
  
  // Actions
  setIsOnline: (isOnline: boolean) => void;
  setIsInternetReachable: (isReachable: boolean | null) => void;
  setConnectionType: (type: ConnectionType) => void;
  setNetworkStatus: (status: { isOnline?: boolean; isInternetReachable?: boolean | null; connectionType?: ConnectionType }) => void;
  registerRequest: (request: IActiveNetworkRequest) => void;
  removeRequest: (id: string) => void;
  clearAllRequests: () => void;
}

export interface IUseNetworkReturn {
  isOnline: boolean;
  isInternetReachable: boolean | null;
  connectionType: ConnectionType;
  isNetworkBusy: boolean;
  activeRequestsCount: number;
  activeRequests: IActiveNetworkRequest[];
  hasPendingMutations: boolean;
  hasPendingQueries: boolean;
}
