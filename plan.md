# PRED Care Patient App — Android Implementation Plan

**Scope:** Android-only code review of this React Native 0.78.3 patient app (`predcarepatient` / `com.predcarefrontendstable`).  
**Deliverable:** This plan only. Do not treat it as already-applied code.  
**Verified against:** The actual tree under `android/`, `src/`, `App.tsx`, `index.js`, `package.json`, and `ios/` (iOS is documented only in the last section).

---

## How to use this document

1. Fix **P0** items first. They can disconnect a live call, enter empty PiP, or hammer Android permission APIs.
2. Treat **P1** as required before a production video-call release.
3. **P2** is quality, OEM hardening, and Play Console hygiene.
4. Each issue lists **file path**, **what is wrong**, **why it matters**, and **what to change**.

Suggested implementation order:

1. Collapse duplicate `useVideoCallControls` / `useMeeting` subscriptions.
2. Stop the permission-request effect that re-runs on every timer tick.
3. Gate native PiP so Home/Back never PiP the dashboard.
4. Align PIP button + Home with real `enterPipMode` + Android 12+ auto-enter.
5. Keep camera/mic alive in PiP (foreground service + OEM notes).
6. Uncomment/wire call save + heartbeat with **patient** role.
7. Remaining lifecycle, loops, and Play/OEM items.

---

## Architecture snapshot (verified)

| Piece | Location | Role |
| --- | --- | --- |
| App shell | `App.tsx` | Navigator + `GlobalMeetingManager` overlay (sibling, not inside the Meeting route) |
| Meeting UI host | `src/components/Modules/PatientMeeting/GlobalMeetingManager.tsx` | `MeetingProvider` while token/meetingId exist |
| Session UI switch | `src/components/Modules/PatientMeeting/MeetingSessionController.tsx` | Full UI vs in-app PiP vs native PiP |
| Video SDK controls | `src/hooks/commons/useVideoCallControls.ts` | `join` / `leave` / mic / cam |
| Meeting route | `src/Screens/DashboardScreen/MeetingScreen.tsx` | Black placeholder; real UI is global overlay |
| Native PiP | `android/app/src/main/java/com/predcarefrontendstable/MainActivity.kt` | `onUserLeaveHint` → `AndroidPipModule.pipModeReq()` |
| Manifest PiP | `android/app/src/main/AndroidManifest.xml` | `supportsPictureInPicture="true"` |
| In-app floating card | `src/components/Modules/PatientMeeting/InAppPipOverlay.tsx` | Overlay while user browses other screens |
| Store | `src/zustand/stores/useMeetingStore.ts` | `isInAppPip`, `isNativePip`, call state |

Libraries present: `@videosdk.live/react-native-sdk`, `@videosdk.live/react-native-webrtc`, `@videosdk.live/react-native-pip-android`, `@videosdk.live/react-native-incallmanager` (dependency **not used** in app JS).

---

## 1. PiP-related issues (review carefully)

### 1.1 P0 — PIP control does not enter system Picture-in-Picture

**Files:**  
`src/components/Modules/PatientMeeting/DoctorMeetingContainer.tsx`  
`src/components/Modules/PatientMeeting/MeetingControlBar.tsx`

**What is wrong:** `handleNativePipPress` calls `handleInAppPip()` on **both** Android and iOS. That only sets `isInAppPip` and `replace(Schedule)`. It never calls `PipHandler.enterPipMode(9, 16)`.

**Why:** Users tapping **PIP** expect a system floating window (Home-screen overlay). They get an in-app card instead. Native PiP only happens if `onUserLeaveHint` runs (Home / Recents / `moveTaskToBack`).

**Change:**

1. On Android API 26+, if `callState` is `CONNECTING` or `CONNECTED`, call `PipHandler.enterPipMode(9, 16)` (or the VideoSDK helper you already use in `GlobalMeetingManager.tsx`).
2. Wrap in try/catch. If `enterPictureInPictureMode` fails (no PiP feature, OEM block, already in PiP), fall back to in-app PiP.
3. Do **not** `replace(Schedule)` when native PiP succeeds; the activity *is* the PiP window. Navigating away while entering PiP can unmount/rebuild the meeting surface and drop tracks.
4. Keep in-app PiP for explicit “browse prescriptions / upload while talking” actions (`handleRxPress` / `handleUploadPress`).

---

### 1.2 P0 — `onUserLeaveHint` always requests PiP, even when there is no call

**File:** `android/app/src/main/java/com/predcarefrontendstable/MainActivity.kt`  
**Related:** `src/components/Modules/PatientMeeting/GlobalMeetingManager.tsx` (`PipHandler.setMeetingScreenState`)

**What is wrong:** `onUserLeaveHint` always calls `AndroidPipModule.pipModeReq()`. JS only *intends* to gate via `setMeetingScreenState(true|false)`, but:

- The JS effect **cleanup always** calls `PipHandler.setMeetingScreenState(false)` whenever `callState` or `callmeetingId` changes.
- `CONNECTING` → `CONNECTED` therefore **disables** meeting-screen PiP, then re-enables it. Home during that window backgrounds the **full app** with no PiP.
- If native `pipModeReq()` does not honor the JS flag (OEM / library version), Home on Dashboard can open a **tiny dashboard PiP**.

**Why:** Empty or wrong PiP; WebRTC may be paused/killed in background without a PiP activity; calls look “disconnected”.

**Change:**

1. Keep a native boolean (`isMeetingPipEligible`) updated from JS (existing `setMeetingScreenState` is the right API — **do not clear it in effect cleanup while the call is still active**). Split the effect: subscribe to PiP events once; only toggle meeting-screen state when `isCalling` changes, without a cleanup that forces `false` on every dependency churn.
2. In `MainActivity.onUserLeaveHint`, only call `pipModeReq()` if the module reports meeting-screen active **and** `Build.VERSION.SDK_INT >= 26` **and** `packageManager.hasSystemFeature(FEATURE_PICTURE_IN_PICTURE)`.
3. Catch `IllegalStateException` (activity not eligible, multi-window, locked).

---

### 1.3 P0 — Android 12+ auto-enter PiP is incomplete

**Files:**  
`android/app/src/main/java/com/predcarefrontendstable/MainActivity.kt`  
`android/app/src/main/AndroidManifest.xml`

**What is wrong:** PiP auto-entry is implemented only via `onUserLeaveHint`. On Android 12 (API 31)+ Google expects `PictureInPictureParams.Builder().setAutoEnterEnabled(true)` while a call is active. `onUserLeaveHint` is **not** reliably called for gesture Home / predictive back on all versions.

**Why:** On Pixel / stock Android 12–16, Home during a call often **does not** enter PiP. The activity goes to the background, camera/mic stop, SFU disconnects.

**Change:**

1. When the call becomes eligible, set `setPictureInPictureParams` with:
   - `setAspectRatio(Rational(9, 16))` (match existing `9, 16`)
   - `setAutoEnterEnabled(true)` on API 31+
   - `setSeamlessResizeEnabled(true)` on API 31+ if you keep video in the window
2. When the call ends, `setAutoEnterEnabled(false)` immediately so Dashboard cannot auto-PiP.
3. Keep `onUserLeaveHint` + `pipModeReq()` for API 26–30 only (or as fallback if auto-enter is false).
4. Add `pictureInPicture` to `android:configChanges` on `MainActivity` so entering PiP does **not** recreate the Activity (RN remount → `MeetingProvider` teardown → `leave()` risk).

Current `configChanges` (missing `pictureInPicture`):

`keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode`

---

### 1.4 P0 — Closing system PiP always hangs up; exiting PiP races with navigation

**Files:**  
`src/components/Modules/PatientMeeting/MeetingSessionController.tsx` (`onPiPClosed` → `endCall('patient_left')`)  
`src/components/Modules/PatientMeeting/GlobalMeetingManager.tsx` (`handlePiPStateChange` when `isEnabled === false` navigates to `Meeting`)

**What is wrong:**

- VideoSDK `onPiPClosed` is treated as “user ended the call”. On some OEMs, leaving PiP (tap the PiP to restore, or Recents) also fires close/changed(false).
- At the same time, `isNativePip` false navigates to `AppRoute.MEETING`. If `endCall` already ran, `MeetingScreen` sees empty token and `replace(Schedule)` — flicker and double leave.

**Why:** Expanding PiP to full screen can **drop the call**. Closing PiP might double-`leave()`.

**Change:**

1. Distinguish **close (X / dismiss)** vs **restore to full screen**. Only `endCall` on explicit close if the library documents that `onPiPClosed` is dismiss-only.
2. If the event is ambiguous, **do not** end the call on `onPiPClosed`. End only from END button / time-up / doctor hangup. On restore, set `isNativePip(false)` and show full `DoctorMeetingContainer` without `leave()`.
3. If you keep hangup-on-close, skip the navigate-to-Meeting branch when `callState` is already `ENDED`/`IDLE`.

---

### 1.5 P0 — Switching to in-app PiP unmounts the full meeting tree (track / join risk)

**File:** `src/components/Modules/PatientMeeting/MeetingSessionController.tsx`

**What is wrong:** When `isInAppPip` is true, the tree swaps from `DoctorMeetingContainer` to `InAppPipOverlay`. That **unmounts** local/remote `RTCView`s and a second `useVideoCallControls` instance.

**Why:** Destroying `RTCView` does not always stop the publisher, but on Android WebRTC it often **stops rendering** and can trigger consumer/producer errors (you already special-case some of these as non-fatal). Combined with duplicate `useMeeting` (issue 2.1), unmount cleanup can still call `leave()` if store flags are stale.

**Change:**

1. Keep **one** meeting surface mounted for the life of `MeetingProvider`.
2. In-app PiP should be a **layout mode** (small `RTCView` + hide chrome), not a different component that unmounts `useParticipant` / `useVideoCallControls`.
3. Alternatively, always keep a hidden `DoctorMeetingContainer` mounted (`opacity: 0` / `pointerEvents: 'none'`) and overlay the draggable card that reuses the same participant ids.

---

### 1.6 P1 — Three competing Android back handlers during a call

**Files:**  
`src/hooks/commons/useGlobalAndroidBackHandler.ts`  
`src/components/Modules/PatientMeeting/GlobalMeetingManager.tsx`  
`src/components/Modules/PatientMeeting/DoctorMeetingContainer.tsx`  
`android/app/src/main/java/com/predcarefrontendstable/MainActivity.kt`  
`android/app/src/main/AndroidManifest.xml` (`android:enableOnBackInvokedCallback="true"`)

**What is wrong:** Back is handled in JS three times plus native `OnBackPressedCallback` that forwards to RN, plus `invokeDefaultOnBackPressed()` → `moveTaskToBack(true)` (never finishes). Predictive back (Android 13+) with `enableOnBackInvokedCallback` often **skips** RN `BackHandler`.

**Current meeting-back behavior (JS):** always in-app PiP + `replace(Schedule)`, **not** native PiP.

**Why:** Inconsistent Back vs Home; on Android 13–16 Back may send the task to background (`moveTaskToBack`) → `onUserLeaveHint` → PiP or silent background kill.

**Change:**

1. Single owner for “back during call”: e.g. only `GlobalMeetingManager` while `hasActiveMeeting`.
2. Remove the `DoctorMeetingContainer` `BackHandler` or make it no-op when the global handler is registered.
3. Meeting back policy (pick one and document in UI):
   - **A (recommended):** Back = in-app PiP + stay in process (browse app).
   - **B:** Back = native system PiP (`enterPipMode`).
4. Native: if predictive back is required, keep `enableOnBackInvokedCallback` but implement `OnBackPressedCallback` that first asks JS “is call active?” via a module, then either consume or `moveTaskToBack`.
5. Do not `exitApp()` from Home double-back while a call is active (`useGlobalAndroidBackHandler.ts`).

---

### 1.7 P1 — `uses-feature` for PiP without `android:required="false"`

**File:** `android/app/src/main/AndroidManifest.xml`

```xml
<uses-feature android:name="android.software.picture_in_picture" />
```

**Why:** Play Store **hides** the app from devices without PiP (some Go editions, TVs, older tablets). PiP is optional; video consult should still work full-screen.

**Change:** `android:required="false"`. In JS, feature-detect before `enterPipMode`.

---

### 1.8 P1 — Portrait lock + PiP aspect + missing PiP actions

**Files:**  
`android/app/src/main/AndroidManifest.xml` (`android:screenOrientation="portrait"`)  
`src/components/Modules/PatientMeeting/GlobalMeetingManager.tsx` (`setDefaultPipDimensions(9, 16)`)

**What is wrong:** Locked portrait is OK for the consult UI, but some OEMs (Samsung DeX, foldables, Xiaomi) fail `enterPictureInPictureMode` if aspect/orientation conflict. Native PiP UI in `DoctorMeetingContainer` still shows a large self-view card (`selfPipCardPip`) designed for a full activity, not a ~120dp window.

**Change:**

1. Keep portrait for the activity; pass a portrait `Rational(9, 16)` consistently.
2. On `isNativePip`, hide badges/chrome; one remote `RTCView` fill; optional tiny local overlay.
3. Optional: `setActions` on `PictureInPictureParams` (mute / end) for API 26+ so the user can hang up from the PiP chrome without opening the app (OEM Recents sometimes lack your in-window buttons).

---

### 1.9 P1 — In-app PiP is not system PiP (and overlay can be clipped)

**Files:**  
`src/components/Modules/PatientMeeting/InAppPipOverlay.tsx`  
`App.tsx` (overlay is a sibling of `AppNavigator` — good)

**What is wrong:** In-app PiP dies when the process is backgrounded. `Dimensions.get('window')` is captured at **module load**, so foldables / split-screen / density change clamp pan incorrectly. `PanResponder` uses `useNativeDriver: false` (OK) but `onStartShouldSetPanResponder: () => true` steals taps from the End button unless `stopPropagation` always wins (race on some OEMs).

**Change:** Subscribe to `Dimensions.addEventListener('change')` to recompute max X/Y. Prefer `onStartShouldSetPanResponderCapture: false` and only capture moves after a threshold (already partially done). Ensure End uses a child that the pan responder does not claim (`onMoveShouldSetPanResponder` only).

---

### 1.10 P1 — `MeetingScreen` `beforeRemove` forces in-app PiP whenever the route leaves

**File:** `src/Screens/DashboardScreen/MeetingScreen.tsx`

**What is wrong:** Any leave of `Meeting` (including a future native-PiP flow that still uses the Meeting route, or `replace` during hangup) sets `isInAppPip: true` if the call is active.

**Why:** Can leave `isInAppPip` true after native PiP restore/hangup and show the wrong UI branch.

**Change:** Set in-app PiP only for **intentional** browse-away (RX, upload, back-to-schedule). If `endCall` / `resetMeetingStore` is in progress, skip. If entering native PiP, skip.

---

### 1.11 P2 — Restore from native PiP always navigates to Meeting

**File:** `src/components/Modules/PatientMeeting/GlobalMeetingManager.tsx`

**What is wrong:** On `isEnabled === false`, if current route is not Meeting, it `navigate(MEETING)` and `setIsInAppPip(false)`.

**Why:** User who had in-app PiP on Schedule, then pressed Home (native PiP), then expands, is forced full-screen Meeting even if they wanted Schedule + overlay.

**Change:** Restore to the previous route if you stored it; or keep Meeting as the PiP activity only and do not mix in-app + native in one session.

---

## 2. Video-call functionality and logic

### 2.1 P0 — Two (sometimes three) `useMeeting` instances with different leave callbacks

**Files:**  
`src/hooks/commons/useVideoCallControls.ts`  
`src/components/Modules/PatientMeeting/MeetingSessionController.tsx`  
`src/components/Modules/PatientMeeting/DoctorMeetingContainer.tsx`  
`src/components/Modules/PatientMeeting/InAppPipOverlay.tsx`

**What is wrong:** `useVideoCallControls` calls `useMeeting({ onMeetingJoined, onMeetingLeft, onError, ... })`. Both `MeetingSessionController` and `DoctorMeetingContainer` call `useVideoCallControls`. Overlay calls `useMeeting()` again for `participants`.

**Why:** Duplicate `onMeetingLeft` → `resetMeetingStore` + `replace('Schedule')` twice. Duplicate `onError`. Two `endCall` closures. Unmount of `DoctorMeetingContainer` (in-app PiP) runs cleanup that may `leave()` if flags are wrong.

**Change:** One module (e.g. `MeetingSessionController` only) owns `useVideoCallControls`. Pass `joinCall` / `endCall` / `toggle*` / `localParticipant` down as props. Overlay/container use `useParticipant(id)` only, or a thin `useMeeting()` without lifecycle callbacks (if the SDK allows). Confirm VideoSDK RN: prefer **one** `useMeeting` with event handlers per `MeetingProvider`.

---

### 2.2 P0 — Permission + join effect re-runs every second during CONNECTED

**Files:**  
`src/components/Modules/PatientMeeting/MeetingSessionController.tsx`  
`src/hooks/commons/useDevicePermissions.ts`  
`src/hooks/commons/useMeetingTimer.ts`

**What is wrong:**

- `useMeetingTimer` does `setTick` every 1s while `CONNECTED`, so `MeetingSessionController` re-renders every second.
- `requestAudioVideoPermissions` is a **new function every render** (hook does not `useCallback`).
- Join effect deps: `[joinCall, requestAudioVideoPermissions, resetMeetingStore]`.

**Why:** `PermissionsAndroid.requestMultiple` every ~1s on Android. On some OEMs this interrupts camera, shows ghost dialogs, or ANRs. `joinCall` is guarded but the permission prompt is not.

**Change:**

1. `useCallback` all permission helpers.
2. Join/permission effect: empty deps after mount, or a ref `hasRequestedJoinRef`. Never depend on timer-driven re-renders.
3. Do not put `useMeetingTimer` in the same component as the join effect, or consume timer via a child.

---

### 2.3 P0 — Socket “time up” resets store without VideoSDK `leave()`

**File:** `src/components/commons/Sockets/SocketListeners.tsx` (`handleTimeUpVideoCallEnded`)

**What is wrong:** `resetMeetingStore()` then navigate. `MeetingProvider` unmounts because `hasActiveMeeting` becomes false. Cleanup in `useVideoCallControls` *may* `leave()`, but two instances and `isMountedRef` make this racy. Media/socket to SFU can linger.

**Change:** Call the same `endCall('time_up')` path (need a store/event, because SocketListeners cannot use `useMeeting` outside provider). Pattern: `DeviceEventEmitter.emit('endActiveCall', 'time_up')` listened inside `MeetingSessionController`.

---

### 2.4 P0 — Call persistence APIs are stubbed; heartbeat is wrong role and no-ops

**Files:**  
`src/hooks/commons/useVideoCallControls.ts` (`// await saveCall(payload)`)  
`src/hooks/commons/useMeetingHeartbeat.ts` (`role: 'doctor'`, mutation commented out)

**Why:** Server never gets patient heartbeats or call-end payload. Doctor app may think the patient vanished. `role: 'doctor'` on a **patient** app is incorrect if the API is ever enabled.

**Change:** Wire patient heartbeat + save-call endpoints. Use `role: 'patient'`. Pause heartbeat when `AppState` is background **only if** you also pause billing; if the consult continues in PiP, keep sending.

---

### 2.5 P1 — `onMeetingJoined` sets `CONNECTING`, not a stable “joined” state

**File:** `src/hooks/commons/useVideoCallControls.ts`

**What is wrong:** After join, `setCallState('CONNECTING')`. `CONNECTED` only when `setRemoteParticipantId` gets a remote id. Timer and heartbeat require `CONNECTED` + remote.

**Why:** Fine for “waiting for doctor”, but PIP eligibility in `GlobalMeetingManager` uses `CONNECTED || CONNECTING` — OK. Auto-end `isTimeUp` only in `CONNECTED` — waiting room does not consume slot time (see 2.6). If the doctor is already in the room, `onParticipantJoined` might fire before `onMeetingJoined`; remote id might be set then overwritten.

**Change:** After join, sync remotes from `participants` immediately (you already have a `participants` effect). Avoid flipping `CONNECTED` → `CONNECTING` if remote briefly null (`onParticipantLeft` clears remote and forces `CONNECTING`, which **pauses the timer** and can restart `lastConnectedAt` accounting).

---

### 2.6 P1 — Remaining-time formula can instantly expire the call

**File:** `src/hooks/commons/useMeetingTimer.ts`  
**Fed by:** `callDurationSeconds` from appointment (`useJoinVideoCall.ts`, `UpcomingAppointmentsSection.tsx`, mock `1800` in `src/resources/mockData/appointmentsMockData.ts`)

**Formula:**  
`totalElapsed = callDurationSeconds + cumulativeActiveElapsedSeconds + currentIntervalElapsed`  
`remaining = (endTime - startTime) - totalElapsed`

**Why:** If `call_duration_seconds` is the **slot length** (1800) and `start_time`/`end_time` also encode 30 minutes, `remaining` is **0 on first CONNECTED tick** → 2s toast → `endCall('time_up')`.

**Change:** Confirm API meaning. If `call_duration_seconds` is already-used seconds, keep it. If it is slot length, **do not** add it to elapsed. Prefer one source: either slot wall clock or remaining from server heartbeat.

---

### 2.7 P1 — Optimistic mic/cam toggles desync from SDK

**File:** `src/hooks/commons/useVideoCallControls.ts` (`toggleAudio` / `toggleVideo`)

**What is wrong:** `setMicState(!isMicOn)` immediately. If `toggleMic()` fails (PiP, OEM, permission revoked), UI lies.

**Change:** Subscribe to local participant `micOn`/`webcamOn` from `useParticipant(localId)` and write those into the store. Disable toggles while `!localParticipant`.

---

### 2.8 P1 — Camera pause for image picker can resume at the wrong time (PiP / AppState)

**Files:**  
`src/lib/common/imagePicker.utils.ts`  
`src/hooks/commons/useVideoCallControls.ts`

**What is wrong:** Flag `isCameraPausedForCapture` plus a **duplicate** `useEffect` on the same flag plus `AppState === 'active'` resume. Opening Android camera intent backgrounds the app (and may trigger PiP via `onUserLeaveHint`). Returning fires both picker callback and AppState — double `enableWebcam`, toasts twice, or PiP + camera intent fighting for the sensor.

**Change:** One state machine: `idle | call_camera | paused_for_capture | native_pip`. Do **not** auto-enter PiP while image picker is open (`setMeetingScreenState(false)` for that window). Resume webcam only from the picker callback, not from AppState, unless the callback never fires (`didCancel` path already resets the flag).

---

### 2.9 P1 — `@videosdk.live/react-native-incallmanager` is unused

**File:** `package.json` (dependency exists; no JS imports)

**Why:** Without InCallManager / `ConnectionService`, Android may not route to earpiece vs speaker, and OEM “call” audio focus can duck or kill WebRTC when another app plays sound. Incoming banner uses `Sound.setCategory('Playback')` which fights voice call routing.

**Change:** Start InCallManager on join (`media: 'video'`, `auto: true`, `ringback` off) and stop on leave. For incoming ringtone, use `Audio` stream type / InCallManager ring API, not Playback, or stop ringtone before `join()`.

---

### 2.10 P1 — Incoming ringtone asset is missing

**File:** `src/components/commons/IncomingCallBanner/IncomingCallBanner.tsx` (`Sound('ringtone.mp3', Sound.MAIN_BUNDLE)`)  
**Verified:** No `ringtone.mp3` (or wav) in the repo.

**Change:** Add `android/app/src/main/res/raw/ringtone.mp3` (and iOS bundle resource). Handle load error without leaving vibration looping forever (vibration is cancelled on unmount — OK).

---

### 2.11 P2 — Incoming join then `useJoinVideoCall` requests permissions twice

**Files:**  
`src/components/commons/IncomingCallBanner/GlobalIncomingCallBanner.tsx`  
`src/hooks/commons/useJoinVideoCall.ts`

**Change:** Request permissions in one place.

---

### 2.12 P2 — `queryClient.fetchQuery` for video token can return a cached token

**File:** `src/hooks/commons/useJoinVideoCall.ts` (`AppointmemntQueryKey.GET_TOKEN`)  
**Provider:** `src/components/providers/ReactQueryProvider.tsx` (default `staleTime` 0, but in-flight cache still applies)

**Change:** `staleTime: 0`, `gcTime: 0` for token queries, or `queryClient.fetchQuery({ ..., staleTime: 0 })` plus `cacheTime: 0`. Always prefer network for VideoSDK JWTs.

---

### 2.13 P2 — Duplicate join implementation

**Files:** `useJoinVideoCall.ts` vs `UpcomingAppointmentsSection.tsx` (nearly the same token fetch + `setMeetingSession`)

**Change:** Use only `useJoinVideoCall` from dashboard cards to avoid drift.

---

### 2.14 P2 — `endCall` invalidates appointments but never POSTs the payload it builds

Already covered in 2.4. Also `onLeaveCallback` runs in **both** `onMeetingLeft` and `endCall` `finally` → double `replace('Schedule')`. After 2.1, keep a single navigation.

---

## 3. Loop-related issues

### 3.1 P0 — 1s timer × join effect × permission request (see 2.2)

### 3.2 P1 — Two `useMeetingTimer` intervals at once

**Files:** `MeetingSessionController.tsx` and `DoctorMeetingContainer.tsx` both call `useMeetingTimer`.

**Why:** Two `setInterval(1000)` while the full UI is shown. Extra JS wakeups on low-end Androids during a call.

**Change:** One timer owner; pass `remainingText` / `elapsedText` as props.

### 3.3 P1 — Heartbeat interval exists even though the request is commented out

**File:** `src/hooks/commons/useMeetingHeartbeat.ts`

**Why:** 30s `setInterval` still runs and recomputes elapsed. Low cost, but `isHeartbeatPendingRef` + empty try still executes. `isBothConnected` flipping (remote id flicker) **clears and restarts** the interval (`useEffect` deps), which can stampede if you uncomment the API.

**Change:** Stabilize `CONNECTED` (2.5). When enabling API, debounce. Do not reset `callTimerStartedAt` on brief `CONNECTING` blips.

### 3.4 P1 — `GlobalMeetingManager` PiP effect re-subscribes on every callState change

**File:** `GlobalMeetingManager.tsx` `useEffect(..., [callState, callmeetingId, ...])`

**Why:** Each `CONNECTING`/`CONNECTED` change: remove `onPipModeChanged`, `setMeetingScreenState(false)` in cleanup, re-add listener. Can miss a PiP event or disable auto-PiP (1.2).

**Change:** Split subscriptions (mount once) vs `setMeetingScreenState(isCalling)`.

### 3.5 P2 — Bottom tabs use a stack, not a tab navigator — back “loops”

**Files:**  
`src/navigation/AppNavigator.tsx` (`Home`, `Doctors`, `Schedule`, `Reports`, `Account` are **stack screens**)  
`src/components/commons/CustomBottomBar/CustomBottomBar.tsx` (`navigate` pushes another copy unless `isPathClear`)  
`src/hooks/commons/useGlobalAndroidBackHandler.ts` (tab routes reset to Home)

**Why:** Repeated tab taps **push** duplicate screens. Back walks a long stack. Users call this a “loop”. `isPathClear` is not passed from `DashboardScreen` (`SafeAreaWrapper` default `false`).

**Change:** Use `@react-navigation/bottom-tabs` for the five roots, or always `replace`/`reset` on tab press. Pass `isPathClear` on main tabs.

### 3.6 P2 — Register OTP timer

**File:** `src/Screens/Auth/RegisterScreen.tsx`

`setTimeout` every second is OK. When `resendTimer` hits 0, effect sets `canResend: true` and still depends on `resendTimer` — one extra run. Not a tight loop. Optional: stop scheduling when 0.

### 3.7 P2 — Payment verification interval

**File:** `src/Screens/DashboardScreen/PaymentScreen.tsx`

`setInterval` 3s for 45s; cleanup `clearInterval` exists. Async callback can run after unmount if a tick was in-flight — use `let cancelled = false` in cleanup. Not a leak loop if user leaves (cleanup runs).

### 3.8 P2 — Dashboard pull-to-refresh is a fake 600ms timeout

**File:** `src/Screens/DashboardScreen/DashboardScreen.tsx`

Does not refetch queries. Functionality issue, not an infinite loop.

### 3.9 P2 — Splash `Animated.loop` pulse

**File:** `src/Screens/SplashScreen.tsx` — stopped on unmount. Fine.

### 3.10 P2 — Incoming call `Animated.loop` + `Vibration.vibrate(..., true)`

**File:** `IncomingCallBanner.tsx` — cleaned on unmount. Fine if `visible` flips correctly. `GlobalIncomingCallBanner` returns `null` when not visible, which unmounts and stops loops. Good.

---

## 4. Android lifecycle issues

### 4.1 P0 — No camera/microphone foreground service while PiP / backgrounded

**File:** `android/app/src/main/AndroidManifest.xml`

Declared:

- `FOREGROUND_SERVICE`
- `FOREGROUND_SERVICE_MICROPHONE`
- `FOREGROUND_SERVICE_CAMERA`
- `FOREGROUND_SERVICE_MEDIA_PROJECTION`
- `FOREGROUND_SERVICE_CONNECTED_DEVICE`

Only service present:

```xml
<service
  android:name="live.videosdk.rnwebrtc.MediaProjectionService"
  android:foregroundServiceType="mediaProjection" />
```

**Why:** `mediaProjection` is screenshare. In PiP the activity is **paused**. Android 14+ (targetSdk **36** in `android/build.gradle`) restricts background camera/mic without a FGS of types `camera|microphone`. OEM killers (Xiaomi, Oppo, Vivo, Huawei, Samsung Sleeping apps) destroy the process when you leave the full-screen activity if no persistent notification FGS is running.

**Change:**

1. Follow current VideoSDK RN Android docs for a **call** foreground service (`camera|microphone` or `phoneCall` if you use ConnectionService).
2. Start it on `join`, stop on `leave`. Notification: “Consultation in progress”.
3. Runtime `POST_NOTIFICATIONS` (you request it in `src/utils/firebaseMessaging.ts` for FCM — also required for FGS on API 33+).
4. Document: user must allow notifications or the FGS cannot start on API 33+.

---

### 4.2 P1 — `AppState` does not keep the call; it only resumes capture-pause camera

**File:** `src/hooks/commons/useVideoCallControls.ts`

**Change:** On `background`/`inactive` during an active call, do **not** `leave()`. Prefer native PiP (1.3) or FGS (4.1). On `active`, if `isNativePip` became false and tracks muted, re-`enableWebcam` if store says camera should be on.

---

### 4.3 P1 — Activity `launchMode="singleTask"` + Meeting overlay

**File:** `AndroidManifest.xml`

**Why:** Notification / deep link can deliver a new intent without remounting JS. Cold start vs warm start for incoming call must re-open Meeting without creating a second `MeetingProvider` key churn.

**Change:** Handle `onNewIntent` if you add call intents. Keep `sessionKey` stable (`meetingId` + participant id) as you already do.

---

### 4.4 P1 — Logout during an active call does not leave the SFU

**File:** `src/components/commons/EventListener/EventListener.tsx`

**Why:** 401 → `logoutCurrentUser` → `queryClient.clear()` + login reset. `GlobalMeetingManager` still has token in **meeting** store until something resets it. Auth token gone; meeting JWT might still work until expiry — orphaned publisher.

**Change:** On logout, if meeting active, `endCall` / `leave` then `resetMeetingStore`.

---

### 4.5 P2 — `MeetingProvider` `reinitialiseMeetingOnConfigChange={false}`

**File:** `GlobalMeetingManager.tsx`

**Why:** Correct to avoid rejoin on incidental config identity changes. Ensure `participantId` (`patient_${id}`) does not change mid-call (`userData` loading late would **change `sessionKey`** and remount provider → disconnect).

**Change:** Freeze `participantId` in meeting store at `setMeetingSession` time; do not derive from `userData` each render for the `key`.

---

## 5. Android / OEM compatibility

### 5.1 P0 — Target SDK 36 without a call-grade FGS (see 4.1)

**File:** `android/build.gradle` (`targetSdkVersion = 36`, `minSdkVersion = 24`)

PiP exists from API 26. API 24–25: never call `enterPipMode`; hide PIP button.

### 5.2 P1 — Xiaomi / MIUI / HyperOS

- Autostart, battery saver, “display pop-up windows while running in the background”.
- `SYSTEM_ALERT_WINDOW` is in the manifest but **never requested** and in-app PiP does not need it. System PiP does not use overlay permission. Do not rely on draw-over-apps for consult PiP.

**Change:** In-app settings screen: link to `ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` (with Play policy disclosure) and OEM autostart instructions. Optional `Intent` to `Settings.ACTION_PICTURE_IN_PICTURE_SETTINGS` if available.

### 5.3 P1 — Oppo / Vivo / ColorOS / Funtouch

Background freeze kills WebRTC unless FGS notification is visible. Test Home → PiP for 2+ minutes.

### 5.4 P1 — Samsung

DeX / pop-up view: `enterPictureInPictureMode` can throw. Catch and fallback to in-app PiP. Recents “Keep open” vs close PiP (1.4).

### 5.5 P1 — Huawei / Harmony (GMS-less)

FCM in `index.js` / `@react-native-firebase/messaging` will fail. Incoming call sockets (`SocketProvider`) become the only ring path. `getFirebaseToken` already retries `SERVICE_NOT_AVAILABLE`.

### 5.6 P1 — Bluetooth runtime permission missing (API 31+)

**Files:** Manifest has `BLUETOOTH_CONNECT`; `useDevicePermissions.ts` never requests it.

**Why:** Headset routing fails; VideoSDK may error.

**Change:** Request `BLUETOOTH_CONNECT` on API 31+ before join.

### 5.7 P2 — Storage permissions vs Android 13+

Manifest: `READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE` with **no** `maxSdkVersion`. `useDevicePermissions` uses `READ_MEDIA_IMAGES` on API 33+.

**Change:** `maxSdkVersion="32"` on legacy storage; add `READ_MEDIA_IMAGES` / `READ_MEDIA_VISUAL_USER_SELECTED` as needed. Play photo/video policy.

### 5.8 P2 — `DownloadNotificationModule` FileProvider not declared

**Files:**  
`android/app/src/main/java/com/predcarefrontendstable/DownloadNotificationModule.java`  
`android/app/src/main/AndroidManifest.xml` (no `<provider>`)

**Why:** `FileProvider.getUriForFile(..., package + ".provider")` throws; fallback `Uri.fromFile` fails on API 24+ for other apps.

**Change:** Add `FileProvider` + `file_paths.xml`. Register `DownloadNotificationPackage` is already in `MainApplication.kt`.

### 5.9 P2 — Release signing uses the debug keystore

**File:** `android/app/build.gradle`

**Change:** Production keystore before Play. Not a runtime PiP bug.

### 5.10 P2 — ProGuard off, empty rules

**Files:** `enableProguardInReleaseBuilds = false`, `android/app/proguard-rules.pro`

When you enable minify: keep VideoSDK, WebRTC, Hermes, Firebase, Notifee.

### 5.11 P2 — Cleartext only on debug

**File:** `android/app/src/debug/AndroidManifest.xml` (`usesCleartextTraffic`)

Production uses HTTPS `https://api-dev.predcare.in` (`src/api/endpoints.ts`). Socket uses `localBaseUrl` ngrok (`SocketProvider.tsx`) — **debug-style URL in shared source**. If ngrok is down, incoming calls never ring.

**Change:** Point sockets at `baseUrl` in non-dev builds; keep ngrok behind a dev flag.

### 5.12 P2 — Auth interceptor logs tokens

**File:** `src/api/apiClient.ts` (`console.log('dev token ==================>', token)`)

**Change:** Remove for release (and any PiP-related log dumps of JWTs).

---

## 6. Performance and memory

### 6.1 P1 — `maxResolution: 'hd'` + `multiStream: true` in PiP

**File:** `GlobalMeetingManager.tsx` `MeetingProvider` config

**Why:** HD encode while the window is ~136×196 (in-app) or small system PiP wastes CPU/battery and thermal-throttles mid-range Androids → apparent “freeze” / disconnect.

**Change:** On `isNativePip` / `isInAppPip`, set VideoSDK quality to low (if API available: `setQuality('low')` on remote, disable local webcam in PiP if product allows, or `maxResolution: 'sd'` for the session). Re-raise on restore.

### 6.2 P1 — `RTCView` `zOrder`

**Files:** `RemoteParticipantView.tsx` `zOrder={0}`, `LocalParticipantView.tsx` / `RemotePipVideoView.tsx` `zOrder={1}`

**Why:** On Android SurfaceView, wrong z-order causes black video in PiP (surface behind the PiP window). VideoSDK often recommends `zOrder={1}` for the PiP surface.

**Change:** Follow VideoSDK Android PiP sample for zOrder; test Xiaomi + Samsung.

### 6.3 P2 — Creating `MediaStream` every memo pass

**Files:** `LocalParticipantView.tsx`, `RemoteParticipantView.tsx`, `RemotePipVideoView.tsx`

**Change:** Prefer `webcamStream.toURL()`; avoid `new MediaStream` if the SDK already exposes a URL (you already try `toURL` first).

### 6.4 P2 — `MeetingScreen` is an empty black view plus global overlay

**File:** `MeetingScreen.tsx`

**Why:** Extra native stack screen and `beforeRemove` complexity. Consider rendering meeting UI **only** globally and using a transparent Meeting route, or rendering container inside the route **and** cloning for PiP (harder). Prefer one tree (1.5).

### 6.5 P2 — Console logging in production paths

`AppNavigator` focus logs, socket heartbeat logs, FCM logs, back handler logs. Noise and Jank on low-end devices during a call.

---

## 7. Other important issues (Android-relevant)

### 7.1 Socket connects to ngrok, REST to api-dev

**Files:** `src/api/endpoints.ts`, `src/components/commons/Sockets/SocketProvider.tsx`

Incoming call banners depend on socket. If ngrok is wrong, video join from the list still works (REST token) but doctor-initiated ring does not.

### 7.2 `SocketProvider` reconnects only 5 times

A hospital Wi-Fi blip during consult loses `TIME_UP` / cancel events. Increase attempts or reconnect on `AppState` active.

### 7.3 No `NS`-style Android 14 partial photo access

If uploads fail on API 34+, add selected-photos permission (product).

### 7.4 `android:supportsRtl="true"` with many hardcoded layouts

Unlikely to drop calls; RTL may clip PiP overlay on Arabic later.

### 7.5 Microphone `uses-feature` required true; camera not required

**File:** Manifest. Play filtering: devices without mic excluded. Camera optional is correct for audio-only fallback — but join **requires** both permissions in `requestAudioVideoPermissions`. Allow audio-only if camera denied.

### 7.6 `onError` string matching to swallow fatals

**File:** `useVideoCallControls.ts` `NON_FATAL_PATTERNS` includes `'producer'`, `'consumer'`.

**Why:** A real fatal producer failure might be ignored and the user stares at a frozen image.

**Change:** Narrow patterns; after N errors, show reconnect UI.

### 7.7 Default display names mixed (patient vs doctor)

`RemotePipVideoView` default `'Patient'`; overlay uses `patientName` which `setMeetingSession` fills with **doctor** display name. Confusing labels only.

---

## 8. Step-by-step implementation guide (Android)

### Phase A — Stop disconnects (do this first)

1. **Single `useVideoCallControls`** in `MeetingSessionController.tsx`. Refactor `DoctorMeetingContainer` to props. Remove extra `useMeeting` event handlers.
2. **Join once:** `useCallback` permissions; `hasStartedJoinRef`; remove timer from that component.
3. **Do not `leave()` on PiP layout changes.** Delete unmount-leave except when store is idle/ended.
4. **Socket time-up** → emit to session controller `endCall`.
5. **Native PiP gate** in `MainActivity` + stop `setMeetingScreenState(false)` on every effect cleanup.

### Phase B — Real PiP across versions

1. API 26–30: `onUserLeaveHint` → `pipModeReq()` only if call eligible.
2. API 31+: `setAutoEnterEnabled(true)` while eligible; `false` when idle.
3. `configChanges` includes `pictureInPicture`.
4. PIP button → `PipHandler.enterPipMode`; failure → in-app PiP.
5. Test matrix (minimum):
   - Android 8/9 emulator: Home during call → PiP; X on PiP → expected hangup or restore policy.
   - Android 11: same.
   - Android 12–14 Pixel: gesture Home → **must** PiP without disconnect for 3 minutes.
   - Android 14–15 Samsung + one Xiaomi: same + Recents.
   - API 24 emulator: PIP hidden; Home backgrounds; confirm FGS still keeps audio if you support background audio.

### Phase C — Keep media alive

1. Call FGS camera|microphone + notification.
2. InCallManager start/stop.
3. Bluetooth permission.
4. Ignore battery optimization (optional, Play-compliant copy).
5. Lower bitrate in PiP.

### Phase D — Product correctness

1. Heartbeat + saveCall with patient role.
2. Fix timer semantics.
3. Token fetch no cache.
4. Ringtone resource.
5. FileProvider.
6. Tab navigator / replace to kill stack loops.
7. Remove token logs; fix socket base URL.

### Phase E — Regression checklist (manual)

- Join from Schedule, from incoming banner, from deep link.
- Mute/unmute, cam off, flip camera.
- RX / upload during call (in-app PiP) then return.
- Home → system PiP → tap to restore → still in same meeting id.
- Back from Meeting.
- Doctor leaves (`onParticipantLeft`) — waiting UI, not a crash.
- Time-up local vs socket.
- Deny camera; deny mic.
- Turn off notifications (FGS start failure message).
- Split-screen (if device supports) — PiP may be disabled; catch error.

---

## 9. File checklist (primary edit targets)

| Path | Typical change |
| --- | --- |
| `android/app/src/main/java/com/predcarefrontendstable/MainActivity.kt` | Gate PiP; API 31 auto-enter; optional `onPictureInPictureModeChanged` already forwards to VideoSDK |
| `android/app/src/main/AndroidManifest.xml` | `configChanges`, PiP feature required false, FGS types/services, FileProvider, storage maxSdk |
| `android/app/src/main/java/com/predcarefrontendstable/MainApplication.kt` | Only if you register a new FGS package |
| `src/components/Modules/PatientMeeting/GlobalMeetingManager.tsx` | Effect split; enter/exit PiP; freeze session key |
| `src/components/Modules/PatientMeeting/MeetingSessionController.tsx` | Single controls hook; do not unmount media; PiP close policy; join-once |
| `src/components/Modules/PatientMeeting/DoctorMeetingContainer.tsx` | Native PiP press; remove extra hooks/back handler |
| `src/components/Modules/PatientMeeting/InAppPipOverlay.tsx` | Dynamic dimensions; keep tracks mounted |
| `src/hooks/commons/useVideoCallControls.ts` | One instance; leave policy; InCallManager; saveCall |
| `src/hooks/commons/useMeetingHeartbeat.ts` | Patient role; real API |
| `src/hooks/commons/useMeetingTimer.ts` | Elapsed formula |
| `src/hooks/commons/useDevicePermissions.ts` | `useCallback`; Bluetooth; POST_NOTIFICATIONS reuse |
| `src/hooks/commons/useGlobalAndroidBackHandler.ts` | Call-aware; no exit during call |
| `src/Screens/DashboardScreen/MeetingScreen.tsx` | Narrow `beforeRemove` |
| `src/components/commons/Sockets/SocketListeners.tsx` | endCall event |
| `src/components/commons/Sockets/SocketProvider.tsx` | Production socket URL |
| `src/zustand/stores/useMeetingStore.ts` | Frozen participant id; pip eligibility |
| `src/api/apiClient.ts` | Remove token logs |
| `src/navigation/AppNavigator.tsx` | Tabs vs stack |
| `src/components/commons/CustomBottomBar/CustomBottomBar.tsx` | replace/reset |
| `android/app/src/main/res/raw/` | `ringtone.mp3` |
| `src/lib/common/imagePicker.utils.ts` | Coordinate with PiP auto-enter off |

---

## 10. iOS / Mac — run this project on a physical iPhone

The review above is **Android-only**. This section is setup to run the **existing** React Native app on iOS. Verified from the repo:

- App name: `predcarepatient` (`app.json`, `package.json`)
- RN **0.78.3**, React **19.0.0**, Node **>= 18**
- iOS folder: `ios/Podfile`, target **`predcarepatient`**
- Xcode project: `ios/predcarepatient.xcodeproj`
- Shared scheme file is named `ios/predcarepatient.xcodeproj/xcshareddata/xcschemes/predcaredoctor.xcscheme` (name mismatch with the patient target — in Xcode, select the **predcarepatient** target/scheme)
- Bundle ID in `project.pbxproj`: `org.reactjs.native.example.$(PRODUCT_NAME:rfc1034identifier)` → typically `org.reactjs.native.example.predcarepatient`
- Deployment target: **iOS 13.4**
- `Gemfile`: CocoaPods `>= 1.13` excluding `1.15.0`/`1.15.1`, Ruby `>= 2.6.10`
- `ios/predcarepatient/Info.plist`: **no** `NSCameraUsageDescription`, **no** `NSMicrophoneUsageDescription`, **no** `UIBackgroundModes`, **no** Firebase `GoogleService-Info.plist` in `ios/`
- `AppDelegate.mm`: standard RN; **no** Firebase import
- VideoSDK is registered in `index.js` via `register()` from `@videosdk.live/react-native-sdk`

You must add iOS privacy strings (and Firebase plist if you need FCM) **before** camera/mic/push will work on a device. Xcode will crash on camera without usage descriptions.

### 10.1 Machine requirements

1. A Mac with a current **Xcode** (Xcode 16.x is appropriate for RN 0.78) from the App Store, plus **Xcode Command Line Tools**:
   `xcode-select --install`
2. Open Xcode once → **Settings → Locations → Command Line Tools** set.
3. **Xcode → Settings → Accounts**: add your Apple ID. For a physical iPhone you need a **Personal Team** (free) or paid **Apple Developer** team.
4. Install **Homebrew** (optional but useful): https://brew.sh  
5. **Node.js 18+** (nvm or official pkg). From repo root: `node -v` must be ≥ 18.
6. **Watchman** (recommended): `brew install watchman`
7. **Ruby** with Bundler (macOS default may work). From repo: `ruby -v` ≥ 2.6.10. Then:
   ```bash
   cd "/path/to/dev-patient"
   bundle install
   ```
8. **CocoaPods** via Bundler (preferred, matches `Gemfile`):
   ```bash
   bundle exec pod --version
   ```
   Or Homebrew `brew install cocoapods` (avoid CocoaPods 1.15.0 and 1.15.1 per `Gemfile`).

### 10.2 Apple device preparation

1. Unlock the iPhone; cable to Mac (USB).
2. iPhone **Settings → Privacy & Security → Developer Mode** (iOS 16+) → On → restart if asked.
3. Trust the computer on the phone dialog.
4. Unlock the phone whenever you build.

### 10.3 Project dependencies

From the **repository root** (`dev-patient`):

```bash
cd "/path/to/dev-patient"
npm install
```

iOS native pods:

```bash
cd ios
bundle exec pod install
cd ..
```

If `pod install` fails on `use_frameworks` / Firebase:

- This app uses `@react-native-firebase/app` and `messaging`. Firebase on iOS usually needs:
  - `GoogleService-Info.plist` copied into `ios/predcarepatient/` and added to the Xcode target
  - In `ios/Podfile`, many RN Firebase setups use:
    ```ruby
    use_frameworks! :linkage => :static
    $RNFirebaseAsStaticFramework = true
    ```
    Set `ENV['USE_FRAMEWORKS']='static'` before `pod install` if you follow RN Firebase docs for RN 0.78.
- Then: `cd ios && bundle exec pod install --repo-update`

### 10.4 Xcode configuration and signing

1. Open the **workspace** (not the `.xcodeproj` alone):
   ```bash
   open ios/predcarepatient.xcworkspace
   ```
   `pod install` creates `predcarepatient.xcworkspace`. Building the `.xcodeproj` without pods will fail.
2. In the left sidebar, select the **predcarepatient** project → target **predcarepatient**.
3. **Signing & Capabilities**:
   - Check **Automatically manage signing**
   - **Team**: your Personal Team or organization
   - Change **Bundle Identifier** to a unique id you own, e.g. `in.predcare.patient.dev` (the example `org.reactjs.native.example.predcarepatient` will collide and cannot be used on a real device for anyone but the original owner)
4. Add capabilities as needed:
   - **Push Notifications** (if you add `GoogleService-Info.plist` + AppDelegate Firebase)
   - **Background Modes** → Audio, Voice over IP (for keeping a call when the app is backgrounded on iOS; **not** Android PiP)
5. **Info** tab / `Info.plist` — add (required for VideoSDK on device):
   - `Privacy - Camera Usage Description`
   - `Privacy - Microphone Usage Description`
   - `Privacy - Photo Library Usage Description` (uploads)
   - Optional Bluetooth / local network if prompted
6. Select scheme **predcarepatient** (if only `predcaredoctor` appears, Product → Scheme → Manage Schemes → ensure predcarepatient is shared/checked). Destination: your **physical iPhone**.

### 10.5 Metro and run commands

Terminal 1 — Metro (repo root):

```bash
cd "/path/to/dev-patient"
npm start
```

Terminal 2 — iOS device. List devices:

```bash
xcrun xctrace list devices
```

Run (replace device name):

```bash
cd "/path/to/dev-patient"
npm run ios -- --device "Sahil’s iPhone"
```

Or:

```bash
npx react-native run-ios --device "Sahil’s iPhone"
```

If the CLI cannot match the device, build from Xcode: **Product → Run** (⌘R) with the phone selected.

Release-style device build from Xcode: **Product → Scheme → Edit Scheme → Run → Build Configuration → Release** (optional).

### 10.6 First-launch on device

1. If install is blocked: iPhone **Settings → General → VPN & Device Management** → trust your Developer App certificate.
2. Allow Camera, Microphone, Notifications when prompted.
3. Same backend as Android: `src/api/endpoints.ts` (`baseUrl`, socket `localBaseUrl`). The Mac/phone must reach those hosts (ngrok, etc.).
4. VideoSDK: camera/mic usage strings must be present or iOS kills the app when `join()` enables webcam.

### 10.7 Common iOS failures

| Symptom | What to do |
| --- | --- |
| `No such module` / pods missing | Open `.xcworkspace`; `bundle exec pod install` |
| Signing error | Unique bundle id + Team; Developer Mode on phone |
| Flipper / SDK compile | RN 0.78 template; clean `cd ios && bundle exec pod deintegrate && bundle exec pod install`; Xcode Product → Clean Build Folder |
| Firebase crash at start | Add `GoogleService-Info.plist`; configure `[FIRApp configure]` per RN Firebase iOS docs in `AppDelegate` |
| Blank app / red box Metro | Mac and phone on same network, or USB with Metro; `npm start`; shake device → configure bundler IP |
| CocoaPods 1.15.x | Use `bundle exec pod` per `Gemfile` |

### 10.8 Commands recap (copy-paste)

```bash
# One-time tooling
xcode-select --install
# node 18+, then:
cd "/path/to/dev-patient"
bundle install
npm install
cd ios && bundle exec pod install && cd ..

# Run
npm start
# other terminal:
npm run ios -- --device "Your iPhone Name"
# or:
open ios/predcarepatient.xcworkspace
```

iOS does **not** use Android system PiP. On iPhone, this codebase’s `Platform.OS === 'android'` branches skip `PipHandler`; in-app overlay (`InAppPipOverlay`) can still show if you set `isInAppPip` from back/RX. Multitasking PiP on iOS would be a separate `AVKit` / VideoSDK iOS PiP implementation and is out of scope for the Android review.
)
