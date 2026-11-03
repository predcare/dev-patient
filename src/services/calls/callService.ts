import { AppState, Platform } from 'react-native';
import RNCallKeep, { CONSTANTS } from 'react-native-callkeep';
import { showInfoToast } from '../../lib/common/toast.utils';
import { navigationRef } from '../../navigation/navigationRef';
import { AppRoute } from '../../route';
import { useIncomingCallStore } from '../../zustand/stores/useIncomingCallStore';
import { useMeetingStore } from '../../zustand/stores/useMeetingStore';
import { showAndroidRing, showMissedCall, stopAndroidRing } from './androidRing';
import type { CallCancel, IncomingCall, PushData } from './call.types';
import { canShowSystemCall, ensureCallKeep } from './callKeepSetup';
import { callFromPush } from './callPayload';
import { getHandledCall, isCallHandled, loadHandledCalls, markCallHandled } from './handledCalls';
import type { HandledState } from './handledCalls';
import { joinIncomingCall } from './joinIncomingCall';

// Every ring goes through here, whatever started it. Calls are keyed by the backend uuid, so a
// push that arrives twice rings once. Calls already dealt with are kept in handledCalls, which
// survives restarts, so an old notification handed back at launch never rings or joins again.
const calls = new Map<string, IncomingCall>();
// Ends a ring whose cancel push never arrives.
const ringTimers = new Map<string, ReturnType<typeof setTimeout>>();
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

// When the ring time is up and nobody answered, the ring is cleared everywhere: otherwise the call
// stays "ringing" here, its system call is never ended, and later in-app banners for the same
// appointment stay hidden.
const endRingWhenExpired = (call: IncomingCall) => {
  if (ringTimers.has(call.callId)) return;
  const delay = Math.max(call.expiresAtMs + CLOCK_ALLOWANCE_MS - Date.now(), 0);
  ringTimers.set(
    call.callId,
    setTimeout(async () => {
      ringTimers.delete(call.callId);
      if (!calls.has(call.callId) || pendingAnswer?.call.callId === call.callId) return;
      const showMissed = Platform.OS === 'android' && !isAppActive();
      await stopRinging(call.callId, call.appointmentId);
      if (showMissed) await showMissedCall(call);
    }, delay),
  );
};

// Keeps a call shown natively (iOS VoIP push) so Answer can find its appointment.
export const rememberCall = (data: PushData): void => {
  const call = callFromPush(data);
  if (call && !isCallHandled(call.callId)) {
    calls.set(call.callId, call);
    onSystemScreen.add(call.callId);
    // An already-expired call is left for replayInitialCallEvents to answer or end.
    if (!isCallExpired(call)) endRingWhenExpired(call);
    hideBannerWhileRinging();
  }
};

export const ringIncomingCall = async (call: IncomingCall): Promise<void> => {
  await loadHandledCalls();
  if (calls.has(call.callId) || isCallHandled(call.callId) || isCallExpired(call)) return;
  // Already in a consultation.
  if (useMeetingStore.getState().callInfo?.meetingId) return;
  calls.set(call.callId, call);
  endRingWhenExpired(call);

  // iOS with the app in the background: the backend's alert (or, later, its VoIP push) rings.
  if (Platform.OS === 'ios' && !isAppActive()) return;

  await ensureCallKeep();

  if (Platform.OS === 'android') {
    // Self-managed (CallKeep's Android guide): Telecom registers the call, so Android respects an
    // ongoing phone call, Do Not Disturb and headsets, and PRED Care's own call notification is the
    // incoming-call UI in every app state. Its Answer opens the app, which Android always allows for
    // a tap on the app's own notification. Shown directly (not only on `showIncomingCallUi`) so it
    // still rings when Telecom refuses the call (`createIncomingConnectionFailed`).
    try {
      RNCallKeep.displayIncomingCall(call.callId, 'PRED Care', call.callerName, 'generic', false);
    } catch (err) {
      console.warn('[CallService] displayIncomingCall failed:', err);
    }
    onSystemScreen.add(call.callId);
    hideBannerWhileRinging();
    await showAndroidRing(call);
    // Cancelled or declined while the notification was being shown.
    if (isCallHandled(call.callId)) await stopAndroidRing(call.callId);
    return;
  }

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

// Keeps an answer until ANSWER_JOIN_WINDOW_MS after `answeredAt`. When the window passes, the answer
// is dropped and the system call (still showing as connected) is ended. `answeredAt` is the time of
// the Answer press, so holding the same answer again never makes the window longer.
const holdAnswer = (call: IncomingCall, answeredAt: number) => {
  clearPendingAnswer();
  pendingAnswer = { call, answeredAt };
  answerTimer = setTimeout(() => {
    if (pendingAnswer?.call.callId === call.callId) stopRinging(call.callId, call.appointmentId);
  }, Math.max(answeredAt + ANSWER_JOIN_WINDOW_MS - Date.now(), 0));
};

// Clears the ring everywhere. Takes the appointment too, because a fresh background JS instance
// (for example a Decline press after the app was closed) has an empty `calls` map.
// `outcome` 'answered' is for an Answer whose join hasn't run yet; anything else ends the call for good.
const stopRinging = async (
  callId: string,
  appointmentId?: string,
  outcome: HandledState = 'done',
  answeredAt?: number,
): Promise<void> => {
  if (
    outcome === 'done' &&
    pendingAnswer &&
    matchesCall(pendingAnswer.call, callId, appointmentId)
  ) {
    clearPendingAnswer();
  }
  markCallHandled(callId, outcome, answeredAt);
  onSystemScreen.delete(callId);
  const timer = ringTimers.get(callId);
  if (timer) clearTimeout(timer);
  ringTimers.delete(callId);
  const call = calls.get(callId);
  calls.delete(callId);

  const bannerAppointment = appointmentId ?? call?.appointmentId;
  if (bannerAppointment && isBannerShowing(bannerAppointment)) {
    useIncomingCallStore.getState().hideCallBanner();
  }

  await endSystemCall(callId);
};

// Removes the ring notification (Android) and closes the system call screen (and the Phone app's
// in-call screen after Answer).
const endSystemCall = async (callId: string): Promise<void> => {
  if (Platform.OS === 'android') await stopAndroidRing(callId);
  try {
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
    markCallHandled(callId, 'done');
    await endSystemCall(callId);
  }
};

// The backend has no decline route, so this only stops this phone ringing.
export const declineCall = async (callId: string, known?: IncomingCall): Promise<void> => {
  await loadHandledCalls();
  const key = callId.toLowerCase();
  if (isCallHandled(key)) {
    // Already dealt with (or answered and about to join): only make sure no system call is left.
    if (getHandledCall(key)?.state === 'done') endSystemCall(key);
    return;
  }
  await stopRinging(key, known?.appointmentId);
};

const isStartingUp = () => {
  const route = navigationRef.isReady() ? navigationRef.getCurrentRoute()?.name : undefined;
  return !route || route === AppRoute.SPLASH;
};

const startJoin = async (call: IncomingCall, answeredAt: number) => {
  if (isStartingUp()) {
    // Cold start: SplashScreen joins after it has checked the login.
    holdAnswer(call, answeredAt);
    return;
  }
  markCallHandled(call.callId, 'done');
  await joinIncomingCall(call.appointmentId, call.callerName);
};

const showCallEndedToast = () =>
  showInfoToast('The doctor is no longer calling. Open the appointment to join.', 'Call ended');

/**
 * Answer on the call notification, the system call screen or a tap on the call alert. Also runs for
 * the notification that launched the app, which on Android can be an old one handed back again
 * (JS reload, relaunch): a call already dealt with is ignored, and an expired one never joins.
 * `allowLate` is for answers replayed from before JS started, already checked against their window.
 */
export const answerCall = async (
  callId: string,
  known?: IncomingCall,
  { allowLate = false }: { allowLate?: boolean } = {},
): Promise<void> => {
  await loadHandledCalls();
  const key = callId.toLowerCase();
  const call = known ?? calls.get(key);
  if (!call || pendingAnswer?.call.callId === key) return;

  const handled = getHandledCall(key);
  if (handled?.state === 'done') return;

  // Answered already, but the JS instance that took the Answer is gone (Android starts the app's
  // UI after the background handler stopped the ring). Join only within the original window.
  if (handled?.state === 'answered') {
    if (Date.now() - handled.at > ANSWER_JOIN_WINDOW_MS) {
      markCallHandled(key, 'done');
      return;
    }
  } else if (!allowLate && isCallExpired(call)) {
    // Answered so late that the doctor has likely gone; the patient can join from the appointment.
    // Checked in every app state: the app is already active while a cold start replays the
    // notification that opened it.
    await stopRinging(key, call.appointmentId);
    showCallEndedToast();
    return;
  }
  const answeredAt = handled?.at ?? Date.now();

  if (isAppActive()) {
    // Ends the system call. The consultation then runs in the app's own video call screen.
    await stopRinging(key, call.appointmentId, 'answered', answeredAt);
    await startJoin(call, answeredAt);
    return;
  }

  if (Platform.OS === 'android') {
    // The Answer tap on PRED Care's notification is opening the app (after the unlock, if locked):
    // stop the ring now and join as soon as the app is in front.
    await stopRinging(key, call.appointmentId, 'answered', answeredAt);
  } else {
    // iOS, locked or in the background: CallKit stays on the connected call until the app is in
    // front (tapping PRED Care there opens it). Kept so a later cancel can find it.
    calls.set(key, call);
  }
  holdAnswer(call, answeredAt);
  joinWhenActive = AppState.addEventListener('change', state => {
    // During a cold start SplashScreen takes the answer once the login is checked.
    if (state !== 'active' || isStartingUp()) return;
    const waiting = consumePendingAnswer();
    if (waiting) joinIncomingCall(waiting.appointmentId, waiting.callerName);
  });
};

/**
 * The answered call to join now, if it's still within ANSWER_JOIN_WINDOW_MS. Either way the pending
 * answer is cleared, its system call ended and the call marked done, so opening the app later (or a
 * replay of the same notification) never joins by itself.
 */
export const consumePendingAnswer = (): IncomingCall | null => {
  const pending = pendingAnswer;
  clearPendingAnswer();
  if (!pending) return null;
  const { call, answeredAt } = pending;
  stopRinging(call.callId, call.appointmentId);
  if (Date.now() - answeredAt > ANSWER_JOIN_WINDOW_MS) return null;
  return call;
};

type InitialEvent = { name: string; data: any };

/**
 * Runs the answers and declines the patient made on the system call screen before the app's JS
 * was ready (closed app, locked phone). SplashScreen awaits this before consumePendingAnswer.
 */
export const replayInitialCallEvents = async (): Promise<void> => {
  await loadHandledCalls();
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
        if (call && Date.now() <= call.expiresAtMs + ANSWER_JOIN_WINDOW_MS) {
          await answerCall(callUUID, undefined, { allowLate: true });
        } else {
          await declineCall(callUUID);
        }
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
  await Promise.all([ensureCallKeep(), loadHandledCalls()]);
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
