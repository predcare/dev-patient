import { MediaStream } from '@videosdk.live/react-native-sdk';
import { useCallback } from 'react';
import { showErrorToast } from '../../../lib/common/toast.utils';
import { navigate } from '../../../navigation/navigationRef';
import { AppRoute } from '../../../route';
import { useLoadingStore } from '../../../zustand/stores/useLoadingStore';
import { useMeetingStore } from '../../../zustand/stores/useMeetingStore';
import { useGetToken } from '../../react-query/appointments/appointments.hooks';
import {
  createCameraTrack,
  createMicTrack,
  setPendingTracks,
  stopStream,
} from './meetingMediaTracks';
import useMeetingPermissions from './useMeetingPermissions';
import useMeetingPip from './useMeetingPip';

export type TJoinVideoCallResult = 'restored' | 'joined' | 'denied' | 'failed';

type TJoinTracks = { camera?: MediaStream; mic?: MediaStream };

/**
 * Opens the mic and camera once, so MeetingProvider does not open them a second time.
 * Never rejects: a failed track is undefined and the SDK opens that device itself, as before.
 */
export const openJoinTracks = async (): Promise<TJoinTracks> => {
  const [micResult, cameraResult] = await Promise.allSettled([
    createMicTrack(),
    useMeetingStore.getState().isCamOn ? createCameraTrack('hd') : Promise.resolve(undefined),
  ]);
  return {
    mic: micResult.status === 'fulfilled' ? micResult.value : undefined,
    camera: cameraResult.status === 'fulfilled' ? cameraResult.value : undefined,
  };
};

export const releaseJoinTracks = ({ camera, mic }: TJoinTracks) => {
  stopStream(camera);
  stopStream(mic);
};

/** One join path for the appointment screens: permission, then token and devices in parallel. */
export const useJoinVideoCall = () => {
  const { mutateAsync: getToken } = useGetToken();
  const showLoader = useLoadingStore(state => state.showLoader);
  const hideLoader = useLoadingStore(state => state.hideLoader);
  const setCallInfo = useMeetingStore(state => state.setCallInfo);
  const activeMeetingId = useMeetingStore(state => state.callInfo?.meetingId);
  const activeCallAppointmentId = useMeetingStore(state => state.callInfo?.appointment?.id);
  const { restoreToMeeting } = useMeetingPip();
  const { requestPermissions } = useMeetingPermissions();

  const joinVideoCall = useCallback(
    async (appointmentId?: string | number | null): Promise<TJoinVideoCallResult> => {
      if (!appointmentId) return 'failed';

      if (activeMeetingId && String(activeCallAppointmentId) === String(appointmentId)) {
        restoreToMeeting();
        return 'restored';
      }

      const hasPermissions = await requestPermissions();
      if (!hasPermissions) {
        showErrorToast(
          'Camera and microphone permissions are required to join the video consultation.'
        );
        return 'denied';
      }

      showLoader('Joining Video Call...');
      const [tokenResult, tracks] = await Promise.all([
        getToken({ appointmentId: String(appointmentId) }).then(
          res => ({ ok: true as const, res }),
          () => ({ ok: false as const, res: null }),
        ),
        openJoinTracks(),
      ]);

      try {
        const res = tokenResult.res;
        const videoCallData = res?.data;
        if (!tokenResult.ok || !res?.success || !videoCallData) {
          releaseJoinTracks(tracks);
          return 'failed';
        }

        setPendingTracks(tracks);
        setCallInfo({
          token: videoCallData.token,
          meeting_id: videoCallData.meeting_id,
          appointment: videoCallData.appointment,
          doctorInfo: {
            name: videoCallData.doctor?.name,
            doctorId: videoCallData.doctor?.id,
          },
        });
        navigate(AppRoute.MEETING);
        return 'joined';
      } finally {
        hideLoader();
      }
    },
    [
      activeCallAppointmentId,
      activeMeetingId,
      getToken,
      hideLoader,
      requestPermissions,
      restoreToMeeting,
      setCallInfo,
      showLoader,
    ]
  );

  return { joinVideoCall };
};

export default useJoinVideoCall;
