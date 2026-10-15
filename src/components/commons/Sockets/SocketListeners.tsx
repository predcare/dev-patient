import { useEffect } from 'react';
import { queryClient } from '../../../components/providers/ReactQueryProvider';
import { SocketEvents } from '../../../config/socket.constants';
import { leaveActiveMeeting } from '../../../hooks/commons/meeting/meetingSessionLeave';
import { AppointmemntQueryKey } from '../../../hooks/react-query/query.keys';
import { showInfoToast } from '../../../lib/common/toast.utils';
import NativePip from '../../../native/NativePip';
import useIncomingCallStore from '../../../zustand/stores/useIncomingCallStore';
import { useLoadingStore } from '../../../zustand/stores/useLoadingStore';
import { useMeetingStore } from '../../../zustand/stores/useMeetingStore';
import { useSocketStore } from '../../../zustand/stores/useSocketStore';

const SocketListeners = () => {
  const socketConnection = useSocketStore(state => state.socketConnection);
  const showCallBanner = useIncomingCallStore(state => state.showCallBanner);
  const activeMeetingId = useMeetingStore(state => state.callInfo?.meetingId);

  useEffect(() => {
    if (!socketConnection) return;

    const handleIncomingCall = (payload: {
      appointmentId: string;
      name: string;
      meetingId: string;
      callType: string;
    }) => {
      if (activeMeetingId && payload.meetingId) {
        return null;
      }
      if (payload?.appointmentId) {
        showCallBanner({
          appointmentId: payload.appointmentId,
          callType: payload?.callType,
          doctorName: payload?.name,
          meetingId: payload?.meetingId,
        });
      }
    };

    const handleCallCancelled = (payload: { appointmentId: string }) => {
      if (payload?.appointmentId) {
        const incomingState = useIncomingCallStore.getState();
        if (String(payload.appointmentId) === String(incomingState.appointmentId)) {
          incomingState.hideCallBanner();
        }
      }
    };

    const handleTimeUpVideoCallEnded = async (payload: { appointmentId: string | number }) => {
      const incomingApptId = payload?.appointmentId;
      if (!incomingApptId) return;

      const incomingState = useIncomingCallStore.getState();
      if (String(incomingApptId) === String(incomingState.appointmentId)) {
        incomingState.hideCallBanner();
      }

      const meetingState = useMeetingStore.getState();
      const isCallActiveForThisAppt = String(incomingApptId) === String(meetingState.appointmentId);

      if (!isCallActiveForThisAppt) return;

      await leaveActiveMeeting();
      NativePip.exitPipMode();
      NativePip.setMeetingScreenState(false);

      useMeetingStore.getState().resetCallInfo();
      useLoadingStore.getState().hideLoader();

      showInfoToast('Consultation time has ended. The call has ended.', 'Time Up');

      await queryClient.invalidateQueries({
        queryKey: [AppointmemntQueryKey.ALL_APPOINTMENTS],
      });
      await queryClient.invalidateQueries({
        queryKey: [AppointmemntQueryKey.INFO, incomingApptId],
      });
    };

    // ---- REGISTER EVENTS ----
    socketConnection.on(SocketEvents.INCOMING_CALL, handleIncomingCall);
    socketConnection.on(SocketEvents.INCOMING_CALL_CANCELLED, handleCallCancelled);
    socketConnection.on(SocketEvents.TIME_UP_VIDEO_CALL_ENDED, handleTimeUpVideoCallEnded);

    // ---- CLEANUP ----
    return () => {
      socketConnection.off(SocketEvents.INCOMING_CALL, handleIncomingCall);
      socketConnection.off(SocketEvents.INCOMING_CALL_CANCELLED, handleCallCancelled);
      socketConnection.off(SocketEvents.TIME_UP_VIDEO_CALL_ENDED, handleTimeUpVideoCallEnded);
    };
  }, [socketConnection, showCallBanner]);

  return null;
};

export default SocketListeners;
