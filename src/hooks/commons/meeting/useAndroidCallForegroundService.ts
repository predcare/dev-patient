import notifee, { AndroidForegroundServiceType } from '@notifee/react-native';
import { useEffect, useRef } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import {
  createMeetingOngoingChannel,
  NotificationCategory,
} from '../../../services/notifications';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';
import { MeetingCallState } from '../../../zustand/interfaces/meeting.interfaces';

const MEETING_NOTIFICATION_ID = 'meeting-ongoing';

// Android 12+ only allows starting the service while the app is in the foreground, which is
// the case once the meeting has been joined.
const SERVICE_STATES: MeetingCallState[] = ['WAITING_FOR_DOCTOR', 'CONNECTED', 'RECONNECTING'];

const startMeetingService = async (doctorName?: string) => {
  const channelId = await createMeetingOngoingChannel();
  const hasCamera = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
  const hasMic = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);

  const foregroundServiceTypes: AndroidForegroundServiceType[] = [];
  if (hasCamera) {
    foregroundServiceTypes.push(AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_CAMERA);
  }
  if (hasMic) {
    foregroundServiceTypes.push(AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_MICROPHONE);
  }
  if (foregroundServiceTypes.length === 0) return;

  await notifee.displayNotification({
    id: MEETING_NOTIFICATION_ID,
    title: 'PredCare Consultation',
    body: doctorName ? `Video consultation with ${doctorName} in progress` : 'Video consultation in progress',
    data: { type: NotificationCategory.MEETING_ONGOING },
    android: {
      channelId,
      asForegroundService: true,
      foregroundServiceTypes,
      ongoing: true,
      autoCancel: false,
      onlyAlertOnce: true,
      pressAction: { id: 'default', launchActivity: 'default' },
    },
  });
};

const stopMeetingService = async () => {
  try {
    await notifee.stopForegroundService();
    await notifee.cancelNotification(MEETING_NOTIFICATION_ID);
  } catch (e) {
    console.warn('[useAndroidCallForegroundService] stop error:', e);
  }
};

export const useAndroidCallForegroundService = () => {
  const callState = useMeetingStore(state => state.callState);
  const doctorName = useMeetingStore(state => state.doctorInfo?.name);
  const runningRef = useRef(false);

  const shouldRun = SERVICE_STATES.includes(callState);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    if (shouldRun && !runningRef.current) {
      runningRef.current = true;
      startMeetingService(doctorName).catch(e => {
        runningRef.current = false;
        console.warn('[useAndroidCallForegroundService] start error:', e);
      });
    } else if (!shouldRun && runningRef.current) {
      runningRef.current = false;
      stopMeetingService();
    }
  }, [shouldRun, doctorName]);

  useEffect(() => {
    return () => {
      if (Platform.OS === 'android' && runningRef.current) {
        runningRef.current = false;
        stopMeetingService();
      }
    };
  }, []);
};

export default useAndroidCallForegroundService;
