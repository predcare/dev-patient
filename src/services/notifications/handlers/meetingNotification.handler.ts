import { navigationRef } from '../../../navigation/navigationRef';
import { AppRoute } from '../../../route';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';

export const handleMeetingNotificationPress = (): void => {
  const meetingState = useMeetingStore.getState();
  if (!meetingState.callInfo?.meetingId) return;

  if (meetingState.pipMode !== 'NATIVE_PIP') {
    meetingState.setPipMode('NORMAL');
  }

  if (navigationRef.isReady() && navigationRef.getCurrentRoute()?.name !== AppRoute.MEETING) {
    navigationRef.navigate(AppRoute.MEETING as never);
  }
};
