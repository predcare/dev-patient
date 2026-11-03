# Fix Plan: Duplicate Token Calls and Answer-to-Join

**Status:** done on 2026-11-03 in `deviceSync.ts` and `callService.ts`; not yet tested on devices. Fix 1 uses a queue (one request at a time) instead of sharing the running request, so a new token that arrives mid-request is still sent.
**Scope:** two fixes, in two existing files only (`deviceSync.ts`, `callService.ts`). No new files, and nothing else changes.
**Checked on:** 2026-11-03.

## Fix 1. `register-token` is sent many times

### Why

`syncPushToken` in `src/services/calls/deviceSync.ts` sends a request every time it's called. On each app start it's called from 3–4 places:

| Caller | When |
| --- | --- |
| `pushSetup.ts` → `setupPush` | Every app start |
| `SplashScreen.tsx`, after the profile loads | Every app start |
| `voipToken.ts` `register` event (iOS) | Every start, sometimes twice |
| `onTokenRefresh` | Only when Firebase changes the token |

Nothing remembers what was already sent.

### Change (only `deviceSync.ts`)

1. **Skip when nothing changed.** After a successful request, save a fingerprint of `user_id`, `device_id`, `fcm_token` and `voip_token` in AsyncStorage. Next time, if the fingerprint is the same, don't send.
2. **One request at a time.** If a request is already running, a new call waits for it instead of sending again.

```ts
const SYNCED_KEY = '@push_token_synced';
let inFlight: Promise<void> | null = null;

export const syncPushToken = (freshToken?: string, freshVoipToken?: string) => {
  inFlight ??= doSync(freshToken, freshVoipToken).finally(() => {
    inFlight = null;
  });
  return inFlight;
};

// in doSync, before the request:
const fingerprint = [userId, info.device_id, fcmToken, voipToken ?? ''].join('|');
if ((await getItem(SYNCED_KEY)) === fingerprint) return;
// after the request succeeds:
await setItem(SYNCED_KEY, fingerprint);
```

Logout already clears AsyncStorage (this key isn't kept), so the first sync after the next login sends once.

**Result:** a normal app open sends nothing; a login or a token change sends one request.

## Fix 2. Answer doesn't open the app, then opening it later joins by itself

### Why

All of these are in `src/services/calls/callService.ts`:

1. **The call screen closes too early.** `answerCall` calls `stopRinging` right away, which ends the system call (`reportEndCallWithUUID`) before the app is in front. If Android blocks the app from opening itself, or on iPhone, where JS may not be running yet, the patient sees nothing.
2. **The answer is kept for 2 minutes.** `pendingAnswer` and an `AppState` listener wait `ANSWER_WAIT_MS` (2 minutes), so opening the app any time in that window joins by itself.
3. **No age check at startup.** `replayInitialCallEvents()` and `consumePendingAnswer()` (used by Splash) join an answer however old it is.
4. **A cancel doesn't clear it.** After Answer the call is removed from the `calls` map, so a later `CALL_CANCELLED` (doctor left, or the 30-second timeout) doesn't clear `pendingAnswer`.

### Change (only `callService.ts`)

1. **Keep the system call until the app is in front.** In `answerCall`:
   - If the app is active, end the system call and join, as today.
   - If not, don't end the system call yet. On Android, call `RNCallKeep.setCurrentCallActive(callId)` so the Phone app shows the ongoing call, then `backToForeground()`. On iPhone, CallKit stays on the connected call, and the patient taps PRED Care to open the app.
   - End the system call when the app comes to the front and the join starts, or when 2 or 3 below happens.
2. **Short answer window.** Replace `ANSWER_WAIT_MS` (2 minutes) with `ANSWER_JOIN_WINDOW_MS = 45_000`. Save the time with the answer: `pendingAnswer = { call, answeredAt }`.
   - `consumePendingAnswer()` returns the call only within 45 seconds; otherwise it clears it.
   - A 45-second timer clears the pending answer, removes the `AppState` listener and ends the system call.
   - `replayInitialCallEvents()` replays an answer only for a known call that's still within `expiresAtMs + 45 seconds`; otherwise it skips it.
3. **A cancel clears an answered call.** In `cancelCall`, if the `uuid` or `appointment_id` matches `pendingAnswer`, clear it, remove the listener and end the system call.

```ts
const ANSWER_JOIN_WINDOW_MS = 45_000;
let pendingAnswer: { call: IncomingCall; answeredAt: number } | null = null;

export const consumePendingAnswer = (): IncomingCall | null => {
  const pending = pendingAnswer;
  pendingAnswer = null;
  if (!pending || Date.now() - pending.answeredAt > ANSWER_JOIN_WINDOW_MS) return null;
  return pending.call;
};
```

`SplashScreen` keeps calling `replayInitialCallEvents()` and `consumePendingAnswer()` as today, so it doesn't change.

### Result

| Case | Result |
| --- | --- |
| Answer with the app open | Joins at once |
| Answer with the app closed or in the background | The system call stays on screen until the app opens, then it joins |
| App opened more than 45 seconds after Answer | No join |
| Doctor cancels, or the call times out, after Answer | No join when the app is opened later |
| App killed after Answer, opened later | No join |

## Files

| File | Fix |
| --- | --- |
| `src/services/calls/deviceSync.ts` | Fix 1 |
| `src/services/calls/callService.ts` | Fix 2 |

## Test checklist

- [ ] Open, close and reopen the app 3 times: `register-token` is sent at most once
- [ ] Logout and login: sent once
- [ ] Android, app closed: Answer keeps the call screen, the app opens and joins
- [ ] iPhone, locked: Answer keeps CallKit connected; tap PRED Care, the app opens and joins
- [ ] Answer, then open the app after 45 seconds: no join
- [ ] Answer, doctor leaves, then open the app: no join
- [ ] Answer, kill the app, open it later: no join
