import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { baseUrl, localBaseUrl } from '../../../api/endpoints';
import { getItem, STORAGE_KEYS } from '../../../lib/common/asyncStorage';
import { useAuthStore } from '../../../zustand/stores/useAuthStore';
import { useSocketStore } from '../../../zustand/stores/useSocketStore';

const SocketProvider = () => {
  const socketRef = useRef<Socket | null>(null);
  const { isLoggedIn, userData } = useAuthStore();
  const { setSocketConnection, setIsConnected } = useSocketStore();

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
      const socketUrl = localBaseUrl ?? '';
      // const socketUrl = baseUrl ?? '';

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
  }, [isLoggedIn, userData?.id, setSocketConnection, setIsConnected]);

  return null;
};

export default SocketProvider;
