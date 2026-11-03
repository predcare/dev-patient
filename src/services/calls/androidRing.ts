import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidVisibility,
} from '@notifee/react-native';
import { NotificationEventActions } from '../notifications/notification.types';
import { NOTIFICATION_CHANNELS } from '../notifications/notification.core';
import type { IncomingCall } from './call.types';
import { callToData } from './callPayload';

export const CALL_ACTION_ANSWER = 'call_answer';
export const CALL_ACTION_DECLINE = 'call_decline';

const RING_CHANNEL = {
  id: 'incoming_call',
  name: 'Incoming doctor calls',
  description: 'Rings when your doctor starts a video consultation',
};

// Android won't change a channel's sound or importance after it's created.
const createRingChannel = () =>
  notifee.createChannel({
    id: RING_CHANNEL.id,
    name: RING_CHANNEL.name,
    description: RING_CHANNEL.description,
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
    sound: 'ringtone', // res/raw/ringtone.mp3
    vibration: true,
    vibrationPattern: [300, 1000, 500, 1000],
  });

export const showAndroidRing = async (call: IncomingCall): Promise<void> => {
  // Created here too: in the background, NotificationEventListener hasn't mounted.
  await createRingChannel();

  await notifee.displayNotification({
    id: call.callId,
    title: call.callerName,
    body: 'Incoming video consultation',
    data: callToData(call),
    android: {
      channelId: RING_CHANNEL.id,
      smallIcon: 'ic_launcher',
      category: AndroidCategory.CALL,
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      ongoing: true,
      autoCancel: false,
      loopSound: true,
      // Stops the ring if the cancel push never arrives.
      timeoutAfter: Math.max(call.expiresAtMs - Date.now(), 5000),
      pressAction: { id: 'default', launchActivity: 'default' },
      fullScreenAction: { id: 'default' },
      actions: [
        { title: 'Decline', pressAction: { id: CALL_ACTION_DECLINE } },
        { title: 'Answer', pressAction: { id: CALL_ACTION_ANSWER, launchActivity: 'default' } },
      ],
    },
  });
};

export const stopAndroidRing = (callId: string): Promise<void> =>
  notifee.cancelNotification(callId).catch(() => {});

// A visible result also keeps FCM from lowering the priority of the high-priority cancel push.
export const showMissedCall = async (call: IncomingCall): Promise<void> => {
  const channel = NOTIFICATION_CHANNELS.APPOINTMENTS;
  await notifee.createChannel({
    id: channel.id,
    name: channel.name,
    description: channel.description,
    importance: channel.importance,
    visibility: AndroidVisibility.PUBLIC,
  });

  await notifee.displayNotification({
    id: `missed-${call.callId}`,
    title: 'Missed call',
    body: `${call.callerName} tried to start your consultation. Open the appointment to join.`,
    // Opens the appointment through the existing push tap routing.
    data: {
      event_action: NotificationEventActions.APPOINTMENT_REMINDER,
      id: call.appointmentId,
    },
    android: {
      channelId: channel.id,
      smallIcon: 'ic_launcher',
      pressAction: { id: 'default', launchActivity: 'default' },
      autoCancel: true,
    },
  });
};
