import { navigationRef } from '../navigation/navigationRef';
import { AppRoute } from '../route';

export {
  NotificationAction,
  NotificationCategory,
  NotificationType,
} from '../config/notification.constants';

let pendingRoute: { name: string; params?: any } | null = null;

export function handleNotificationClick(source: string, rawData?: any): void {
  const data = rawData?.data || rawData?.notification?.data || rawData;
  const appointmentId = data?.appointment_id || data?.appointmentId;
  const routeParams = {
    refresh: true,
    appointmentId: appointmentId ? String(appointmentId) : undefined,
  };

  console.log('====================================================');
  console.log(`[PUSH NOTIFICATION CLICKED] Source: ${source}`);
  console.log('[PUSH NOTIFICATION PAYLOAD]:', JSON.stringify(data, null, 2));
  console.log('====================================================');

  const currentRouteName = navigationRef.isReady() ? navigationRef.getCurrentRoute()?.name : null;
  const isPastSplash =
    navigationRef.isReady() && Boolean(currentRouteName) && currentRouteName !== AppRoute.SPLASH;

  if (isPastSplash) {
    console.info(
      `[NotificationRouter] App is active on route "${currentRouteName}". Navigating immediately to Schedule`
    );
    // @ts-ignore
    navigationRef.navigate(AppRoute.SCHEDULE, routeParams);
  } else {
    console.info(
      `[NotificationRouter] App is cold-starting (Current route: "${currentRouteName}"). Setting pending target for SplashScreen:`,
      routeParams
    );
    pendingRoute = { name: AppRoute.SCHEDULE, params: routeParams };
  }
}

export function consumeTargetRoute(): { name: string; params?: any } {
  const route = pendingRoute || { name: AppRoute.HOME };
  pendingRoute = null;
  console.log('[NotificationRouter] SplashScreen resolved initial route:', route);
  return route;
}
