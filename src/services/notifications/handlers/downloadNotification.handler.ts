import notifee from '@notifee/react-native';
import { openOrShareFile } from '../../../lib/common/file.utils';
import {
  initNotificationChannels,
  NOTIFICATION_CHANNELS,
  requestNotificationPermission,
} from '../notification.core';
import { NotificationCategory, PdfDownloadNotificationData } from '../notification.types';

export interface ShowDownloadNotificationParams {
  filePath: string;
  fileName: string;
  title?: string;
  message?: string;
}

/**
 * Dispatches a completed download notification to the Android / iOS notification tray.
 */
export const showDownloadCompleteNotification = async ({
  filePath,
  fileName,
  title = 'Download Complete',
  message,
}: ShowDownloadNotificationParams): Promise<string | null> => {
  try {
    await initNotificationChannels();

    const granted = await requestNotificationPermission();
    if (!granted) {
      console.log('[DownloadNotification] Notification permission not granted, skipping tray notification.');
      return null;
    }

    const payload: PdfDownloadNotificationData = {
      type: NotificationCategory.PDF_DOWNLOAD,
      filePath,
      fileName,
      mimeType: 'application/pdf',
      title,
    };

    const notificationId = await notifee.displayNotification({
      title,
      body: message || `${fileName} is ready. Tap to view.`,
      data: payload as unknown as { [key: string]: string | number | object },
      android: {
        channelId: NOTIFICATION_CHANNELS.DOWNLOADS.id,
        smallIcon: 'ic_launcher',
        pressAction: {
          id: 'default',
        },
        autoCancel: true,
      },
      ios: {
        sound: 'default',
        foregroundPresentationOptions: {
          banner: true,
          badge: true,
          sound: true,
        },
      },
    });

    return notificationId;
  } catch (err) {
    console.warn('[DownloadNotification] Failed to display notification:', err);
    return null;
  }
};

/**
 * Handles user tap on a PDF download notification.
 * Opens the file in the default viewer with fallback to system share sheet.
 */
export const handleDownloadNotificationPress = async (
  data: PdfDownloadNotificationData
): Promise<void> => {
  if (!data?.filePath) return;
  try {
    await openOrShareFile(data.filePath, data.fileName || 'Document');
  } catch (err) {
    console.warn('[DownloadNotification] Failed to open document from notification tap:', err);
  }
};
