---
name: Video call performance and low-network handling (patient app)
overview: Port the video call work already shipped in the doctor app (predcaredoctor commit 641a02b) to the patient app. Smooth rendering, real network quality, adaptive video, reconnect instead of ending, one end-call path, meeting-aware offline blocker, faster join, socket resync. Behavior and logic only. No layout, color, or component design changes.
todos:
  - id: store-and-types
    content: Add networkQuality, qualityLimitation, videoTier, sessionKey, rejoinAttempt, isEndRequested, rejoinCallInfo to the meeting store; no-op guard on setDoctorParticipant; add config/meeting.constants.ts; add wifiStrength and cellularGeneration to useNetworkStore
    status: completed
  - id: end-call-helper
    content: Add endMeetingCall() and route END button, in-app PiP end, Android PiP end, socket time-up, and offline exit through it
    status: completed
  - id: render-isolation
    content: Split MeetingTimerBadge and MeetingSignalBadge out of MeetingHeader, memo the stage parts, memo the local self-view stream URL (LocalPipCard, AndroidPipStage.LocalPipTile)
    status: completed
  - id: timer-accuracy
    content: Countdown from an end timestamp, resync on AppState active
    status: completed
  - id: network-monitor
    content: Add callQuality.utils + useCallQualityMonitor and drive the header signal bars from real stats capped by NetInfo details
    status: completed
  - id: adaptive-quality
    content: Replace useDoctorVideoQuality (forced high) with useAdaptiveVideo; publish simulcast (multiStream); camera on / flip / capture handoff / foreground use the current tier
    status: completed
  - id: reconnect
    content: Map onMeetingStateChanged to call states after first connect, treat network leave codes as a drop, add useMeetingReconnect (fresh token + backoff)
    status: completed
  - id: offline-blocker
    content: 8 s grace during a call, Exit really leaves via endMeetingCall()
    status: completed
  - id: faster-join
    content: New useJoinVideoCall hook (permission → token + tracks in parallel); replace the 5 copied join blocks
    status: completed
  - id: android-lifecycle
    content: Move useAndroidCallForegroundService into MeetingSessionHost and add DISCONNECTED to service and PiP state lists
    status: completed
  - id: socket-resync
    content: Resync appointment status when the socket reconnects
    status: completed
  - id: tests
    content: Copy __tests__/callQuality.utils.test.ts from the doctor app
    status: completed
isProject: false
---

# Video call (patient app): smooth performance and low-network handling

Scope: the React Native patient app (`predcarepatient`). Same SDK as the doctor app: `@videosdk.live/react-native-sdk@^1.0.1`, NetInfo 12, zustand 5.

Reference: the doctor app plan ([video_call_performance_network.plan.md](video_call_performance_network.plan.md), copied into this repo) and its **finished implementation** in `/Users/pred/Documents/PredCare/predcaredoctor/src` (commit `641a02b`). Most new files are a straight port of the doctor files with names swapped. This plan lists **what to port, what is different in the patient app, and what must stay in sync between the two apps**. It does not repeat code that can be copied verbatim.

**The design does not change.** Messages to the patient use what exists: header status text and signal label, `showInfoToast` / `showWarningToast` from `src/lib/common/toast.utils.ts` (note: `lib/common`, not `lib/commons` as in the doctor app), and `useAlertStore().showInfo(message, title, onPress)`.

**Existing behavior that must not change:** END → Consultation Completed, socket time-up, mic/camera/flip, in-app PiP, Android native PiP (`AndroidPipStage`), iOS native PiP renderer (`usePipRemoteTrack`), Android capture handoff and camera restore, foreground service, iOS background camera pause (`useMeetingAppState` + `NativePip.isBackgroundCameraSupported`), rejoining the same appointment from the appointment screens.

---

## Why this matters for both sides of the call

The two apps form one call. Some doctor-side features only work once the patient app is changed:

| Doctor app already does | Needs from the patient app |
|---|---|
| `useAdaptiveVideo` asks for the patient's `high` / `med` / `low` layer via `setQuality` | The patient must **publish simulcast layers** (`multiStream: true`, camera track with `maxLayer`). Without layers, the doctor's step-down has nothing to step to and the doctor's video freezes on a weak patient uplink. |
| Doctor rejoins with the same `doctor_<id>` participant id | Patient must not end the call when the doctor briefly disappears (already true: it goes to `WAITING_FOR_DOCTOR`) and must not re-request `high` on every rejoin while its own link is weak. |
| Doctor finds the patient as "first non-local participant" | When the patient rejoins with the same `patient_<id>`, the old peer must be gone. Test this (see Step 6). |

---

## Current patient app: what causes lag

1. **Self-view rebuilt on every render.** `LocalPipCard.tsx:26` and `AndroidPipStage.tsx:24` (`LocalPipTile`) call `new MediaStream([webcamStream.track]).toURL()` inside JSX. Every re-render hands `RTCView` a new URL → re-attach, flicker.
2. **`MeetingHeader` re-renders every second** (reads `useMeetingCountdown`), taking the name, status, and signal bars with it.
3. **Duplicate store writes.** `useDoctorStream` runs in 4 places (`DoctorStageView`, `InAppPipWindow`, `AndroidPipStage`, `usePipRemoteTrack`). Each writes the same values with `setDoctorParticipant`, which always returns a new object, so every subscriber re-runs.
4. **Nothing is memoized.** `MeetingSessionController` re-renders on every SDK event and re-renders `MeetingStageOverlay` → `DoctorStageView`, `MeetingHeader`, `LocalPipCard`, `MeetingController`.
5. **Doctor video is forced to `high`.** `useDoctorVideoQuality` (`useMeetingParticipants.ts:82`) always calls `setQuality('high')`. On a weak patient downlink the SDK cannot step down → doctor video freezes, audio stutters.
6. **No simulcast / encoder settings.** `MeetingSessionHost` only sets `maxResolution: 'hd'`. The patient always sends HD on any uplink, and the doctor has no lower layer to pick.
7. **Camera opens twice on join.** Permission request, then the SDK opens the camera again after navigation.

Already fixed in this repo (from `remote_video_quality_a9d53540.plan.md`): the **remote** doctor stream URL is memoized in `DoctorStageView`, `InAppPipWindow`, `AndroidPipStage`. Mark that plan's todos completed; `useDoctorVideoQuality` is now replaced by Step 5.

## Current patient app: what breaks on a bad network

1. **A drop ends the call.** `onMeetingStateChanged` maps `DISCONNECTED` / `FAILED` / `CLOSED` → `ENDED` (`MeetingSessionHost.tsx:130`), `MeetingScreen` calls `goBack()`, and `onMeetingLeft` always opens Consultation Completed.
2. **No reconnecting state.** `RECONNECTING` exists in `MeetingCallState` but nothing sets it. Header says "WAITING FOR DOCTOR..." or "CONNECTED" over a frozen frame.
3. **Offline blocker covers the call** on the first offline event, even a 1 s blip, and eats the back button.
4. **"Exit Ongoing Consultation" doesn't leave.** `GlobalNoInternetBlocker.handleEmergencyLeaveMeeting` only calls `resetMeetingStore()` and goes Home. The doctor still sees the patient in the room.
5. **Signal bars are fake.** Wifi = 4 "Strong", cellular = 3 "Good", always.
6. **Countdown drifts** after background / busy JS thread (decrements once per tick).
7. **End paths differ.** END button / in-app PiP (`useMeetingConnection.endCall`), socket time-up (`leaveActiveMeeting` + `resetCallInfo`), offline exit (reset only). With reconnect logic, this difference decides rejoin vs Consultation Completed, so it must be unified first.
8. **Socket reconnect not resynced.** A missed `time_up_video_call_ended` leaves the call running.
9. **Foreground service lives inside the provider** and stops on unmount; `DISCONNECTED` is not in its state list. A provider remount on rejoin would stop it.
10. **Join flow is copied 5 times** (`AppointmentDetailsScreen`, `AppointmentsScreen`, `UpcomingAppointmentsCard`, `MeetingStatusScreen`, `GlobalIncomingCallBanner`). Any join change (faster join) would need 5 edits. The doctor app has one `useJoinVideoCall`.

---

## Name mapping (doctor → patient)

Use this when porting doctor files.

| Doctor app | Patient app |
|---|---|
| `patientParticipantId`, `patientWebcamOn`, `patientMicOn` | `doctorParticipantId`, `doctorWebcamOn`, `doctorMicOn` |
| `setPatientParticipant` | `setDoctorParticipant` |
| `WAITING_FOR_PATIENT` | `WAITING_FOR_DOCTOR` |
| `usePatientStream` | `useDoctorStream` |
| `PatientStageView` | `DoctorStageView` |
| `DoctorMeetingScreen` / `AppRoute.DOCTOR_MEETING` | `MeetingScreen` / `AppRoute.MEETING` |
| `doctorMeetingStyles` (`DoctorMeetingScreen.styled`) | `meetingStyles` (`MeetingScreen.styled`) |
| `lib/commons/toast.utils` | `lib/common/toast.utils` |
| `appointments.func` | `appointments.funcs` (`getApptToken`, `getApptInfo`) |
| `participantId: doctor_<id>` | `participantId: patient_<patient_id or id>` |
| `appointment.appointmentDuration` in `rejoinCallInfo` | same field (`callInfo.appointment.appointmentDuration`), set by `setCallInfo` from `appointment_duration \|\| slot_duration` |

---

## Folder and file structure

```text
predcarepatient/src/
├── config/
│   └── meeting.constants.ts                     NEW   copy verbatim from doctor
├── zustand/
│   ├── interfaces/meeting.interfaces.ts         EDIT  TNetworkQuality, TVideoTier, TQualityLimitation,
│   │                                                  IMeetingTokenRefresh, new state/actions
│   └── stores/
│       ├── useMeetingStore.ts                   EDIT  new fields in initialState, guarded setters,
│       │                                              rejoinCallInfo, no-op guard on setDoctorParticipant
│       └── useNetworkStore.ts                   EDIT  wifiStrength, cellularGeneration
├── hooks/commons/meeting/
│   ├── callQuality.utils.ts                     NEW   copy verbatim
│   ├── meetingMediaTracks.ts                    NEW   copy (getSendTier, createCameraTrack, createMicTrack,
│   │                                                  stopStream, pending tracks)
│   ├── useCallQualityMonitor.ts                 NEW   port (doctorParticipantId)
│   ├── useAdaptiveVideo.ts                      NEW   port (doctorParticipantId, patient toasts)
│   ├── useMeetingReconnect.ts                   NEW   port (patient useGetToken)
│   ├── useJoinVideoCall.ts                      NEW   one join path for all 5 entry points
│   ├── meetingSessionLeave.ts                   EDIT  endMeetingCall()
│   ├── useMeetingConnection.ts                  EDIT  endCall → endMeetingCall(), drop useMeeting
│   ├── useMeetingParticipants.ts                EDIT  delete useDoctorVideoQuality, keep doctor during reconnect
│   ├── useMeetingCountdown.ts                   EDIT  timestamp ticker + AppState resync
│   ├── useMeetingCamera.ts                      EDIT  toggle lock, tier track on CAM ON / FLIP
│   ├── useMeetingCaptureHandoff.ts              EDIT  enableWebcam(tier track)
│   ├── useMeetingAppState.ts                    EDIT  enableWebcam(tier track) on foreground (patient-only)
│   ├── useAndroidCallForegroundService.ts       EDIT  + DISCONNECTED, mounted in host
│   └── useAndroidPipLifecycle.ts                EDIT  + DISCONNECTED
├── components/
│   ├── meeting/
│   │   ├── MeetingSessionHost.tsx               EDIT  state mapping, leave reasons, provider config,
│   │   │                                              sessionKey, initialMedia, new hooks
│   │   ├── InAppPipWindow.tsx                   EDIT  memo, audio-only placeholder
│   │   └── AndroidPipStage.tsx                  EDIT  memo self-view URL, audio-only placeholder
│   └── commons/
│       ├── Network/GlobalNoInternetBlocker.tsx  EDIT  8 s grace during a call, real leave
│       ├── Sockets/SocketListeners.tsx          EDIT  endMeetingCall() on time-up, resync on reconnect
│       └── IncomingCallBanner/GlobalIncomingCallBanner.tsx   EDIT  use useJoinVideoCall
├── Features/Dashboard/
│   ├── MeetingScreen/Components/
│   │   ├── MeetingHeader.tsx                    EDIT  badge components, RECONNECTING text, memo
│   │   ├── MeetingTimerBadge.tsx                NEW   today's LEFT badge markup, unchanged
│   │   ├── MeetingSignalBadge.tsx               NEW   today's signal bars markup, unchanged
│   │   ├── DoctorStageView.tsx                  EDIT  memo, audio-only placeholder
│   │   ├── LocalPipCard.tsx                     EDIT  memo, memoized stream URL
│   │   ├── MeetingController.tsx                EDIT  memo
│   │   └── MeetingStageOverlay.tsx              EDIT  memo
│   ├── MeetingScreen/MeetingStatusScreen.tsx    EDIT  use useJoinVideoCall
│   ├── AppointmentScreen/AppointmentDetailsScreen.tsx   EDIT  use useJoinVideoCall
│   ├── AppointmentScreen/AppointmentsScreen.tsx         EDIT  use useJoinVideoCall
│   └── HomeScreen/Components/UpcomingAppointmentsCard.tsx  EDIT  use useJoinVideoCall
└── __tests__/callQuality.utils.test.ts          NEW   copy from doctor (repo root __tests__)
```

Mount points after the change:

```text
App
└── MeetingSessionHost                  (outside MeetingProvider, survives remounts)
    ├── useMeetingReconnect()
    ├── useAndroidCallForegroundService()      ← moved out of the controller
    └── <MeetingProvider key={`${meetingId}_${participantId}_${sessionKey}`}>
        └── MeetingConsumer (onMeetingJoined, onMeetingStateChanged, onMeetingLeft,
                             onQualityLimitation, onError)
            └── MeetingSessionController
                ├── useRegisterMeetingLeave, useMeetingAppState, useMeetingParticipants,
                │   usePipRemoteTrack, useMeetingCountdownTicker, useAndroidPipLifecycle,
                │   useMeetingCaptureHandoff, useAndroidPipCameraRestore   (existing)
                ├── useCallQualityMonitor()     NEW
                └── useAdaptiveVideo()          NEW (replaces useDoctorVideoQuality)
```

---

## Step 0. Types, constants, stores

Port from doctor `meeting.interfaces.ts`, `useMeetingStore.ts`, `useNetworkStore.ts`, `config/meeting.constants.ts`.

- `meeting.constants.ts`: copy verbatim (thresholds, tier presets, backoff `[2000, 4000, 8000, 15000, 15000]`, `MEETING_SDK_RECOVERY_MS = 30000`, `MEETING_OFFLINE_GRACE_MS = 8000`, `MEETING_LEAVE_TIMEOUT_MS = 3000`, `MEETING_NETWORK_LEAVE_CODES = [1001, 1007, 1102, 1103]`). Keeping the numbers identical keeps both apps stepping down and reconnecting on the same timeline.
- Interfaces: add `TNetworkQuality`, `TVideoTier`, `TQualityLimitation`, `IMeetingTokenRefresh`, and to `IMeetingStoreState`: `networkQuality`, `qualityLimitation`, `videoTier`, `sessionKey`, `rejoinAttempt`, `isEndRequested` plus setters and `rejoinCallInfo`.
- Store: add the fields to `initialState` (so `resetCallInfo` / `resetMeetingStore` clear them). Setters for quality/limitation/tier return `state` when unchanged.
- `rejoinCallInfo({ token, meetingId, callElapsedSeconds })`: keeps `pipMode`, `isMuted`, `isCamOn`, `isFrontCamera`, `doctorInfo`, `appointmentId`; sets `callInfo.token/meetingId`, `sessionKey + 1`, `callState: 'RECONNECTING'`, `doctorParticipantId: null`, and `remainingSeconds = min(current, total - elapsed)` (server can only shorten). Do **not** reuse `setCallInfo` (it resets `pipMode` and `callState`).
- `setDoctorParticipant`: return `state` when id, webcamOn, micOn are all unchanged (fixes lag 3).
- `useNetworkStore`: add `wifiStrength` (`details.strength`, Android only) and `cellularGeneration` (`details.cellularGeneration`), initial `null`.

## Step 1. One way to end a call

`meetingSessionLeave.ts`: keep `registerMeetingLeave`, `useRegisterMeetingLeave`, `leaveActiveMeeting`; add `endMeetingCall()` exactly as in the doctor app (set `isEndRequested`, `leave()` raced against 3 s, then `openMeetingStatusOnce()`).

Callers:
- `useMeetingConnection.endCall` → `await endMeetingCall()`. Remove the `useMeeting` call there (it no longer needs `sdkLeave` / unused `sdkEnd`). Covers the END button, `InAppPipWindow`, and `useAndroidPipLifecycle`.
- `SocketListeners.handleTimeUpVideoCallEnded` → replace `leaveActiveMeeting()` + manual `exitPipMode` / `resetCallInfo` with `await endMeetingCall()`. Keep `hideCallBanner`, `hideLoader`, the "Time Up" toast, and both query invalidations. **Check on device:** today the leave already fires `onMeetingLeft` → Consultation Completed, so the screen the patient lands on should not change; confirm before merging.
- `GlobalNoInternetBlocker` exit → Step 7.

## Step 2. Render isolation (no visual change)

- **`MeetingTimerBadge.tsx`** (new): today's LEFT badge block from `MeetingHeader.tsx:65-90`, same styles (`meetingStyles.leftBadgeRow/leftLbl/leftValue`), reads `useMeetingCountdown()`, `memo`. Only this re-renders each second.
- **`MeetingSignalBadge.tsx`** (new): today's bars from `MeetingHeader.tsx:91-109`, same markup. Level = `getSignalLevel(getLinkSignalCap(...), networkQuality, qualityLimitation)`; `0` + label "Reconnecting" while `RECONNECTING` / `DISCONNECTED`. Port from doctor `MeetingSignalBadge.tsx`, swap the style import.
- **`MeetingHeader.tsx`**: remove `useMeetingCountdown`, `useNetworkStatus`, local `getSignalLevel`, `signalColor`, `SIGNAL_LABELS`; render the two badges in the same spots inside `timersCol`. Status text: `RECONNECTING…` while `RECONNECTING` / `DISCONNECTED`, else today's `CONNECTED` / `WAITING FOR DOCTOR...`. `export default memo(MeetingHeader)`.
  - Side note: the fallback name `'Dr. Sahil Mallick'` (here and in `DoctorStageView.tsx:20`) is a placeholder; switch to `'Doctor'` like `InAppPipWindow` while touching the file.
- **`LocalPipCard.tsx`** and **`AndroidPipStage.tsx` `LocalPipTile`**:
  ```tsx
  const localTrack = isCamOn && webcamOn && webcamStream ? webcamStream.track : null;
  const localStreamURL = useMemo(
    () => (localTrack ? new MediaStream([localTrack]).toURL() : null),
    // cameraSessionEpoch: Android capture handoff/restore needs a fresh URL for the same track
    [localTrack, cameraSessionEpoch],
  );
  ```
  Keep the existing `key` logic. Wrap both in `memo`.
- `DoctorStageView`, `MeetingController`, `MeetingStageOverlay`, `InAppPipWindow`: `export default memo(...)`. `MeetingStageOverlay` passes `endCall` from `useMeetingConnection`, which is a stable `useCallback` once it no longer depends on `sdkLeave`.

## Step 3. Accurate timer

`useMeetingCountdownTicker`: port the doctor version, gate on `doctorParticipantId` instead of `patientParticipantId`. `endsAt = Date.now() + remaining * 1000`, tick computes `ceil((endsAt - now) / 1000)`, re-tick on `AppState` `active`. The "2 min pending" toast and `onTimeUp` stay. Still pauses while the doctor is not in the room (today's behavior). On rejoin, `rejoinCallInfo` rebases from `call_elapsed_seconds`.

## Step 4. Call quality monitor and signal bars

- `callQuality.utils.ts`: copy verbatim (`sumStats`, `lossRatio` on deltas, `classifySample`, `applyHysteresis` 2 down / 3 up, `getLinkSignalCap`, `getSignalLevel`).
- `useCallQualityMonitor.ts`: port, using `doctorParticipantId` for the remote side. Samples every 3 s, local (patient upload) and remote (doctor download), audio stats when video is off, skips a backgrounded app unless in native PiP, forces `OFFLINE` while offline / reconnecting.
- `onQualityLimitation` on `MeetingConsumer` writes `qualityLimitation` (Step 6).

Patients are far more often on mobile data than doctors, so `cellularGeneration` (2g/3g → 1/2 bars) matters more here.

## Step 5. Adaptive quality and the low-network ladder

### Provider config (`MeetingSessionHost.tsx`)

```tsx
config={{
  meetingId,
  micEnabled: initialMedia.micEnabled,
  webcamEnabled: initialMedia.webcamEnabled,
  customCameraVideoTrack: initialMedia.cameraTrack,
  customMicrophoneAudioTrack: initialMedia.micTrack,
  participantId: patientParticipantId,
  name: patientDisplayName,
  defaultCamera: isFrontCamera ? 'front' : 'back',
  maxResolution: 'hd',
  multiStream: true,                 // publish layers so the doctor app can step down
  preferredProtocol: 'UDP_OVER_TCP', // falls back to TCP on networks that block UDP
  codecSwitchEnabled: true,
  mode: 'SEND_AND_RECV',
  debugMode: false,
  notification: { title: 'PredCare Consultation', message: 'Video consultation in progress' },
}}
```

### `meetingMediaTracks.ts`

Copy from doctor. `createCameraTrack(tier)` uses `isFrontCamera`, `optimizationMode: 'motion'`, `multiStream: true`, tier preset. `createMicTrack()` uses `speech_standard` with noise suppression / echo cancellation / AGC.

### `useAdaptiveVideo.ts`

Port from doctor with `doctorParticipantId`. Same four parts:
1. Decide tier every 2 s: bad for 6 s → `sd`, weak 10 s → `low`, weak or bandwidth-limited 20 s → `audio`; good 10 s → one level up.
2. Outgoing patient camera follows the tier via `changeWebcam(track)`; `audio` keeps sending the `low` layer (CAM button stays truthful). Skip while camera off, during Android capture handoff, and in Android native PiP; re-run when those end.
3. Incoming doctor video: `audio` → `stopConsumingWebcamStreams()`; otherwise `consumeWebcamStreams()` when leaving audio, then `setQuality(low|med|high)` (PiP always `low`). Re-run when the doctor's track id changes (doctor flips camera / rejoins).
4. One toast per tier per call (same wording as doctor).

### `useMeetingParticipants.ts`

- Delete `useDoctorVideoQuality` and its call in `MeetingSessionController`.
- Don't clear the doctor while the **patient** is `RECONNECTING` / `DISCONNECTED` (`RECONNECT_STATES` guard from doctor).

### Audio-only view

`DoctorStageView`, `InAppPipWindow`, `AndroidPipStage`, `usePipRemoteTrack`:
```ts
const isAudioOnly = useMeetingStore(state => state.videoTier === 'audio');
const remoteTrack = !isAudioOnly && webcamOn && webcamStream ? webcamStream.track : null;
```
Shows the existing camera-off placeholder instead of a frozen frame; iOS native PiP detaches its renderer.

### Camera paths that must use the current tier

Otherwise the camera snaps back to HD.
- `useMeetingCamera.ts`: port doctor version (400 ms toggle lock; CAM ON passes a tier track; FLIP always creates a track for the other camera at the current tier, falls back to `changeWebcam()` on failure; flipping with the camera off only updates `isFrontCamera`).
- `useMeetingCaptureHandoff.ts`: every `enableWebcamRef.current()` → `enableWebcamRef.current(await createCameraTrack(videoTier).catch(() => undefined))`.
- `useMeetingAppState.ts` (**patient-only, not in the doctor app**): the iOS foreground `enableWebcam()` should also pass a tier track. Patients on iOS without multitasking camera hit this path every time they switch apps mid-call.

## Step 6. Reconnect instead of ending the call

### `MeetingConsumer` in `MeetingSessionHost.tsx`

Port the doctor version 1:1 (`MeetingSessionHost.tsx:60-232` in predcaredoctor), with `doctorParticipantId` and `WAITING_FOR_DOCTOR`:
- `hasConnectedRef` and `sdkRecoveryTimerRef` live in the host (outside the provider); reset `hasConnectedRef` only when `meetingId` changes.
- **Before first connect:** keep today's behavior (failure → `ENDED`, leave → Consultation Completed).
- **After first connect:** SDK `CONNECTING` / `FAILED` / `DISCONNECTED` → `RECONNECTING` + 30 s recovery timer (then `DISCONNECTED` → `useMeetingReconnect`); `CONNECTED` → `CONNECTED` / `WAITING_FOR_DOCTOR`; `CLOSING` / `CLOSED` → `ENDED` only if `isEndRequested`.
- `onMeetingJoined`: `resetMeetingStatusGuard()`, clear timer, `setRejoinAttempt(0)`. Today it always sets `WAITING_FOR_DOCTOR`; keep that for first join, but after a rejoin go to `CONNECTED` if the doctor is already there.
- `onMeetingLeft({ code })`: if not `isEndRequested`, connected before, and code in `MEETING_NETWORK_LEAVE_CODES` → `DISCONNECTED` (rejoin). Otherwise `openMeetingStatusOnce()`.
- `onQualityLimitation` → `setQualityLimitation(state === 'detected' ? type : null)`.

`MeetingScreen` needs no change: it only goes back on `ENDED` or a missing token, and `rejoinCallInfo` keeps the token set.

### `useMeetingReconnect.ts`

Port from doctor. Uses patient `useGetToken().mutateAsync` (`getApptToken`). On `DISCONNECTED` + online: fetch token, re-check state, create tier camera + mic tracks, `setPendingTracks`, `rejoinCallInfo`. Backoff 2/4/8/15/15 s, a 4xx or 5 failures → "Could not reconnect to the consultation." alert → Consultation Completed.

### Rejoin identity (test before shipping)

The patient rejoins as the same `patient_<id>`. The doctor app picks the patient as the first non-local participant. If VideoSDK keeps the old peer briefly (`DUPLICATE_PARTICIPANT` or two entries), the doctor might bind to the dead one. If seen in testing, the fix needs **both apps**: patient rejoins as `patient_<id>_r<sessionKey>`, and the doctor app prefers the newest participant / matches by `patient_` prefix. Same check for the doctor id on the patient side.

## Step 7. Meeting-aware offline blocker

`GlobalNoInternetBlocker.tsx`, port the doctor version:
- `meetingId = useMeetingStore(s => s.callInfo?.meetingId)`; `isInsideMeeting = Boolean(meetingId)` (today it uses `callState`, which hides Exit during `DISCONNECTED`).
- While in a call, render nothing for the first 8 s offline (`MEETING_OFFLINE_GRACE_MS`); the header shows Reconnecting. Back-button lock only once the blocker is visible.
- Exit: `await endMeetingCall()`; navigate Home only if no live session existed. Today it only resets the store and the doctor keeps seeing the patient.
- If `leave()` can't reach the server, VideoSDK removes the peer when it times out server-side; the doctor sees the patient leave a little later.

## Step 8. Faster join and one join path

New `src/hooks/commons/meeting/useJoinVideoCall.ts`, ported from the doctor's, returning `joinVideoCall(appointmentId, extra?)`:
1. `requestPermissions()` (existing `useMeetingPermissions`) first, same error toast as today.
2. `showLoader('Joining Video Call...')`, then `Promise.allSettled([getToken, createMicTrack(), createCameraTrack('hd')])`.
3. On token failure: stop both tracks, hide loader, error toast.
4. `setPendingTracks({ camera, mic })`, `setCallInfo({ token, meeting_id, appointment, doctorInfo: { name: data.doctor?.name, doctorId: data.doctor?.id } })`, `navigate(AppRoute.MEETING)`, hide loader.

Replace the inline join blocks in `AppointmentDetailsScreen`, `AppointmentsScreen`, `UpcomingAppointmentsCard`, `MeetingStatusScreen`, and `GlobalIncomingCallBanner` (check each for screen-specific extras like hiding the call banner before navigating, and keep those at the call site).

`MeetingSessionHost`: add the `initialMedia` memo keyed on `[meetingId, sessionKey]` (takes pending tracks once, stops the camera track if cam is off). If track creation failed, `customCameraVideoTrack` is `undefined` and the SDK opens the devices itself, as today.

## Step 9. Android lifecycle during reconnect

- `useAndroidCallForegroundService.ts`: add `'DISCONNECTED'` to `SERVICE_STATES`; mount in `MeetingSessionHost` instead of `MeetingSessionController`.
- `useAndroidPipLifecycle.ts`: add `'DISCONNECTED'` to `PIP_ELIGIBLE_STATES`. Stays inside the provider (it uses `useMeetingConnection`, which after Step 1 no longer needs the SDK, but it is fine where it is).
- `NativePip.setMeetingScreenState` depends on `meetingId`. The token API may return the same meeting id on rejoin; if it ever returns a new one, the effect toggles off/on once, which is harmless.

## Step 10. Socket resync

`SocketListeners.tsx`, inside the existing effect:

```ts
const handleReconnect = async () => {
  const { appointmentId, callInfo } = useMeetingStore.getState();
  if (!callInfo?.token || !appointmentId) return;
  const info = await getApptInfo(appointmentId).catch(() => null);
  const status = info?.data?.appointment_status ?? info?.data?.status;
  if (status === 'completed' || status === 'cancelled') {
    await handleTimeUpVideoCallEnded({ appointmentId });
  }
};
socketConnection.io.on('reconnect', handleReconnect);
// cleanup: socketConnection.io.off('reconnect', handleReconnect);
```

Confirm the exact field name from the `getApptInfo` response before coding (`AppointmentDetailsScreen` switches on `'completed'` / `'cancelled'` / `'in_progress'`). Also fix the effect's dependency list: it reads `activeMeetingId` but doesn't list it, so the incoming-call guard uses a stale value; read it from `useMeetingStore.getState()` inside the handler instead.

---

## Order of work

1. Step 0 + Step 1 (store, constants, `endMeetingCall`). Everything else depends on them.
2. Step 2 + Step 3 (render isolation, timer). Low risk, removes most visible stutter and self-view flicker. Can ship alone.
3. Step 4 + Step 5 (monitor, signal bars, adaptive video, simulcast, camera paths).
4. Step 6 + Step 7 + Step 9 (reconnect, offline blocker, Android lifecycle). Biggest reliability win; ship together.
5. Step 8 (one join path + faster join).
6. Step 10 (socket resync) + tests.

## How to test

Run every case with the **doctor app on its current build** (already has these changes), patient on mobile data where possible.

- **Throttling:** iOS Network Link Conditioner (3G, Very Bad Network, 5 % / 15 % loss, 300 ms delay); Android emulator network settings or a throttled hotspot. Patient bars go Fair/Weak, doctor video steps down, audio stays clear. **On the doctor side**, the patient's video should also step down instead of freezing (proves simulcast works).
- **Weak wifi** (Android): walk away from the router; bars drop, never "Strong" on a slow link.
- **Drop test** (patient airplane mode): 3 s → no blocker, "RECONNECTING…", call continues. 10 s → blocker after 8 s, rejoin when back, PiP mode / mute / camera / timer kept. 40 s+ → retries, then "Could not reconnect" → Consultation Completed.
- **Doctor drops** while the patient stays online: patient shows waiting/doctor camera off, timer pauses, doctor comes back without the patient doing anything.
- **Both drop** (shared wifi): both rejoin, end up in the same room.
- **Wifi → mobile data** switch mid-call.
- **Exit while offline:** doctor app must show that the patient left.
- **End paths:** END button, in-app PiP end, Android PiP end, socket time-up → Consultation Completed, never a rejoin.
- **Background 5 min:** timer matches wall-clock on return; iOS camera resumes at the current tier.
- **Android:** capture handoff (Upload health record camera/gallery during a call), camera steal in native PiP, home → native PiP, foreground notification stays during reconnect.
- **iOS native PiP:** doctor video → placeholder in audio-only → doctor video again.
- **Flip camera** at HD and at SD/low.
- **All 5 join entry points** still open the call (details, list, home card, status screen, incoming banner).
- **Performance:** React DevTools Profiler. `DoctorStageView`, `LocalPipCard`, `MeetingController` must not re-render once per second; self-view must not flicker.

## Out of scope

- Any layout, style, or component design change.
- Further doctor-app changes, except the rejoin-identity fix in Step 6 if testing shows it's needed.
- Switching away from VideoSDK, recording, chat, new controls, audio route picker.
- Backend changes. Confirm with the backend team: the room does not auto-close while the patient rejoins; `getApptToken` works for an in-progress appointment and returns `appointment.call_elapsed_seconds` for the patient too; a participant-left webhook does not complete the appointment during a reconnect.
