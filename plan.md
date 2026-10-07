# Android System Picture-in-Picture

Plan only. No code in this step. When this is implemented, do not edit any iOS PiP files or any iOS branch.

## Goal

iOS system picture-in-picture already works. Android should do the same product behavior: while a consultation is active, leaving the app (Home) puts the doctor’s video in a system PiP window. Tapping that window returns to the full meeting. Closing it ends the call.

In-app PiP (the floating card used by Back, the PIP button, prescriptions, and upload) already works on both platforms. Leave that path alone.

## Two modes, and they stay separate

| Mode | When it happens | What the patient sees |
| --- | --- | --- |
| In-app PiP (`IN_APP_PIP`) | Back, the PIP button, prescriptions, or upload | A small floating card inside the app. The call stays up while they browse. |
| System PiP (`NATIVE_PIP`) | Home, or otherwise leaving the app during a call | A system window that shows the doctor’s video. Coming back opens the full meeting again. |

On iOS, system PiP is not the app UI shrunk down. `PiPManager` builds an `AVPictureInPictureController`, attaches the doctor’s WebRTC track, and iOS moves that view into the system window. The React tree draws nothing in `NATIVE_PIP`, because the system window owns the video.

Android system PiP is the whole activity. There is no second video surface. If React unmounts the meeting view, the system window is blank. iOS can render nothing. Android must keep the doctor video mounted and hide the header, controls, and self-view.

## What Android already has

Keep all of this:

- `@videosdk.live/react-native-pip-android` is installed. Its native module is `AndroidPip` (`live.videosdk.pipmode.AndroidPipModule`).
- `AndroidManifest.xml` sets `android:supportsPictureInPicture="true"`.
- `configChanges` already includes `screenSize`, `smallestScreenSize`, and `screenLayout`, so the activity is not recreated when the window shrinks.
- `MainActivity` forwards `onPictureInPictureModeChanged` and `onPictureInPictureRequested` to `AndroidPipModule`.
- When a meeting id exists, `MeetingSessionHost` calls `NativePip.setMeetingScreenState(true)`. On Android that sets the library’s “a call is active” flag. It is cleared when the meeting id goes away.
- `NativePip.enterPipMode` and `NativePip.isPipSupported` already have Android branches. Support is treated as API 26+.
- In-app PiP (`InAppPipWindow`, `enterInAppPip`) is shared React and already runs on Android.

`minSdk` is 24. `targetSdk` is 36. PiP itself starts at API 26.

## Why Android system PiP still does not work

1. **Home does not reliably enter PiP.** The library only enters PiP from `onPictureInPictureRequested`, which is an Android 12+ callback. Android 8–11 never gets it. The library never calls `setAutoEnterEnabled(true)`, which is what makes Home on Android 12–16 enter PiP smoothly. `MainActivity` has no `onUserLeaveHint()`, which is the API 26–30 Home path. The library’s auto path also hardcodes `enterPipMode(300, 214)` (landscape) and ignores the 300×500 size the JS side sets in `setMeetingScreenState`.

2. **JS never hears Android PiP events.** The module emits `PIP_MODE_CHANGE`. `NativePip.addPipChangeListener` only subscribes to the iOS `onPipChanged` event. On Android, `pipMode` never becomes `NATIVE_PIP`, and leaving the system window never restores the meeting.

3. **The meeting UI would go blank.** `MeetingSessionController` returns `null` for `NATIVE_PIP`. That is correct for iOS. On Android it hides `DoctorStageView`, so the small window is empty. Android must keep drawing the doctor video.

4. **The camera would turn off as PiP starts.** `useMeetingAppState` calls `disableWebcam()` when the app backgrounds, unless `NativePip.isBackgroundCameraSupported()` is true. That check is iOS-only and returns false on Android. Entering PiP pauses the activity, React Native reports background, and the patient’s camera stops. The doctor would see a frozen or black image. Mic is already left on.

5. **Closing the system window can kill the app.** On Android, the X on the PiP window finishes the activity. This app is one activity, so that closes PredCare. Nothing leaves the VideoSDK meeting first. Expanding the window (tap) should return to the full meeting instead.

6. **Manifest is one attribute short.** `android:resizeableActivity="true"` is not set. It defaults to true at this target SDK, but it should be explicit so OEM skins still allow the resize.

7. **Android 14+ camera and mic while not fullscreen.** Target SDK is 36. PiP often keeps the camera because the activity is still visible. If a device stops the camera or mic when the activity pauses, the app will need a foreground service with `camera` and `microphone` types. VideoSDK’s WebRTC manifest has those foreground-service permissions commented out. Do not add the service until a device shows the camera or mic dropping. If it does, add it only in the Android app.

The in-app PIP button must not be switched to system PiP. `enterNativePip` exists in `useMeetingPip` and is unused. iOS does not need it, because AVKit starts PiP on its own (`canStartPictureInPictureAutomaticallyFromInline`). Android should enter from the activity lifecycle, not from that button.

## Do not change

- Anything under `ios/predcarepatient/pipmode/` (`PiPManager.swift`, `PiPTrackRenderer.m`, `PiPContainerView.swift`, `PiPVideoView.swift`, `PiPFrameProcessor.swift`, `PiPCameraMultitasking.m`, `PiPManagerBridge.m`).
- The iOS branches of `NativePip.ts`, `useMeetingPip.ts`, `usePipRemoteTrack.ts`, and `useMeetingAppState.ts`.
- In-app PiP: `InAppPipWindow`, `enterInAppPip`, the PIP button, Back, prescriptions, and upload.
- `node_modules/@videosdk.live/react-native-pip-android`. Work around the hardcoded ratio and missing auto-enter in app code.

## Implementation

### 1. Enter system PiP from Home

Android only, in `MainActivity` plus a small app-owned helper. Do not edit the VideoSDK library.

- Track “call is active” at the same moment JS already calls `setMeetingScreenState(true/false)`. An app-owned flag is safer than the library companion, because `pipModeReq()` ignores `setDefaultPipDimensions` and never enables auto-enter.
- While a call is active, on API 31+ call `setPictureInPictureParams` with `setAutoEnterEnabled(true)` and a portrait ratio around 9:16. Android accepts a width/height ratio from about 0.418 to 2.39. 300×500 (0.6) is valid. 9:16 (0.5625) matches the doctor stage better than the library’s 300×214 landscape ratio.
- On API 26–30, enter PiP from `onUserLeaveHint()` with that same ratio.
- When the call ends, turn auto-enter off so Home does not shrink the rest of the app.
- Keep `supportsPictureInPicture`. Add `android:resizeableActivity="true"` on `MainActivity`.
- `onPictureInPictureRequested` should still enter PiP only when a call is active. Returning true with no call is correct: it consumes the request and does not PiP the rest of the app.

`enterPictureInPictureMode` must run before the activity pauses. That call stays in Kotlin. Do not try to enter PiP from a React effect after Home.

### 2. Sync JS when the system window opens and closes

In the Android branch of `NativePip.addPipChangeListener`, subscribe to `PIP_MODE_CHANGE` from `NativeModules.AndroidPip`.

Reuse the listener already in `useMeetingPip`:

- `true` sets `pipMode` to `NATIVE_PIP` (only if `callInfo.meetingId` is set).
- `false` sets `pipMode` to `NORMAL` and navigates to the meeting screen (`goToMeetingScreen`).

Leave the iOS `onPipChanged` subscription and the iOS `AppState` restore effect (`Platform.OS !== 'ios' return`) unchanged.

`NativePip.exitPipMode()` stays a no-op on Android. The patient leaves PiP by tapping the system window. `restoreToMeeting` can keep calling it.

### 3. Draw video inside the Android system window

In `MeetingSessionController`:

- iOS `NATIVE_PIP` still returns `null`.
- Android `NATIVE_PIP` renders a video-only stage.

That stage:

- Full-bleed doctor video via the existing `DoctorStageView`. It already shows the avatar plus “DOCTOR CAMERA OFF” or “WAITING FOR DOCTOR...”.
- No header, no control bar, no local self-view. Those controls are untappable at this size, and iOS system PiP is remote video only.
- If the patient was on the in-app floating card and then presses Home, switch to this full-bleed video as system PiP starts. Otherwise the system window would show whatever screen is underneath the card.

`MeetingProvider` must stay mounted. `MeetingSessionHost` already lives above the navigator in `App.tsx`, so the call survives navigation. Do not unmount it for Android `NATIVE_PIP`.

### 4. Keep camera and mic alive

In `useMeetingAppState`, on Android, do not call `disableWebcam()` when the transition is into system PiP. Mic already stays on. The iOS `isBackgroundCameraSupported` check stays as it is.

### 5. Close versus expand

- Tap the system window: `PIP_MODE_CHANGE` is false, set `NORMAL`, show the full meeting.
- X on the system window: the activity is finishing. End the VideoSDK meeting before the activity is destroyed, so the doctor is not left in a call with no patient UI.
- End call from the full meeting screen: clear the “call is active” flag first so PiP cannot start again during teardown.

### 6. Confirm the native module is linked

`AndroidPipPackage` is a legacy module (`isTurboModule = false`) using `BaseReactPackage`. Autolinking (`autolinkLibrariesWithApp()` / `autolinkLibrariesFromCommand()`) should pick it up. `MainApplication` only adds `WebRTCModulePackage` by hand.

Before testing UI, confirm a debug build lists `AndroidPip` and that `NativeModules.AndroidPip` is not null. If autolink misses it, register `AndroidPipPackage()` in `MainApplication` only. Do not add an iOS package.

### 7. Foreground service, only if a device proves it is needed

If, on a real Android 14+ device, the doctor stops seeing or hearing the patient the moment PiP starts:

- Add `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_CAMERA`, and `FOREGROUND_SERVICE_MICROPHONE` on the app manifest.
- Run a short-lived call foreground service of types `camera|microphone` for the duration of the consultation.
- Do this only in the Android app. Do not patch VideoSDK’s commented-out manifest inside `node_modules` unless the app service is not enough.

Skip this step if camera and mic stay up in PiP during the device test.

## Files to touch later

| File | Change |
| --- | --- |
| `android/app/src/main/java/com/predcarepatient/MainActivity.kt` | Home entry, portrait aspect ratio, auto-enter, close versus expand |
| `android/app/src/main/AndroidManifest.xml` | `android:resizeableActivity="true"`. Foreground-service permissions only if a device test requires them |
| `src/native/NativePip.ts` | Android `PIP_MODE_CHANGE` subscription only. Leave every `Platform.OS === 'ios'` branch as it is |
| `src/hooks/commons/meeting/useMeetingPip.ts` | Let the existing listener drive `NATIVE_PIP` from the Android event. Do not change the iOS `AppState` block |
| `src/components/meeting/MeetingSessionHost.tsx` | Android-only video stage when `pipMode === 'NATIVE_PIP'`. iOS still returns null |
| `src/hooks/commons/meeting/useMeetingAppState.ts` | Android guard so entering PiP does not call `disableWebcam()` |
| New Android-only component, for example `src/components/meeting/AndroidSystemPipStage.tsx` | `DoctorStageView` only |

Optional, only if autolink does not expose `AndroidPip`:

| File | Change |
| --- | --- |
| `android/app/src/main/java/com/predcarepatient/MainApplication.kt` | `add(AndroidPipPackage())` |

## Out of scope

- Any edit under `ios/`.
- Changing in-app PiP layout, drag behavior, or which buttons call `enterInAppPip`.
- Calling `enterNativePip` from the PIP button.
- Forking or patching `@videosdk.live/react-native-pip-android`.
- A foreground service, unless the device test shows camera or mic dying in PiP.
- Remote-track attachment (`usePipRemoteTrack`, `attachRemoteRenderer`). That exists so iOS can paint a second surface. Android paints the activity’s existing `RTCView`.

## How to verify on a device

In-app PiP is not this work. Check system PiP on one Android 12+ phone and, if available, one Android 8–11 phone, with a live consultation:

- Press Home. A portrait system window appears with the doctor’s video, or the waiting / camera-off state. Header, controls, and self-view are gone.
- The doctor still sees and hears the patient.
- Tap the window. The full meeting returns with controls.
- Close the window with X. The call ends for both sides. The app does not sit in a dead call.
- Press Home on Home, doctors, or appointments with no active call. The app does not enter PiP.
- PIP button, Back, prescriptions, and upload still use the floating in-app card.
- From the in-app card, press Home. The system window shows the doctor video, not the screen that was behind the card.
- An iOS call still enters and leaves system PiP exactly as it does now.
