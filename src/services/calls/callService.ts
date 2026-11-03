import { AppState, Platform } from 'react-native';
import RNCallKeep, { CONSTANTS } from 'react-native-callkeep';
import { showInfoToast } from '../../lib/common/toast.utils';
import { navigationRef } from '../../navigation/navigationRef';
import { AppRoute } from '../../route';
import { useIncomingCallStore } from '../../zustand/stores/useIncomingCallStore';
import { useMeetingStore } from '../../zustand/stores/useMeetingStore';
import { showMissedCall, stopAndroidRing } from './androidRing';
import type { CallCancel, IncomingCall, PushData } from './call.types';
import { canShowSystemCall, ensureCallKeep } from './callKeepSetup';
import { callFromPush } from './callPayload';
import { joinIncomingCall } from './joinIncomingCall';

// Every ring goes through here, whatever started it. Calls are keyed by the backend uuid, so a
// push that arrives twice rings once.
const calls = new Map<string, IncomingCall>();
const finished = new Set<string>();
// Calls currently on the system call screen (Android Phone app or CallKit).
const onSystemScreen = new Set<string>();
// An answered call waiting for the app to come to the front.
let pendingAnswer: { call: IncomingCall; answeredAt: number } | null = null;
let joinWhenActive: ReturnType<typeof AppState.addEventListener> | null = null;
let answerTimer: ReturnType<typeof setTimeout> | null = null;
let listening = false;

const REMOTE_ENDED = CONSTANTS.END_CALL_REASONS.REMOTE_ENDED;
// Allowance for a phone clock that's slightly wrong.
const CLOCK_ALLOWANCE_MS = 30_000;
// How long an answered call may wait for the patient to unlock and open the app. After this, opening
// the app doesn't join by itself.
const ANSWER_JOIN_WINDOW_MS = 45_000;

export const isCallExpired = (call: IncomingCall): boolean =>
  Date.now() > call.expiresAtMs + CLOCK_ALLOWANCE_MS;

const isAppActive = () => AppState.currentState === 'active';

const isBannerShowing = (appointmentId: string) => {
  const store = useIncomingCallStore.getState();
  return store.visible && String(store.appointmentId) === appointmentId;
};

const isRinging = (appointmentId: string) =>
  [...calls.values()].some(
    call => call.appointmentId === appointmentId && onSystemScreen.has(call.callId),
  );

// One sound per call: while the system call screen rings, the socket's in-app banner (which plays
// its own ringtone) is hidden. The socket code isn't changed; this reacts to the store instead.
const hideBannerWhileRinging = () => {
  const store = useIncomingCallStore.getState();
  if (store.visible && isRinging(String(store.appointmentId))) store.hideCallBanner();
};
useIncomingCallStore.subscribe(hideBannerWhileRinging);

// Keeps a call shown natively (iOS VoIP push) so Answer can find its appointment.
export const rememberCall = (data: PushData): void => {
  const call = callFromPush(data);
  if (call && !finished.has(call.callId)) {
    calls.set(call.callId, call);
    onSystemScreen.add(call.callId);
    hideBannerWhileRinging();
  }
};

export const ringIncomingCall = async (call: IncomingCall): Promise<void> => {
  if (calls.has(call.callId) || finished.has(call.callId) || isCallExpired(call)) return;
  // Already in a consultation.
  if (useMeetingStore.getState().callInfo?.meetingId) return;
  calls.set(call.callId, call);

  // iOS with the app in the background: the backend's alert (or, later, its VoIP push) rings.
  if (Platform.OS === 'ios' && !isAppActive()) return;

  await ensureCallKeep();
  // Android ignores the call when the PRED Care calling account is off or the phone permission is
  // missing. Then the socket's banner (if any) stays, so the patient still sees something.
  const systemScreenAvailable = await canShowSystemCall();
  if (!systemScreenAvailable) {
    console.warn(
      '[CallService] PRED Care calling account is off or phone permission is missing: Android will not show this call.',
    );
  }

  // The system call screen (Android Phone app or iOS CallKit) in every app state; no Notifee ring.
  try {
    // hasVideo false: the screen shows just "PRED Care", without "Video". The video consultation
    // itself runs in the app after Answer.
    RNCallKeep.displayIncomingCall(call.callId, 'PRED Care', call.callerName, 'generic', false);
    if (systemScreenAvailable) onSystemScreen.add(call.callId);
  } catch (err) {
    console.warn('[CallService] displayIncomingCall failed:', err);
  }
  hideBannerWhileRinging();
};

const matchesCall = (call: IncomingCall, callId?: string, appointmentId?: string) =>
  call.callId === callId || (!!appointmentId && call.appointmentId === appointmentId);

const clearPendingAnswer = () => {
  pendingAnswer = null;
  joinWhenActive?.remove();
  joinWhenActive = null;
  if (answerTimer) clearTimeout(answerTimer);
  answerTimer = null;
};

// Keeps an answer for ANSWER_JOIN_WINDOW_MS. When the window passes, the answer is dropped and the
// system call (still showing as connected) is ended.
const holdAnswer = (call: IncomingCall) => {
  clearPendingAnswer();
  pendingAnswer = { call, answeredAt: Date.now() };
  answerTimer = setTimeout(() => {
    if (pendingAnswer?.call.callId === call.callId) stopRinging(call.callId, call.appointmentId);
  }, ANSWER_JOIN_WINDOW_MS);
};

// Clears the ring everywhere. Takes the appointment too, because a fresh background JS instance
// (for example a Decline press after the app was closed) has an empty `calls` map.
const stopRinging = async (callId: string, appointmentId?: string): Promise<void> => {
  if (pendingAnswer && matchesCall(pendingAnswer.call, callId, appointmentId)) clearPendingAnswer();
  finished.add(callId);
  onSystemScreen.delete(callId);
  const call = calls.get(callId);
  calls.delete(callId);

  const bannerAppointment = appointmentId ?? call?.appointmentId;
  if (bannerAppointment && isBannerShowing(bannerAppointment)) {
    useIncomingCallStore.getState().hideCallBanner();
  }

  if (Platform.OS === 'android') await stopAndroidRing(callId);
  try {
    // Closes the system call screen (and the Phone app's in-call screen after Answer).
    RNCallKeep.reportEndCallWithUUID(callId, REMOTE_ENDED);
  } catch {
    // No system call to end.
  }
};

// CALL_CANCELLED push. The uuid can be empty, so match the appointment too.
export const cancelCall = async ({ callId, appointmentId }: CallCancel): Promise<void> => {
  const matches = [...calls.values()].filter(call => matchesCall(call, callId, appointmentId));
  // An answered call that's waiting for the app: the doctor left, so opening the app must not join.
  const answered = pendingAnswer?.call;
  if (answered && matchesCall(answered, callId, appointmentId) && !matches.includes(answered)) {
    matches.push(answered);
  }
  const showMissed = !isAppActive();

  for (const call of matches) {
    await stopRinging(call.callId, call.appointmentId);
    if (showMissed && Platform.OS === 'android') await showMissedCall(call);
  }

  // A cancel can reach a fresh background instance that never saw the ring.
  if (matches.length === 0 && callId) {
    if (Platform.OS === 'android') await stopAndroidRing(callId);
    try {
      RNCallKeep.reportEndCallWithUUID(callId, REMOTE_ENDED);
    } catch {
      // No system call to end.
    }
  }
};

// The backend has no decline route, so this only stops this phone ringing.
export const declineCall = async (callId: string, known?: IncomingCall): Promise<void> => {
  const key = callId.toLowerCase();
  if (finished.has(key)) return;
  await stopRinging(key, known?.appointmentId);
};

const startJoin = async (call: IncomingCall) => {
  const route = navigationRef.isReady() ? navigationRef.getCurrentRoute()?.name : undefined;
  if (!route || route === AppRoute.SPLASH) {
    // Cold start: SplashScreen joins after it has checked the login.
    holdAnswer(call);
    return;
  }
  await joinIncomingCall(call.appointmentId, call.callerName);
};

export const answerCall = async (callId: string, known?: IncomingCall): Promise<void> => {
  const key = callId.toLowerCase();
  const call = known ?? calls.get(key);
  if (!call || finished.has(key) || pendingAnswer?.call.callId === key) return;

  if (isCallExpired(call) && !isAppActive()) {
    // Answered so late that the doctor has likely gone; the patient can join from the appointment.
    await stopRinging(key, call.appointmentId);
    showInfoToast('The doctor is no longer calling. Open the appointment to join.', 'Call ended');
    return;
  }

  if (isAppActive()) {
    // Ends the system call. The consultation then runs in the app's own video call screen.
    await stopRinging(key, call.appointmentId);
    await startJoin(call);
    return;
  }

  // Locked phone or app in the background: keep the system call on screen (as connected) until the
  // app is in front, so the patient isn't left with nothing. Kept so a later cancel can find it.
  calls.set(key, call);
  holdAnswer(call);
  if (Platform.OS === 'android') {
    try {
      RNCallKeep.setCurrentCallActive(key);
    } catch {
      // Already active.
    }
    // Opens the app over the system call screen; CallKeep asks for the unlock if locked.
    RNCallKeep.backToForeground();
  }
  // iOS: CallKit stays on the connected call; tapping PRED Care there opens the app.
  joinWhenActive = AppState.addEventListener('change', state => {
    if (state !== 'active') return;
    const waiting = consumePendingAnswer();
    if (waiting) startJoin(waiting);
  });
};

/**
 * The answered call to join now, if it's still within ANSWER_JOIN_WINDOW_MS. Either way the pending
 * answer is cleared and its system call ended, so opening the app later never joins by itself.
 */
export const consumePendingAnswer = (): IncomingCall | null => {
  const pending = pendingAnswer;
  clearPendingAnswer();
  if (!pending) return null;
  const { call, answeredAt } = pending;
  if (!finished.has(call.callId)) stopRinging(call.callId, call.appointmentId);
  if (Date.now() - answeredAt > ANSWER_JOIN_WINDOW_MS) return null;
  return call;
};

type InitialEvent = { name: string; data: any };

/**
 * Runs the answers and declines the patient made on the system call screen before the app's JS
 * was ready (closed app, locked phone). SplashScreen awaits this before consumePendingAnswer.
 */
export const replayInitialCallEvents = async (): Promise<void> => {
  try {
    const events = ((await RNCallKeep.getInitialEvents()) ?? []) as InitialEvent[];
    RNCallKeep.clearInitialEvents();
    // The display event carries the push payload, so the answer can find the appointment.
    events
      .filter(e => e.name === 'RNCallKeepDidDisplayIncomingCall')
      .forEach(e => rememberCall(e.data?.payload));
    for (const event of events) {
      const callUUID = event.data?.callUUID;
      if (!callUUID) continue;
      if (event.name === 'RNCallKeepPerformAnswerCallAction') {
        // Only a call this instance knows, answered while it could still be joined. Anything else
        // (unknown or too old) just has its system call ended, so it doesn't join by itself.
        const call = calls.get(String(callUUID).toLowerCase());
        if (call && Date.now() <= call.expiresAtMs + ANSWER_JOIN_WINDOW_MS) await answerCall(callUUID);
        else await declineCall(callUUID);
      }
      if (event.name === 'RNCallKeepPerformEndCallAction') await declineCall(callUUID);
    }
  } catch (err) {
    console.warn('[CallService] Initial call events failed:', err);
  }
};

/**
 * Answer and Decline on the system call screen. Registered from index.js, so it also works when
 * the app was closed and only the background JS is running. Safe to call more than once.
 */
export const startCallKeepListeners = async (): Promise<void> => {
  if (listening) return;
  listening = true;
  await ensureCallKeep();
  RNCallKeep.addEventListener('didDisplayIncomingCall', ({ payload }) => {
    rememberCall(payload as PushData);
  });
  RNCallKeep.addEventListener('answerCall', ({ callUUID }) => {
    answerCall(callUUID);
  });
  RNCallKeep.addEventListener('endCall', ({ callUUID }) => {
    declineCall(callUUID);
  });
};
