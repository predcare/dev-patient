import { useCallback, useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import NativePip from '../../../native/NativePip';
import { navigationRef } from '../../../navigation/navigationRef';
import { AppRoute } from '../../../route';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';

const goToMeetingScreen = () => {
  if (!navigationRef.isReady()) return;
  if (navigationRef.getCurrentRoute()?.name !== AppRoute.MEETING) {
    navigationRef.navigate(AppRoute.MEETING as never);
  }
};

export const useMeetingPip = () => {
  const pipMode = useMeetingStore(state => state.pipMode);
  const setPipMode = useMeetingStore(state => state.setPipMode);

  const enterInAppPip = useCallback(() => {
    setPipMode('IN_APP_PIP');
  }, [setPipMode]);

  const enterNativePip = useCallback(
    async (width = 300, height = 500) => {
      const started = await NativePip.enterPipMode(width, height);
      setPipMode(started ? 'NATIVE_PIP' : 'IN_APP_PIP');
      return started;
    },
    [setPipMode]
  );

  const restoreToMeeting = useCallback(() => {
    setPipMode('NORMAL');
    NativePip.exitPipMode();
    goToMeetingScreen();
  }, [setPipMode]);

  useEffect(() => {
    const subscription = NativePip.addPipChangeListener(active => {
      const state = useMeetingStore.getState();
      if (!state.callInfo?.meetingId) return;

      if (active) {
        state.setPipMode('NATIVE_PIP');
      } else if (state.pipMode === 'NATIVE_PIP') {
        state.setPipMode('NORMAL');
        goToMeetingScreen();
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') return;

      const meetingState = useMeetingStore.getState();
      if (meetingState.pipMode !== 'NATIVE_PIP' || !meetingState.callInfo?.meetingId) return;

      meetingState.setPipMode('NORMAL');
      NativePip.exitPipMode();
      goToMeetingScreen();
    });

    return () => subscription.remove();
  }, []);

  return {
    pipMode,
    isInAppPip: pipMode === 'IN_APP_PIP',
    isNativePip: pipMode === 'NATIVE_PIP',
    isNormal: pipMode === 'NORMAL',
    enterInAppPip,
    enterNativePip,
    restoreToMeeting,
  };
};

export default useMeetingPip;
