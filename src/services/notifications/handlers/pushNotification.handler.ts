import { setTargetRoute } from '../../../lib/common/navigation.utils';
import { navigate, navigationRef, resetRoot } from '../../../navigation/navigationRef';
import { AppRoute } from '../../../route';
import { useAuthStore } from '../../../zustand/stores/useAuthStore';
import { callFromPush } from '../../calls/callPayload';
import { answerCall } from '../../calls/callService';
import { NotificationEventActions, PushNotificationData } from '../notification.types';

const APPOINTMENT_ACTIONS: string[] = [
  NotificationEventActions.APPOINTMENT_BOOKED,
  NotificationEventActions.APPOINTMENT_CONFIRMED,
  NotificationEventActions.APPOINTMENT_CANCELLED,
  NotificationEventActions.APPOINTMENT_RESCHEDULED,
  NotificationEventActions.APPOINTMENT_COMPLETED,
  NotificationEventActions.APPOINTMENT_REMINDER,
];

const DOCTOR_AVAILABILITY_ACTIONS: string[] = [
  NotificationEventActions.DOCTOR_AVAILABILITY_CREATED,
  NotificationEventActions.DOCTOR_AVAILABILITY_UPDATED,
  NotificationEventActions.DOCTOR_AVAILABILITY_STATUS_CHANGED,
  NotificationEventActions.DOCTOR_AVAILABILITY_DELETED,
];

// Screens a tap must not navigate away from: the setup steps a patient still has to finish, and a live call.
const PROTECTED_ROUTES: string[] = [
  AppRoute.EMAIL_VERIFY,
  AppRoute.POLICY_ACCEPTANCE,
  AppRoute.MEETING,
];

const resolvePushRoute = (data: PushNotificationData = {}): { name: string; params?: object } => {
  const action = String(data.event_action ?? '');

  if (APPOINTMENT_ACTIONS.includes(action)) {
    // data.id is the numeric appointment ID; data.appointment_id is a display code the API can't load.
    return data.id
      ? { name: AppRoute.APPOINTMENT_DETAILS, params: { appointmentId: String(data.id) } }
      : { name: AppRoute.SCHEDULE, params: { refresh: true } };
  }

  if (DOCTOR_AVAILABILITY_ACTIONS.includes(action)) {
    // DoctorDetails reads its params without a check, so only open it with a valid ID.
    const doctorId = Number(data.doctor_id);
    return doctorId > 0
      ? { name: AppRoute.DOCTOR_DETAILS, params: { doctorId } }
      : { name: AppRoute.DOCTORS };
  }

  return { name: AppRoute.HOME };
};

export const handlePushNotificationPress = (data?: PushNotificationData): void => {
  // A tap on the incoming call notification (the iOS system alert) answers the call.
  const incomingCall = callFromPush(data);
  if (incomingCall) {
    answerCall(incomingCall.callId, incomingCall);
    return;
  }

  const route = resolvePushRoute(data);
  const currentRoute = navigationRef.isReady() ? navigationRef.getCurrentRoute()?.name : undefined;

  // Still starting up: SplashScreen opens this route once it knows the patient can see it.
  if (!currentRoute || currentRoute === AppRoute.SPLASH) {
    setTargetRoute(route);
    return;
  }

  if (!useAuthStore.getState().isLoggedIn || PROTECTED_ROUTES.includes(currentRoute)) return;

  if (route.name === AppRoute.HOME) {
    // navigate() could stack a second Home on top of the existing one.
    resetRoot(AppRoute.HOME);
  } else {
    navigate(route.name as never, route.params as never);
  }
};
