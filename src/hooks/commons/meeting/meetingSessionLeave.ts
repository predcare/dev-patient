import { useMeeting } from '@videosdk.live/react-native-sdk';
import { useEffect } from 'react';

type LeaveMeeting = () => Promise<void>;

let leaveMeeting: LeaveMeeting | null = null;

export const registerMeetingLeave = (leave: LeaveMeeting | null) => {
  leaveMeeting = leave;
};

/** Mount once inside MeetingProvider so a socket time-up can leave the live call. */
export const useRegisterMeetingLeave = () => {
  const { leave: sdkLeave } = useMeeting({});

  useEffect(() => {
    if (!sdkLeave) {
      registerMeetingLeave(null);
      return;
    }
    registerMeetingLeave(async () => {
      await sdkLeave();
    });
    return () => registerMeetingLeave(null);
  }, [sdkLeave]);
};

/** Leaves the live VideoSDK session. Safe to call when no call is mounted. */
export const leaveActiveMeeting = async () => {
  if (!leaveMeeting) return;
  try {
    await leaveMeeting();
  } catch (e) {
    console.warn('[meetingSessionLeave] leave error:', e);
  }
};
