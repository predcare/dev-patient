import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { queryClient } from '../../../components/providers/ReactQueryProvider';
import { setPendingTracks } from '../../../hooks/commons/meeting/meetingMediaTracks';
import { openJoinTracks, releaseJoinTracks } from '../../../hooks/commons/meeting/useJoinVideoCall';
import useDevicePermissions from '../../../hooks/commons/useDevicePermissions';
import {
  getApptInfo,
  getApptToken,
} from '../../../hooks/react-query/appointments/appointments.funcs';
import { AppointmemntQueryKey } from '../../../hooks/react-query/query.keys';
import { showErrorToast } from '../../../lib/common/toast.utils';
import { navigate } from '../../../navigation/navigationRef';
import { AppRoute } from '../../../route';
import { useIncomingCallStore } from '../../../zustand/stores/useIncomingCallStore';
import { useLoadingStore } from '../../../zustand/stores/useLoadingStore';
import { useMeetingStore } from '../../../zustand/stores/useMeetingStore';
import IncomingCallBanner from './IncomingCallBanner';

export const GlobalIncomingCallBanner: React.FC = () => {
  const { visible, doctorName, callType, appointmentId, hideCallBanner } = useIncomingCallStore(
    useShallow(state => ({
      visible: state.visible,
      doctorName: state.doctorName,
      callType: state.callType,
      appointmentId: state.appointmentId,
      hideCallBanner: state.hideCallBanner,
    }))
  );
  const showLoader = useLoadingStore(state => state.showLoader);
  const hideLoader = useLoadingStore(state => state.hideLoader);
  const { requestAudioVideoPermissions } = useDevicePermissions();
  const setCallInfo = useMeetingStore(state => state.setCallInfo);

  if (!visible) return null;

  const handleJoin = async () => {
    if (!appointmentId) {
      showErrorToast('No appointment ID found');
      return;
    }
    const hasPermissions = await requestAudioVideoPermissions();
    if (!hasPermissions) {
      showErrorToast('Please allow microphone and camera permissions to join the call');
      return;
    }

    // Open the mic and camera while the appointment and token load; handed to the provider on
    // success, released on any failure.
    const tracksPromise = openJoinTracks();
    let tracksHandedOver = false;

    try {
      showLoader('Joining Video Call...');

      const apptResponse = await queryClient.fetchQuery({
        queryKey: [AppointmemntQueryKey.INFO, appointmentId],
        queryFn: () => getApptInfo(appointmentId),
      });

      const apptInfo = apptResponse?.data;
      if (!apptInfo) {
        hideLoader();
        showErrorToast('Failed to load appointment details');
        return;
      }

      const tokenRes = await getApptToken(appointmentId);
      if (!tokenRes?.data || !tokenRes?.success) {
        hideLoader();
        showErrorToast('Failed to join video call session');
        return;
      }

      setPendingTracks(await tracksPromise);
      tracksHandedOver = true;
      setCallInfo({
        token: tokenRes.data.token,
        meeting_id: tokenRes.data.meeting_id,
        appointment: tokenRes.data.appointment || apptInfo,
        doctorInfo: {
          name: apptInfo.doctor?.name || doctorName,
          doctorId: apptInfo.doctor?.id,
        },
      });

      hideCallBanner();
      navigate(AppRoute.MEETING);
    } catch (error) {
      console.error('[GlobalIncomingCallBanner] Join failed:', error);
      showErrorToast('Failed to join the call. Please try again.');
    } finally {
      if (!tracksHandedOver) releaseJoinTracks(await tracksPromise);
      hideLoader();
    }
  };

  return (
    <IncomingCallBanner
      visible={visible}
      doctorName={doctorName}
      callType={callType}
      onJoin={handleJoin}
    />
  );
};

export default GlobalIncomingCallBanner;
