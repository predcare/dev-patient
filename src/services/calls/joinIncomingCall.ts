import { Platform } from 'react-native';
import { PERMISSIONS, requestMultiple, RESULTS } from 'react-native-permissions';
import { queryClient } from '../../components/providers/ReactQueryProvider';
import { setPendingTracks } from '../../hooks/commons/meeting/meetingMediaTracks';
import { openJoinTracks, releaseJoinTracks } from '../../hooks/commons/meeting/useJoinVideoCall';
import { getApptInfo, getApptToken } from '../../hooks/react-query/appointments/appointments.funcs';
import { AppointmemntQueryKey } from '../../hooks/react-query/query.keys';
import { showErrorToast, showInfoToast } from '../../lib/common/toast.utils';
import { navigate } from '../../navigation/navigationRef';
import { AppRoute } from '../../route';
import { ConsultStatus } from '../../typescripts/enums';
import { useLoadingStore } from '../../zustand/stores/useLoadingStore';
import { useMeetingStore } from '../../zustand/stores/useMeetingStore';

const CALL_PERMISSIONS =
  Platform.OS === 'ios'
    ? [PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.MICROPHONE]
    : [PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.RECORD_AUDIO];

// An appointment in one of these states has no call left to join.
const ENDED_STATUSES: string[] = [
  ConsultStatus.COMPLETED,
  ConsultStatus.CANCELLED,
  ConsultStatus.NO_SHOW,
];

const hasCallPermissions = async (): Promise<boolean> => {
  const result = await requestMultiple(CALL_PERMISSIONS);
  return CALL_PERMISSIONS.every(
    permission => result[permission] === RESULTS.GRANTED || result[permission] === RESULTS.LIMITED
  );
};

/**
 * Joins a call answered from a push (Android Answer button or a tap on the call notification).
 * Same steps as the banner's join in GlobalIncomingCallBanner, which stays as it is, but runs
 * outside React. The meeting token always comes from getApptToken, never from the push.
 */
export const joinIncomingCall = async (appointmentId: string, doctorName: string): Promise<void> => {
  // Already in a consultation (for example the same answer reaching here twice).
  if (useMeetingStore.getState().callInfo?.meetingId) return;

  if (!(await hasCallPermissions())) {
    showErrorToast('Please allow microphone and camera permissions to join the call');
    return;
  }

  const { showLoader, hideLoader } = useLoadingStore.getState();
  // Open the mic and camera while the appointment and token load; handed to the provider on
  // success, released on any failure.
  const tracksPromise = openJoinTracks();
  let tracksHandedOver = false;

  try {
    showLoader('Joining Video Call...');

    const apptResponse = await queryClient.fetchQuery({
      queryKey: [AppointmemntQueryKey.INFO, appointmentId],
      queryFn: () => getApptInfo(appointmentId),
      // Never a cached copy: the appointment's status decides whether there is still a call.
      staleTime: 0,
    });
    const apptInfo = apptResponse?.data;
    if (!apptInfo) {
      showErrorToast('Failed to load appointment details');
      return;
    }

    const status = String(apptInfo.appointment_status || '').toLowerCase();
    if (ENDED_STATUSES.includes(status)) {
      showInfoToast('This consultation has already ended.', 'Call ended');
      return;
    }

    const tokenRes = await getApptToken(appointmentId);
    if (!tokenRes?.data || !tokenRes?.success) {
      showErrorToast('Failed to join video call session');
      return;
    }

    setPendingTracks(await tracksPromise);
    tracksHandedOver = true;
    useMeetingStore.getState().setCallInfo({
      token: tokenRes.data.token,
      meeting_id: tokenRes.data.meeting_id,
      appointment: tokenRes.data.appointment || apptInfo,
      doctorInfo: {
        name: apptInfo.doctor?.name || doctorName,
        doctorId: apptInfo.doctor?.id,
      },
    });

    navigate(AppRoute.MEETING);
  } catch (error) {
    console.error('[joinIncomingCall] Join failed:', error);
    showErrorToast('Failed to join the call. Please try again.');
  } finally {
    if (!tracksHandedOver) releaseJoinTracks(await tracksPromise);
    hideLoader();
  }
};
