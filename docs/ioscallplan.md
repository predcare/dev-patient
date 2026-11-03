# Plan: iOS Incoming Call as a Notifee Notification (like Android)

**Status:** plan only, no code changed yet.
**Scope:** iOS only. The Android call (self-managed CallKeep + Notifee notification) stays exactly as it is.
**Checked on:** 2026-11-03 (Notifee 9.1.8, react-native-callkeep 4.6.1, react-native-voip-push-notification 3.3.3).

## Goal

The same incoming call on iOS as on Android: a PRED Care notification "Dr. X · PRED Care · Incoming video consultation" with **Decline** and **Answer**, ringing. Answer opens the app and joins the consultation, in every app state.

## First: why `voip_token` can't drive a Notifee notification

The `voip_token` is a PushKit token. Apple's rule since iOS 13: **every VoIP push must be reported to CallKit straight away**, before the push handler returns. If the app shows anything else (a Notifee notification, or nothing), iOS kills the app. After a few such pushes, iOS stops delivering VoIP pushes to the app at all. A VoIP push therefore always means the CallKit screen, never a Notifee notification.

To get a Notifee-style call on iOS, the call has to come from a **normal notification push** (an APNs alert push, sent through FCM like the other app pushes). So this plan:

- **Stops using VoIP and CallKit on iOS** (PushKit registration, `voip_token`, `AppDelegate+PushKit.swift`, CallKit setup).
- **Rings with a notification** that iOS shows itself when the app is in the background or closed, and that Notifee shows when the app is open.

### What changes for the patient compared with CallKit (decide before proceeding)

| | CallKit (today's iOS plan) | Notifee notification (this plan) |
| --- | --- | --- |
| Locked phone | Full-screen call screen, like a phone call | A notification on the lock screen |
| Ringtone | Loops until answered, at ringer volume | `ringtone.caf` plays **once** (iOS allows up to 30 s), at notification volume |
| Silent switch on | Still shows the full call screen | Vibrates only, no sound |
| Focus / Do Not Disturb | Rings if calls are allowed | Breaks through Focus as a **Time Sensitive** notification (patient can turn this off) |
| Answer / Decline | Big buttons on the call screen | Tapping the notification = Answer. **Answer / Decline buttons show when the notification is pressed and held or pulled down** (iOS only shows action buttons on an expanded notification) |
| Backend | VoIP push to `voip_token` | Normal FCM/APNs alert push to the FCM token (already stored) |

## How it behaves (iOS)

| App state | Incoming call | Answer |
| --- | --- | --- |
| **App open** | Notifee shows the call notification as a banner, with the ringtone | Tap the banner, or press and hold → **Answer** → joins at once |
| **Background** | iOS shows the pushed call notification, with the ringtone | Tap, or press and hold → **Answer** → the app opens and joins |
| **Locked** | The same notification on the lock screen (Time Sensitive) | Tap or **Answer** → Face ID / passcode → the app opens and joins |
| **Closed (swiped away)** | The same notification (iOS shows it; no app code needs to run) | The app starts → Splash → joins |
| **Decline** | Press and hold → **Decline** | The ring notification goes; the app doesn't open |
| **Doctor cancels or 30 s timeout** | The ring notification is replaced by "Missed call" | — |

## Change

### App (iOS only)

**1. Call notification category** (`src/services/calls/androidRing.ts`)

The existing ring file stays the one place for the call notification; its Notifee calls already work on iOS.

- Add `setupCallCategory()`: `notifee.setNotificationCategories([{ id: 'incoming_call', actions: [{ id: 'call_decline', title: 'Decline', destructive: true }, { id: 'call_answer', title: 'Answer', foreground: true }] }])`. It uses the same action ids as Android (`CALL_ACTION_DECLINE` / `CALL_ACTION_ANSWER`). Run it at app start. Pushed notifications need the category registered on the phone too.
- `showAndroidRing(call)` gets an `ios` section next to the existing `android` one: `categoryId: 'incoming_call'`, `sound: 'ringtone.caf'`, `interruptionLevel: 'timeSensitive'`, `foregroundPresentationOptions: { banner: true, sound: true, list: true }`. It keeps the same `id` (the call uuid), title, body and `data`.
- `stopAndroidRing(callId)` runs on iOS too: `notifee.cancelNotification(callId)` (shown by Notifee) and `notifee.cancelDisplayedNotification(callId)` (pushed, matched by the push's `apns-collapse-id`).

**2. Ring and answer** (`src/services/calls/callService.ts`)

- `ringIncomingCall` on iOS: drop the CallKit branch (`displayIncomingCall`) and the "background → return" early exit.
  - **App open:** show the Notifee notification (`showAndroidRing`), as on Android.
  - **Background or closed:** iOS already shows the pushed notification, so nothing to show; just remember the call.
- `stopRinging`: call `stopAndroidRing` on iOS too (today it's Android only), and drop `reportEndCallWithUUID` on iOS.
- `answerCall` on iOS: use the Android path. Stop the ring, join when the app is active, and on a cold start Splash joins through `consumePendingAnswer`. Remove the "keep CallKit connected" branch.
- `startCallKeepListeners` / `replayInitialCallEvents`: skip CallKit on iOS (`Platform.OS === 'android'` guard), since there's no CallKit call any more.

**3. Taps and actions** (`notificationDispatcher.ts`, existing code)

`routeNotificationPress` already turns Answer / tap → `answerCall` and Decline → `declineCall` when the notification `data` is a call. On iOS this covers:

- Notifee's own notification (app open): `onForegroundEvent`.
- The pushed notification. Notifee 9 passes taps and action buttons on remote notifications to the same events. Confirm while implementing; if a pushed tap only reaches Firebase (`getInitialNotification` / `onNotificationOpenedApp`), the existing `handlePushNotificationPress` call-tap block already answers it.

**4. One notification while the app is open** (`pushSetup.ts`)

While the app is open, `onMessage` gets the call push, and `handleCallMessage` → `ringIncomingCall` shows the Notifee notification. Make sure iOS doesn't also present the remote one: either iOS's foreground presentation for this push is off, or the Notifee one isn't shown when the remote banner is. Check which one appears on a test phone and keep exactly one.

**5. Stop VoIP and CallKit on iOS**

| File | Change |
| --- | --- |
| `App.tsx` | Remove `startVoipToken()` |
| `src/services/calls/deviceSync.ts` | Stop sending `voip_token` / `apns_env` (and drop the `@voip_token` read), so the backend stops VoIP pushes |
| `ios/predcarepatient/AppDelegate.swift` | Remove `RNCallKeep.setup([...])` and `RNVoipPushNotificationManager.voipRegistration()` |
| `ios/predcarepatient/AppDelegate+PushKit.swift` | Delete and remove it from the Xcode target. A PushKit delegate that receives a VoIP push without CallKit would get the app killed |
| `ios/predcarepatient/Info.plist` | Remove `voip` from `UIBackgroundModes` (App Review rejects the VoIP mode without CallKit) |
| `src/services/calls/voipToken.ts` | Delete (no longer used) |

The `react-native-voip-push-notification` package can be uninstalled afterwards. `react-native-callkeep` stays (Android uses it).

**6. Time Sensitive notifications** (Xcode)

- Add the **Time Sensitive Notifications** capability: `com.apple.developer.usernotifications.time-sensitive` = `true` in `predcarepatient.entitlements`, and enable it for the App ID in the Apple Developer portal.
- `ringtone.caf` (29 s) is already in the app bundle. iOS plays custom notification sounds up to 30 s, once.

### Backend (dev-api, for iOS devices)

**Ring:** send an FCM message to the patient's FCM token with an APNs alert payload instead of the VoIP push:

```json
{
  "token": "<fcm_token>",
  "data": { "type": "INCOMING_CALL", "uuid": "...", "appointment_id": "...", "meeting_id": "...", "caller_name": "Dr. X", "caller_role": "doctor", "timestamp": "...", "timeout_seconds": "30" },
  "apns": {
    "headers": {
      "apns-push-type": "alert",
      "apns-priority": "10",
      "apns-collapse-id": "<uuid>",
      "apns-expiration": "<now + 30 s, unix seconds>"
    },
    "payload": {
      "aps": {
        "alert": { "title": "Dr. X", "body": "PRED Care · Incoming video consultation" },
        "sound": "ringtone.caf",
        "category": "incoming_call",
        "interruption-level": "time-sensitive",
        "mutable-content": 1
      }
    }
  }
}
```

**Cancel (doctor left or 30 s timeout):** send an alert push with the **same `apns-collapse-id`**, which replaces the ring on the phone with "Missed call · Dr. X tried to start your consultation" (`data.type: "CALL_CANCELLED"`, no sound). While the app is running, the existing `CALL_CANCELLED` handling also removes it.

**Stop:** VoIP pushes to `voip_token` for patients.

Android pushes don't change.

## Files

| File | Change |
| --- | --- |
| `src/services/calls/androidRing.ts` | iOS category; `ios` options on the call notification; cancel on iOS |
| `src/services/calls/callService.ts` | iOS rings with Notifee in the foreground, no CallKit; iOS answers like Android |
| `src/services/notifications/push/pushSetup.ts` | Exactly one call notification while the app is open |
| `src/services/notifications/notificationDispatcher.ts` | Confirm pushed taps/actions reach `answerCall` / `declineCall` (likely no change) |
| `App.tsx` | Register the category; remove `startVoipToken()` |
| `src/services/calls/deviceSync.ts` | Stop sending `voip_token` |
| `ios/predcarepatient/AppDelegate.swift` | Remove CallKit setup and PushKit registration |
| `ios/predcarepatient/AppDelegate+PushKit.swift` | Delete (and remove from the Xcode target) |
| `src/services/calls/voipToken.ts` | Delete |
| `ios/predcarepatient/Info.plist` | Remove the `voip` background mode |
| `ios/predcarepatient/predcarepatient.entitlements` | Time Sensitive Notifications |
| Backend `callRinging.service.ts` | iOS: alert push with category, sound, collapse id; cancel replaces it; no VoIP push |

No new files. Android is untouched.

## Test checklist (real iPhone; notifications allowed)

- [ ] App open: call banner rings → tap → joins
- [ ] App open: press and hold → Decline → ring goes, no join
- [ ] Background: notification rings → tap → app opens → joins
- [ ] Locked: notification on the lock screen rings → tap → Face ID → joins
- [ ] Swiped away: notification rings → tap → Splash → joins
- [ ] Press and hold → Answer from background and closed: joins
- [ ] Doctor cancels while ringing: notification becomes "Missed call"
- [ ] No answer in 30 s: notification becomes "Missed call"
- [ ] Focus mode on: notification still shows (Time Sensitive)
- [ ] Only one notification and one sound while the app is open
- [ ] No CallKit screen anywhere; no crash when an old VoIP push arrives (PushKit removed)
- [ ] Android: unchanged
