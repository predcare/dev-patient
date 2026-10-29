---
name: Video call performance and low-network handling (mobile app)
overview: Bring the web doctor video call improvements to the React Native doctor app. Same functionality as the web plan (smooth rendering, real network quality, adaptive video, reconnect instead of ending, one end-call path, meeting-aware offline blocker, faster join, socket resync), adapted to React Native, native PiP, and the Android camera handoff. Behavior and logic only. No layout, color, or component design changes.
todos:
  - id: store-and-types
    content: Add network quality, video tier, session key, rejoin attempt, end-requested flag, and rejoinCallInfo to the meeting store and types; add config/meeting.constants.ts; add wifi strength and cellular generation to useNetworkStore
    status: completed
  - id: end-call-helper
    content: Add endMeetingCall() so every end path (END button, in-app PiP end, socket time-up, offline exit) marks the end as intentional before leave
    status: completed
  - id: render-isolation
    content: Split the timer and signal badges out of MeetingHeader, memo the stage parts, memo the local RTCView stream URL, and skip no-op patient store writes
    status: completed
  - id: timer-accuracy
    content: Base the countdown on an end timestamp and resync on AppState active
    status: completed
  - id: network-monitor
    content: Add useCallQualityMonitor (delta packet loss, RTT, onQualityLimitation, hysteresis) and drive the header signal bars from it plus NetInfo signal details
    status: completed
  - id: adaptive-quality
    content: Remove forced setQuality('high'); add useAdaptiveVideo for remote layer choice and the low-network ladder (HD, SD, low, audio only, restore); make capture handoff and flip use the current tier
    status: completed
  - id: reconnect
    content: Map onMeetingStateChanged to call states, stop treating a network drop as call end, and add useMeetingReconnect with a fresh token and backoff
    status: completed
  - id: offline-blocker
    content: Delay GlobalNoInternetBlocker 8 s during a call and make Exit really leave
    status: completed
  - id: faster-join
    content: Create the SDK camera/mic tracks once in useJoinVideoCall after permission and hand them to MeetingProvider
    status: completed
  - id: android-lifecycle
    content: Keep the foreground service and PiP eligibility alive through DISCONNECTED and provider remounts
    status: completed
  - id: socket-resync
    content: Resync appointment state when the socket reconnects
    status: completed
isProject: false
---

# Video call (mobile app): smooth performance and low-network handling

Scope: the React Native doctor app ([predcaredoctor](/Users/pred/Documents/PredCare/predcaredoctor)). SDK: `@videosdk.live/react-native-sdk@1.0.1` (on top of `@videosdk.live/js-sdk@1.1.1`). Source of the functionality: the web plan [webdoctornext/.cursor/plans/video_call_performance_network.plan.md](/Users/pred/Documents/PredCare/webdoctornext/.cursor/plans/video_call_performance_network.plan.md).

**The design does not change.** Every item changes behavior inside existing components or hooks. Where the doctor must be told something, use what exists: the header status text and signal label, `showInfoToast` / `showWarningToast` (`src/lib/commons/toast.utils.ts`), and `useAlertStore().showInfo(message, title, onPress)`.

**Existing behavior that must not change:** END button → Consultation Completed, socket time-up, mic/camera/flip, in-app PiP, Android native PiP, iOS native PiP renderer, Android camera capture handoff and camera restore, foreground service, rejoining the same appointment restores the call, Rx and Upload beside the call.

All code below is the target solution, checked against `node_modules/@videosdk.live/react-native-sdk/types/index.d.ts`.

## SDK facts this plan relies on (React Native 1.0.1)

- `onMeetingStateChanged({ state })`: `CONNECTING | CONNECTED | FAILED | DISCONNECTED | CLOSING | CLOSED`. No `RECONNECTING` value. `CONNECTING` after a first `CONNECTED` means the SDK is retrying.
- `onMeetingLeft({ code, message })` leave codes (from js-sdk): `1001` WEBSOCKET_DISCONNECTED, `1007` UNKNOWN, `1101` MANUAL_LEAVE_CALLED, `1102` WEBSOCKET_CONNECTION_ATTEMPTS_EXHAUSTED, `1103` JOIN_ROOM_FAILED, `1009` MEETING_END_API, `1002` REMOVE_PEER, `1010` REMOVE_PEER_API.
- `onQualityLimitation({ type, state })`: `type` is `congestion | bandwidth | cpu`, `state` is `detected | resolved`. Available on `MeetingConsumer` and `useMeeting`.
- `useParticipant(id)` returns `setQuality('low' | 'med' | 'high')`, `setViewPort(w, h)`, `consumeWebcamStreams()`, `stopConsumingWebcamStreams()`, `getVideoStats()`, `getAudioStats()`.
- Stats rows: `packetsLost`, `totalPackets` (running totals), `rtt` (ms), `jitter` (ms), `bitrate`.
- `useMeeting()` returns `changeWebcam(string | MediaStream)` (**no argument = flip camera**, used today by `flipCamera`), `enableWebcam(customTrack?)`, `toggleWebcam(customTrack?)`, `disableWebcam()`.
- `createCameraVideoTrack({ facingMode: 'user' | 'environment', encoderConfig, optimizationMode, multiStream, bitrateMode, maxLayer })`. RN encoder presets: `h720p_w1280p`, `h480p_w640p`, `h360p_w640p`, `h240p_w320p`, … (there is **no** `h540p` on RN).
- `createMicrophoneAudioTrack({ encoderConfig, noiseConfig })`.
- `MeetingProvider` config accepts `multiStream`, `customCameraVideoTrack`, `customMicrophoneAudioTrack`, `preferredProtocol`, `codecSwitchEnabled`.
- NetInfo `state.details`: `strength` (wifi 0–100, Android only), `cellularGeneration` (`2g | 3g | 4g | 5g`).

## Web → app mapping

| Web plan item | App equivalent |
|---|---|
| `document.visibilitychange` | `AppState` `change` → `active` |
| `navigator.onLine` / `window 'online'` | `useNetworkStore` (`isOffline`) fed by NetInfo |
| HEAD probe in `useNetworkStatus` | Not needed: NetInfo already checks `isInternetReachable` |
| `MeetingStage` timer/NET/HD pills | `MeetingHeader` timer badge and signal bars |
| `RemoteStage` / `LocalVideoTile` / `MeetingMiniPlayer` | `PatientStageView` / `LocalPipCard` + `AndroidPipStage.LocalPipTile` / `InAppPipWindow` + `AndroidPipStage` |
| `devicechange` watcher | Not applicable on mobile. The Android "camera stolen" case is already handled by `useAndroidPipCameraRestore`; it is updated to use the current tier |
| `beforeunload` while mini player is open | Not applicable. The Android foreground service keeps the call alive (step 10) |
| `MeetingPage` ERROR block with Retry | `useAlertStore().showInfo` "Connection lost" with OK → Consultation Completed (no new screen) |
| `setCallState('ENDED')` before leave | `isEndRequested` flag. Setting `ENDED` early in the app would trigger `DoctorMeetingScreen.goBack()` and stop `useMeetingAppState` before `leave()` finishes |

## Folder and file structure

```text
predcaredoctor/src/
├── config/
│   └── meeting.constants.ts                       NEW   thresholds, timings, video tier presets, leave codes
├── zustand/
│   ├── interfaces/meeting.interfaces.ts           EDIT  TNetworkQuality, TVideoTier, TQualityLimitation, new state/actions
│   └── stores/
│       ├── useMeetingStore.ts                     EDIT  networkQuality, qualityLimitation, videoTier, sessionKey,
│       │                                                rejoinAttempt, isEndRequested, rejoinCallInfo, no-op guards
│       └── useNetworkStore.ts                     EDIT  wifiStrength, cellularGeneration
├── hooks/commons/meeting/
│   ├── callQuality.utils.ts                       NEW   pure functions: stats → quality, hysteresis, signal bars
│   ├── meetingMediaTracks.ts                      NEW   create camera/mic tracks per tier, pending tracks for the provider
│   ├── useCallQualityMonitor.ts                   NEW   stats polling + onQualityLimitation → store
│   ├── useAdaptiveVideo.ts                        NEW   remote layer choice + low-network ladder
│   ├── useMeetingReconnect.ts                     NEW   rejoin with a fresh token and backoff
│   ├── meetingSessionLeave.ts                     EDIT  endMeetingCall() with timeout
│   ├── useMeetingConnection.ts                    EDIT  endCall → endMeetingCall()
│   ├── useMeetingParticipants.ts                  EDIT  remove usePatientVideoQuality (forced high), keep RECONNECTING
│   ├── useMeetingCountdown.ts                     EDIT  timestamp-based ticker + AppState resync
│   ├── useMeetingCamera.ts                        EDIT  toggle lock, camera-on and flip use the current tier
│   ├── useMeetingCaptureHandoff.ts                EDIT  enableWebcam(tier track)
│   ├── useJoinVideoCall.ts                        EDIT  create tracks once after permission
│   ├── useAndroidCallForegroundService.ts         EDIT  keep running in DISCONNECTED, mount outside provider
│   └── useAndroidPipLifecycle.ts                  EDIT  keep PiP eligible in DISCONNECTED
├── components/
│   ├── meeting/
│   │   ├── MeetingSessionHost.tsx                 EDIT  state mapping, leave reasons, provider config, sessionKey, new hooks
│   │   ├── InAppPipWindow.tsx                     EDIT  memo, endMeetingCall()
│   │   └── AndroidPipStage.tsx                    EDIT  memo local stream URL
│   └── commons/
│       ├── Network/GlobalNoInternetBlocker.tsx    EDIT  8 s grace during a call, real leave
│       └── Sockets/SocketListeners.tsx            EDIT  endMeetingCall() on time-up, resync on reconnect
└── Features/Dashboard/MeetingScreen/Components/
    ├── MeetingHeader.tsx                          EDIT  use the two badge components, RECONNECTING text
    ├── MeetingTimerBadge.tsx                      NEW   same markup as today's LEFT badge
    ├── MeetingSignalBadge.tsx                     NEW   same markup as today's signal bars
    ├── MeetingStageOverlay.tsx                    EDIT  memo
    ├── PatientStageView.tsx                       EDIT  memo, audio-only shows the existing camera-off view
    ├── LocalPipCard.tsx                           EDIT  memo, stream URL by track id
    └── MeetingController.tsx                      EDIT  memo
```

Where each hook is mounted:

```text
App.tsx
└── MeetingSessionHost                 (outside MeetingProvider, survives remounts)
    ├── useMeetingReconnect()
    ├── useAndroidCallForegroundService()      ← moved here so a remount does not stop the service
    └── <MeetingProvider key={`${meetingId}_${participantId}_${sessionKey}`}>
        └── MeetingConsumer (onMeetingStateChanged, onMeetingLeft, onQualityLimitation, onError)
            └── MeetingSessionController
                ├── existing hooks (leave registry, app state, participants, PiP, capture handoff, ticker …)
                ├── useCallQualityMonitor()
                └── useAdaptiveVideo()
```

## What causes lag today (app)

1. **Local self-view renderer is rebuilt on every render.** `LocalPipCard` and `AndroidPipStage.LocalPipTile` call `new MediaStream([track]).toURL()` inside render, so every re-render hands `RTCView` a new URL. It re-attaches and can flicker.
2. **`MeetingHeader` re-renders every second.** It reads the countdown, so the signal bars, name, and status text re-render with it.
3. **Duplicate store writes.** `usePatientStream` runs in 4 places (`PatientStageView`, `InAppPipWindow`, `AndroidPipStage`, `usePipRemoteTrack`) and each writes the same patient values. `setPatientParticipant` always creates a new state, so every subscriber's selector runs again.
4. **`MeetingSessionController` re-renders on every SDK event** (it hosts many `useMeeting` / `useParticipant` hooks) and re-renders `MeetingStageOverlay` and all its children, none of which are memoized.
5. **Remote quality is forced to `high`** (`usePatientVideoQuality`). On a slow link the SDK cannot step down, so video freezes and audio stutters.
6. **No simulcast or encoder settings.** Only `maxResolution: 'hd'`. The doctor always sends HD, even on a weak uplink.
7. **Camera opens twice on join on some devices.** Permission request and then the SDK opens the camera again.

## What breaks on a bad network today (app)

1. **A drop ends the call.** `onMeetingStateChanged` maps `DISCONNECTED` to `ENDED`, so `DoctorMeetingScreen` calls `goBack()`. `onMeetingLeft` always calls `openMeetingStatusOnce()`, which resets the store and opens Consultation Completed.
2. **No reconnecting state.** `RECONNECTING` exists in `MeetingCallState` but nothing sets it. The doctor sees a frozen frame with no message.
3. **The offline blocker covers the call** on the first offline event, even for a 1-second wifi blip, and blocks the hardware back button.
4. **"Exit Ongoing Consultation" does not leave.** It calls `resetCallInfo()` without `leave()` and goes to Home. The patient still sees the doctor in the room.
5. **Signal bars are wrong.** They use only the connection type: wifi always shows 4 bars "Strong", cellular always 3 "Good".
6. **The countdown drifts** after the app has been in the background or the JS thread was busy, because it decrements once per tick.
7. **End paths are inconsistent.** The END button, the in-app PiP end, socket time-up, and the offline exit each leave differently. With reconnect logic, that difference decides whether the app rejoins or shows Consultation Completed, so it must be fixed first.
8. **The socket reconnect is not resynced**, so a missed `time_up_video_call_ended` leaves the call running.
9. **Provider remount would stop the foreground service.** `useAndroidCallForegroundService` lives inside the provider and stops the service on unmount; `DISCONNECTED` is not in its state list.

---

## Step 0. Types, constants, and stores

### `src/zustand/interfaces/meeting.interfaces.ts` (edit)

`MeetingCallState` stays as it is. Add:

```ts
export type TNetworkQuality = 'GOOD' | 'FAIR' | 'WEAK' | 'OFFLINE';

export type TVideoTier = 'hd' | 'sd' | 'low' | 'audio';

export type TQualityLimitation = 'congestion' | 'bandwidth' | 'cpu' | null;

export interface IMeetingTokenRefresh {
  token: string;
  meetingId: string;
  callElapsedSeconds?: number;
}
```

Add to `IMeetingStoreState`:

```ts
networkQuality: TNetworkQuality;
qualityLimitation: TQualityLimitation;
videoTier: TVideoTier;
sessionKey: number;
rejoinAttempt: number;
isEndRequested: boolean;

setNetworkQuality: (networkQuality: TNetworkQuality) => void;
setQualityLimitation: (qualityLimitation: TQualityLimitation) => void;
setVideoTier: (videoTier: TVideoTier) => void;
setRejoinAttempt: (rejoinAttempt: number) => void;
setEndRequested: (isEndRequested: boolean) => void;
rejoinCallInfo: (params: IMeetingTokenRefresh) => void;
```

### `src/config/meeting.constants.ts` (new)

```ts
import { TVideoTier } from '../zustand/interfaces/meeting.interfaces';

export const CALL_QUALITY_SAMPLE_MS = 3000;
export const CALL_QUALITY_DOWNGRADE_SAMPLES = 2;
export const CALL_QUALITY_UPGRADE_SAMPLES = 3;

export const CALL_QUALITY_THRESHOLDS = {
  good: { loss: 0.02, rtt: 250 },
  fair: { loss: 0.08, rtt: 500 },
} as const;

export const VIDEO_TIER_STEP_MS = {
  toSd: 6000,
  toLow: 10000,
  toAudio: 20000,
  restore: 10000,
} as const;

// RN has no 540p preset, so SD is 480p.
export const VIDEO_TIER_PRESETS = {
  hd: { encoderConfig: 'h720p_w1280p', bitrateMode: 'balanced', maxLayer: 3 },
  sd: { encoderConfig: 'h480p_w640p', bitrateMode: 'bandwidth_optimized', maxLayer: 2 },
  low: { encoderConfig: 'h360p_w640p', bitrateMode: 'bandwidth_optimized', maxLayer: 2 },
} as const satisfies Record<Exclude<TVideoTier, 'audio'>, object>;

export const MEETING_REJOIN_BACKOFF_MS = [2000, 4000, 8000, 15000, 15000];

export const MEETING_SDK_RECOVERY_MS = 30000;

export const MEETING_OFFLINE_GRACE_MS = 8000;

export const MEETING_LEAVE_TIMEOUT_MS = 3000;

/** onMeetingLeft codes that mean "the network dropped", not "the call ended". */
export const MEETING_NETWORK_LEAVE_CODES = [1001, 1007, 1102, 1103];
```

### `src/zustand/stores/useMeetingStore.ts` (edit)

Add to `initialVideoState` so `resetCallInfo()` / `resetMeetingStore()` clear them:

```ts
networkQuality: 'GOOD' as TNetworkQuality,
qualityLimitation: null as TQualityLimitation,
videoTier: 'hd' as TVideoTier,
sessionKey: 0,
rejoinAttempt: 0,
isEndRequested: false,
```

New actions (no-op when the value is unchanged, so subscribers do not re-render):

```ts
setNetworkQuality: networkQuality =>
  set(state => (state.networkQuality === networkQuality ? state : { networkQuality })),

setQualityLimitation: qualityLimitation =>
  set(state => (state.qualityLimitation === qualityLimitation ? state : { qualityLimitation })),

setVideoTier: videoTier =>
  set(state => (state.videoTier === videoTier ? state : { videoTier })),

setRejoinAttempt: rejoinAttempt => set({ rejoinAttempt }),

setEndRequested: isEndRequested => set({ isEndRequested }),

rejoinCallInfo: ({ token, meetingId, callElapsedSeconds }) =>
  set(state => {
    const durationMinutes = Number(state.callInfo.appointment?.appointmentDuration || 0);
    const totalSeconds = Math.floor(durationMinutes * 60);
    const serverRemaining =
      callElapsedSeconds != null && totalSeconds > 0
        ? Math.max(0, totalSeconds - callElapsedSeconds)
        : null;
    return {
      callInfo: { ...state.callInfo, token, meetingId },
      sessionKey: state.sessionKey + 1,
      callState: 'RECONNECTING',
      patientParticipantId: null,
      // The server can only shorten the remaining time, never extend it.
      remainingSeconds:
        serverRemaining != null
          ? Math.min(state.remainingSeconds, serverRemaining)
          : state.remainingSeconds,
    };
  }),
```

`rejoinCallInfo` keeps `pipMode`, `isMuted`, `isCamOn`, `isFrontCamera`, `patientInfo`, and `appointmentId`. Do **not** reuse `setCallInfo` for rejoin: it resets `pipMode` to `NORMAL` and `callState` to `INITIALIZING`.

Guard `setPatientParticipant` against no-op writes (fixes lag item 3):

```ts
setPatientParticipant: ({ id, webcamOn, micOn }) =>
  set(state => {
    const nextWebcamOn = webcamOn !== undefined ? webcamOn : state.patientWebcamOn;
    const nextMicOn = micOn !== undefined ? micOn : state.patientMicOn;
    if (
      state.patientParticipantId === id &&
      state.patientWebcamOn === nextWebcamOn &&
      state.patientMicOn === nextMicOn
    ) {
      return state;
    }
    return { patientParticipantId: id, patientWebcamOn: nextWebcamOn, patientMicOn: nextMicOn };
  }),
```

### `src/zustand/stores/useNetworkStore.ts` (edit)

Add `wifiStrength: number | null` and `cellularGeneration: string | null` (initial `null`), and inside `setNetworkState`:

```ts
const details = (state.details ?? null) as {
  strength?: number | null;
  cellularGeneration?: string | null;
} | null;

set({
  // ...existing fields unchanged
  wifiStrength: typeof details?.strength === 'number' ? details.strength : null,
  cellularGeneration: details?.cellularGeneration ?? null,
});
```

---

## Step 1. One way to end a call

### `src/hooks/commons/meeting/meetingSessionLeave.ts` (edit)

Keep `registerMeetingLeave`, `useRegisterMeetingLeave`, and `leaveActiveMeeting`. Add:

```ts
import { MEETING_LEAVE_TIMEOUT_MS } from '../../../config/meeting.constants';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';
import { openMeetingStatusOnce } from './openMeetingStatus';

/** Every intentional end goes through here, so a network drop can be told apart from an end. */
export const endMeetingCall = async () => {
  const store = useMeetingStore.getState();
  if (!store.callInfo?.meetingId && !store.appointmentId) return;
  store.setEndRequested(true);

  try {
    if (!leaveMeeting) throw new Error('No active meeting session');
    await Promise.race([
      leaveMeeting(),
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error('Leave timed out')), MEETING_LEAVE_TIMEOUT_MS),
      ),
    ]);
  } catch (e) {
    console.warn('[meetingSessionLeave] endMeetingCall:', e);
  } finally {
    // onMeetingLeft usually opens the status screen first; the guard makes this a no-op then.
    openMeetingStatusOnce();
  }
};
```

Callers:

- `useMeetingConnection.endCall` → `await endMeetingCall()` (used by the END button and `InAppPipWindow`).
- `SocketListeners.handleTimeUpVideoCallEnded` → replace `await leaveActiveMeeting()` with `await endMeetingCall()`. Keep the existing loader, query invalidation, and the toast / alert.
- `GlobalNoInternetBlocker` exit → step 7.

---

## Step 2. Render isolation (no visual change)

### `MeetingTimerBadge.tsx` (new)

The exact LEFT badge markup moved out of `MeetingHeader`. Only this component re-renders once a second.

```tsx
import React, { memo } from 'react';
import { Text, View } from 'react-native';
import useMeetingCountdown from '../../../../hooks/commons/meeting/useMeetingCountdown';
import doctorMeetingStyles from '../../../../styled/DoctorMeetingScreen.styled';

const MeetingTimerBadge: React.FC = () => {
  const { formattedTime, isWarning, isUrgent } = useMeetingCountdown();

  return (
    <View
      style={[
        doctorMeetingStyles.leftBadgeRow,
        isWarning && { backgroundColor: 'rgba(245, 158, 11, 0.25)', borderColor: '#F59E0B' },
        isUrgent && { backgroundColor: 'rgba(239, 68, 68, 0.3)', borderColor: '#EF4444' },
      ]}
    >
      <Text
        style={[
          doctorMeetingStyles.leftLbl,
          isWarning && { color: '#F59E0B' },
          isUrgent && { color: '#EF4444' },
        ]}
      >
        LEFT
      </Text>
      <Text
        style={[
          doctorMeetingStyles.leftValue,
          isWarning && { color: '#F59E0B' },
          isUrgent && { color: '#EF4444' },
        ]}
      >
        {formattedTime}
      </Text>
    </View>
  );
};

export default memo(MeetingTimerBadge);
```

### `MeetingSignalBadge.tsx` (new)

Same bars and labels as today. The level now comes from real call stats, capped by the device link (step 4).

```tsx
import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { getLinkSignalCap, getSignalLevel } from '../../../../hooks/commons/meeting/callQuality.utils';
import doctorMeetingStyles from '../../../../styled/DoctorMeetingScreen.styled';
import theme from '../../../../styled/theme.styled';
import useMeetingStore from '../../../../zustand/stores/useMeetingStore';
import useNetworkStore from '../../../../zustand/stores/useNetworkStore';

const SIGNAL_LABELS = ['Offline', 'Weak', 'Fair', 'Good', 'Strong'] as const;

const signalColor = (level: number) => {
  if (level <= 1) return '#EF4444';
  if (level === 2) return '#F59E0B';
  return theme.colors.green;
};

const MeetingSignalBadge: React.FC = () => {
  const networkQuality = useMeetingStore(state => state.networkQuality);
  const qualityLimitation = useMeetingStore(state => state.qualityLimitation);
  const callState = useMeetingStore(state => state.callState);
  const isOffline = useNetworkStore(state => state.isOffline);
  const connectionType = useNetworkStore(state => state.connectionType);
  const wifiStrength = useNetworkStore(state => state.wifiStrength);
  const cellularGeneration = useNetworkStore(state => state.cellularGeneration);

  const isReconnecting = callState === 'RECONNECTING' || callState === 'DISCONNECTED';
  const linkCap = getLinkSignalCap(isOffline, String(connectionType), wifiStrength, cellularGeneration);
  const level = isReconnecting ? 0 : getSignalLevel(linkCap, networkQuality, qualityLimitation);
  const label = isReconnecting ? 'Reconnecting' : SIGNAL_LABELS[level];
  const barsColor = signalColor(level);

  return (
    <View style={doctorMeetingStyles.networkRow}>
      <View style={doctorMeetingStyles.signalBars}>
        {[1, 2, 3, 4].map(bar => (
          <View
            key={bar}
            style={[
              doctorMeetingStyles.signalBar,
              { height: 4 + bar * 2 },
              { backgroundColor: bar <= level ? barsColor : 'rgba(255, 255, 255, 0.25)' },
            ]}
          />
        ))}
      </View>
      <Text style={[doctorMeetingStyles.networkLabel, { color: barsColor }]}>{label}</Text>
    </View>
  );
};

export default memo(MeetingSignalBadge);
```

### `MeetingHeader.tsx` (edit)

- Remove `useMeetingCountdown`, `useNetworkStatus`, `getSignalLevel`, `signalColor`, and `SIGNAL_LABELS`.
- Replace the LEFT badge block with `<MeetingTimerBadge />` and the network row with `<MeetingSignalBadge />`, in the same positions inside `timersCol`.
- Status text: `RECONNECTING…` while `callState` is `RECONNECTING` or `DISCONNECTED`, otherwise today's `CONNECTED` / `WAITING FOR PATIENT`. Same `Text` and style.
- `export default memo(MeetingHeader);`

### `LocalPipCard.tsx` and `AndroidPipStage.tsx` `LocalPipTile` (edit)

Build the stream URL only when the track or the camera session changes:

```tsx
const localTrack = isCamOn && webcamOn && webcamStream ? webcamStream.track : null;
const localStreamURL = useMemo(
  () => (localTrack ? new MediaStream([localTrack]).toURL() : null),
  // cameraSessionEpoch: Android capture handoff/restore needs a fresh URL even for the same track
  [localTrack, cameraSessionEpoch],
);
```

Render `RTCView` with `streamURL={localStreamURL}` when it is not null. Keep `key={cameraSessionEpoch}` as today. Wrap both components in `memo`.

### `PatientStageView.tsx`, `MeetingController.tsx`, `MeetingStageOverlay.tsx`, `InAppPipWindow.tsx` (edit)

`export default memo(Component);`. They read their data from store selectors, so `memo` only stops parent-driven re-renders. `MeetingController` gets `handleEndCall` from `useMeetingConnection`, which is a stable `useCallback`.

---

## Step 3. Accurate timer

### `src/hooks/commons/meeting/useMeetingCountdown.ts` (edit `useMeetingCountdownTicker`)

Counts down from an end timestamp, so slow or skipped ticks catch up. It still pauses while the patient is not in the room, as today. The existing `onTimeUp` callback and "2 min pending" toast are kept.

```ts
export const useMeetingCountdownTicker = (onTimeUp?: () => void) => {
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;
  const twoMinToastShown = useRef(false);

  const patientParticipantId = useMeetingStore(state => state.patientParticipantId);
  const setRemainingSeconds = useMeetingStore(state => state.setRemainingSeconds);

  useEffect(() => {
    if (!patientParticipantId) return;

    const startRemaining = useMeetingStore.getState().remainingSeconds;
    if (startRemaining <= 0) return;

    const endsAt = Date.now() + startRemaining * 1000;

    const notifyTwoMinPending = (seconds: number) => {
      if (twoMinToastShown.current || seconds <= 0 || seconds > TWO_MINUTES_SECONDS) return;
      twoMinToastShown.current = true;
      showInfoToast('2 min pending');
    };

    const tick = () => {
      const current = useMeetingStore.getState().remainingSeconds;
      const next = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      if (next !== current) {
        setRemainingSeconds(next);
        notifyTwoMinPending(next);
      }
      if (next === 0) {
        clearInterval(intervalId);
        if (current > 0) onTimeUpRef.current?.();
      }
    };

    notifyTwoMinPending(startRemaining);
    const intervalId = setInterval(tick, 1000);
    const appStateSub = AppState.addEventListener('change', state => {
      if (state === 'active') tick();
    });

    return () => {
      clearInterval(intervalId);
      appStateSub.remove();
    };
  }, [patientParticipantId, setRemainingSeconds]);
};
```

On rejoin, `rejoinCallInfo` rebases `remainingSeconds` from the server's `call_elapsed_seconds`.

---

## Step 4. Call quality monitor and signal bars

### `src/hooks/commons/meeting/callQuality.utils.ts` (new)

Pure functions, unit-testable with Jest.

```ts
import {
  CALL_QUALITY_DOWNGRADE_SAMPLES,
  CALL_QUALITY_THRESHOLDS,
  CALL_QUALITY_UPGRADE_SAMPLES,
} from '../../../config/meeting.constants';
import { TNetworkQuality, TQualityLimitation } from '../../../zustand/interfaces/meeting.interfaces';

export type TStatsRow = { packetsLost?: number; totalPackets?: number; rtt?: number; jitter?: number };
export type TStatsTotals = { lost: number; total: number };

const RANK: Record<TNetworkQuality, number> = { GOOD: 3, FAIR: 2, WEAK: 1, OFFLINE: 0 };

export const sumStats = (rows: TStatsRow[] = []): TStatsTotals & { rtt: number } =>
  rows.reduce(
    (acc, row) => ({
      lost: acc.lost + (row.packetsLost || 0),
      total: acc.total + (row.totalPackets || 0),
      rtt: Math.max(acc.rtt, row.rtt || 0),
    }),
    { lost: 0, total: 0, rtt: 0 },
  );

/** packetsLost/totalPackets are running totals, so loss is the change since the last sample. */
export const lossRatio = (now: TStatsTotals, before: TStatsTotals | null) => {
  if (!before) return 0;
  const lost = now.lost - before.lost;
  const total = now.total - before.total;
  if (total <= 0 || lost < 0) return 0;
  return lost / total;
};

export const classifySample = (loss: number, rtt: number): TNetworkQuality => {
  const { good, fair } = CALL_QUALITY_THRESHOLDS;
  if (loss < good.loss && rtt < good.rtt) return 'GOOD';
  if (loss < fair.loss && rtt < fair.rtt) return 'FAIR';
  return 'WEAK';
};

export type THysteresis = { current: TNetworkQuality; candidate: TNetworkQuality | null; streak: number };

/** Drops after 2 bad samples, recovers after 3 good ones, so the UI and video do not flip. */
export const applyHysteresis = (state: THysteresis, sample: TNetworkQuality): THysteresis => {
  if (sample === state.current) return { ...state, candidate: null, streak: 0 };
  const streak = state.candidate === sample ? state.streak + 1 : 1;
  const needed =
    RANK[sample] < RANK[state.current] ? CALL_QUALITY_DOWNGRADE_SAMPLES : CALL_QUALITY_UPGRADE_SAMPLES;
  if (streak >= needed) return { current: sample, candidate: null, streak: 0 };
  return { ...state, candidate: sample, streak };
};

/** Upper bound from the device link. With no details it matches today's bars (wifi 4, cellular 3, unknown 2). */
export const getLinkSignalCap = (
  isOffline: boolean,
  connectionType: string,
  wifiStrength: number | null,
  cellularGeneration: string | null,
): number => {
  if (isOffline || connectionType === 'none') return 0;
  if (connectionType === 'ethernet') return 4;
  if (connectionType === 'wifi') {
    if (wifiStrength == null) return 4;
    if (wifiStrength < 30) return 1;
    if (wifiStrength < 60) return 2;
    if (wifiStrength < 80) return 3;
    return 4;
  }
  if (connectionType === 'cellular') {
    if (cellularGeneration === '2g') return 1;
    if (cellularGeneration === '3g') return 2;
    if (cellularGeneration === '5g') return 4;
    return 3;
  }
  if (connectionType === 'unknown') return 2;
  return 3;
};

/** Header bars: the link cap, lowered by real call quality. Wifi alone can no longer show "Strong". */
export const getSignalLevel = (
  linkCap: number,
  networkQuality: TNetworkQuality,
  qualityLimitation: TQualityLimitation,
): number => {
  if (linkCap === 0 || networkQuality === 'OFFLINE') return 0;
  const callCap = networkQuality === 'GOOD' ? 4 : networkQuality === 'FAIR' ? 2 : 1;
  const limitCap = qualityLimitation === 'bandwidth' || qualityLimitation === 'congestion' ? 2 : 4;
  return Math.max(1, Math.min(linkCap, callCap, limitCap));
};
```

### `src/hooks/commons/meeting/useCallQualityMonitor.ts` (new)

Mounted once in `MeetingSessionController`. Measures both directions (the doctor's upload and the patient's stream), uses audio stats when video is off, and keeps the participants in refs so the interval is not restarted on every SDK update.

```ts
import { useMeeting, useParticipant } from '@videosdk.live/react-native-sdk';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { CALL_QUALITY_SAMPLE_MS } from '../../../config/meeting.constants';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';
import useNetworkStore from '../../../zustand/stores/useNetworkStore';
import {
  applyHysteresis,
  classifySample,
  lossRatio,
  sumStats,
  THysteresis,
  TStatsTotals,
} from './callQuality.utils';

export const useCallQualityMonitor = () => {
  const hysteresisRef = useRef<THysteresis>({ current: 'GOOD', candidate: null, streak: 0 });
  const previousRef = useRef<Record<string, TStatsTotals | null>>({});

  const patientParticipantId = useMeetingStore(state => state.patientParticipantId);
  const setNetworkQuality = useMeetingStore(state => state.setNetworkQuality);
  const { localParticipant } = useMeeting({});
  const local = useParticipant(localParticipant?.id || '');
  const remote = useParticipant(patientParticipantId || '');

  const localRef = useRef(local);
  const remoteRef = useRef(remote);
  localRef.current = local;
  remoteRef.current = remote;

  useEffect(() => {
    let cancelled = false;

    const sample = async () => {
      const { isOffline } = useNetworkStore.getState();
      const { callState, pipMode } = useMeetingStore.getState();
      // Keep sampling in native PiP (the call is visible); skip a plain background app.
      if (AppState.currentState !== 'active' && pipMode !== 'NATIVE_PIP') return;

      if (isOffline || callState === 'RECONNECTING' || callState === 'DISCONNECTED') {
        hysteresisRef.current = { current: 'OFFLINE', candidate: null, streak: 0 };
        previousRef.current = {};
        setNetworkQuality('OFFLINE');
        return;
      }

      const sources = [
        { key: 'local', p: localRef.current },
        { key: 'remote', p: remoteRef.current },
      ];

      let worstLoss = 0;
      let worstRtt = 0;
      for (const { key, p } of sources) {
        if (!p?.getAudioStats) continue;
        try {
          const rows = p.webcamOn ? await p.getVideoStats() : await p.getAudioStats();
          const totals = sumStats(rows as never);
          worstLoss = Math.max(worstLoss, lossRatio(totals, previousRef.current[key] ?? null));
          worstRtt = Math.max(worstRtt, totals.rtt);
          previousRef.current[key] = totals;
        } catch {
          // a missed sample is ignored
        }
      }
      if (cancelled) return;

      const next = applyHysteresis(hysteresisRef.current, classifySample(worstLoss, worstRtt));
      hysteresisRef.current = next;
      setNetworkQuality(next.current);
    };

    const intervalId = setInterval(sample, CALL_QUALITY_SAMPLE_MS);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [setNetworkQuality]);
};
```

`onQualityLimitation` is handled on `MeetingConsumer` in step 6 and writes `qualityLimitation`.

---

## Step 5. Adaptive quality and the low-network ladder

### `MeetingSessionHost.tsx` provider config (edit)

```tsx
<MeetingProvider
  key={`${meetingId}_${participantId}_${sessionKey}`}
  config={{
    meetingId,
    micEnabled: initialMedia.micEnabled,
    webcamEnabled: initialMedia.webcamEnabled,
    customCameraVideoTrack: initialMedia.cameraTrack,
    customMicrophoneAudioTrack: initialMedia.micTrack,
    participantId,
    name: doctorDisplayName,
    defaultCamera: isFrontCamera ? 'front' : 'back',
    maxResolution: 'hd',
    multiStream: true,
    codecSwitchEnabled: true,
    preferredProtocol: 'UDP_OVER_TCP',
    mode: 'SEND_AND_RECV',
    debugMode: false,
    notification: {
      title: 'PRED Care Consultation',
      message: 'Video consultation in progress',
    },
  }}
  token={token}
  joinWithoutUserInteraction={true}
>
```

`initialMedia` is built in step 8. If there are no pending tracks, `customCameraVideoTrack` / `customMicrophoneAudioTrack` are `undefined` and the SDK opens the camera/mic itself, as it does today.

### `src/hooks/commons/meeting/meetingMediaTracks.ts` (new)

```ts
import {
  createCameraVideoTrack,
  createMicrophoneAudioTrack,
  MediaStream,
} from '@videosdk.live/react-native-sdk';
import { VIDEO_TIER_PRESETS } from '../../../config/meeting.constants';
import { TVideoTier } from '../../../zustand/interfaces/meeting.interfaces';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';

type TPendingTracks = { camera?: MediaStream; mic?: MediaStream };

let pendingTracks: TPendingTracks | null = null;

/** Camera track for a tier, facing the camera the doctor currently uses. */
export const createCameraTrack = (tier: TVideoTier) => {
  const { isFrontCamera } = useMeetingStore.getState();
  const preset = VIDEO_TIER_PRESETS[tier === 'audio' ? 'low' : tier];
  return createCameraVideoTrack({
    facingMode: isFrontCamera ? 'user' : 'environment',
    optimizationMode: 'motion',
    multiStream: true,
    ...preset,
  });
};

export const createMicTrack = () =>
  createMicrophoneAudioTrack({
    encoderConfig: 'speech_standard',
    noiseConfig: { noiseSuppression: true, echoCancellation: true, autoGainControl: true },
  });

export const stopStream = (stream?: MediaStream) => {
  stream?.getTracks().forEach(track => track.stop());
};

export const setPendingTracks = (tracks: TPendingTracks) => {
  releasePendingTracks();
  pendingTracks = tracks;
};

export const takePendingTracks = (): TPendingTracks => {
  const tracks = pendingTracks || {};
  pendingTracks = null;
  return tracks;
};

export const releasePendingTracks = () => {
  stopStream(pendingTracks?.camera);
  stopStream(pendingTracks?.mic);
  pendingTracks = null;
};
```

### `src/hooks/commons/meeting/useAdaptiveVideo.ts` (new)

One place decides what to request from the patient and what the doctor sends. Steps down after a weak period and back up one level at a time.

```ts
import { useMeeting, useParticipant } from '@videosdk.live/react-native-sdk';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { VIDEO_TIER_STEP_MS } from '../../../config/meeting.constants';
import { showInfoToast, showWarningToast } from '../../../lib/commons/toast.utils';
import { TVideoTier } from '../../../zustand/interfaces/meeting.interfaces';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';
import { createCameraTrack, stopStream } from './meetingMediaTracks';

const ORDER: TVideoTier[] = ['hd', 'sd', 'low', 'audio'];

export const useAdaptiveVideo = () => {
  const badSinceRef = useRef<number | null>(null);
  const goodSinceRef = useRef<number | null>(null);
  const toastedRef = useRef<Set<TVideoTier>>(new Set());
  const appliedTierRef = useRef<TVideoTier>('hd'); // the join track is already HD

  const networkQuality = useMeetingStore(state => state.networkQuality);
  const qualityLimitation = useMeetingStore(state => state.qualityLimitation);
  const videoTier = useMeetingStore(state => state.videoTier);
  const pipMode = useMeetingStore(state => state.pipMode);
  const patientParticipantId = useMeetingStore(state => state.patientParticipantId);
  const setVideoTier = useMeetingStore(state => state.setVideoTier);
  const bumpCameraSessionEpoch = useMeetingStore(state => state.bumpCameraSessionEpoch);
  const { changeWebcam } = useMeeting({});
  const remote = useParticipant(patientParticipantId || '');
  const remoteRef = useRef(remote);
  remoteRef.current = remote;

  // 1. Decide the tier
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const isBad = networkQuality !== 'GOOD' || qualityLimitation !== null;
      if (isBad) {
        goodSinceRef.current = null;
        badSinceRef.current ??= now;
      } else {
        badSinceRef.current = null;
        goodSinceRef.current ??= now;
      }
      if (networkQuality === 'OFFLINE') return; // reconnect handles this, keep the tier

      const badFor = badSinceRef.current ? now - badSinceRef.current : 0;
      const goodFor = goodSinceRef.current ? now - goodSinceRef.current : 0;
      const index = ORDER.indexOf(videoTier);

      let target: TVideoTier = videoTier;
      if (qualityLimitation === 'bandwidth' && badFor >= VIDEO_TIER_STEP_MS.toAudio) {
        target = 'audio';
      } else if (networkQuality === 'WEAK' && badFor >= VIDEO_TIER_STEP_MS.toAudio) {
        target = 'audio';
      } else if (networkQuality === 'WEAK' && badFor >= VIDEO_TIER_STEP_MS.toLow) {
        target = index < 2 ? 'low' : videoTier;
      } else if (isBad && badFor >= VIDEO_TIER_STEP_MS.toSd) {
        target = index < 1 ? 'sd' : videoTier;
      } else if (!isBad && goodFor >= VIDEO_TIER_STEP_MS.restore && index > 0) {
        target = ORDER[index - 1];
        goodSinceRef.current = now;
      }

      if (target !== videoTier) setVideoTier(target);
    };

    tick();
    const intervalId = setInterval(tick, 2000);
    return () => clearInterval(intervalId);
  }, [networkQuality, qualityLimitation, videoTier, setVideoTier]);

  // 2. Outgoing camera follows the tier. Audio only sends the smallest layer instead of
  //    turning the camera off, so the CAM button stays truthful.
  useEffect(() => {
    const sendTier: TVideoTier = videoTier === 'audio' ? 'low' : videoTier;
    if (sendTier === appliedTierRef.current) return;

    const { isCamOn, isCameraPausedForCapture } = useMeetingStore.getState();
    // Do not fight the Android capture handoff or swap the camera inside system PiP.
    if (!isCamOn || isCameraPausedForCapture) return;
    if (Platform.OS === 'android' && pipMode === 'NATIVE_PIP') return;

    let cancelled = false;
    createCameraTrack(sendTier)
      .then(async stream => {
        if (cancelled) {
          stopStream(stream);
          return;
        }
        await changeWebcam(stream);
        appliedTierRef.current = sendTier;
        bumpCameraSessionEpoch();
      })
      .catch(error => console.warn('[useAdaptiveVideo] change camera quality failed:', error));
    return () => {
      cancelled = true;
    };
    // pipMode re-runs a skipped swap after leaving system PiP
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoTier, pipMode]);

  // 3. Incoming patient video
  useEffect(() => {
    const p = remoteRef.current;
    if (!patientParticipantId || !p?.setQuality) return;
    if (videoTier === 'audio') {
      p.stopConsumingWebcamStreams?.().catch(() => undefined);
      return;
    }
    p.consumeWebcamStreams?.().catch(() => undefined);
    const quality =
      pipMode !== 'NORMAL' || videoTier === 'low' ? 'low' : videoTier === 'sd' ? 'med' : 'high';
    p.setQuality(quality).catch(() => undefined);
  }, [patientParticipantId, videoTier, pipMode]);

  // 4. One toast per tier per call
  useEffect(() => {
    if (toastedRef.current.has(videoTier)) return;
    if (videoTier === 'low') {
      toastedRef.current.add(videoTier);
      showWarningToast('Weak connection. Video quality lowered to keep audio clear.');
    } else if (videoTier === 'audio') {
      toastedRef.current.add(videoTier);
      showInfoToast('Switched to audio only to keep the call going.');
    } else if (videoTier === 'hd' && toastedRef.current.size > 0) {
      toastedRef.current.clear();
      showInfoToast('Connection improved. Video restored.');
    }
  }, [videoTier]);
};
```

### `useMeetingParticipants.ts` (edit)

- Delete `usePatientVideoQuality` and its call in `MeetingSessionController`. `useAdaptiveVideo` replaces it.
- In `useMeetingParticipants`, do not override `RECONNECTING` / `DISCONNECTED` when the patient briefly disappears:

```ts
useEffect(() => {
  const locked: MeetingCallState[] = ['RECONNECTING', 'DISCONNECTED', 'ENDED', 'FAILED'];
  if (patientId) {
    setPatientParticipant({ id: patientId });
    if (currentCallState === 'WAITING_FOR_PATIENT' || currentCallState === 'CONNECTING') {
      setCallState('CONNECTED');
    }
  } else if (!locked.includes(currentCallState)) {
    setPatientParticipant({ id: null, webcamOn: false });
    if (currentCallState === 'CONNECTED') setCallState('WAITING_FOR_PATIENT');
  }
}, [patientId, currentCallState, setPatientParticipant, setCallState]);
```

### `PatientStageView.tsx`, `InAppPipWindow.tsx`, `AndroidPipStage.tsx` (edit)

While `videoTier === 'audio'`, render the existing camera-off placeholder (same markup) instead of the frozen last frame:

```ts
const isAudioOnly = useMeetingStore(state => state.videoTier === 'audio');
const remoteTrack = !isAudioOnly && webcamOn && webcamStream ? webcamStream.track : null;
```

iOS native PiP (`usePipRemoteTrack`) already detaches the renderer when the track goes away, so it shows its placeholder too.

### Camera paths that must use the current tier (edit)

Without this, the camera snaps back to HD after an Android capture or restore, or after CAM ON.

- `useMeetingCaptureHandoff.ts`: replace every `enableWebcamRef.current()` with

  ```ts
  const track = await createCameraTrack(useMeetingStore.getState().videoTier).catch(() => undefined);
  await enableWebcamRef.current(track);
  ```

- `useMeetingCamera.ts`:
  - Lock toggles while one is in flight (double taps on a slow network):

    ```ts
    const toggleLockRef = useRef(false);
    const runLocked = useCallback(async (action: () => Promise<void>) => {
      if (toggleLockRef.current) return;
      toggleLockRef.current = true;
      try {
        await action();
      } finally {
        setTimeout(() => {
          toggleLockRef.current = false;
        }, 400);
      }
    }, []);
    ```

  - CAM ON passes a tier track: `sdkToggleWebcam(isCamOn ? undefined : await createCameraTrack(videoTier).catch(() => undefined))`.
  - FLIP: keep `sdkChangeWebcam()` (no argument) while `videoTier === 'hd'` (today's behavior). For other tiers, flip `isFrontCamera` first and then `sdkChangeWebcam(await createCameraTrack(videoTier))`, so the flipped camera keeps the low tier. **Verify on device** that the no-argument flip still works after a custom track was set; if not, always flip with a new track.

---

## Step 6. Reconnect instead of ending the call

### `MeetingConsumer` in `MeetingSessionHost.tsx` (edit)

`hasConnectedRef` lives in `MeetingSessionHost` and is reset when `meetingId` changes (a new appointment). It is **not** reset on a `sessionKey` remount, so a rejoin shows `RECONNECTING`, not `CONNECTING`.

```tsx
const hasConnectedRef = useRef(false);
const sdkRecoveryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const clearRecoveryTimer = () => {
  if (sdkRecoveryTimerRef.current) clearTimeout(sdkRecoveryTimerRef.current);
  sdkRecoveryTimerRef.current = null;
};

// If the SDK has not recovered on its own while online, start a fresh session.
const armRecoveryTimer = () => {
  if (sdkRecoveryTimerRef.current) return;
  sdkRecoveryTimerRef.current = setTimeout(() => {
    sdkRecoveryTimerRef.current = null;
    const { callState, isEndRequested } = useMeetingStore.getState();
    if (!isEndRequested && callState === 'RECONNECTING') setCallState('DISCONNECTED');
  }, MEETING_SDK_RECOVERY_MS);
};

<MeetingConsumer
  onMeetingJoined={() => {
    resetMeetingStatusGuard();
    hasConnectedRef.current = true;
    clearRecoveryTimer();
    const state = useMeetingStore.getState();
    state.setRejoinAttempt(0);
    if (state.callState === 'IDLE' || state.callState === 'INITIALIZING') {
      setCallState('CONNECTING');
    } else if (state.callState === 'RECONNECTING' || state.callState === 'DISCONNECTED') {
      setCallState(state.patientParticipantId ? 'CONNECTED' : 'WAITING_FOR_PATIENT');
    }
  }}
  onMeetingStateChanged={({ state }) => {
    const { callState, isEndRequested, patientParticipantId } = useMeetingStore.getState();
    if (callState === 'ENDED') return;

    if (state === 'CONNECTING') {
      if (hasConnectedRef.current) {
        setCallState('RECONNECTING');
        armRecoveryTimer();
      } else {
        setCallState('CONNECTING');
      }
    } else if (state === 'CONNECTED') {
      hasConnectedRef.current = true;
      clearRecoveryTimer();
      setCallState(patientParticipantId ? 'CONNECTED' : 'WAITING_FOR_PATIENT');
    } else if (state === 'FAILED' || state === 'DISCONNECTED') {
      if (isEndRequested) {
        setCallState('ENDED');
      } else {
        setCallState('RECONNECTING');
        armRecoveryTimer();
      }
    } else if (state === 'CLOSING' || state === 'CLOSED') {
      // Only an intentional end closes the call here; a network close is handled by onMeetingLeft.
      if (isEndRequested) setCallState('ENDED');
    }
  }}
  onMeetingLeft={({ code }) => {
    clearRecoveryTimer();
    const { isEndRequested } = useMeetingStore.getState();
    if (!isEndRequested && MEETING_NETWORK_LEAVE_CODES.includes(code)) {
      // Dropped, not ended: useMeetingReconnect takes over.
      setCallState('DISCONNECTED');
      return;
    }
    openMeetingStatusOnce(); // today's behavior for every other reason
  }}
  onQualityLimitation={({ type, state }) => {
    useMeetingStore.getState().setQualityLimitation(state === 'detected' ? type : null);
  }}
  onError={({ code, message }) => {
    console.warn(`[VideoSDK] Meeting error (${code}): ${message}`);
  }}
>
```

`DoctorMeetingScreen` needs no change: it only goes back on `ENDED` / `FAILED`, which a drop no longer sets.

### `src/hooks/commons/meeting/useMeetingReconnect.ts` (new)

Mounted in `MeetingSessionHost`, outside the provider, because the provider is remounted on rejoin.

```ts
import { useCallback, useEffect, useRef } from 'react';
import { MEETING_REJOIN_BACKOFF_MS } from '../../../config/meeting.constants';
import { useAlertStore } from '../../../zustand/stores/useAlertStore';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';
import useNetworkStore from '../../../zustand/stores/useNetworkStore';
import { useGetToken } from '../../react-query/appointments/appointments.hooks';
import { createCameraTrack, createMicTrack, setPendingTracks } from './meetingMediaTracks';
import { openMeetingStatusOnce } from './openMeetingStatus';

const isClientError = (error: unknown) => {
  const status = (error as { response?: { status?: number } })?.response?.status;
  return !!status && status >= 400 && status < 500;
};

export const useMeetingReconnect = () => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);

  const callState = useMeetingStore(state => state.callState);
  const isOffline = useNetworkStore(state => state.isOffline);
  const { mutateAsync: getToken } = useGetToken();

  const giveUp = useCallback(() => {
    useAlertStore
      .getState()
      .showInfo('Could not reconnect to the consultation.', 'Connection lost', () => {
        openMeetingStatusOnce();
      });
  }, []);

  const rejoin = useCallback(async () => {
    const store = useMeetingStore.getState();
    if (inFlightRef.current || store.isEndRequested || !store.appointmentId) return;
    if (store.callState !== 'DISCONNECTED') return;
    if (useNetworkStore.getState().isOffline) return; // wait for NetInfo to report online

    inFlightRef.current = true;
    const attempt = store.rejoinAttempt + 1;
    store.setRejoinAttempt(attempt);
    try {
      const res = await getToken({ appointmentId: String(store.appointmentId) });
      if (!res?.success || !res?.data?.token || !res?.data?.meeting_id) {
        throw new Error('Missing video session token');
      }
      const [camera, mic] = await Promise.all([
        store.isCamOn ? createCameraTrack(store.videoTier).catch(() => undefined) : undefined,
        createMicTrack().catch(() => undefined),
      ]);
      setPendingTracks({ camera, mic });
      store.rejoinCallInfo({
        token: res.data.token,
        meetingId: res.data.meeting_id,
        callElapsedSeconds: res.data.appointment?.call_elapsed_seconds,
      });
    } catch (error) {
      if (isClientError(error) || attempt >= MEETING_REJOIN_BACKOFF_MS.length) {
        giveUp();
        return;
      }
      timerRef.current = setTimeout(rejoin, MEETING_REJOIN_BACKOFF_MS[attempt - 1]);
    } finally {
      inFlightRef.current = false;
    }
  }, [getToken, giveUp]);

  // Start (or continue) rejoining while DISCONNECTED; re-run when the network comes back.
  useEffect(() => {
    if (callState !== 'DISCONNECTED' || isOffline) return;
    const attempt = useMeetingStore.getState().rejoinAttempt;
    timerRef.current = setTimeout(rejoin, MEETING_REJOIN_BACKOFF_MS[attempt] ?? 15000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [callState, isOffline, rejoin]);

  return { rejoin };
};
```

A 4xx from the token API means the appointment is closed or the time is up, so the hook stops at once and shows Consultation Completed instead of retrying.

**Test before shipping:** VideoSDK must accept the same `participantId` (`doctor_<id>`) rejoining the same room. If the old peer lingers (leave code `DUPLICATE_PARTICIPANT`), add a suffix on rejoin (`doctor_<id>_r<sessionKey>`) and make sure the patient app matches the doctor by prefix.

---

## Step 7. Meeting-aware offline blocker

### `src/components/commons/Network/GlobalNoInternetBlocker.tsx` (edit)

```tsx
const [isGraceOver, setIsGraceOver] = useState(false);
const meetingId = useMeetingStore(state => state.callInfo?.meetingId);

const handleEmergencyLeaveMeeting = async () => {
  await endMeetingCall(); // marks the end as intentional, leave() with timeout, opens the status screen
  navigate(AppRoute.HOME); // only if openMeetingStatusOnce did not navigate (no live session)
};

useEffect(() => {
  if (!isOffline || !meetingId) {
    setIsGraceOver(false);
    return;
  }
  const timerId = setTimeout(() => setIsGraceOver(true), MEETING_OFFLINE_GRACE_MS);
  return () => clearTimeout(timerId);
}, [isOffline, meetingId]);

// existing BackHandler and fade effects unchanged

if (!isOffline) return null;
if (meetingId && !isGraceOver) return null; // short blips during a call: the header shows Reconnecting

return ( /* existing JSX unchanged */ );
```

- `isInsideMeeting` becomes `Boolean(meetingId)` so "Exit Ongoing Consultation" stays visible while `RECONNECTING` / `DISCONNECTED`.
- If `leave()` cannot reach the server, VideoSDK removes the peer when its connection times out server-side. The patient sees the doctor leave a little later.
- `GlobalOfflineBanner` is unchanged.

---

## Step 8. Faster join

### `useJoinVideoCall.ts` (edit, inside `joinVideoCall`)

The permission request stays first, as today, so a denied mic never starts a call on the server. After permission, open the mic and camera once, in parallel with the token request:

```ts
const hasPermissions = await requestAudioVideoPermissions();
if (!hasPermissions) {
  showErrorToast('Camera and microphone permissions are required to join the video consultation.');
  return;
}

showLoader('Joining Video Call...');
const [tokenResult, micResult, cameraResult] = await Promise.allSettled([
  getTokenAsync({ appointmentId: String(appointmentId) }),
  createMicTrack(),
  createCameraTrack('hd'),
]);

const mic = micResult.status === 'fulfilled' ? micResult.value : undefined;
const camera = cameraResult.status === 'fulfilled' ? cameraResult.value : undefined;
const res = tokenResult.status === 'fulfilled' ? tokenResult.value : null;

if (!res?.success || !res?.data) {
  stopStream(camera);
  stopStream(mic);
  hideLoader();
  showErrorToast(res?.message || 'Unable to join the video consultation.');
  return;
}

setPendingTracks({ camera, mic });
// ...existing setCallInfo(...) and navigate(AppRoute.DOCTOR_MEETING) unchanged
hideLoader();
```

`getTokenAsync` is `useGetToken().mutateAsync`. If track creation fails, the provider falls back to opening the devices itself (today's path).

### `MeetingSessionHost.tsx` (edit)

```tsx
const sessionKey = useMeetingStore(state => state.sessionKey);

const initialMedia = useMemo(() => {
  const { isMuted: muted, isCamOn: camOn } = useMeetingStore.getState();
  const { camera, mic } = takePendingTracks();
  if (!camOn) stopStream(camera);
  return {
    micEnabled: !muted,
    webcamEnabled: camOn,
    cameraTrack: camOn ? camera : undefined,
    micTrack: mic,
  };
  // read once per session; store values are taken at mount on purpose
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [meetingId, sessionKey]);

useEffect(() => {
  hasConnectedRef.current = false;
}, [meetingId]);

useMeetingReconnect();
useAndroidCallForegroundService();
```

Today the provider reads `isMuted` / `isCamOn` reactively; with `initialMedia` they are read once per session, which is what the SDK uses anyway (it only reads them at join).

---

## Step 9. Android lifecycle during reconnect

- `useAndroidCallForegroundService.ts`: add `'DISCONNECTED'` to `SERVICE_STATES`, and mount it in `MeetingSessionHost` (step 8) instead of `MeetingSessionController`, so the provider remount on rejoin does not stop and restart the service. It only reads the store and notifee, so it does not need the provider.
- `useAndroidPipLifecycle.ts`: add `'DISCONNECTED'` to `PIP_ELIGIBLE_STATES`. Check that it does not use `useMeeting`; if it does not, mount it in `MeetingSessionHost` too.
- `NativePip.setMeetingScreenState` depends on `meetingId`, which does not change on rejoin, so no change is needed.

---

## Step 10. Socket resync

### `src/components/commons/Sockets/SocketListeners.tsx` (edit)

Inside the existing effect:

```ts
const handleReconnect = async () => {
  const { appointmentId, callInfo } = useMeetingStore.getState();
  if (!callInfo?.token || !appointmentId) return;
  await queryClient.invalidateQueries({ queryKey: [MyAppointmentsQueryKeys.MyAppointmentsInfo] });
  const info = await getMyAppointmentInfo(appointmentId).catch(() => null);
  const status = info?.data?.appointment_status;
  if (status === 'completed' || status === 'cancelled') {
    await handleTimeUpVideoCallEnded({ appointmentId });
  }
};

socketConnection.io.on('reconnect', handleReconnect);
// cleanup
socketConnection.io.off('reconnect', handleReconnect);
```

Check the real `appointment_status` values in `appointments.func.ts` before coding.

---

## Implementation notes (where the code differs from the snippets above)

- **First join failure keeps the old behavior.** Until the first `CONNECTED`, `FAILED` / `CLOSED` / `DISCONNECTED` still end the call, and `onMeetingLeft` opens Consultation Completed. Only a call that already connected is treated as a drop and reconnected.
- **Flip camera always uses a new track** for the other camera at the current tier (`changeWebcam(track)`). The SDK's no-argument `changeWebcam()` cycles to the next device and reopens it at the default HD, which is unreliable once the session started on a custom track (faster join). If track creation fails, it falls back to the no-argument switch. Flipping while the camera is off only updates `isFrontCamera`; CAM ON then opens the right camera.
- **CAM ON and the Android capture handoff / restore** always pass a tier track to `toggleWebcam` / `enableWebcam`, falling back to the SDK default if creation fails.
- **`useAndroidPipLifecycle` stays inside the provider** (it uses `useMeetingConnection`); only `'DISCONNECTED'` was added to its state list. `useAndroidCallForegroundService` moved to `MeetingSessionHost`.
- **`useMeetingConnection` no longer calls `useMeeting`.** `endCall` goes through `endMeetingCall()`, which uses the registered SDK leave.
- **Offline exit** goes through `endMeetingCall()` and opens Consultation Completed, like any other intentional end. Home is only the fallback when no session existed.
- **Audio-only** also detaches the iOS native PiP renderer (`usePipRemoteTrack`).
- **`useAdaptiveVideo`** also tracks the camera being turned back on (CAM ON, capture handoff), so it does not swap a camera that is already at the right tier, and retries a skipped swap once capture or system PiP ends.
- **Tests:** `__tests__/callQuality.utils.test.ts` covers loss deltas, classification, hysteresis, the link cap, and the signal level.

## Order of work

1. Step 0 (store/types/constants) and step 1 (`endMeetingCall`). Everything else depends on them.
2. Step 2 (render isolation) and step 3 (timer). Low risk, removes most of the visible stutter and the self-view flicker.
3. Step 4 (monitor and signal bars) and step 5 (adaptive quality and the ladder, including the camera paths).
4. Step 6 (reconnect), step 7 (offline blocker), step 9 (Android lifecycle). The biggest reliability win; ship together.
5. Step 8 (faster join).
6. Step 10 (socket resync).

## How to test

- **Throttling:** iOS Network Link Conditioner ("3G", "Very Bad Network", 5 % and 15 % loss, 300 ms delay); Android emulator network speed/latency settings or a throttled hotspot. The signal bars move to Fair/Weak, the patient video steps down, and audio stays clear.
- **Weak wifi:** walk away from the router (Android). The bars drop before the call stats react, and never show "Strong" on a slow link.
- **Drop test:** airplane mode for 3 s, 10 s, and 40 s during a call.
  - 3 s: no blocker, header shows Reconnecting, the call continues.
  - 10 s: the blocker appears after 8 s, the call rejoins when the network returns, PiP state, mute/camera, and the timer are kept.
  - 40 s+: rejoin attempts, then the "Could not reconnect" alert and Consultation Completed.
- **Wifi → mobile data** switch mid-call.
- **Exit while offline:** the patient app must show that the doctor left.
- **End paths:** END button, in-app PiP end, and time-up. Each must reach Consultation Completed, never a rejoin.
- **Background:** background the app for 5 minutes. The timer must match wall-clock time on return.
- **Android:** capture handoff (camera/gallery during a call), WhatsApp camera steal in native PiP, home button → native PiP, foreground notification stays during a reconnect.
- **iOS:** native PiP shows the patient, then the placeholder in audio-only, then the patient again.
- **Flip camera** at HD and at the SD/low tier.
- **Performance:** React DevTools Profiler (Flipper or the RN DevTools). `PatientStageView`, `LocalPipCard`, and `MeetingController` must not re-render once per second; the self-view must not flicker.
- Test with the patient on the mobile app (`predcarepatient` / `dev-patient`) on mobile data.

## Out of scope

- Any layout, style, or component design change.
- Changes in the web portal or the patient app.
- Switching away from VideoSDK.
- Recording, chat, new controls, or an audio route (speaker/earpiece) picker.
- Backend changes. To confirm with the backend team: the room does not auto-close while the doctor rejoins, the token API works for an in-progress appointment and returns `call_elapsed_seconds`, and a participant-left webhook does not complete the appointment during a reconnect.
