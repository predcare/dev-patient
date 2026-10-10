import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { getItem, STORAGE_KEYS } from '../../../lib/common/asyncStorage';
import { baseUrl } from '../../../services/api/endpoints';
import { useAuthStore } from '../../../zustand/stores/useAuthStore';
import { useSocketStore } from '../../../zustand/stores/useSocketStore';

const SocketProvider = () => {
  const socketRef = useRef<Socket | null>(null);
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const userId = useAuthStore(state => state.userData?.id);
  const setSocketConnection = useSocketStore(state => state.setSocketConnection);
  const setIsConnected = useSocketStore(state => state.setIsConnected);

  useEffect(() => {
    let isMounted = true;

    const initSocket = async () => {
      if (!isLoggedIn) {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
          setSocketConnection(null);
          setIsConnected(false);
        }
        return;
      }

      const token = await getItem(STORAGE_KEYS.AUTH_TOKEN);
      const socketUrl = baseUrl ?? '';

      if (!token || !socketUrl || !isMounted) return;
      if (socketRef.current?.connected) return;

      const socket = io(socketUrl, {
        auth: {
          token,
        },
        extraHeaders: {
          Authorization: `Bearer ${token}`,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.info('✅ Socket connected:', socket.id);
        setIsConnected(true);
      });

      socket.on('disconnect', reason => {
        console.info('ℹ️ Socket disconnected:', reason);
        setIsConnected(false);
      });

      socket.on('connect_error', err => {
        console.error('❌ Socket connection error:', err.message);
        setIsConnected(false);
      });

      setSocketConnection(socket);
    };

    initSocket();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocketConnection(null);
        setIsConnected(false);
      }
    };
  }, [isLoggedIn, userId, setSocketConnection, setIsConnected]);

  return null;
};

export default SocketProvider;
