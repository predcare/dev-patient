import { AppState, Platform } from 'react-native';
import RNCallKeep, { CONSTANTS } from 'react-native-callkeep';
import { showInfoToast } from '../../lib/common/toast.utils';
import { navigationRef } from '../../navigation/navigationRef';
import { AppRoute } from '../../route';
import { useIncomingCallStore } from '../../zustand/stores/useIncomingCallStore';
import { useMeetingStore } from '../../zustand/stores/useMeetingStore';
import { showAndroidRing, showMissedCall, stopAndroidRing } from './androidRing';
import type { CallCancel, IncomingCall } from './call.types';
import { ensureCallKeep } from './callKeepSetup';
import { joinIncomingCall } from './joinIncomingCall';

// Every ring goes through here, whatever started it. Calls are keyed by the backend uuid, so a
// push that arrives twice rings once.
const calls = new Map<string, IncomingCall>();
const finished = new Set<string>();
let pendingAnswer: IncomingCall | null = null;
let listening = false;

const REMOTE_ENDED = CONSTANTS.END_CALL_REASONS.REMOTE_ENDED;
// Allowance for a phone clock that's slightly wrong.
const CLOCK_ALLOWANCE_MS = 30_000;
// How long a join waits for the app to come to the front after Answer.
const FOREGROUND_WAIT_MS = 15_000;

export const isCallExpired = (call: IncomingCall): boolean =>
  Date.now() > call.expiresAtMs + CLOCK_ALLOWANCE_MS;

const isAppActive = () => AppState.currentState === 'active';

// The camera can't start until the app is in front, for example right after Answer.
const whenAppActive = (): Promise<boolean> =>
  new Promise(resolve => {
    if (isAppActive()) {
      resolve(true);
      return;
    }
    const timer = setTimeout(() => {
      subscription.remove();
      resolve(false);
    }, FOREGROUND_WAIT_MS);
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') return;
      clearTimeout(timer);
      subscription.remove();
      resolve(true);
    });
  });

const isBannerShowing = (appointmentId: string) => {
  const store = useIncomingCallStore.getState();
  return store.visible && String(store.appointmentId) === appointmentId;
};

// Uses the existing banner as it is. Its Join and close buttons keep their current behaviour.
const showBanner = (call: IncomingCall) => {
  // The socket may already show it for this appointment.
  if (isBannerShowing(call.appointmentId)) return;
  useIncomingCallStore.getState().showCallBanner({
    appointmentId: call.appointmentId,
    meetingId: call.meetingId,
    doctorName: call.callerName,
    callType: 'Incoming Video Call...',
  });
};

export const ringIncomingCall = async (call: IncomingCall): Promise<void> => {
  if (calls.has(call.callId) || finished.has(call.callId) || isCallExpired(call)) return;
  // Already in a consultation.
  if (useMeetingStore.getState().callInfo?.meetingId) return;
  calls.set(call.callId, call);

  if (isAppActive()) {
    showBanner(call);
    return;
  }

  if (Platform.OS === 'android') {
    await ensureCallKeep();
    try {
      RNCallKeep.displayIncomingCall(call.callId, 'PRED Care', call.callerName, 'generic', true);
    } catch (err) {
      // The Notifee ring below still works without the Telecom call.
      console.warn('[CallService] displayIncomingCall failed:', err);
    }
    await showAndroidRing(call);
  }
  // iOS in the background: the system already shows the push's own alert and ringtone.
};

// Clears the ring everywhere. Takes the appointment too, because a fresh background JS instance
// (for example a Decline press after the app was closed) has an empty `calls` map.
const stopRinging = async (callId: string, appointmentId?: string): Promise<void> => {
  finished.add(callId);
  const call = calls.get(callId);
  calls.delete(callId);

  const bannerAppointment = appointmentId ?? call?.appointmentId;
  if (bannerAppointment && isBannerShowing(bannerAppointment)) {
    useIncomingCallStore.getState().hideCallBanner();
  }

  if (Platform.OS === 'android') {
    await stopAndroidRing(callId);
    try {
      RNCallKeep.reportEndCallWithUUID(callId, REMOTE_ENDED);
    } catch {
      // No Telecom call to end.
    }
  }
};

// CALL_CANCELLED push. The uuid can be empty, so match the appointment too.
export const cancelCall = async ({ callId, appointmentId }: CallCancel): Promise<void> => {
  const matches = [...calls.values()].filter(
    call => call.callId === callId || (!!appointmentId && call.appointmentId === appointmentId)
  );
  const showMissed = !isAppActive();

  for (const call of matches) {
    await stopRinging(call.callId, call.appointmentId);
    if (showMissed && Platform.OS === 'android') await showMissedCall(call);
  }

  // A cancel can reach a fresh background instance that never saw the ring.
  if (matches.length === 0 && callId && Platform.OS === 'android') {
    await stopAndroidRing(callId);
  }
};

// The backend has no decline route, so this only stops this phone ringing.
export const declineCall = async (callId: string, known?: IncomingCall): Promise<void> => {
  const key = callId.toLowerCase();
  if (finished.has(key)) return;
  await stopRinging(key, known?.appointmentId);
};

export const answerCall = async (callId: string, known?: IncomingCall): Promise<void> => {
  const key = callId.toLowerCase();
  const call = known ?? calls.get(key);
  if (!call || finished.has(key)) return;
  await stopRinging(key, call.appointmentId);

  if (isCallExpired(call)) {
    showInfoToast('The doctor is no longer calling. Open the appointment to join.', 'Call ended');
    return;
  }

  const route = navigationRef.isReady() ? navigationRef.getCurrentRoute()?.name : undefined;
  if (!route || route === AppRoute.SPLASH) {
    // Cold start: SplashScreen joins after it has checked the login.
    pendingAnswer = call;
    return;
  }

  if (!(await whenAppActive())) return;
  await joinIncomingCall(call.appointmentId, call.callerName);
};

export const consumePendingAnswer = (): IncomingCall | null => {
  const call = pendingAnswer;
  pendingAnswer = null;
  return call;
};

// Telecom events, e.g. Answer on a Bluetooth headset. Android only; started from App.tsx.
export const startCallKeepListeners = async (): Promise<void> => {
  if (Platform.OS !== 'android' || listening) return;
  listening = true;
  await ensureCallKeep();
  RNCallKeep.addEventListener('answerCall', ({ callUUID }) => {
    answerCall(callUUID);
  });
  RNCallKeep.addEventListener('endCall', ({ callUUID }) => {
    declineCall(callUUID);
  });
};
