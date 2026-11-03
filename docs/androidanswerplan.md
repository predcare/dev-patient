# Fix Plan: Android Answer Opens the App and Joins

**Status:** Part 1 done on 2026-11-03; Part 2 below is a plan and replaces parts of Part 1. Part 1 notes: Kotlin compiles and tsc is unchanged, not yet tested on a device. Two changes from the plan: step 2 saves the ringing call in AsyncStorage (`@ringing_call`), because CallKeep's Android `reportNewIncomingCall` isn't exposed to JS; and `android/app/build.gradle` gets the `localbroadcastmanager` dependency the receiver needs. The notification is skipped when the app is already on screen.
**Scope:** Android only. iOS code and behavior stay as they are.
**Checked on:** 2026-11-03 (react-native-callkeep 4.6.1, `callService.ts` after the answer-window fix).

---

## Part 2 (done on 2026-11-03, not yet tested on a device): self-managed mode, from the official CallKeep guide

**Implementation note:** the call notification is shown straight from `ringIncomingCall` (right after `displayIncomingCall`) instead of waiting for `showIncomingCallUi`, so it rings even if that event isn't delivered or Telecom refuses the call. Part 1's uncommitted code was reversed (backup patch kept outside the repo).

**This replaces the earlier Part 2 draft** (overlay permission, MIUI settings, calling-account prompts). Part 1's native Answer receiver is removed by this plan (see "Remove" below).

Sources: CallKeep [Android installation](https://github.com/react-native-webrtc/react-native-callkeep/blob/HEAD/docs/android-installation.md), [Android self-managed guide](https://github.com/react-native-webrtc/react-native-callkeep/blob/HEAD/docs/guides/android-self-managed.md), [background calls guide](https://github.com/react-native-webrtc/react-native-callkeep/blob/HEAD/docs/guides/background-calls.md).

### Why managed mode can't do this

In managed mode (today), Android's Phone app draws the call screen and owns the **Answer** button. The tap happens in the Phone app, not in PRED Care, so:

- PRED Care gets no right to open itself. Android 10+ blocks it (on the Xiaomi test phone: `MIUILOG- Permission Denied Activity … MainActivity`), and the patient is left on the Phone app's "call connected" screen.
- The only workarounds are risky in production:
  - The "Display over other apps" permission (Google Play limits its use).
  - Private Xiaomi settings that change between MIUI and HyperOS.
  - A "Tap to join" notification that's easy to miss.
- Managed mode also needs the phone permission (`CALL_PHONE`, `READ_PHONE_NUMBERS`) and the calling account turned on in settings. Neither is on for the test phone (`granted=false`, account off), so calls don't even show: `PRED Care calling account is off or phone permission is missing`.

### The fix: self-managed mode (the guide's recommended setup for apps with their own call UI)

From the self-managed guide:

1. Set `selfManaged: true`.
2. Call `displayIncomingCall` as today.
3. CallKeep sends `showIncomingCallUi`.
4. The app shows its own incoming call as a **high-priority notification**.
5. When the patient acts, the app answers, rejects or ends the call.

Because PRED Care draws the Answer button itself, a tap on it is the patient's own tap on our notification. **Android always lets that open the app**, so no extra permission is needed. This is how WhatsApp and similar apps work.

What this removes:

- **No phone permission or calling-account setup:** self-managed uses `MANAGE_OWN_CALLS` (CallKeep's own manifest adds it; nothing to ask), so the call shows on every phone.
- **No overlay permission and no Xiaomi-specific code.**
- **No AsyncStorage race:** the call details travel inside the notification (`data`), and Notifee hands them over when the app opens (`getInitialNotification`, which Splash already awaits).

What CallKeep still gives us: Android knows a call is ringing, so it respects an ongoing phone call, Do Not Disturb and Bluetooth headsets.

### How it behaves (Android)

**One incoming call UI in every state:** the same PRED Care call notification ("Dr. X · Incoming video consultation", ringing, with **Decline** / **Answer**). `GlobalIncomingCallBanner` isn't used for calls.

| App state | Incoming call | Patient taps Answer |
| --- | --- | --- |
| **App open** | The call notification drops down over the app (heads-up), ringing | Joins at once |
| **Background, phone unlocked** | The same heads-up call notification, ringing | The app opens and joins |
| **Phone locked or screen off** | The same call notification on the lock screen, ringing | Android asks to unlock → the app opens and joins |
| **App closed (swiped away)** | The same notification (FCM high-priority push → background handler) | The app starts → Splash → joins |
| **Decline, doctor cancels, or 30 s timeout** | Ring stops; a "Missed call" notification when the patient didn't answer | — |

One ringtone per call: only the notification rings. The socket's in-app banner stays hidden while the call rings (existing `hideBannerWhileRinging`); the socket code itself isn't changed.

### Change

**1. CallKeep setup** (`src/services/calls/callKeepSetup.ts`)

- `android.selfManaged: true`. Drop `imageName` and the alert texts (no account prompt in self-managed).
- No `foregroundService` option for CallKeep (the guide's tip: avoids sticky foreground-service notifications).
- `canShowSystemCall()` stays; in self-managed, CallKeep's `hasPhoneAccount()` returns `true`.
- The manifest service already matches the installation guide (`VoiceConnectionService`, `BIND_TELECOM_CONNECTION_SERVICE`, `foregroundServiceType="phoneCall|microphone|camera"`, `FOREGROUND_SERVICE_PHONE_CALL/MICROPHONE/CAMERA`, `POST_NOTIFICATIONS`). No manifest change.

**2. Ring with our own UI** (`src/services/calls/callService.ts`, Android branch)

- `ringIncomingCall`: keep `RNCallKeep.displayIncomingCall(...)` (Telecom registers the call).
- New CallKeep listener `showIncomingCallUi` (in `startCallKeepListeners`): `showAndroidRing(call)` (the Notifee call notification), **in every app state**, and mark the call as ringing (`onSystemScreen`) so the socket banner stays hidden.
- `createIncomingConnectionFailed` (Android refused the call, e.g. the patient is already on a phone call): still show the notification without Telecom, so the patient can choose. This is a small difference from the guide (which says reject), because a missed consultation is worse.

**3. The call notification** (`src/services/calls/androidRing.ts`, existing `showAndroidRing`)

Already: `category: CALL`, `importance: HIGH`, `ongoing`, looped `ringtone`, `timeoutAfter` the ring time, Decline and Answer actions, call details in `data`. Change:

- Remove `fullScreenAction`. A full-screen launch would open the app itself (Home) instead of showing the call, so the patient wouldn't see Answer. Without it, the locked phone shows the same call notification with Answer and Decline (`visibility: PUBLIC`, ringing).
- Answer keeps `launchActivity: 'default'` (opens the app, or keeps it in front); Decline doesn't open it.
- Title: the doctor's name; body: "Incoming video consultation".

**4. Answer, Decline, cancel** (`callService.ts`, existing code)

- `routeNotificationPress` already sends Answer → `answerCall` and Decline → `declineCall` (foreground, background and the notification that opened the app).
- `answerCall` on Android: the app is in front (the tap opened it, or it already was), so it uses the existing path: `stopRinging` (cancels the notification, ends the Telecom call with `reportEndCallWithUUID`) and then `startJoin`. On a cold start, Splash joins through `consumePendingAnswer` as today. Remove the Android `setCurrentCallActive` + `backToForeground` + wait-for-active branch.
- Decline and the `CALL_CANCELLED` push: unchanged (`declineCall` / `cancelCall`).

**5. No lock-screen launch** (`MainActivity.kt`)

Remove Part 1's `setShowWhenLocked` / `setTurnScreenOn` code. The app isn't opened over the lock screen any more (the patient unlocks after Answer), so no patient data ever shows on a locked phone.

**6. Remove what's no longer needed**

| Remove | Why |
| --- | --- |
| `MainApplication.kt`: Answer receiver, `call_answered` notification, foreground tracking | The Answer tap now opens the app by itself |
| `android/app/build.gradle`: `localbroadcastmanager` dependency | Only the receiver used it |
| `callService.ts`: `@ringing_call` AsyncStorage save and lookup | Call details come from the notification `data` |
| `callPermissionPrompt.ts` call in Splash | Never needed in self-managed (`canShowSystemCall()` is true, so it already returns early; remove the call for clarity) |
| `res/drawable/ic_call_blank.xml` | No system call screen to put an icon on |
| `MainActivity.kt`: lock-screen flags and notification cancel | No launch over the lock screen; no Part 1 notification |

### Production checks (Google Play and Android versions)

- **Notification permission (Android 13+):** needed for the ring. `notification.core.ts` already asks (`notifee.requestPermission()`); make sure it runs after login, before the first call.
- **Full-screen intent:** not used any more, so there's no Android 14 full-screen permission or Play Console declaration to depend on. `USE_FULL_SCREEN_INTENT` can be removed from the manifest in the same change.
- **Locked phone:** the notification rings and shows on the lock screen. Most phones also light up the screen for a high-priority notification; on phones with that turned off, the patient hears the ring and sees the call when they pick up the phone.
- **`SYSTEM_ALERT_WINDOW`:** this plan doesn't use it. It's already in `AndroidManifest.xml` from the first project commit. If nothing else uses it, remove it in a separate change to avoid a Play policy question.
- **High-priority FCM:** the backend already sends data-only high-priority messages. Android lowers an app's priority if it doesn't show a notification for them. We always show one (ring or missed call), as the guide says.
- **Xiaomi / OEM battery savers:** they may delay FCM when the app is swiped away. That's outside the app's control; the ring works once the push arrives.

### iOS

No change. CallKit stays as it is (in-app, background and closed, once the backend sends VoIP pushes). Answering there opens the app through CallKit.

### Files

| File | Change |
| --- | --- |
| `src/services/calls/callKeepSetup.ts` | `selfManaged: true`; drop `imageName` and alert texts |
| `src/services/calls/callService.ts` | `showIncomingCallUi` → call notification in every state; simpler Android answer; remove `@ringing_call` |
| `src/services/calls/androidRing.ts` | Remove `fullScreenAction`; title and body |
| `android/app/src/main/java/com/predcarepatient/MainActivity.kt` | Remove Part 1's lock-screen flags and notification cancel |
| `android/app/src/main/AndroidManifest.xml` | Remove `USE_FULL_SCREEN_INTENT` |
| `android/app/src/main/java/com/predcarepatient/MainApplication.kt` | Remove Part 1's receiver and notification |
| `android/app/build.gradle` | Remove `localbroadcastmanager` |
| `src/Features/SplashScreen/SplashScreen.tsx` | Remove the `promptCallAccountIfNeeded` call |
| `android/app/src/main/res/drawable/ic_call_blank.xml` | Delete |

No new files. iOS untouched.

### Test checklist (Xiaomi and one stock-Android phone; uninstall first so the phone account is re-registered as self-managed)

- [ ] No phone-permission or calling-account prompt anywhere
- [ ] App open: the call notification drops down over the app and rings → Answer → joins; Decline → ring stops
- [ ] App open while the socket also fires: no in-app banner, one ringtone
- [ ] Background, unlocked: heads-up rings → Answer → app opens and joins
- [ ] Background, unlocked: Decline → ring stops, app stays closed
- [ ] Locked / screen off: the call notification rings on the lock screen → Answer → unlock → joins
- [ ] Swiped away: ring shows → Answer → app starts → Splash → joins
- [ ] Doctor cancels while ringing: ring stops, "Missed call" notification
- [ ] No answer for 30 s: ring stops
- [ ] On a normal phone call when the doctor calls: notification shows (no crash), Answer works after
- [ ] Only one ringtone at a time in every state
- [ ] iOS: unchanged

---

## Part 1 (done)

## What happens now

The patient taps **Answer** on the Android system call screen. The call becomes a normal ongoing call in the Phone app; PRED Care doesn't open and the patient doesn't join the consultation.

## Why

1. **Opening the app depends on JS.** On Answer, CallKeep's native `VoiceConnection` only sends an `ACTION_ANSWER_CALL` broadcast. Our JS `answerCall` must receive it and call `backToForeground()`. When the app was closed, JS often isn't listening, so CallKeep just queues the event (`delayedEvents`) and nothing opens the app.
2. **Android blocks the open from the background.** Even when JS runs, `backToForeground()` calls `startActivity` from an app that's in the background. Android 10+ blocks that (logcat: `Background activity launch blocked` / `Abort background activity starts`).
3. **It now looks like a normal call.** The answer-window fix marks the call active (`setCurrentCallActive`) so the screen stays up. With the app not opening, the patient is left in an empty "ongoing call" until the 45-second window ends it.
4. **A fresh app start can't find the call.** On Android, `RNCallKeep.displayIncomingCall` sends no payload. After a cold start, `replayInitialCallEvents()` doesn't know the appointment, so it skips the answer and doesn't join.

## Change (Android only)

### 1. Open the app from native code, not JS: `MainApplication.kt` and `MainActivity.kt`

`MainApplication.kt`: in `onCreate`, register a `LocalBroadcastManager` receiver for CallKeep's `ACTION_ANSWER_CALL`. It runs in the app process even when JS isn't running. On receive:

- Post a notification on a new high-importance channel `call_answered`, category `CALL`, with a **full-screen intent** and a content intent. Both are a `PendingIntent` (immutable) that opens `MainActivity` with the extra `answered_call_uuid`.
  - Phone locked or screen off: Android launches `MainActivity` straight away, over the lock screen.
  - Phone unlocked and in use: Android shows a heads-up "Tap to join your doctor's call" instead. Android doesn't let a background app jump over another app here (only an overlay permission could do that, which we won't ask for).
- Android 14+: if `NotificationManager.canUseFullScreenIntent()` is false, the heads-up still shows. `USE_FULL_SCREEN_INTENT` and `POST_NOTIFICATIONS` are already in the manifest.

`MainActivity.kt`: when it's opened with `answered_call_uuid` (in `onCreate` and `onNewIntent`), call `setShowWhenLocked(true)` and `setTurnScreenOn(true)` so it shows over the lock screen. In `onResume`, cancel the "Tap to join" notification.

```kotlin
// MainApplication.onCreate
LocalBroadcastManager.getInstance(this).registerReceiver(object : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val uuid = (intent.getSerializableExtra("attributeMap") as? Map<*, *>)?.get("EXTRA_CALL_UUID") as? String
    showAnsweredCallNotification(context, uuid) // full-screen + content intent → MainActivity
  }
}, IntentFilter("ACTION_ANSWER_CALL"))
```

### 2. Give a fresh app start the call details: `callService.ts` (Android branch only)

- In `ringIncomingCall`, on Android, report the call with its push data so CallKeep keeps it as a payload:
  `NativeModules.RNCallKeep.reportNewIncomingCall(call.callId, 'PRED Care', call.callerName, false, JSON.stringify(callToData(call)))`.
  iOS keeps `RNCallKeep.displayIncomingCall` as today.
- In `rememberCall`, accept the payload as a JSON string too (`typeof data === 'string' ? JSON.parse(data) : data`).

Then at Splash, `replayInitialCallEvents()` knows the call from the display event, and the answer within the 45-second window joins.

### 3. Keep the rest of the answer flow (`callService.ts`)

- `answerCall` with the app in the background stays as now: `holdAnswer`, `setCurrentCallActive`, and the `AppState` listener that joins when the app becomes active and ends the system call.
- `backToForeground()` stays as a first try; the native notification in step 1 is what opens the app when Android blocks it.
- Splash keeps `replayInitialCallEvents()` + `consumePendingAnswer()`; no change there.

## Files

| File | Change |
| --- | --- |
| `android/app/src/main/java/com/predcarepatient/MainApplication.kt` | Answer receiver, `call_answered` channel, full-screen notification |
| `android/app/src/main/java/com/predcarepatient/MainActivity.kt` | Show over the lock screen when opened from Answer; cancel the notification |
| `src/services/calls/callService.ts` | Android: report the call with its payload; `rememberCall` parses a string payload |

No iOS file changes. No new files.

## Result

| Android state when Answer is tapped | Result |
| --- | --- |
| App open | Joins at once (as today) |
| App in background, phone locked or screen off | App opens over the lock screen and joins |
| App in background, phone in use | Heads-up "Tap to join"; tapping it opens the app and joins |
| App closed (swiped away) | App opens (or the heads-up shows), Splash replays the answer and joins |
| App not opened within 45 seconds | System call ends, no join later |

## Test checklist

Check with `adb logcat -s RNCallKeep ReactNativeJS ActivityTaskManager`:

- [ ] App in background, locked: Answer → app opens over the lock screen → joins
- [ ] App in background, unlocked, another app open: Answer → "Tap to join" → tap → joins
- [ ] App swiped away: Answer → app opens → Splash → joins
- [ ] App open: Answer → joins
- [ ] Answer, don't open the app for 45 seconds: call ends, opening later doesn't join
- [ ] Doctor cancels after Answer: no join
- [ ] iOS: nothing changed
