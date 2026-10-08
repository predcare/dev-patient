import notifee, {
  AndroidImportance,
  AndroidVisibility,
  AuthorizationStatus,
} from '@notifee/react-native';
import { Platform } from 'react-native';

export const NOTIFICATION_CHANNELS = {
  DOWNLOADS: {
    id: 'pdf_downloads',
    name: 'Document Downloads',
    description: 'Notifications for downloaded prescriptions, invoices, and health reports',
    importance: AndroidImportance.DEFAULT,
  },
  APPOINTMENTS: {
    id: 'appointments',
    name: 'Appointments',
    description: 'Reminders and updates for upcoming doctor appointments',
    importance: AndroidImportance.HIGH,
  },
  MEETING_ONGOING: {
    id: 'meeting-ongoing',
    name: 'Ongoing Consultation',
    description: 'Shown while a video consultation is in progress',
    importance: AndroidImportance.LOW,
  },
} as const;

export const createMeetingOngoingChannel = async (): Promise<string> => {
  return notifee.createChannel({
    id: NOTIFICATION_CHANNELS.MEETING_ONGOING.id,
    name: NOTIFICATION_CHANNELS.MEETING_ONGOING.name,
    description: NOTIFICATION_CHANNELS.MEETING_ONGOING.description,
    importance: NOTIFICATION_CHANNELS.MEETING_ONGOING.importance,
    visibility: AndroidVisibility.PUBLIC,
    vibration: false,
  });
};

/**
 * Initializes required Android notification channels. Safe to call idempotently.
 */
export const initNotificationChannels = async (): Promise<void> => {
  if (Platform.OS !== 'android') return;

  try {
    await notifee.createChannel({
      id: NOTIFICATION_CHANNELS.DOWNLOADS.id,
      name: NOTIFICATION_CHANNELS.DOWNLOADS.name,
      description: NOTIFICATION_CHANNELS.DOWNLOADS.description,
      importance: NOTIFICATION_CHANNELS.DOWNLOADS.importance,
      visibility: AndroidVisibility.PUBLIC,
      vibration: false,
    });
    await createMeetingOngoingChannel();
  } catch (err) {
    console.warn('[NotificationCore] Failed to create notification channels:', err);
  }
};

/**
 * Requests notification permissions for Android 13+ (POST_NOTIFICATIONS) and iOS.
 * Returns true if granted/provisional, false if denied.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
  } catch (err) {
    console.warn('[NotificationCore] Permission request failed:', err);
    return false;
  }
};

/**
 * Checks current notification permission status without prompting.
 */
export const getNotificationPermissionStatus = async (): Promise<boolean> => {
  try {
    const settings = await notifee.getNotificationSettings();
    return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
  } catch (err) {
    console.warn('[NotificationCore] Failed to get permission settings:', err);
    return false;
  }
};
