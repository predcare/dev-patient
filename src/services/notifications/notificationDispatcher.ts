import notifee, { Event, EventType } from '@notifee/react-native';
import { handleDownloadNotificationPress } from './handlers/downloadNotification.handler';
import { NotificationCategory, PdfDownloadNotificationData } from './notification.types';

/**
 * Central router for notification press interactions.
 * New notification types can be mapped here without touching callers or App.tsx.
 */
export const routeNotificationPress = async (event: Event): Promise<void> => {
  const { type, detail } = event;

  if (type !== EventType.PRESS || !detail.notification?.data) {
    return;
  }

  const data = detail.notification.data;

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

    default:
      console.log('[NotificationDispatcher] Unhandled notification type:', data.type);
      break;
  }
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
