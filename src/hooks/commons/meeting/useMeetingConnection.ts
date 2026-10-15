import { useMeeting } from '@videosdk.live/react-native-sdk';
import { useCallback } from 'react';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';
import { openMeetingStatusOnce } from './openMeetingStatus';

export const useMeetingConnection = () => {
  const { leave: sdkLeave, end: sdkEnd } = useMeeting({});

  const callState = useMeetingStore(state => state.callState);

  const endCall = useCallback(async () => {
    try {
      if (sdkLeave) {
        await sdkLeave();
      }
    } catch (e) {
      console.warn('[useMeetingConnection] leave error:', e);
    } finally {
      openMeetingStatusOnce();
    }
  }, [sdkLeave]);

  return {
    callState,
    endCall,
  };
};

export default useMeetingConnection;
