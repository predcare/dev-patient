import { useEffect } from 'react';
import { SocketEvents } from '../../../config/socket.constants';
import { useSocketStore } from '../../../zustand/stores/useSocketStore';

const SocketListeners = () => {
  const { socketConnection } = useSocketStore();

  useEffect(() => {
    if (!socketConnection) return;

    const handleHeartbeat = (payload: any) => {
      console.log('💓 [Socket] HEARTBEAT received:', payload);
    };

    // ---- REGISTER EVENTS ----
    socketConnection.on(SocketEvents.HEARTBEAT, handleHeartbeat);

    // ---- CLEANUP ----
    return () => {
      socketConnection.off(SocketEvents.HEARTBEAT, handleHeartbeat);
    };
  }, [socketConnection]);

  return null;
};

export default SocketListeners;
