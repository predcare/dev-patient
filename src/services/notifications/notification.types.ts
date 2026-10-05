export enum NotificationCategory {
  PDF_DOWNLOAD = 'PDF_DOWNLOAD',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  CONSULTATION_ALERT = 'CONSULTATION_ALERT',
  LAB_REPORT = 'LAB_REPORT',
}

export interface PdfDownloadNotificationData {
  type: NotificationCategory.PDF_DOWNLOAD;
  filePath: string;
  fileName: string;
  mimeType?: string;
  title?: string;
}

export interface AppointmentNotificationData {
  type: NotificationCategory.APPOINTMENT_REMINDER;
  appointmentId: string | number;
  doctorName?: string;
}

export type AppNotificationData =
  | PdfDownloadNotificationData
  | AppointmentNotificationData
  | { type: string; [key: string]: any };
