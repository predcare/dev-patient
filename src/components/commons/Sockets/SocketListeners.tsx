import { useEffect } from 'react';
import { NativeModules, Platform } from 'react-native';
import { queryClient } from '../../../components/providers/ReactQueryProvider';
import { SocketEvents } from '../../../config/socket.constants';
import { AppointmemntQueryKey } from '../../../hooks/react-query/query.keys';
import { showInfoToast } from '../../../lib/common/toast.utils';
import { navigationRef, replace } from '../../../navigation/navigationRef';
import { AppRoute } from '../../../route';
import useIncomingCallStore from '../../../zustand/stores/useIncomingCallStore';
import { useLoadingStore } from '../../../zustand/stores/useLoadingStore';
import { useMeetingStore } from '../../../zustand/stores/useMeetingStore';
import { useSocketStore } from '../../../zustand/stores/useSocketStore';

const { PiPModule } = NativeModules;

const SocketListeners = () => {
  const { socketConnection } = useSocketStore();
  const { showCallBanner } = useIncomingCallStore(state => state);

  useEffect(() => {
    if (!socketConnection) return;

    const handleHeartbeat = (payload: any) => {
      console.log('💓 [Socket] HEARTBEAT received:', payload);
    };

    const handleIncomingCall = (payload: {
      appointmentId: string;
      name: string;
      meetingId: string;
      callType: string;
    }) => {
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

    const handleTimeUpVideoCallEnded = (payload: { appointmentId: string | number }) => {
      const incomingApptId = payload?.appointmentId;
      if (!incomingApptId) return;

      // 1. Hide incoming call banner if currently visible for this appointment
      const incomingState = useIncomingCallStore.getState();
      if (String(incomingApptId) === String(incomingState.appointmentId)) {
        incomingState.hideCallBanner();
      }

      // 2. Check if an active meeting is ongoing for this appointment
      const meetingState = useMeetingStore.getState();
      const isCallActiveForThisAppt = String(incomingApptId) === String(meetingState.appointmentId);

      if (isCallActiveForThisAppt) {
        // Dismiss Native PiP on Android if active
        if (Platform.OS === 'android' && PiPModule?.setCallActive) {
          PiPModule.setCallActive(false).catch?.(() => {});
        }

        // Clean up meeting state & loaders
        meetingState.resetMeetingStore();
        useLoadingStore.getState().hideLoader();

        // Inform the user
        showInfoToast('Consultation time has ended. The call has ended.', '⏱ Time Up');

        // Invalidate queries so appointment details/list show fresh status
        queryClient.invalidateQueries({
          queryKey: [AppointmemntQueryKey.ALL_APPOINTMENTS],
        });
        queryClient.invalidateQueries({
          queryKey: [AppointmemntQueryKey.INFO, incomingApptId],
        });

        // Navigate user to appointment details
        const targetApptId = Number(incomingApptId) || incomingApptId;
        const currentRoute = navigationRef.isReady() ? navigationRef.getCurrentRoute()?.name : null;

        if (currentRoute === AppRoute.APPOINTMENT_DETAILS) {
          replace(AppRoute.APPOINTMENT_DETAILS, {
            appointmentId: targetApptId as any,
            isComingFromNotification: false,
          });
        } else {
          replace(AppRoute.APPOINTMENT_DETAILS, {
            appointmentId: targetApptId as any,
            isComingFromNotification: false,
          });
        }
      }
    };

    // ---- REGISTER EVENTS ----
    socketConnection.on(SocketEvents.HEARTBEAT, handleHeartbeat);
    socketConnection.on(SocketEvents.INCOMING_CALL, handleIncomingCall);
    socketConnection.on(SocketEvents.INCOMING_CALL_CANCELLED, handleCallCancelled);
    socketConnection.on(SocketEvents.TIME_UP_VIDEO_CALL_ENDED, handleTimeUpVideoCallEnded);

    // ---- CLEANUP ----
    return () => {
      socketConnection.off(SocketEvents.HEARTBEAT, handleHeartbeat);
      socketConnection.off(SocketEvents.INCOMING_CALL, handleIncomingCall);
      socketConnection.off(SocketEvents.INCOMING_CALL_CANCELLED, handleCallCancelled);
      socketConnection.off(SocketEvents.TIME_UP_VIDEO_CALL_ENDED, handleTimeUpVideoCallEnded);
    };
  }, [socketConnection, showCallBanner]);

  return null;
};

export default SocketListeners;
