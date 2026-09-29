import { NotificationCategory, NotificationType } from '../config/notification.constants';
import { navigationRef } from '../navigation/navigationRef';
import { AppRoute } from '../route';

export {
  NotificationAction,
  NotificationCategory,
  NotificationType,
} from '../config/notification.constants';

let pendingRoute: { name: string; params?: any } | null = null;

interface NotificationRouteResult {
  name: string;
  params?: any;
}

export function resolveNotificationRoute(data: any): NotificationRouteResult {
  if (!data) {
    return { name: AppRoute.HOME };
  }

  const type = String(data?.type || '').toUpperCase();
  const eventCategory = String(data?.event_category || '').toLowerCase();
  const eventAction = String(data?.event_action || '').toLowerCase();
  const prescriptionId = data?.prescription_id || data?.prescriptionId;
  const appointmentId = data?.appointment_id || data?.appointmentId;

  if (
    type === NotificationType.PRESCRIPTION ||
    eventCategory === NotificationCategory.PRESCRIPTION ||
    eventAction.includes('prescription') ||
    Boolean(prescriptionId)
  ) {
    const rxId = prescriptionId ? Number(prescriptionId) : undefined;
    return {
      name: rxId ? AppRoute.PRESCRIPTION_DETAIL : AppRoute.PRESCRIPTIONS_LIST,
      params: {
        prescriptionId: rxId,
      },
    };
  }

  const emrId = data?.emr_id || data?.emrId;
  const documentType =
    data?.document_type || data?.documentType || data?.folderName || data?.document_title;
  const patientId = data?.patient_id || data?.patientId;

  if (
    type === NotificationType.EMR ||
    eventCategory === NotificationCategory.EMR ||
    eventCategory === NotificationCategory.MEDICAL_RECORD_MANAGEMENT ||
    eventAction.includes('emr') ||
    Boolean(emrId)
  ) {
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
    type === NotificationType.APPOINTMENT ||
    eventCategory === NotificationCategory.APPOINTMENT ||
    eventAction.includes('appointment') ||
    eventAction.includes('call') ||
    Boolean(appointmentId)
  ) {
    return {
      name: AppRoute.APPOINTMENT_DETAILS,
      params: {
        appointmentId: appointmentId ? String(appointmentId) : undefined,
        isComingFromNotification: true,
      },
    };
  }

  // Fallback
  return {
    name: AppRoute.HOME,
    params: { isComingFromNotification: true },
  };
}

export function handleNotificationClick(source: string, rawData?: any): void {
  const data = rawData?.data || rawData?.notification?.data || rawData;

  console.log('====================================================');
  console.log(`[PUSH NOTIFICATION CLICKED] Source: ${source}`);
  console.log('[PUSH NOTIFICATION PAYLOAD]:', JSON.stringify(data, null, 2));
  console.log('====================================================');

  const resolved = resolveNotificationRoute(data);

  const currentRouteName = navigationRef.isReady() ? navigationRef.getCurrentRoute()?.name : null;
  const isPastSplash =
    navigationRef.isReady() && Boolean(currentRouteName) && currentRouteName !== AppRoute.SPLASH;

  if (isPastSplash) {
    console.info(
      `[NotificationRouter] App is active on route "${currentRouteName}". Navigating immediately to "${resolved.name}" with params:`,
      resolved.params
    );
    // @ts-ignore
    navigationRef.navigate(resolved.name, resolved.params);
  } else {
    console.info(
      `[NotificationRouter] App is cold-starting (Current route: "${currentRouteName}"). Setting pending target for SplashScreen:`,
      resolved
    );
    pendingRoute = resolved;
  }
}

export function consumeTargetRoute(): { name: string; params?: any } {
  const route = pendingRoute || { name: AppRoute.HOME };
  pendingRoute = null;
  console.log('[NotificationRouter] SplashScreen resolved initial route:', route);
  return route;
}
