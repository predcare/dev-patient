import NativePip from '../../../native/NativePip';
import { resetRoot } from '../../../navigation/navigationRef';
import { AppRoute } from '../../../route';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';

let meetingStatusOpened = false;

export const resetMeetingStatusGuard = () => {
  meetingStatusOpened = false;
};

export const openMeetingStatusOnce = () => {
  if (meetingStatusOpened) return;

  const meetingState = useMeetingStore.getState();
  const appointmentId =
    meetingState.appointmentId || meetingState.callInfo?.appointment?.id || null;
  const hasLiveSession = Boolean(meetingState.callInfo?.meetingId || appointmentId);
  if (!hasLiveSession) return;

  meetingStatusOpened = true;
  NativePip.exitPipMode();
  NativePip.setMeetingScreenState(false);
  meetingState.resetCallInfo();
  resetRoot(
    AppRoute.CONSULTATION_COMPLETED,
    appointmentId != null ? { appointmentId } : undefined,
  );
};
