import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { queryClient } from '../../components/providers/ReactQueryProvider';
import { showErrorToast, showInfoToast } from '../../lib/common/toast.utils';
import { navigate } from '../../navigation/navigationRef';
import { AppRoute } from '../../route';
import { useMeetingStore } from '../../zustand/stores/useMeetingStore';
import { getApptToken } from '../react-query/appointments/appointments.funcs';
import { AppointmemntQueryKey } from '../react-query/query.keys';
import useDevicePermissions from './useDevicePermissions';

/** Only the fields the join-video-call flow actually needs. */
export interface IJoinVideoCallParams {
  id: string;
  appointment_id: string;
  patient_id: string;
  meeting_id?: string;
  call_duration_seconds?: number;
  start_time: string;
  end_time: string;
  doctorName?: string;
  patientAlphanumericId?: string;
}

const useJoinVideoCall = () => {
  const { t } = useTranslation();
  const { setMeetingSession } = useMeetingStore(state => state);
  const { requestAudioVideoPermissions } = useDevicePermissions();

  const handleJoinVideoCall = useCallback(
    async (params: IJoinVideoCallParams) => {
      if (!params) return;

      const storeState = useMeetingStore.getState();
      const isCallActive =
        (storeState.callState === 'CONNECTED' || storeState.callState === 'CONNECTING') &&
        Boolean(storeState.token && storeState.meetingId);

      const isCurrentAppt =
        isCallActive &&
        (String(storeState.appointmentId) === String(params.id) ||
          (Boolean(params.appointment_id) &&
            storeState.appointmentGeneratedId === params.appointment_id));

      if (isCurrentAppt) {
        storeState.setIsInAppPip(false);
        navigate(AppRoute.MEETING);
        return;
      }

      if (isCallActive) {
        showInfoToast(t('appointments.activeCallToast'), t('appointments.activeCallOngoing'));
        return;
      }

      const hasPermissions = await requestAudioVideoPermissions();
      if (!hasPermissions) {
        showErrorToast(t('appointments.permissionsRequired'));
        return;
      }

      const apptId = params.id;
      let token: string | undefined;
      let meetingId: string | undefined = params.meeting_id;
      let call_duration_seconds: number | undefined = params.call_duration_seconds;
      if (!apptId) {
        showErrorToast(t('appointments.noApptId'));
        return;
      }
      if (!params.patient_id) return showErrorToast(t('appointments.noPatientId'));

      try {
        const tokenResponse = await queryClient.fetchQuery({
          queryKey: [AppointmemntQueryKey.GET_TOKEN, 'token', apptId],
          queryFn: () => getApptToken(apptId),
        });
        token = tokenResponse?.data?.token || '';
        meetingId = tokenResponse?.data?.meeting_id || '';
      } catch (error) {
        console.error('Failed to fetch fresh appointment token:', error);
      }

      if (!token || !meetingId) {
        return showErrorToast(t('appointments.failedMeetingCredentials'));
      }

      const cleanedToken = token?.trim().replace(/^["']|["']$/g, '');
      const cleanedMeetingId = meetingId?.trim().replace(/^["']|["']$/g, '');

      if (!cleanedToken || !cleanedMeetingId) {
        showErrorToast(t('appointments.invalidMeetingCredentials'));
        return;
      }

      const docName = params.doctorName || t('appointments.doctorDefault');
      const docDisplayName = docName.startsWith('Dr.') ? docName : `Dr. ${docName}`;

      setMeetingSession({
        token: cleanedToken,
        meetingId: cleanedMeetingId,
        appointmentId: apptId,
        patientName: docDisplayName,
        patientAlphanumericId: params.patientAlphanumericId,
        appointmentGeneratedId: params.appointment_id,
        startTime: params.start_time,
        endTime: params.end_time,
        callDurationSeconds: call_duration_seconds ?? 0,
        patientUserId: String(params.patient_id),
      });

      navigate(AppRoute.MEETING);
    },
    [setMeetingSession, requestAudioVideoPermissions, t]
  );

  return { handleJoinVideoCall };
};

export default useJoinVideoCall;
