import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import NativePip from '../../../native/NativePip';
import { navigationRef } from '../../../navigation/navigationRef';
import { AppRoute } from '../../../route';
import { MeetingCallState } from '../../../zustand/interfaces/meeting.interfaces';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';
import useMeetingConnection from './useMeetingConnection';

const PIP_ELIGIBLE_STATES: MeetingCallState[] = [
  'INITIALIZING',
  'CONNECTING',
  'WAITING_FOR_DOCTOR',
  'CONNECTED',
  'RECONNECTING',
];

const goToMeetingScreen = () => {
  if (!navigationRef.isReady()) return;
  if (navigationRef.getCurrentRoute()?.name !== AppRoute.MEETING) {
    navigationRef.navigate(AppRoute.MEETING as never);
  }
};

/** Android only: the system PiP window always shows the meeting stage, whatever screen was open. */
export const useAndroidPipLifecycle = () => {
  const { endCall } = useMeetingConnection();
  const callState = useMeetingStore(state => state.callState);
  const endCallRef = useRef(endCall);
  endCallRef.current = endCall;

  const isPipEligible = PIP_ELIGIBLE_STATES.includes(callState);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    NativePip.setMeetingScreenState(isPipEligible);
  }, [isPipEligible]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    // Swap to the compact stage before the system snapshots the window for the PiP animation.
    const willEnterSub = NativePip.addAndroidPipWillEnterListener(() => {
      const state = useMeetingStore.getState();
      if (!state.callInfo?.meetingId) return;
      state.setPipMode('NATIVE_PIP');
      goToMeetingScreen();
    });

    const changeSub = NativePip.addAndroidPipListener(active => {
      const state = useMeetingStore.getState();
      if (!state.callInfo?.meetingId) return;

      if (active) {
        if (state.pipMode !== 'NATIVE_PIP') {
          state.setPipMode('NATIVE_PIP');
        }
        goToMeetingScreen();
      } else if (state.pipMode === 'NATIVE_PIP') {
        state.setPipMode('NORMAL');
        goToMeetingScreen();
      }
    });

    const dismissSub = NativePip.addAndroidPipDismissListener(() => {
      if (!useMeetingStore.getState().callInfo?.meetingId) return;
      endCallRef.current();
    });

    return () => {
      willEnterSub?.remove();
      changeSub?.remove();
      dismissSub?.remove();
    };
  }, []);
};

export default useAndroidPipLifecycle;
