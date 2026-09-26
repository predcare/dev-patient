import React from 'react';
import { queryClient } from '../../../components/providers/ReactQueryProvider';
import useDevicePermissions from '../../../hooks/commons/useDevicePermissions';
import useJoinVideoCall from '../../../hooks/commons/useJoinVideoCall';
import { getApptInfo } from '../../../hooks/react-query/appointments/appointments.funcs';
import { AppointmemntQueryKey } from '../../../hooks/react-query/query.keys';
import { showErrorToast } from '../../../lib/common/toast.utils';
import { useIncomingCallStore } from '../../../zustand/stores/useIncomingCallStore';
import { useLoadingStore } from '../../../zustand/stores/useLoadingStore';
import IncomingCallBanner from './IncomingCallBanner';

export const GlobalIncomingCallBanner: React.FC = () => {
  const { visible, doctorName, callType, appointmentId } = useIncomingCallStore(state => state);
  const { hideCallBanner } = useIncomingCallStore(state => state);
  const { showLoader, hideLoader } = useLoadingStore(state => state);
  const { requestAudioVideoPermissions } = useDevicePermissions();
  const { handleJoinVideoCall } = useJoinVideoCall();

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

    try {
      showLoader('Joining call...');

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

      hideCallBanner();

      await handleJoinVideoCall({
        id: apptInfo.id,
        appointment_id: apptInfo.appointment_id,
        patient_id: apptInfo.patient?.user_id || apptInfo.patient_id,
        start_time: apptInfo.start_time,
        end_time: apptInfo.end_time,
        call_duration_seconds: apptInfo.call_duration_seconds ?? undefined,
        doctorName: apptInfo.doctor?.name,
        patientAlphanumericId: apptInfo.patient?.patient_id,
      });
    } catch (error) {
      console.error('[GlobalIncomingCallBanner] Join failed:', error);
      showErrorToast('Failed to join the call. Please try again.');
    } finally {
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
