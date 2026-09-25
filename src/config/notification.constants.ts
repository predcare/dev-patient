export enum NotificationCategory {
  APPOINTMENT = 'appointment',
}

export enum NotificationAction {
  INCOMING_VIDEO_CALL = 'incoming_video_call',
  PATIENT_JOINED_CALL = 'patient_joined_call',
}

export enum NotificationType {
  VIDEO_CALL_ROOM = 'VIDEO_CALL_ROOM',
}

export type NotificationCategoryType = `${NotificationCategory}`;
export type NotificationActionType = `${NotificationAction}`;
export type NotificationTypeEnum = `${NotificationType}`;
