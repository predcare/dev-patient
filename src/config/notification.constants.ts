export enum NotificationCategory {
  APPOINTMENT = 'appointment',
  PRESCRIPTION = 'prescription',
  MEDICAL_RECORD_MANAGEMENT = 'medical_record_management',
  EMR = 'emr',
}

export enum NotificationAction {
  INCOMING_VIDEO_CALL = 'incoming_video_call',
  PATIENT_JOINED_CALL = 'patient_joined_call',
  PRESCRIPTION_CREATED = 'prescription_created',
  PRESCRIPTION_UPDATED = 'prescription_updated',
  PRESCRIPTION_RESENT = 'prescription_resent',
  EMR_DOCUMENT_UPLOADED = 'emr_document_uploaded',
  EMR_DOCUMENT_SHARED = 'emr_document_shared',
}

export enum NotificationType {
  VIDEO_CALL_ROOM = 'VIDEO_CALL_ROOM',
  PRESCRIPTION = 'PRESCRIPTION',
  APPOINTMENT = 'APPOINTMENT',
  EMR = 'EMR',
}

export type NotificationCategoryType = `${NotificationCategory}`;
export type NotificationActionType = `${NotificationAction}`;
export type NotificationTypeEnum = `${NotificationType}`;
