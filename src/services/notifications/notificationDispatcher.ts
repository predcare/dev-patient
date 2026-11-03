import notifee, { Event, EventType } from '@notifee/react-native';
import { getInitialNotification, getMessaging } from '@react-native-firebase/messaging';
import { CALL_ACTION_ANSWER, CALL_ACTION_DECLINE } from '../calls/androidRing';
import { callFromPush } from '../calls/callPayload';
import { answerCall, declineCall } from '../calls/callService';
import { handleDownloadNotificationPress } from './handlers/downloadNotification.handler';
import { handleMeetingNotificationPress } from './handlers/meetingNotification.handler';
import { handlePushNotificationPress } from './handlers/pushNotification.handler';
import { NotificationCategory, PdfDownloadNotificationData } from './notification.types';

/**
 * Central router for notification press interactions.
 * New notification types can be mapped here without touching callers or App.tsx.
 */
export const routeNotificationPress = async (event: Event): Promise<void> => {
  const { type, detail } = event;

  // Incoming call ring: Answer and Decline buttons (ACTION_PRESS) and a tap on the notification.
  const incomingCall = callFromPush(detail.notification?.data);
  if (incomingCall) {
    const actionId = detail.pressAction?.id;
    if (actionId === CALL_ACTION_DECLINE) {
      await declineCall(incomingCall.callId, incomingCall);
    } else if (actionId === CALL_ACTION_ANSWER || type === EventType.PRESS) {
      await answerCall(incomingCall.callId, incomingCall);
    }
    return;
  }

  if (type !== EventType.PRESS || !detail.notification?.data) {
    return;
  }

  const data = detail.notification.data;

  // Backend pushes carry event_action; the types below are for notifications the app creates.
  if (data.event_action) {
    handlePushNotificationPress(data);
    return;
  }

  switch (data.type) {
    case NotificationCategory.PDF_DOWNLOAD:
      await handleDownloadNotificationPress(data as unknown as PdfDownloadNotificationData);
      break;

    case NotificationCategory.APPOINTMENT_REMINDER:
      // Future handler registration e.g.:
      // await handleAppointmentNotificationPress(data as unknown as AppointmentNotificationData);
      break;

    case NotificationCategory.CONSULTATION_ALERT:
      // Future handler registration
      break;

    case NotificationCategory.MEETING_ONGOING:
      handleMeetingNotificationPress();
      break;

    // Anything else is a backend push shown by displayPush while the app was open.
    default:
      handlePushNotificationPress(data);
      break;
  }
};

let initialNotificationCheck: Promise<void> | null = null;

/**
 * Handles the notification tap that opened the app, if any. It runs once and never rejects,
 * so SplashScreen can safely wait for it before choosing the first screen.
 */
export const processInitialNotification = (): Promise<void> => {
  initialNotificationCheck ??= (async () => {
    // Notifee sees banners shown by displayPush; Firebase sees those shown by the phone.
    const [notifeeInitial, firebaseInitial] = await Promise.all([
      notifee.getInitialNotification().catch(err => {
        console.warn('[NotificationDispatcher] Notifee initial notification error:', err);
        return null;
      }),
      getInitialNotification(getMessaging()).catch(err => {
        console.warn('[NotificationDispatcher] Firebase initial notification error:', err);
        return null;
      }),
    ]);

    try {
      if (notifeeInitial?.notification?.data) {
        await routeNotificationPress({
          type: EventType.PRESS,
          detail: {
            notification: notifeeInitial.notification,
            pressAction: notifeeInitial.pressAction,
          },
        });
      } else if (firebaseInitial) {
        handlePushNotificationPress(firebaseInitial.data);
      }
    } catch (err) {
      console.warn('[NotificationDispatcher] Initial notification press failed:', err);
    }
  })();

  return initialNotificationCheck;
};

/**
 * Registers background notification event listener.
 * Safe to invoke once at the application entry point (index.js).
 */
export const registerBackgroundNotificationHandler = (): void => {
  notifee.onBackgroundEvent(async event => {
    await routeNotificationPress(event);
  });
};
