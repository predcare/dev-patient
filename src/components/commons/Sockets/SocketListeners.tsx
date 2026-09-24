import { useEffect } from 'react';
import { SocketEvents } from '../../../config/socket.constants';
import useIncomingCallStore from '../../../zustand/stores/useIncomingCallStore';
import { useSocketStore } from '../../../zustand/stores/useSocketStore';

const SocketListeners = () => {
  const { socketConnection } = useSocketStore();
  const { showCallBanner, hideCallBanner } = useIncomingCallStore(state => state);

  useEffect(() => {
    if (!socketConnection) return;

    const handleHeartbeat = (payload: any) => {
      console.log('💓 [Socket] HEARTBEAT received:', payload);
    };

    const handleIncomingCall = (payload: { appointmentId: string }) => {
      if (payload?.appointmentId) {
        showCallBanner({
          appointmentId: payload.appointmentId,
          callType: 'video',
          doctorName: 'Sahil Mallick',
          meetingId: '',
        });
      }
    };

    const handleCallCancelled = (payload: { appointmentId: string }) => {
      if (payload?.appointmentId) {
        hideCallBanner();
      }
    };

    // ---- REGISTER EVENTS ----
    socketConnection.on(SocketEvents.HEARTBEAT, handleHeartbeat);
    socketConnection.on(SocketEvents.INCOMING_CALL, handleIncomingCall);
    socketConnection.on(SocketEvents.INCOMING_CALL_CANCELLED, handleCallCancelled);

    // ---- CLEANUP ----
    return () => {
      socketConnection.off(SocketEvents.HEARTBEAT, handleHeartbeat);
      socketConnection.off(SocketEvents.INCOMING_CALL, handleIncomingCall);
      socketConnection.off(SocketEvents.INCOMING_CALL_CANCELLED, handleCallCancelled);
    };
  }, [socketConnection]);

  return null;
};

export default SocketListeners;
