import { Socket } from 'socket.io-client';
import { create } from 'zustand';

interface ISocketState {
  socketConnection: Socket | null;
  isConnected: boolean;
  setSocketConnection: (socket: Socket | null) => void;
  setIsConnected: (connected: boolean) => void;
}

export const useSocketStore = create<ISocketState>(set => ({
  socketConnection: null,
  isConnected: false,
  setSocketConnection: socket =>
    set({
      socketConnection: socket,
      isConnected: Boolean(socket?.connected),
    }),
  setIsConnected: isConnected => set({ isConnected }),
}));
