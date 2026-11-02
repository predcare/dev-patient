export enum NotificationCategory {
  PDF_DOWNLOAD = 'PDF_DOWNLOAD',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  CONSULTATION_ALERT = 'CONSULTATION_ALERT',
  LAB_REPORT = 'LAB_REPORT',
  MEETING_ONGOING = 'MEETING_ONGOING',
}

// The event_action values the backend sends in a push's data.
export const NotificationEventActions = {
  INCOMING_VIDEO_CALL: 'incoming_video_call',
  PATIENT_JOINED_CALL: 'patient_joined_call',
  DOCTOR_JOINED_CALL: 'doctor_joined_call',
  CALL_ENDED: 'call_ended',
  PRESCRIPTION_CREATED: 'prescription_created',
  PRESCRIPTION_UPDATED: 'prescription_updated',
  EMR_DOCUMENT_SHARED: 'emr_document_shared',
  EMR_DOCUMENT_UPLOADED: 'emr_document_uploaded',
  DOCTOR_AVAILABILITY_CREATED: 'doctor_availability_created',
  DOCTOR_AVAILABILITY_UPDATED: 'doctor_availability_updated',
  DOCTOR_AVAILABILITY_STATUS_CHANGED: 'doctor_availability_status_changed',
  DOCTOR_AVAILABILITY_DELETED: 'doctor_availability_deleted',
  APPOINTMENT_BOOKED: 'appointment_booked',
  APPOINTMENT_CONFIRMED: 'appointment_confirmed',
  APPOINTMENT_CANCELLED: 'appointment_cancelled',
  APPOINTMENT_RESCHEDULED: 'appointment_rescheduled',
  APPOINTMENT_COMPLETED: 'appointment_completed',
  APPOINTMENT_REMINDER: 'appointment_reminder',
} as const;

// Firebase and Notifee both type a message's data loosely, so fields are read defensively.
export type PushNotificationData = { [key: string]: unknown };

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
