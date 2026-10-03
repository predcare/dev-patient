import { AppRoute } from '../../route';
import { INotificationDoc } from '../../typescripts/interfaces/notification.interfaces';

export interface NotificationModalNavigationResult {
  name: string;
  params?: any;
}

const parseNotificationMetadata = (metadata: any): Record<string, any> => {
  if (!metadata) return {};
  if (typeof metadata === 'object') return metadata;
  try {
    return JSON.parse(metadata);
  } catch {
    return {};
  }
};

export const resolveNotificationModalNavigation = (
  item: INotificationDoc | any
): NotificationModalNavigationResult => {
  if (!item) {
    return { name: AppRoute.HOME };
  }

  const meta = parseNotificationMetadata(item.metadata);
  const eventCategory = String(item.event_category || meta.event_category || '')
    .toLowerCase()
    .trim();
  const eventAction = String(item.event_action || meta.event_action || '')
    .toLowerCase()
    .trim();
  const metaType = String(meta.type || item.type || '')
    .toUpperCase()
    .trim();
  if (
    eventCategory === 'medical_record_management' ||
    eventCategory === 'emr' ||
    eventAction === 'emr_document_uploaded' ||
    eventAction === 'emr_document_shared' ||
    metaType === 'EMR'
  ) {
    const documentType =
      meta.document_type ||
      meta.document_title ||
      meta.folderName ||
      item.document_type ||
      item.document_title;
    const patientId = meta.patient_id || item.associate_patient_id || item.user_id;

    if (documentType) {
      return {
        name: AppRoute.HEALTH_RECORD_FOLDER,
        params: {
          folderName: String(documentType).trim(),
          patientId: patientId ? Number(patientId) : undefined,
        },
      };
    }

    return {
      name: AppRoute.HEALTH_RECORDS,
    };
  }
  if (
    eventCategory === 'prescription' ||
    eventAction === 'prescription_created' ||
    eventAction === 'prescription_updated' ||
    eventAction === 'prescription_resent' ||
    metaType === 'PRESCRIPTION'
  ) {
    const prescriptionId =
      meta.prescription_id || meta.prescriptionId || item.prescription_id || item.prescriptionId;

    if (prescriptionId) {
      return {
        name: AppRoute.PRESCRIPTION_DETAIL,
        params: {
          prescriptionId: Number(prescriptionId),
        },
      };
    }

    return {
      name: AppRoute.PRESCRIPTIONS_LIST,
    };
  }
  if (
    eventCategory === 'appointment' ||
    eventAction === 'incoming_video_call' ||
    eventAction === 'patient_joined_call' ||
    eventAction.startsWith('appointment_') ||
    metaType === 'VIDEO_CALL_ROOM' ||
    metaType === 'APPOINTMENT'
  ) {
    const appointmentId =
      meta.appointment_id ||
      meta.appointmentId ||
      item.associate_appointment_id ||
      item.appointment_id;

    if (appointmentId) {
      return {
        name: AppRoute.APPOINTMENT_DETAILS,
        params: {
          appointmentId: String(appointmentId),
          isComingFromNotification: true,
        },
      };
    }

    return {
      name: AppRoute.SCHEDULE,
      params: { refresh: true },
    };
  }

  // Fallback to Home
  return {
    name: AppRoute.HOME,
    params: { isComingFromNotification: true },
  };
};
