import { useMeeting } from '@videosdk.live/react-native-sdk';
import { useEffect } from 'react';
import { MEETING_LEAVE_TIMEOUT_MS } from '../../../config/meeting.constants';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';
import { openMeetingStatusOnce } from './openMeetingStatus';

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

/**
 * Every intentional end (END button, PiP end, time-up, offline exit) goes through here,
 * so a network drop can be told apart from an end and is not treated as one.
 */
export const endMeetingCall = async () => {
  const store = useMeetingStore.getState();
  if (!store.callInfo?.meetingId && !store.appointmentId) return;
  store.setEndRequested(true);

  try {
    if (!leaveMeeting) throw new Error('No active meeting session');
    await Promise.race([
      leaveMeeting(),
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error('Leave timed out')), MEETING_LEAVE_TIMEOUT_MS),
      ),
    ]);
  } catch (e) {
    console.warn('[meetingSessionLeave] endMeetingCall:', e);
  } finally {
    // onMeetingLeft usually opens the status screen first; the guard makes this a no-op then.
    openMeetingStatusOnce();
  }
};
