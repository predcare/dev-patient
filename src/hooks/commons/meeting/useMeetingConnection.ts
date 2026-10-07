import { useMeeting } from '@videosdk.live/react-native-sdk';
import { useCallback } from 'react';
import { resetRoot } from '../../../navigation/navigationRef';
import { AppRoute } from '../../../route';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';

export const useMeetingConnection = () => {
  const { leave: sdkLeave, end: sdkEnd } = useMeeting({});

  const callState = useMeetingStore(state => state.callState);
  const resetCallInfo = useMeetingStore(state => state.resetCallInfo);

  const endCall = useCallback(async () => {
    try {
      if (sdkLeave) {
        await sdkLeave();
      }
    } catch (e) {
      console.warn('[useMeetingConnection] leave error:', e);
    } finally {
      resetCallInfo();
      resetRoot(AppRoute.CONSULTATION_COMPLETED);
    }
  }, [sdkLeave, resetCallInfo]);

  return {
    callState,
    endCall,
  };
};

export default useMeetingConnection;
