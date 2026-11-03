# Stale call fix plan: opening the app joins an old call

## The problem

Sometimes opening PRED Care starts "Joining Video Call..." for an earlier call: a test ring or a
real ring that has already ended. Nobody is calling. The app is acting on old ring data.

## Root causes

### 1. Android keeps returning the old ring notification as the "launch" notification (main bug)

- `processInitialNotification()` ([notificationDispatcher.ts:73](../src/services/notifications/notificationDispatcher.ts#L73))
  calls `notifee.getInitialNotification()`.
- Notifee's Android core (v9.1.8) reads the `notification` extra from `activity.getIntent()`.
  It never clears that extra and doesn't check `FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY`. (Checked in
  the shipped `core-202108261754.aar`: it calls `getIntent`, with no `getFlags` or `removeExtra`.)
- `MainActivity` is `singleTask` and doesn't override `onNewIntent`, so the intent from the first
  Answer/tap stays on the activity.
- Every new JS start therefore sees the same old ring notification again:
  - a JS reload in development (this is the "test ring" case),
  - reopening from Recents after Android killed the process (Recents replays the original intent),
  - the activity being recreated.
- The only guard is the `initialNotificationCheck` memo, and it lives in JS memory, so it's lost
  on each of these restarts.

### 2. A replayed call skips the expiry check when the app is in front

`answerCall()` ([callService.ts:209](../src/services/calls/callService.ts#L209)):

```ts
if (isCallExpired(call) && !isAppActive()) { ...stop, toast... }
```

During a cold start on the splash screen the app is `active`, so the expiry check is skipped. The
replayed call then goes `stopRinging` → `startJoin` → `holdAnswer` (with a **new** `answeredAt = now`)
→ `consumePendingAnswer()` in SplashScreen → `joinIncomingCall()`.
Because `holdAnswer` sets a new `answeredAt`, the 45 s answer window can't catch it either.

The same path hits iOS through Firebase `getInitialNotification` / `onNotificationOpenedApp` when
the patient taps an old call alert left in Notification Center.

### 3. The "already handled" list is lost on every restart

`finished` ([callService.ts:17](../src/services/calls/callService.ts#L17)) is an in-memory `Set`.
After a restart, a callId that was already answered, declined or cancelled looks new again.

### 4. `joinIncomingCall` never checks that the call is still live

[joinIncomingCall.ts:31](../src/services/calls/joinIncomingCall.ts#L31) loads the appointment info
and a fresh token and then goes to the meeting. It never checks whether the doctor is still in the
room or the appointment is still running, and it doesn't skip the join when a meeting is already
open (`useMeetingStore.callInfo`).

### 5. Smaller leftover-state problems (same family)

- **A ring that times out keeps its entries.** When the ring notification goes away through
  `timeoutAfter` and no cancel push arrives, the call stays in `calls` and `onSystemScreen`, and
  the CallKeep call is never ended. `isRinging(appointmentId)` stays `true`, so
  `hideBannerWhileRinging` keeps hiding later socket banners for that appointment.
- **A test doctor name is the default.** In
  [useIncomingCallStore.ts:24](../src/zustand/stores/useIncomingCallStore.ts#L24),
  `DEFAULT_DOCTOR_NAME = 'Dr. Sahil Mallick'`, so a socket payload with no `name` shows the test
  name.
- **Two code paths answer the same call.** The `AppState` listener in `answerCall` and
  SplashScreen's `consumePendingAnswer` both handle it. Today this only works because
  `startJoin → holdAnswer` re-holds the call, and that re-hold also resets `answeredAt`.

## Fix plan

### Step 1: Drop launch notifications that are stale or already used (fixes 1 and 2)

- In `processInitialNotification`, before routing, take the notification `id` (the callId for
  rings) and skip it when either is true:
  - it was already handled (see Step 2), or
  - it's a call (`callFromPush` succeeds) and `isCallExpired(call)` is true.
- Android native: in `MainActivity`, override `onNewIntent` to call `setIntent(intent)`. If the
  launch has `FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY`, remove the notification extras from the intent
  in `onCreate`, so a launch from Recents never counts as a notification tap.
- Optional: once the initial notification has been handled, clear the activity intent extras.
  This needs a small native method, or `setIntent(Intent())` after JS has read the intent.

### Step 2: Remember handled callIds across restarts (fixes 3)

- Save `finished` callIds to AsyncStorage (or MMKV if the app already uses it), each with a
  timestamp. Drop entries older than about 24 h.
- Load them early: in `startCallKeepListeners` / before `replayInitialCallEvents`.
- Check them in `ringIncomingCall`, `answerCall`, `declineCall` and `processInitialNotification`.

### Step 3: Check expiry no matter what state the app is in (fixes 2)

- In `answerCall`, check `isCallExpired(call)` even when the app is active. If the call has
  expired: `stopRinging` and show the "doctor is no longer calling" toast. Don't join.
- In `holdAnswer`, keep the first `answeredAt` when the same callId is held again, so the 45 s
  window can't be reset.
- Give `consumePendingAnswer` one owner: let SplashScreen own a cold start, and have the
  `AppState` listener ignore events while the route is `SPLASH`.

### Step 4: Check the call is live before joining (fixes 4)

- In `joinIncomingCall`, return early if `useMeetingStore.getState().callInfo?.meetingId` is
  already set.
- Use the appointment info that's already fetched (status, or whether a meeting is ongoing,
  depending on what the API returns). If the call isn't live, show "Call ended, open the
  appointment to join" and don't open the meeting. **Ask the backend team** which field shows
  "doctor is in the room".
- Fetch with `staleTime: 0` (or `queryClient.fetchQuery({ ..., staleTime: 0 })`) so a cached old
  appointment isn't used.

### Step 5: Clean up after a timed-out ring (fixes 5)

- In `ringIncomingCall`, start a timer for `expiresAtMs - now`. When it fires, if the call is still
  in `calls`, run `stopRinging` (which also ends the CallKeep call and clears `onSystemScreen`).
  On Android, optionally show the missed-call notification.
- Change `DEFAULT_DOCTOR_NAME` to a neutral `'Your doctor'`.

## Test checklist

1. Android: answer a ring from the notification and finish the call. Swipe the app away, then
   reopen it from **Recents**. It must not join.
2. Android dev: answer a test ring, then reload JS (`r` in Metro). It must not join.
3. Android: let a ring time out with no cancel push, then open the app. It must not join, and a
   new socket banner for the same appointment must show.
4. iOS: leave an old call alert in Notification Center for over 1 min, then tap it with the app
   closed. You should get the "Call ended" toast and no join.
5. A normal case still works: a fresh ring answered within 30 s from a closed, background and
   foreground app joins once.
6. Already in a meeting with a second ring/answer for the same appointment: no second join.

## Files to change

- `src/services/notifications/notificationDispatcher.ts`: filter stale or already-handled launch
  notifications.
- `src/services/calls/callService.ts`: saved `finished` list, expiry check, keep first
  `answeredAt`, ring timeout cleanup, one owner for the pending answer.
- `src/services/calls/joinIncomingCall.ts`: skip when already in a meeting, check the call is live.
- `android/app/src/main/java/com/predcarepatient/MainActivity.kt`: `onNewIntent` → `setIntent`,
  remove extras on launch from Recents.
- `src/zustand/stores/useIncomingCallStore.ts`: neutral default name.

## Implemented (2026-11-03)

- `src/services/calls/handledCalls.ts` (new): callIds already dealt with, saved in AsyncStorage
  for 12 h. Each is `answered` (Answer pressed, join pending) or `done` (joined, declined,
  cancelled, expired, timed out). A `done` call never rings or joins again.
- `callService.ts`:
  - `answerCall` checks expiry in every app state and ignores `done` calls.
  - An `answered` call whose JS instance has gone can still join, but only within 45 s of the
    original Answer.
  - `holdAnswer` keeps the original `answeredAt`.
  - The `AppState` listener leaves cold starts to SplashScreen and joins directly otherwise.
  - Rings are cleared on timeout (`endRingWhenExpired`).
  - An unmatched cancel marks the callId as `done`.
- `joinIncomingCall.ts`: skips the join when already in a meeting, always fetches fresh
  appointment info, and doesn't join a `completed` / `cancelled` / `no_show` appointment.
- `MainActivity.kt`: `onNewIntent` → `setIntent`. On a launch from Recents or a restore after
  the app was killed, the notification extras are removed.
- `useIncomingCallStore.ts`: default name is now `'Your doctor'`.

Backend notes:
- Every ring needs a new `uuid`; a reused one is ignored for 12 h.
- The push should carry `timestamp` (ms). Without it, expiry can't be checked and only the
  handled list protects against old alerts.
