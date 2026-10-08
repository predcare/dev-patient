# PredCare Patient App — Full Analysis & Fix Plan

**Date:** 8 Oct 2026  
**App:** `predcarepatient` (React Native 0.87, React 19, VideoSDK, Razorpay, Socket.IO, Zustand, TanStack Query)  
**Goal:** Make the app run smoothly without crashes, freezes, or broken loops.  
**How we will work:** Do **nothing in this file except track**. Fix items **one by one** in later chats, in the order below. Check the box when a fix is merged and verified.

---

## How to use this file

1. Pick the next **unchecked** item in **Wave 1**, then Wave 2, and so on.
2. Fix only that item (or a tightly related pair if they share the same file).
3. Verify on device (Android + iOS where the item is native).
4. Mark the checkbox `[x]` and add a one-line note under **Fix log**.
5. Do not start a later wave until the previous wave’s P0/P1 items are done.

**Severity**

| Tag | Meaning |
|-----|---------|
| **P0** | Crash, freeze, infinite loop, or call/payment break |
| **P1** | Broken flow, missed call, wrong screen, session hole |
| **P2** | Jank, extra refetch, leak, confusing UX |
| **P3** | Hygiene, leftover code, naming |

---

## Architecture snapshot

The app is a **single native stack** (no real tab navigator). Bottom tabs are a custom bar that `navigate()`s between `Home`, `Doctors`, `Schedule`, `Reports`, `Account`.

```
App.tsx
├── ReactQueryProvider
├── LanguageProvider
├── NetworkEventListener
├── SocketProvider + SocketListeners
├── AppNavigator (Splash → Auth → all dashboard screens)
├── MeetingSessionHost  ← VideoSDK MeetingProvider lives here (outside navigator)
├── EventListener (logout / toasts)
├── NotificationEventListener
└── HideDuringAndroidPip → banners, toasts, popup, loader, offline blocker
```

**Critical global systems**

| System | Where | Risk if broken |
|--------|--------|----------------|
| Auth + token | `useAuthStore` persist + `apiClient` interceptor | Forced logout / stuck logged in |
| Video call | `useMeetingStore` + `MeetingSessionHost` | White screen, frozen camera, PiP loops |
| Sockets | `SocketProvider` / `SocketListeners` | Missed incoming call, call never ends |
| Payments | `PaymentScreen` → Razorpay → `PaymentProcessingScreen` | Paid but unconfirmed / double book |
| Network overlay | `GlobalNoInternetBlocker` | Covers the whole app, including live calls |

There is **no React Error Boundary**. Any uncaught render throw becomes a white screen.

---

## Tracker (work in this order)

### Wave 1 — Stop crashes, freezes, and loops

- [ ] **W1-01 P0** Meeting back-button infinite loop (`MeetingScreen` `beforeRemove`)
- [ ] **W1-02 P0** `setCallInfo` crashes when `appointment` is missing
- [ ] **W1-03 P0** Add a root Error Boundary so render errors do not white-screen the app
- [ ] **W1-04 P0** Offline overlay covers an active video call
- [ ] **W1-05 P0** Meeting mute/camera toggles may remount `MeetingProvider` (rejoin / freeze)
- [ ] **W1-06 P1** `PaymentProcessingScreen` effect can restart poll forever if params fallback to `{}`
- [ ] **W1-07 P0** Register verify uses hardcoded OTP `'123456'` when the field is empty

### Wave 2 — Video call, PiP, sockets (smooth consult)

- [ ] **W2-01 P0** Incoming call still shown while already in a meeting (stale socket closure)
- [ ] **W2-02 P0** Server “time up” resets meeting store without leaving VideoSDK, then `replace()`s away
- [ ] **W2-03 P1** Call countdown hits 0 and does not end the call (depends on socket)
- [ ] **W2-04 P1** Emergency “Exit consultation” while offline does not `leave()` the SDK
- [ ] **W2-05 P1** Incoming banner hides itself before join succeeds
- [ ] **W2-06 P1** `useParticipant('')` with empty id (doctor not joined yet)
- [ ] **W2-07 P1** Dual PiP listeners (`useMeetingPip` + `useAndroidPipLifecycle`) can fight
- [ ] **W2-08 P1** Socket reconnect stops after 5 attempts and never recovers
- [ ] **W2-09 P2** Ringtone / vibration leak if banner unmounts while `Sound` is still loading
- [ ] **W2-10 P2** Foreground-service notification can stick if meeting crashes mid-call
- [ ] **W2-11 P0** Joining a **second** call swaps `callInfo` without `sdkLeave()` on the first room
- [ ] **W2-12 P1** `useMeetingPip` is mounted at 7 screens → duplicate iOS PiP / AppState listeners
- [ ] **W2-13 P1** Closing Android system PiP (X / swipe) calls `endCall()` (easy accidental hang-up)
- [ ] **W2-14 P2** `RTCView` builds `MediaStream` without checking `webcamStream.track`
- [ ] **W2-15 P2** iOS `startPiP` resolves `true` before the system PiP window actually opens

### Wave 3 — Payments and booking (money must not break)

- [ ] **W3-01 P0** Appointment is created **before** Razorpay success (orphan / unpaid booking)
- [ ] **W3-02 P1** Payment timeout vs checkout race (paid user kicked back / slot lost)
- [ ] **W3-03 P1** Payment verify timeout tells user to “check schedule” with no follow-up verify
- [ ] **W3-04 P1** `id` vs `appointment_id` mixed across Home / details / payment verify
- [ ] **W3-05 P2** Duplicate cancel toasts (Razorpay hook + PaymentScreen both toast)
- [ ] **W3-06 P0** `/payments/verify-payment` is never called; poll has no `razorpay_signature`
- [ ] **W3-07 P1** Payment cancel socket emit uses `bookingData.id` which is never set
- [ ] **W3-08 P1** `requires_payment: false` skips checkout even if the UI showed a fee

### Wave 4 — Auth, session, navigation (app must not kick or trap the user)

- [ ] **W4-01 P0** Auth token printed in logs (`apiClient`)
- [ ] **W4-02 P1** No auth route guard (any screen is reachable if navigation is ready)
- [ ] **W4-03 P1** Splash navigates after unmount (`isMounted` not checked after await)
- [ ] **W4-04 P1** Login/register send empty `fcm_token` / `device_id` (push never works)
- [ ] **W4-05 P1** Bottom tabs `navigate()` so the stack grows forever (`isPathClear` never passed)
- [ ] **W4-06 P1** 401 logout has a 2s ignore window; parallel 401s can leave a half-logged-out state
- [ ] **W4-07 P1** Axios has **no request timeout** (spinners can hang forever)
- [ ] **W4-08 P2** Home pull-to-refresh is fake (timeout only, no refetch)
- [ ] **W4-09 P1** `setIntentionalLogoutMode` is never called; `/auth/logout` is not in `exclude401Routes`
- [ ] **W4-10 P1** Logout / 401 does not reset meeting, incoming-call, or socket stores
- [ ] **W4-11 P1** `pendingRoute` is never set — cold-start notification deep link always goes Home
- [ ] **W4-12 P1** `SupportTicketSuccess` is in route types but not registered in the navigator
- [ ] **W4-13 P1** `resetToLogin(navigationRef)` no-ops if the nav container is not ready yet

### Wave 5 — Data, queries, screens (smooth lists and details)

- [ ] **W5-01 P1** React Query: `refetchOnMount` + `refetchOnWindowFocus` + default retry 3, almost no `staleTime`
- [ ] **W5-02 P1** Profile sync in `useAuthProfile` rewrites user on every `data` identity change
- [ ] **W5-03 P2** SocketProvider tears down the socket on every `userData.id` effect rerun
- [ ] **W5-04 P2** Reschedule `useEffect` can fight the user while they type reason
- [ ] **W5-05 P2** Join-video button shows for **confirmed** appointments even when call has not started
- [ ] **W5-06 P3** Leftover `CustomBottomBar_22`, `ProfileSceen` typo, `AppointmemntQueryKey` typo
- [ ] **W5-07 P1** `_isApptExpired` uses `new Date(\`${date} ${time}\`)` (locale-dependent, wrong expiry)
- [ ] **W5-08 P1** Reschedule dates query is disabled when `appointment_duration` is `0` / missing
- [ ] **W5-09 P2** EMR yup schema allows submit without a file; “Browse files” opens gallery not a document picker
- [ ] **W5-10 P2** Several mutations only toast on `res.success` (reschedule, cancel, join, family, support, EMR)

### Wave 6 — Hygiene (after the app is stable)

- [ ] **W6-01 P3** Remove `console.log` of URLs/tokens in interceptors and splash routing
- [ ] **W6-02 P3** Delete unused mock-data exports if screens no longer use them
- [ ] **W6-03 P3** Add ErrorBoundary around Meeting + Payment only if a global one is too wide
- [ ] **W6-04 P3** Unify appointment identifier (`id` everywhere in API calls)

---

## Detailed findings

### W1-01 P0 — Meeting back-button infinite loop

**File:** `src/Features/Dashboard/MeetingScreen/MeetingScreen.tsx` (lines 40–59)

On Android/iOS back or swipe-back during an active call:

1. `beforeRemove` runs.
2. It `preventDefault()`s.
3. It sets PiP to `IN_APP_PIP`.
4. It **dispatches the same navigation action again**.

There is **no guard** for `pipMode === 'IN_APP_PIP'`. Only `NATIVE_PIP` / `ENDED` / `IDLE` return early. The listener fires again → prevent → dispatch → forever. This can freeze the JS thread.

**Fix direction:** If already in `IN_APP_PIP`, allow the leave. Otherwise `preventDefault`, enter in-app PiP, then dispatch **once** (use a ref so the second pass is allowed).

**Verify:** Join a call → hardware back → floating PiP appears, Meeting screen unmounts, no freeze. Back from PiP end-call still works.

---

### W1-02 P0 — `setCallInfo` crash if appointment payload is missing

**File:** `src/zustand/stores/useMeetingStore.ts` (lines 35–41)

```ts
const durationMinutes = Number(
  appointment.appointment_duration || appointment.slot_duration || 0
);
```

`appointment` is not optional in the setter, but join callers pass `videoCallData?.appointment` which can be `undefined`:

- `AppointmentDetailsScreen.tsx` ~198
- `AppointmentsScreen.tsx` ~150
- `UpcomingAppointmentsCard.tsx` ~227
- `GlobalIncomingCallBanner.tsx` ~59

One bad token response = **redbox / JS crash** at join.

**Fix direction:** Guard `appointment`, default remaining time to 0, toast and abort join if token/meetingId missing.

**Verify:** Mock token API without `appointment` → no crash, error toast, stay on details.

---

### W1-03 P0 — No Error Boundary

**Search:** no `ErrorBoundary` / `componentDidCatch` anywhere.

A single render throw (bad `.map` on undefined, missing route param, VideoSDK child error) kills the whole tree. Meeting host sits **outside** the navigator, so a meeting crash can also take down overlays.

**Fix direction:** Add a root boundary in `App.tsx` with a “Reload / Go home” fallback. Add a second boundary around `MeetingSessionHost` so a call crash does not white-screen Home.

**Verify:** Temporarily throw in Home render → fallback UI, not a blank screen.

---

### W1-04 P0 — Offline overlay covers live calls

**File:** `src/components/commons/Network/GlobalNoInternetBlocker.tsx`

`isOffline` is true when `isInternetReachable === false`. On Android this flickers **false** during handoff / brief packet loss. The overlay is full-screen and **blocks the video UI**. There is an “Exit ongoing consultation” button, but the patient cannot see the doctor during the blip.

Network store (`useNetworkStore.ts` line 26):

```ts
const isOffline = isConnected === false || isInternetReachable === false;
```

**Fix direction:** Do not full-block during `callState` in `CONNECTING | WAITING_FOR_DOCTOR | CONNECTED | RECONNECTING`. Use the existing slim `GlobalOfflineBanner` instead. Debounce offline (e.g. 2–3s) before blocking other screens.

**Verify:** Airplane mode 1s during call → banner only. Airplane 10s on Home → blocker. Restore network → blocker gone.

---

### W1-05 P0 — `MeetingProvider` config includes live mute/camera

**File:** `src/components/meeting/MeetingSessionHost.tsx` (lines 72–88)

```ts
micEnabled: !isMuted,
webcamEnabled: isCamOn,
```

`isMuted` / `isCamOn` are store values. Toggling mute re-renders the host and **passes new config into `MeetingProvider`**. VideoSDK often treats config as join options; changing it can rejoin or reset tracks → freeze / echo / black video.

**Fix direction:** Pass **initial** mic/cam only (refs). Drive mute/camera through `useMeeting()` `muteMic` / `enableWebcam` in the controller, not via Provider props.

**Verify:** Join → mute/unmute 10 times → call stays connected, doctor still sees/hears correctly.

---

### W1-06 P1 — Payment processing poll restart loop

**File:** `src/Features/Dashboard/PaymentScreen/PaymentProcessingScreen.tsx` (lines 36–41, 141, 266)

```ts
const bookingData = route.params?.bookingData || {};
const paymentVerifyParams = route.params?.paymentVerifyParams || { ...new object... };
```

The processing `useEffect` depends on `bookingData` and `paymentVerifyParams`. If either is a **new object every render** (missing params), the effect cleanup/restart loop: start poll → unmount poll → start poll. Spinner never finishes.

**Fix direction:** Depend on primitive ids (`appointment_id`, `razorpay_payment_id`). Abort if ids missing. `useRef` for booking snapshot.

**Verify:** Open processing with valid params → one poll chain. Open without params → error UI, no tight loop (check Flipper/logs).

---

### W1-07 P0 — Register OTP fallback `'123456'`

**File:** `src/Features/Auth/RegisterScreen.tsx` line 132

```ts
otp: formData.otp || '123456',
```

Empty/partial OTP is sent as a hardcoded value. That can register a real account against a weak/dev OTP if the backend still accepts it.

**Fix direction:** Require a 6-digit OTP (same as Login). Never substitute a default.

**Verify:** Register with blank OTP → client validation error, network tab shows no `123456`.

---

### W2-01 P0 — Incoming call while already in a meeting

**File:** `src/components/commons/Sockets/SocketListeners.tsx`

`handleIncomingCall` uses `activeMeetingId` from the render that registered the listener, but the effect deps are only `[socketConnection, showCallBanner]` (line 115). After join, `activeMeetingId` in the closure stays **null**, so a second `INCOMING_CALL` still shows the banner (ringtone + vibration) over the live call.

**Fix direction:** Read `useMeetingStore.getState()` inside the handler (already done for time-up). Ignore if any `meetingId` is set, or if payload meeting matches the current one.

**Verify:** In a call, emit a second incoming-call event → no banner.

---

### W2-02 P0 — Time-up does not leave the SDK cleanly

**Same file**, `handleTimeUpVideoCallEnded` (lines 54–99):

- `resetMeetingStore()` only (no `leave()`).
- `replace(APPOINTMENT_DETAILS)` even if current route is already details (dead if/else).
- User can be yanked off Meeting while VideoSDK is still connected for a tick, then Provider unmounts hard.

**Fix direction:** Call the same `endCall()` path as hang-up (`useMeetingConnection`), then reset to `ConsultationCompleted` (existing hang-up UX) or details — pick **one** destination.

**Verify:** Let consult timer end on server → patient lands on summary, no leftover PiP, no second hang-up crash.

---

### W2-03 P1 — Local countdown does not end the call

**File:** `src/hooks/commons/meeting/useMeetingCountdown.ts`

At 0 seconds it only `setRemainingSeconds(0)`. `onTimeUp` is never passed from `MeetingSessionHost`. If the socket `TIME_UP` event is missed (W2-08), the call runs forever with `0:00` on screen.

**Fix direction:** When remaining hits 0, invoke `endCall()` once (ref guard). Keep the 2-min toast.

**Verify:** Short remainingSeconds in store → call ends locally even with socket off.

---

### W2-04 P1 — Offline “Exit consultation” skips SDK leave

**File:** `GlobalNoInternetBlocker.tsx` lines 58–61

```ts
resetMeetingStore();
navigate(AppRoute.HOME);
```

Native camera/mic/foreground service can stay live. Pair with W1-04.

**Fix direction:** Use `endCall()` / `sdkLeave()` then home.

---

### W2-05 P1 — Banner hides before join finishes

**Files:**

- `IncomingCallBanner.tsx` `handleJoinPress` → `hideCallBanner()` immediately
- `GlobalIncomingCallBanner.tsx` also hides after token fetch

If permissions fail or token fails, the banner is already gone. Patient cannot retry without waiting for another socket event.

**Fix direction:** Hide only after `setCallInfo` + navigate succeeds. Keep banner (or a “Retry join” state) on failure.

---

### W2-06 P1 — `useParticipant('')`

**Files:** `useMeetingParticipants.ts` line 46, `AndroidPipStage.tsx` line 15

Empty participant id is passed into VideoSDK while waiting for the doctor. That can throw or subscribe to a junk participant.

**Fix direction:** Skip `useParticipant` unless id is a non-empty string (split hook / early return).

---

### W2-07 P1 — Two Android PiP listeners

- `useMeetingPip.ts` — `addPipChangeListener` (all platforms)
- `useAndroidPipLifecycle.ts` — `addAndroidPipListener` / will-enter / dismiss

Both set `pipMode` and `navigate(MEETING)`. Race: expand PiP → NORMAL then NATIVE_PIP flicker, or Meeting pushed twice.

**Fix direction:** One Android owner (`useAndroidPipLifecycle`). `useMeetingPip` only for iOS + in-app PiP helpers.

---

### W2-08 P1 — Socket dies after 5 reconnects

**File:** `SocketProvider.tsx` `reconnectionAttempts: 5`

After 5 failures the client **stops**. Incoming calls and time-up never arrive until next login. Combined with W2-03, a call can hang.

**Fix direction:** Infinite reconnect with backoff, or re-`io()` when `isLoggedIn` && `!connected` after app foreground. Show a non-blocking “Reconnecting…” on Home/Meeting.

---

### W2-09 P2 — Ringtone leak

**File:** `IncomingCallBanner.tsx` Sound callback after unmount can still `play()`.

**Fix direction:** `cancelled` ref; stop/release in cleanup; don’t play if unmounted.

---

### W2-10 P2 — Sticky call notification

**File:** `index.js` `notifee.registerForegroundService(() => new Promise(() => {}))`  
Stop path: `useAndroidCallForegroundService.ts`

If JS crashes before `stopForegroundService`, Android keeps the mic/camera FGS. User thinks they are still in a call.

**Fix direction:** Also stop FGS on `resetMeetingStore`, app `AppState` inactive+no meeting, and native `onDestroy`.

---

### W2-11 P0 — Second join does not leave the first VideoSDK room

**Files:** `GlobalIncomingCallBanner.tsx` ~59–70, `AppointmentDetailsScreen.tsx` ~172–207, `AppointmentsScreen.tsx` ~126–159, `UpcomingAppointmentsCard.tsx` ~203–236

Join only short-circuits when the **same** appointment is already active. A different appointment calls `setCallInfo` and remounts `MeetingProvider` with no `sdkLeave()` on the previous `meetingId`. Translation `activeCallToast` exists but is unused.

**Fix direction:** If `callState` is not `IDLE`/`ENDED`, toast and abort, or `await endCall()` then join. One shared `leaveMeeting()` used by join, time-up, offline exit, and logout.

**Verify:** In call A, join call B from details → A leaves first; doctor A no longer sees the patient.

---

### W2-12 P1 — `useMeetingPip` mounted 7 times

**File:** `src/hooks/commons/meeting/useMeetingPip.ts` lines 38–71

Call sites: `MeetingScreen`, `MeetingController`, `MeetingHeader`, `InAppPipWindow`, `UpcomingAppointmentsCard`, `AppointmentsScreen`, `AppointmentDetailsScreen`. Each registers iOS PiP + AppState listeners.

**Fix direction:** Same as W2-07 — one host for subscriptions; other screens only import action helpers (`enterInAppPip`, `restoreToMeeting`) from a store or a listener-free module.

---

### W2-13 P1 — Android PiP dismiss hangs up

**Files:** `useAndroidPipLifecycle.ts` ~67–70, `MainActivity.kt` ~118–120

Closing the system PiP window emits dismiss → `endCall()`. Users who swipe the PiP away to “put it down” end the consult.

**Fix direction (product):** Confirm intended UX. Safer default: restore in-app PiP or return to Meeting, hang up only from the end-call button.

---

### W2-14 P2 — RTCView without `track`

**Files:** `DoctorStageView.tsx`, `LocalPipCard.tsx`, `AndroidPipStage.tsx`, `InAppPipWindow.tsx`

Code checks `webcamStream` but not `webcamStream.track` before `new MediaStream([webcamStream.track])`.

**Fix direction:** Render RTCView only when `track` exists.

---

### W2-15 P2 — iOS PiP promise is optimistic

**File:** `ios/predcarepatient/pipmode/PiPManager.swift` ~110–116

`startPiP` `resolve(true)` immediately; real success is later via delegate. JS sets `NATIVE_PIP` from the promise (`useMeetingPip.ts` ~25–26) while the system window may never have opened.

**Fix direction:** Resolve from the PiP started/failed delegate, or keep `IN_APP_PIP` until a native “started” event.

---

### W3-01 P0 — Book first, pay later

**File:** `PaymentScreen.tsx` `handlePay`

`createAppointmentMutation` runs **before** Razorpay. If the user closes Razorpay, the appointment may already exist (pending/unpaid). Timeout (W3-02) then “book again” can double-book the slot.

**Fix direction (product + API):** Confirm with backend: hold slot vs create-on-pay. Client should not treat create success as booked until `paid && confirmed`. On Razorpay cancel, emit cancel (already done) **and** refresh slots. Disable Pay until previous create has settled.

---

### W3-02 P1 — 180s timer vs checkout

If Razorpay is open when the 180s timer hits 0, `timedOutRef` is set. After checkout returns, user is sent **back** even if payment succeeded (`checkoutResult` path still checks timeout). Money taken, booking abandoned.

**Fix direction:** If checkout returned success, **always** go to `PaymentProcessing`. Timer only blocks **starting** a new checkout.

---

### W3-03 P1 — Verify timeout is a dead end

Poll 45s then `timeout`. User is told to check Schedule. If the bank is slow, they may see nothing and book again (double charge risk with W3-01).

**Fix direction:** Keep a background retry (app state active) or a “Check payment status” button that calls the same verify endpoint. Do not offer “Retry booking” on timeout (only on confirmed `failed`).

---

### W3-04 P1 — `id` vs `appointment_id`

| Place | What is passed |
|--------|----------------|
| Appointments list → details | `apt.id` (correct for `/appointments/:id`) |
| Home card details helper | `item.appointment_id` (human code `APT-…`) |
| Payment verify | `data.appointment_id \|\| data._id \|\| data.id` |
| Join token | `apt.id` |

Wrong id → 404 details, failed verify, or verify of the wrong appointment.

**Fix direction:** Type `AppointmentId` as the server UUID/numeric `id`. Display `appointment_id` only as a label. Grep and align all `navigate(APPOINTMENT_DETAILS)` and payment verify params.

---

### W3-05 P2 — Double cancel toast

`useRazorpay.ts` already `showInfoToast('Payment was cancelled')`. `PaymentScreen` `onPaymentDismiss` toasts again.

**Fix direction:** Toast in one place only.

---

### W3-06 P0 — Verify endpoint unused, no signature

**Files:** `src/services/api/endpoints.ts` (`payments.verifyPayment`), `PaymentProcessingScreen.tsx` ~192–196, `useRazorpay.ts` ~79–88

Checkout returns `razorpay_payment_id` / `order_id` / **`razorpay_signature`**. Processing only polls `checkPaymentStatus` with ids. `/payments/verify-payment` is never called.

**Fix direction:** After checkout success, POST verify with signature, then poll status. Do not offer “Retry Booking” unless verify returned failed (see W3-03). Confirm backend contract before changing payload.

**Verify:** Charles/Flipper after pay → verify request present; paid appointment confirmed without a second book.

---

### W3-07 P1 — Cancel emit uses missing `bookingData.id`

**File:** `PaymentScreen.tsx` ~96–98 vs `BookAppointmentScreen.tsx` ~219–242

`PAYMENT_CANCEL_USER` sends `{ appointment_id: bookingData.id }`. Booking payload never sets `id`; the server id appears only after `createAppointment` as `appointment_id`.

**Fix direction:** Emit the id returned from create (same variable used for Razorpay). Skip emit if create never succeeded.

---

### W3-08 P1 — `requires_payment: false` skip

**File:** `PaymentScreen.tsx` ~216–233

If the book API says no payment required, the screen goes straight to success even when the UI showed a fee (`isFeeHidden` / client totals).

**Fix direction:** If `totalAmount > 0` and API says no payment, treat as error (toast + stay). Trust server only when client also expected zero.

---

### W4-01 P0 — Auth token in logs

**File:** `src/services/api/apiClient.ts` line 23

```ts
console.log('dev token ==================>', token);
```

Ships in production JS. Tokens in logcat / Metro / crash reports.

**Fix direction:** Delete. Never log Authorization.

---

### W4-02 P1 — No auth guards

`AppNavigator` registers Login and Home as equal stack screens. Auth is only enforced by Splash/Login `reset`. A notification `navigate(AppointmentDetails)` before login, or a deep link, can open private screens. Logout `resetToLogin` does not reset meeting/socket if 401 races.

**Fix direction:** Split Auth stack vs App stack keyed on `isLoggedIn` (after persist hydrate). Meeting host only mounts when logged in.

---

### W4-03 P1 — Splash navigate-after-unmount

**File:** `SplashScreen.tsx`

`isMounted` is checked **before** `authenticateAndLoad`, not after. Fast logout/login can navigate a stale Splash.

**Fix direction:** Check `isMounted` after the await; abort navigation if false.

---

### W4-04 P1 — Empty push identity

Login and Register send `fcm_token: ""`, `device_id: ""`, `platform: ""`. Storage has `FCM_TOKEN` but nothing in this repo registers FCM. Incoming-call **push** when the app is killed will not work; only socket while open.

**Fix direction:** Wire `@react-native-firebase/messaging` (or existing vendor), save token, send on login/verify, refresh on rotate.

---

### W4-05 P1 — Tab stack grows forever

**File:** `CustomBottomBar.tsx`

`isPathClear` defaults **false** and **no screen passes it**. Every tab press `navigate()`s a new stack entry: Home → Doctors → Schedule → Home → … Memory grows; Android back walks the whole trail instead of exiting.

**Fix direction:** Tab roots should `reset`/`replace` to that screen, or introduce a real nested tab navigator. Pass `isPathClear` from `SafeAreaWrapper` for the five tab screens.

**Verify:** Tap all 5 tabs 20 times → `navigationRef.getState().routes.length` stays small. Back from Home exits the app (Android).

---

### W4-06 P1 — 401 handling window

`isAlreadyHandlingUnauthorized` blocks extra 401s for 2s but does not queue. During logout, in-flight queries still error and toast (unless `isIntentionalLogoutInProgress`). Splash also `logout()` on any profile error (including network) → user kicked to Login offline.

**Fix direction:** Splash: only logout on **401**, not on network. Set intentional-logout before `queryClient.clear()`.

---

### W4-07 P1 — Axios no timeout

`axios.create({ baseURL })` has no `timeout`. A hung API = infinite BackdropLoader (join call, reschedule, login).

**Fix direction:** `timeout: 30000` (longer for uploads). Loader always `hide` in `onSettled`.

---

### W4-08 P2 — Fake Home refresh

**File:** `HomeScreen.tsx` `onRefresh` → `setTimeout(600)`. Child queries (`UpcomingAppointmentsCard`, `MyDoctorsSection`) do not refetch.

**Fix direction:** `queryClient.invalidateQueries` for home keys.

---

### W4-09 P1 — Intentional logout flag unused; logout 401 not excluded

**Files:** `apiClient.ts` `setIntentionalLogoutMode` (defined, **never called**); `exclude401Routes` omits `/auth/logout`; `SettingScreen.tsx` logout ~98–113

Signing out with an expired token hits 401 → `logoutCurrentUser` → “Session Expired” toast on a user who tapped Logout. Settings also `logout()` then `queryClient.clear()` (opposite order from `EventListener`).

**Fix direction:** Call `setIntentionalLogoutMode(true)` before the logout API; add logout URL to `exclude401Routes`; one cleanup order: flag → API → clear queries → reset stores → reset nav → flag false.

---

### W4-10 P1 — Logout does not clear call state

**File:** `EventListener.tsx` ~18–28

401/logout clears auth + query cache only. `useMeetingStore` / incoming-call / socket can keep a live `MeetingProvider` and banner.

**Fix direction:** Shared teardown: `endCall()` or `resetMeetingStore` + hide banner + disconnect socket. Pair with W2-11.

---

### W4-11 P1 — Cold-start notification never reaches Splash target

**File:** `src/lib/common/navigation.utils.ts`

`pendingRoute` is only ever set to `null`. `consumeTargetRoute()` always returns Home. Splash’s “open the notification screen” branch never receives a real target.

**Fix direction:** `setPendingRoute` from `getInitialNotification` / dispatcher when nav is not ready; Splash consumes it (already written).

---

### W4-12 P1 — `SupportTicketSuccess` not in the navigator

**Files:** `src/route/index.ts` vs `AppNavigator.tsx`

Constant and param types exist; no `Stack.Screen`. Navigate after create ticket would throw / no-op.

**Fix direction:** Register the screen or stop navigating to it (use a modal / toast + Support list).

---

### W4-13 P1 — Logout navigation if nav not ready

**File:** `navigation.utils.ts` `resetAndNavigate` returns if `!navigation.isReady()`

`EventListener` calls `resetToLogin(navigationRef)` with no retry. Early 401 (before container ready) leaves the user on a private screen with a cleared token.

**Fix direction:** Queue `Login` reset until `onReady`, or listen for `NavigationContainer` ready.

---

### W5-01 P1 — Query defaults hammer the API

**File:** `ReactQueryProvider.tsx`

```ts
refetchOnWindowFocus: true,
refetchOnMount: true,
```

Almost no `staleTime` (appointments, doctors, slots). Default retry = 3. Opening Schedule while offline = error toasts × retries. Returning from every stack screen refetches.

**Fix direction:** `staleTime: 30_000`, `retry: 1`, `refetchOnWindowFocus: false` (RN has no real window). Keep `refetchOnReconnect: true` via `onlineManager` (already wired).

---

### W5-02 P1 — Profile write loop

**File:** `useAuthProfile.tsx`

Effect depends on `profileDetails.data` (new object each fetch) and always `setUserData(user)`. That re-renders the tree and can persist AsyncStorage repeatedly.

**Fix direction:** Compare `user.id` + `updated_at`; only set when changed.

---

### W5-03 P2 — Socket reconnect on profile touch

`SocketProvider` deps include `userData?.id`. Combined with W5-02, a profile refetch can disconnect/reconnect the socket → missed incoming call during the gap.

**Fix direction:** Depend on `isLoggedIn` + token only. Don’t disconnect if the same token is still valid.

---

### W5-04 P2 — Reschedule form reset

**File:** `RescheduledScreen.tsx` lines 216–224

When `apptInfo` identity changes (refetch), consultation type is overwritten. Pull-to-refresh while editing can reset the form.

**Fix direction:** Seed form **once** (`useRef` hydrated).

---

### W5-05 P2 — Join shown too early

**File:** `AppointmentDetailsScreen.tsx` `isVideoBtnShow`

`confirmed` **or** `in_progress` shows Join. Patients join before the doctor starts the room → WAITING forever or token error.

**Fix direction:** Confirm product rule. Likely: enable Join only `in_progress` (and `confirmed` within slot window if backend allows).

---

### W5-06 P3 — Leftovers

- `src/components/commons/CustomBottomBar_22/` unused duplicate
- Folder `ProfileSceen` typo
- Enum `AppointmemntQueryKey` typo (safe to keep until a rename PR)
- `IncomingCallBanner` default name `'Dr. Sahil Mallick'`
- Auth store sets unused `activeWorkspace`
- `SupportTicketSuccess` / `MainTabs` types with no screens
- Bottom bar still maps doctor-app route names (`Patients`, `DoctorProfile`, …)
- `ComingSoonScreen.tsx` exists but is unregistered
- `FamilyMemberSelectSheet` exists but book flow always uses `userData.id`

---

### W5-07 P1 — Appointment expiry parsed with `Date`

**File:** `src/lib/common/common.utils.ts` `_isApptExpired` (~241–244)

`new Date(\`${apptDate} ${startTime}\`)` is locale/OS dependent. iOS vs Android can disagree → join/cancel/reschedule shown or hidden wrongly (`AppointmentsScreen.tsx`).

**Fix direction:** Parse with `dayjs` and an explicit format (`YYYY-MM-DD HH:mm:ss`) in local time (or UTC if that is the API contract).

---

### W5-08 P1 — Reschedule dates disabled when duration is 0

**File:** `doctor.hooks.ts` `useDoctorRescheduledAvailDates` `enabled: Boolean(doctorId && slot_duration)`  
`RescheduledScreen.tsx` `slotDuration = Number(apptInfo?.appointment_duration || 0)`

Missing duration → query never runs → empty calendar, no error.

**Fix direction:** Enable when `doctorId` is set; pass a fallback duration (slot length from appt info or clinic default). Show error if dates fail.

---

### W5-09 P2 — EMR file not required; browse is gallery

**Files:** `src/lib/schemas/emr.schema.ts` (`file` optional/nullable); `StepUploadMethod.tsx` “Browse files” → `handleGallery`

User can reach submit without a file. Label promises PDF/Word but opens the image picker. Gallery path often skips `useDevicePermissions` (also Profile / Support ticket).

**Fix direction:** Require `file` in yup. Use a document picker for browse. Request photo permission on Android 13+ before gallery.

---

### W5-10 P2 — Silent `success: false` mutations

Reschedule, cancel, join-token, family add/revoke, support create, EMR upload/share/delete often only handle `res?.success` and have no `onError` / `!success` toast.

**Fix direction:** Shared helper: if `!res?.success` show `res.message` or generic error; always `hideLoader` in `onSettled`.

---

## Loop / freeze map (quick)

| Loop | Trigger | Result |
|------|---------|--------|
| Meeting `beforeRemove` dispatch | Back during call | JS freeze |
| Payment processing `useEffect` + `{}` fallback | Missing route params | Poll start/stop forever |
| `useAuthProfile` + `setUserData` | Profile refetch | Extra renders / socket churn |
| Tab `navigate()` | Rapid tab taps | Unbounded stack, sluggish back |
| VideoSDK `MeetingProvider` config | Mute/cam toggle | Rejoin / black frames |
| Socket 5 reconnects then dead | Flaky network | Call never ends, no incoming |
| `useMeetingPip` × 7 mounts | Open Meeting + lists | Duplicate PiP / AppState handlers |

---

## Smoothness rules (apply on every later fix)

1. **Never throw in render** — optional-chain API payloads; Error Boundary as last resort.
2. **One owner for meeting teardown** — always `leave()` then `resetMeetingStore()`.
3. **No overlay on an active call** except a thin banner.
4. **Navigation:** tab roots replace/reset; do not `preventDefault` + re-dispatch without a ref.
5. **Payments:** never navigate away from a **successful** checkout; always verify **with signature**. Never create a second appointment for the same checkout session.
6. **Queries:** staleTime + retry 1; hide loaders in `onSettled`.
7. **Sockets:** read store with `getState()` inside handlers (no stale closures).
8. **Secrets:** never log tokens.

---

## Suggested first three sessions (when we start)

1. **Session A:** W1-01, W1-02, W1-03, W1-07 (loop + crash + safety net + OTP hole)  
2. **Session B:** W1-04, W1-05, W2-01, W2-02, W2-11 (call must stay alive, end cleanly, never double-join)  
3. **Session C:** W3-01, W3-06, W3-02, W4-01 (money verify + token leak)

Do not mix a meeting fix and a payment fix in the same session unless blocked.

---

## Fix log

| Date | ID | Note |
|------|----|------|
| | | |

---

## Out of scope for this analysis (call out later)

- Visual redesign / copy / i18n completeness  
- Backend slot-hold vs capture-on-pay contract, and `/payments/verify-payment` payload (W3-01, W3-06)  
- Whether Android PiP close should hang up or only minimize (W2-13)  
- Adding Firebase if it is in another repo  
- Performance profiling of lists (FlatList already used on Schedule)

This document is the source of truth until a finding is disproven on device. If a “bug” is actually intended product behavior, move it to Out of scope and do not “fix” it.
