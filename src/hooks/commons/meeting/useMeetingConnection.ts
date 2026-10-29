import { useCallback } from 'react';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';
import { endMeetingCall } from './meetingSessionLeave';

export const useMeetingConnection = () => {
  const callState = useMeetingStore(state => state.callState);

  const endCall = useCallback(async () => {
    await endMeetingCall();
  }, []);

  return {
    callState,
    endCall,
  };
};

export default useMeetingConnection;
