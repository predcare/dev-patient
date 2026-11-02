# Push Notification Plan: PRED Care Patient App (Android and iOS)

**Status:** plan only, nothing implemented yet
**Delivery:** Firebase Cloud Messaging (FCM) via `@react-native-firebase`
**Display:** Notifee (already installed, v9.1.8)
**App IDs:** `com.predcarepatient` on both platforms. Apple team `88X8RN3KC7`.

---

## 1. Goal

A patient receives every notification reliably, whether the app is in the foreground, in the background or killed. Tapping one opens the right screen. Incoming video calls reach the patient even when the app is closed, which sockets can't do today.

### Done means

- Appointment, prescription, health record and call pushes arrive in all three app states, on both platforms.
- Every tap lands on the same screen as the matching row in the in-app notification list.
- Tokens stay correct through login, logout, account switch, token rotation and reinstall.
- A logged-out device receives nothing.
- No medical detail appears in a push payload or on the lock screen.

---

## 2. Current state

| Area | What exists | Gap |
|---|---|---|
| Firebase | Nothing: no packages, config files or Gradle plugin | Everything in Phases 0–2 |
| Local notifications | Notifee channels, press routing and foreground service in `src/services/notifications/` | Reuse. Add remote messages to it |
| Device identity | `LoginScreen.tsx:161-166` and `RegisterScreen.tsx:169-174` send `device_id`, `fcm_token`, etc. as `""` | Send real values (also `analyse.md` W4-04) |
| Token refresh | No client call or endpoint in `endpoints.ts` | Needs a new backend endpoint (section 8) |
| Logout | `userLogout` accepts `device_id`. `useAuthStore.logout` keeps `@fcm_token` | Unlink the device and delete the token |
| Tap routing | `resolveNotificationModalNavigation` in `src/lib/common/notificationModal.utils.ts` already maps events to screens | Reuse it for pushes |
| Cold-start routing | `consumeTargetRoute()` exists in `navigation.utils.ts`, but nothing ever sets `pendingRoute` | Add a setter and connect it |
| Incoming calls | Socket only (`SocketListeners.tsx`). Join logic lives inside `GlobalIncomingCallBanner.tsx` | Add a push path and extract the join logic |
| Android | `POST_NOTIFICATIONS` declared, `res/raw/ringtone.mp3` present | No monochrome notification icon, no call channel |
| iOS | `AppDelegate.swift` uses a `SceneDelegate`. `UIBackgroundModes` is `audio`, `voip` | No entitlements file, no `remote-notification` mode, ringtone is `.mp3` only |
| Doctor app | Same empty `fcm_token` fields, no Firebase | Nothing to copy. Can reuse this work later |

Existing problems this work has to deal with:

- **Duplicate enum name:** `NotificationCategory` exists in both `src/config/notification.constants.ts` and `src/services/notifications/notification.types.ts`, with different values. Extend only the services one.
- **Missing channel:** `NOTIFICATION_CHANNELS.APPOINTMENTS` is defined, but `initNotificationChannels` never creates it.
- **Hard-coded doctor name:** `useIncomingCallStore` falls back to `'Dr. Sahil Mallick'`. A push with no name would show that name to a patient. Change the fallback to generic text.
- **Noisy API errors:** `apiClient.ts` shows an error toast for most failed calls. Background token sync must not trigger one.

---

## 3. Architecture

```text
 Backend event (appointment, prescription, call...)
        │  FCM HTTP v1 API (service account)
        ▼
 Firebase Cloud Messaging ──(Android)──► device
        │
        └──(APNs auth key)──► Apple APNs ──► iOS device
                                                │
                   ┌────────────────────────────┤
                   ▼                            ▼
            App in foreground            Background / killed
            onMessage                    System shows the alert, or
                   │                     background handler + Notifee (Android calls)
                   ▼                            │
            Notifee / call banner               │  user taps
                   └───────────┬────────────────┘
                               ▼
              pushNotification.handler.ts
                               ▼
              resolveNotificationModalNavigation()
                               ▼
         navigate now, or hold the route until Splash finishes
```

### Decisions

| # | Decision | Reason |
|---|---|---|
| D1 | FCM on both platforms, using `@react-native-firebase/app` and `/messaging` | One backend integration and one token type |
| D2 | Keep Notifee for display. Firebase only delivers | Channels, press handling and the foreground service already use it |
| D3 | Normal notifications are sent as **notification + data** | The system shows them even if the app process can't start |
| D4 | Android incoming calls are **data-only, high priority**. iOS calls are **alert pushes** | Android needs a looping ring and call styling. iOS throttles silent pushes and doesn't deliver them to swiped-away apps |
| D5 | No silent or `content-available` pushes on iOS | Avoids a headless launch and the `isHeadless` handling it requires |
| D6 | Push payload has the same fields as `INotificationDoc` | Push and in-app list share one routing function |
| D7 | One Firebase project with separate apps for patient and doctor. Reuse a project if one already exists | The backend needs one service account |
| D8 | Use `react-native-device-info` for `device_id`, name and versions | Needs no storage, so it survives logout. Also replaces the hard-coded version |
| D9 | PushKit and CallKit are not in this version (section 11) | FCM can't send VoIP pushes, so this needs a direct APNs integration |

---

## 4. Phase 0: Credentials and console setup

### What each platform needs

| Platform | Certificate or key | Where it goes |
|---|---|---|
| Android | **No certificate.** Just `google-services.json` | `android/app/` |
| iOS | **APNs Auth Key (`.p8`)** | Uploaded to Firebase, never in the repo |
| iOS | `GoogleService-Info.plist` | `ios/predcarepatient/` |
| Backend | Firebase **service account JSON** | Backend secret manager, never in the repo |

Use a `.p8` key rather than `.p12` certificates. It doesn't expire yearly, and one key covers both sandbox and production.

### 4.1 Firebase project

1. Open <https://console.firebase.google.com> and create or select the PRED Care project.
2. Add an **Android app** with package `com.predcarepatient`.
   - Download `google-services.json`.
   - SHA-1 and SHA-256 fingerprints aren't required for FCM. Add them anyway so other Firebase services work later:
     ```bash
     cd android && ./gradlew signingReport
     ```
   - If Play App Signing is on, also add the SHA values from Play Console → App integrity.
3. Add an **iOS app** with bundle ID `com.predcarepatient`, and enter the App Store ID if there is one. Download `GoogleService-Info.plist`.
4. Confirm **Cloud Messaging API (V1)** shows as enabled under Project settings → Cloud Messaging.

### 4.2 Apple Developer

1. Go to Certificates, Identifiers & Profiles → Identifiers → `com.predcarepatient`, and enable **Push Notifications**.
2. Also enable **Time Sensitive Notifications** on the identifier, if listed, for call alerts.
3. Go to Keys → **+**, name it `PRED Care APNs`, tick **Apple Push Notifications service (APNs)** and download the file.
   - **The `.p8` can only be downloaded once.** Store it in the team password manager.
   - Record the **Key ID**. The Team ID is `88X8RN3KC7`.
4. In Firebase: Project settings → Cloud Messaging → your iOS app → APNs Authentication Key → upload the `.p8` with its Key ID and Team ID.
5. Regenerate provisioning profiles if signing is manual. Automatic signing handles this after the capability is added.

### 4.3 Backend credential

1. Firebase: Project settings → Service accounts → **Generate new private key**.
2. Give the JSON to the backend team through a secret manager. Don't send it over chat or email.

### 4.4 Repo protection

Add to `.gitignore`:

```gitignore
*.p8
*.p12
*firebase-adminsdk*.json
*service-account*.json
```

`google-services.json` and `GoogleService-Info.plist` are client config and get committed, so every machine can build. Restrict the API keys to these app IDs in Google Cloud Console.

**Phase 0 is done when** the Firebase console lists both apps with the APNs key uploaded, and the backend holds the service account.

---

## 5. Phase 1: Build compatibility check

Do this on a throwaway branch before any feature work, because it carries the highest build risk.

The stack is very recent: RN 0.87.1, New Architecture, Gradle 9.4.1, AGP in new-DSL mode, Kotlin 2.2.0. **Versions aren't pinned in this plan and compatibility hasn't been confirmed.** Check the current requirements at <https://rnfirebase.io> when installing.

```bash
npm install @react-native-firebase/app @react-native-firebase/messaging react-native-device-info
```

Pass criteria:

- [ ] Android debug and release builds both succeed with the Google Services plugin.
- [ ] iOS debug and release builds both succeed.
- [ ] **A video call still works on both platforms, including PiP and camera.**
- [ ] `getToken()` returns a token on a physical device on each platform.

The last-but-one check matters because the iOS change below affects how native pods link, and this app has `react-native-webrtc`, custom `pipmode` native code and a bridging header.

**iOS linking.** `@react-native-firebase` documents static frameworks as a requirement, but this project doesn't use frameworks today:

```ruby
# ios/Podfile — documented path
$RNFirebaseAsStaticFramework = true
use_frameworks! :linkage => :static
```

If that breaks WebRTC, PiP or the InCallManager header path, fall back to modular headers for the Firebase dependencies only, leaving everything else as it is:

```ruby
pod 'FirebaseCore', :modular_headers => true
pod 'GoogleUtilities', :modular_headers => true
```

Record which option worked in this document.

---

## 6. Phase 2: Native setup

### 6.1 Android

**`android/build.gradle`**, in `buildscript.dependencies`:

```groovy
classpath("com.google.gms:google-services:<version from Firebase console>")
```

**`android/app/build.gradle`**, after the existing plugins:

```groovy
apply plugin: "com.google.gms.google-services"
```

**`android/app/src/main/AndroidManifest.xml`**:

```xml
<uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />
```

Android 14+ only grants this by default to calling and alarm apps, and Google Play requires a declaration. If it's denied, the call falls back to a ringing heads-up notification. That's acceptable, so the code doesn't need a separate path for it.

**Notification icon.** Add `res/drawable-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/ic_notification.png`, white on transparent. The launcher icon would render as a solid square in the status bar.

**`firebase.json`** at the repo root. Use this rather than manifest `meta-data`, to avoid merge conflicts:

```json
{
  "react-native": {
    "messaging_android_notification_channel_id": "general",
    "messaging_android_notification_color": "@color/notification_accent",
    "messaging_android_headless_task_timeout": 30000
  }
}
```

Define `notification_accent` in `res/values/colors.xml`, using the brand colour from `theme.styled.ts`. The small icon is set per message by the backend (`android.notification.icon = "ic_notification"`), or through a `default_notification_icon` manifest entry.

### 6.2 iOS

In Xcode, with `predcarepatient.xcworkspace` open:

1. Drag `GoogleService-Info.plist` into the `predcarepatient` group and tick **Target Membership**.
2. Signing & Capabilities → **+ Push Notifications**. This creates `ios/predcarepatient/predcarepatient.entitlements`.
3. Background Modes → tick **Remote notifications**. Keep `audio` and `voip`.
4. **+ Time Sensitive Notifications**.
5. Convert the ringtone, since APNs sounds must be `.caf`, `.aiff` or `.wav` and under 30 seconds. Add the result to the target, and keep the `.mp3` for the in-app banner:
   ```bash
   afconvert ios/predcarepatient/ringtone.mp3 ios/predcarepatient/ringtone.caf -d ima4 -f caff
   ```

**`ios/predcarepatient/AppDelegate.swift`**:

```swift
import FirebaseCore   // new

func application(...didFinishLaunchingWithOptions...) -> Bool {
  FirebaseApp.configure()   // new, first line
  let delegate = ReactNativeDelegate()
  // ...unchanged
}
```

Then `cd ios && pod install`.

**Scene lifecycle risk.** This app starts React from `SceneDelegate` and passes the launch options from `didFinishLaunching`. With scenes, a notification that cold-starts the app arrives through `connectionOptions.notificationResponse`, not those launch options. Notifee and Firebase also both hook `UNUserNotificationCenter`. Test killed-app taps on a physical iPhone early (case 4 in section 10). If `getInitialNotification` comes back empty, that's the first place to look.

`voip` is declared in `UIBackgroundModes` with no PushKit code. Be ready to justify or remove it at App Store review.

---

## 7. Phase 3: App code

### 7.1 File and folder structure

`A` = add, `M` = modify.

```text
predcarepatient/
├── firebase.json                                    A
├── index.js                                         M  register background handler
├── .gitignore                                       M  block secrets
├── docs/pushnotifyplan.md                           A  this file
├── android/
│   ├── build.gradle                                 M  google-services classpath
│   └── app/
│       ├── build.gradle                             M  apply plugin
│       ├── google-services.json                     A
│       └── src/main/
│           ├── AndroidManifest.xml                  M  full-screen intent permission
│           └── res/
│               ├── drawable-*/ic_notification.png   A
│               └── values/colors.xml                A or M
├── ios/
│   ├── Podfile                                      M  linking from Phase 1
│   └── predcarepatient/
│       ├── AppDelegate.swift                        M  FirebaseApp.configure()
│       ├── Info.plist                               M  remote-notification mode
│       ├── GoogleService-Info.plist                 A
│       ├── predcarepatient.entitlements             A
│       └── ringtone.caf                             A
└── src/
    ├── services/
    │   ├── api/
    │   │   ├── endpoints.ts                         M  device endpoint
    │   │   └── apiClient.ts                         M  no toast for device sync
    │   └── notifications/
    │       ├── index.ts                             M  exports
    │       ├── notification.types.ts                M  push types, new category
    │       ├── notification.core.ts                 M  new channels, display helpers
    │       ├── notificationDispatcher.ts            M  route remote presses
    │       ├── components/
    │       │   └── NotificationEventListener.tsx    M  FCM listeners, cold start
    │       ├── handlers/
    │       │   ├── pushNotification.handler.ts      A  tap to navigation
    │       │   └── incomingCallPush.handler.ts      A  ring, cancel, expiry
    │       └── push/
    │           ├── pushMessage.background.ts        A  setBackgroundMessageHandler
    │           ├── pushMessage.foreground.ts        A  onMessage
    │           ├── pushPayload.ts                   A  parse, validate, dedupe
    │           └── pushToken.service.ts             A  get, sync, refresh, delete
    ├── lib/common/
    │   ├── asyncStorage.ts                          M  synced-user key
    │   ├── deviceInfo.ts                            A  device fields for APIs
    │   └── navigation.utils.ts                      M  setTargetRoute, clear
    ├── hooks/
    │   ├── commons/meeting/joinIncomingCall.ts      A  extracted join logic
    │   └── react-query/notifications/
    │       └── notifications.funcs.ts               M  registerDevice
    ├── zustand/stores/
    │   ├── useAuthStore.ts                          M  token cleanup on logout
    │   └── useIncomingCallStore.ts                  M  generic fallback name
    ├── components/commons/
    │   ├── IncomingCallBanner/GlobalIncomingCallBanner.tsx  M  use joinIncomingCall
    │   └── Sockets/SocketListeners.tsx              M  cancel the call notification
    └── Features/
        ├── Auth/LoginScreen.tsx                     M  real device fields
        ├── Auth/RegisterScreen.tsx                  M  real device fields
        ├── SplashScreen/SplashScreen.tsx            M  wait for initial push, back stack
        └── Dashboard/HomeScreen/HomeScreen.tsx      M  ask permission
```

### 7.2 Android channels

Add to `NOTIFICATION_CHANNELS` in `notification.core.ts`. Android locks a channel's sound and importance once it's created, so **get these right before the first release**. Changing them later needs a new channel ID.

| Channel ID | Used for | Importance | Sound |
|---|---|---|---|
| `incoming-calls` | Doctor calling | HIGH | `ringtone` |
| `appointments` | Bookings, reminders, reschedules (defined, not yet created) | HIGH | default |
| `general` | Prescriptions, records, everything else, and the `firebase.json` fallback | DEFAULT | default |
| `pdf_downloads`, `meeting-ongoing` | Existing, unchanged | | |

The background handler runs without React mounting, so it must call `initNotificationChannels()` before displaying anything.

### 7.3 Device identity: `src/lib/common/deviceInfo.ts`

```ts
export const getDeviceFields = async () => ({
  device_id: await DeviceInfo.getUniqueId(),
  device_name: await DeviceInfo.getModel(),
  platform: Platform.OS,
  os_version: DeviceInfo.getSystemVersion(),
  app_version: DeviceInfo.getVersion(),
  fcm_token: await getPushTokenSafely(), // never blocks login
});
```

Replace the empty strings in `LoginScreen.tsx` and `RegisterScreen.tsx` with these fields.

`getPushTokenSafely` must time out after about 3 seconds and return `""` on failure. Devices without Google Play services, or on poor networks, must still be able to log in. The sync in 7.4 catches up afterwards.

### 7.4 Token lifecycle: `push/pushToken.service.ts`

| Moment | Action |
|---|---|
| OTP verify (login or register) | Send `getDeviceFields()` in the existing payload |
| App start with a valid session (after Splash loads the profile) | `syncPushToken()` |
| `onTokenRefresh` | Save the new token and call the device endpoint |
| Intentional logout | Call `userLogout({ all_devices: false, device_id })` **while the auth token is still valid**, then `deleteToken()`, then clear storage |
| Session expired (401) | `deleteToken()` only, then clear storage |
| Splash finds no auth token | `deleteToken()` only if `@fcm_token` exists, so fresh launches don't do needless work |

```ts
export const syncPushToken = async (userId: string | number) => {
  const token = await getToken(getMessaging());
  const synced = await getObject<{ token: string; userId: string | number }>(
    STORAGE_KEYS.FCM_SYNCED
  );
  if (synced?.token === token && synced?.userId === userId) return;
  await registerDevice({ ...(await getDeviceFields()), fcm_token: token });
  await setObject(STORAGE_KEYS.FCM_SYNCED, { token, userId });
};
```

- The sync marker includes `userId`. Otherwise, a second patient logging in on the same phone would look "already synced" and get the first patient's pushes.
- Add `FCM_SYNCED: '@fcm_synced'` to `STORAGE_KEYS`. Logout clears it automatically, because it isn't in the exclude list.
- In `useAuthStore.logout`, stop preserving `FCM_TOKEN`: change `clearStorageExcept([STORAGE_KEYS.FCM_TOKEN, storageKey])` to `clearStorageExcept([storageKey])`. The token is deleted on logout, so keeping it would keep a stale value.
- On iOS, `getToken` needs APNs registration to finish first. `messaging_ios_auto_register_for_remote_messages` handles this by default. Retry once if the first call fails.
- In `apiClient.ts`, skip `globalError` for the device endpoint. A 401 there should still follow the normal logout path.

### 7.5 Permission

- Don't ask at launch. Call the existing `requestNotificationPermission()` from `notification.core.ts` once, on the first `HomeScreen` visit after login, once the patient has reached the app.
- Before the system prompt, show a short explanation through the existing popup component: "Get alerts when your doctor calls and reminders for your appointments". iOS only allows one system prompt, so a patient who declines can only re-enable in Settings.
- If permission is denied, the app still works. Keep the token registered, so pushes start working if the patient enables notifications later.
- `react-native-permissions` already has a duplicate `requestNotificationPermission` in `useDevicePermissions.ts`. Use only the Notifee one for this flow.

### 7.6 Receiving messages

Use the modular Firebase API (`getMessaging`, `onMessage`, etc.), since the namespaced `messaging()` form is deprecated.

**`index.js`**: must run before `AppRegistry.registerComponent`:

```js
import { registerBackgroundPushHandler } from './src/services/notifications';

registerBackgroundNotificationHandler(); // existing
registerBackgroundPushHandler();         // new
```

| App state | Normal notification | Android call | iOS call |
|---|---|---|---|
| **Foreground** | `onMessage` → Notifee display and refresh the unread count | `onMessage` → existing banner, no system notification | `onMessage` → existing banner, no system notification |
| **Background** | System displays | Background handler → Notifee ringing notification | System displays with `ringtone.caf` |
| **Killed** | System displays | Background handler → Notifee ringing notification | System displays with `ringtone.caf` |

Foreground handling also invalidates the notification count and list queries in React Query, so the bell badge updates.

**Background handler rules:**

1. Don't navigate, show toasts or touch UI. There is no UI in that context.
2. Check `@auth_token` first and ignore the message if logged out.
3. On Android, a high-priority data message **must** show a notification. FCM lowers the priority of apps that don't.
4. Finish quickly and always `await` the display call.

### 7.7 Payload parsing: `push/pushPayload.ts`

- FCM data values are all strings, so convert IDs as needed. `metadata` arrives as a JSON string, which `parseNotificationMetadata` already handles.
- Unknown or malformed messages are ignored with a warning and never crash.
- Keep recent `push_id`s in memory to drop duplicates. On iOS, Notifee and Firebase may both report the same tap.

### 7.8 Tap handling: `handlers/pushNotification.handler.ts`

There are two tap sources, and both must end in the same function:

| Source | How it arrives |
|---|---|
| Displayed by the system | Firebase `onNotificationOpenedApp`, `getInitialNotification` |
| Displayed by Notifee | `routeNotificationPress`: add a `REMOTE_PUSH` case to `NotificationCategory` |

Behaviour of `handlePushPress(data)`:

1. Ignore it if the `push_id` was already handled, or the patient is logged out and the type needs auth.
2. Incoming call → section 7.9.
3. Otherwise, call `resolveNotificationModalNavigation(data)`.
4. Navigate immediately if `navigationRef` is ready and the current route isn't `Splash`. Otherwise call `setTargetRoute(route)`.

**Changes in `navigation.utils.ts`:** add `setTargetRoute`, the missing setter for `pendingRoute`, and `clearTargetRoute`, called on logout.

**Changes in `SplashScreen.tsx`:**

- `getInitialNotification` is asynchronous and can resolve after Splash has already moved on. Export an `initialPushReady` promise that resolves when both initial notification checks finish, and `await` it with a 1-second limit before calling `consumeTargetRoute()`.
- Line 106 currently resets to `routes: [target]`, so pressing back exits the app. Use `{ index: 1, routes: [{ name: AppRoute.HOME }, target] }`.
- If the patient isn't logged in, keep the pending route. After OTP login, consume it in place of the default Home navigation. Patients still go through email verification and policy acceptance first, as they do today.

`NotificationEventListener` calls `routeNotificationPress` as soon as it mounts, which can be before navigation is ready. Pushes must go through the pending route instead of relying on that timing.

### 7.9 Incoming calls: `handlers/incomingCallPush.handler.ts`

**Extract first.** Move the body of `handleJoin` from `GlobalIncomingCallBanner.tsx` to `src/hooks/commons/meeting/joinIncomingCall.ts`. The behaviour stays exactly the same.

**Android ringing notification** (from the background handler):

```ts
await notifee.displayNotification({
  id: `call:${data.meeting_id}`,
  title: data.doctor_name,
  body: 'Incoming video consultation',
  data: { ...data, type: NotificationCategory.REMOTE_PUSH },
  android: {
    channelId: NOTIFICATION_CHANNELS.INCOMING_CALLS.id,
    category: AndroidCategory.CALL,
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PRIVATE,
    ongoing: true,
    loopSound: true,
    timeoutAfter: remainingMs(data.call_expires_at),
    smallIcon: 'ic_notification',
    pressAction: { id: 'default' },
    fullScreenAction: { id: 'default' },
  },
});
```

**Flow on tap (all app states):**

1. If `call_expires_at` has passed, open `AppointmentDetails` for that appointment and show "This call has ended".
2. Otherwise, keep the call pending until Splash finishes, then call `showCallBanner()`. Don't do this during Splash, because its navigation reset would wipe a Meeting screen opened on top. `navigate()` also silently does nothing before navigation is ready.
3. The patient taps Join on the existing banner, which still handles permissions, tracks and the token.

**Skip the alert when:**

- A meeting is already active (`useMeetingStore.callInfo?.meetingId`).
- The banner is already showing the same `meeting_id`, which is what happens when socket and push both arrive.

**Ending the ring:**

| Trigger | Android | iOS |
|---|---|---|
| Doctor cancels | `call_cancelled` data push → `cancelNotification('call:<id>')` | Backend sends a "Missed call" alert with the same `apns-collapse-id`, which replaces the original |
| Socket `incoming_call_cancelled` | Add `cancelNotification` to `SocketListeners.tsx` | Same, for any delivered notification |
| No answer | `timeoutAfter` | Sound stops at the file's end, under 30 seconds |
| Patient joins | Cancel in `joinIncomingCall` | Same |

**Lock screen.** This version doesn't add `showWhenLocked` to `MainActivity`. That flag would show the whole app above the lock screen, exposing health data. A locked phone rings and shows the call notification, and the patient unlocks to reach the banner. Revisit this if testing shows it costs too many missed calls.

---

## 8. Phase 4: Backend contract

The backend isn't in this repo, so **confirm these with the backend team before starting Phase 3**. Endpoint names below are proposals.

### 8.1 Confirm first

1. Does `/auth/verify-login-otp` and `/auth/patient/verify-otp` already store `fcm_token` and `device_id`?
2. Does `/auth/logout` remove the token for that `device_id`?
3. Does any FCM sending code already exist, and does it use the HTTP v1 API? The legacy API no longer works.
4. Is there a decline-call endpoint? If so, Android can gain a Decline button.

### 8.2 New endpoint

```http
POST /api/v1/users/device-token
Authorization: Bearer <token>

{ "device_id": "...", "fcm_token": "...", "platform": "android",
  "device_name": "...", "os_version": "...", "app_version": "1.0.0" }
```

Rules:

- **Upsert by `device_id`**, and assign the device to the current user. One device has only one owner, which is what stops a previous patient's pushes reaching the next one.
- One user can have several devices, so send to all of them.
- Delete a token when FCM returns `UNREGISTERED`. Retry `UNAVAILABLE` and `INTERNAL` with backoff.

### 8.3 Data payload

Every message includes these. They mirror `INotificationDoc`:

```json
{
  "push_id": "unique-id",
  "notification_id": "123",
  "event_category": "appointment",
  "event_action": "appointment_confirmed",
  "type": "APPOINTMENT",
  "associate_appointment_id": "456",
  "associate_patient_id": "789",
  "metadata": "{\"appointment_id\":\"456\"}"
}
```

Total payload limit is 4 KB, and every value must be a string.

### 8.4 Normal notification

```json
{
  "message": {
    "token": "<fcm_token>",
    "notification": { "title": "Appointment confirmed", "body": "Tap to view details" },
    "data": { "...": "section 8.3" },
    "android": {
      "priority": "high",
      "notification": { "channel_id": "appointments", "icon": "ic_notification" }
    },
    "apns": { "payload": { "aps": { "sound": "default", "badge": 1 } } }
  }
}
```

### 8.5 Incoming call

The backend picks the shape by the device's stored `platform`. Send it alongside the existing socket event, not instead of it.

**Android (data-only):**

```json
{
  "message": {
    "token": "<fcm_token>",
    "android": { "priority": "high", "ttl": "45s" },
    "data": {
      "push_id": "unique-id",
      "event_category": "appointment",
      "event_action": "incoming_video_call",
      "type": "VIDEO_CALL_ROOM",
      "associate_appointment_id": "456",
      "meeting_id": "abc-defg",
      "doctor_name": "Dr. Name",
      "call_type": "video",
      "call_expires_at": "2026-11-02T10:00:45Z"
    }
  }
}
```

**iOS (alert):**

```json
{
  "message": {
    "token": "<fcm_token>",
    "notification": { "title": "Dr. Name", "body": "Incoming video consultation" },
    "data": { "...": "same as Android" },
    "apns": {
      "headers": {
        "apns-priority": "10",
        "apns-push-type": "alert",
        "apns-collapse-id": "call-456",
        "apns-expiration": "<now + 45s, unix seconds>"
      },
      "payload": {
        "aps": { "sound": "ringtone.caf", "interruption-level": "time-sensitive" }
      }
    }
  }
}
```

**Cancel:** Android gets a data-only message with `event_action: "call_cancelled"` and the `meeting_id`. iOS gets a "Missed call" alert with the same `apns-collapse-id`.

### 8.6 Events to send

Action names marked ✓ are already in the app's routing code. Confirm the rest against the backend's list.

| Event | Action | Opens | Channel |
|---|---|---|---|
| Doctor calling | `incoming_video_call` ✓ | Call banner | `incoming-calls` |
| Appointment booked, changed, cancelled | `appointment_*` ✓ | `AppointmentDetails` | `appointments` |
| Appointment reminder | `appointment_reminder` | `AppointmentDetails` | `appointments` |
| Prescription created, updated, resent | `prescription_created` / `_updated` / `_resent` ✓ | `PrescriptionDetail` | `general` |
| Health record added | `emr_document_uploaded` / `_shared` ✓ | `HealthRecordFolder` | `general` |
| Anything else | | `Home` | `general` |

Support ticket replies and invoices currently fall through to `Home`. Add cases to `resolveNotificationModalNavigation` if the backend will send them.

### 8.7 Privacy rules

This is health data and it passes through Google and Apple servers, so:

- **Never put these in a push:** diagnosis, medicines, test results, document contents, or the patient's full name.
- Doctor and clinic name are acceptable in appointment and call alerts. Confirm this with whoever owns compliance.
- Use generic text such as "A new prescription is available", and load details from the API after login.
- Use `visibility: PRIVATE` on Android for anything that isn't generic.

---

## 9. Implementation order

| # | Phase | Owner | Depends on |
|---|---|---|---|
| 1 | Credentials and console (section 4) | Account owner, Apple admin | |
| 2 | Backend questions answered (8.1) | Backend, mobile | |
| 3 | Build compatibility check (section 5) | Mobile | 1 |
| 4 | Native setup (section 6) | Mobile | 3 |
| 5 | Device fields and token lifecycle (7.3–7.4), device endpoint (8.2) | Mobile, backend | 2, 4 |
| 6 | Permission, channels, receive and tap for normal pushes (7.2, 7.5–7.8) | Mobile | 5 |
| 7 | Backend sends normal events (8.4, 8.6) | Backend | 5 |
| 8 | Incoming call push (7.9, 8.5) | Mobile, backend | 6, 7 |
| 9 | Full test pass (section 10) | QA, mobile | 8 |
| 10 | Store release (section 12) | Mobile | 9 |

Steps 5 to 7 can ship on their own. Calls are the riskiest part, so keeping them separate means normal notifications aren't held up.

Use **Firebase console → Messaging → Send test message** with a device token from step 4, so mobile work on tap handling doesn't have to wait for the backend. Data-only messages can't be sent from the console, so use a small script with the service account, kept outside the repo, for call tests.

---

## 10. Test plan

**Use physical devices.** Simulators and emulators aren't reliable for this. Include at least one Xiaomi, Oppo, Vivo or Samsung phone, since aggressive battery management on these brands is the most common cause of missing Android pushes in India.

### Delivery and tap

| # | Case | Android | iOS |
|---|---|---|---|
| 1 | Foreground: notification shows, badge updates | ☐ | ☐ |
| 2 | Background: shows, tap opens correct screen | ☐ | ☐ |
| 3 | Killed: shows | ☐ | ☐ |
| 4 | Killed: tap opens correct screen, back goes to Home | ☐ | ☐ |
| 5 | Tap while logged out: login, then correct screen | ☐ | ☐ |
| 6 | Each row in 8.6 opens its screen | ☐ | ☐ |
| 7 | A single tap never navigates twice | ☐ | ☐ |
| 8 | Device in Doze or Low Power Mode, screen off for 30+ minutes | ☐ | ☐ |

### Tokens

| # | Case | Android | iOS |
|---|---|---|---|
| 9 | Login stores real device fields on the backend | ☐ | ☐ |
| 10 | Existing logged-in user updates the app: token syncs without re-login | ☐ | ☐ |
| 11 | Logout: no more pushes | ☐ | ☐ |
| 12 | Patient A logs out, B logs in: only B gets pushes | ☐ | ☐ |
| 13 | Session expiry (401): no more pushes | ☐ | ☐ |
| 14 | Reinstall: new token registered, old one removed after `UNREGISTERED` | ☐ | ☐ |
| 15 | Login with Firebase unavailable: still succeeds | ☐ | ☐ |
| 16 | Failed token sync shows no error toast | ☐ | ☐ |

### Incoming calls

| # | Case | Android | iOS |
|---|---|---|---|
| 17 | Foreground: one banner, no system notification, one ringtone | ☐ | ☐ |
| 18 | Background: rings, tap shows banner, Join connects | ☐ | ☐ |
| 19 | Killed: rings, tap shows banner, Join connects | ☐ | ☐ |
| 20 | Locked phone: rings, reach the banner after unlock | ☐ | ☐ |
| 21 | Doctor cancels: ring stops or shows Missed call | ☐ | ☐ |
| 22 | No answer: ring stops; tapping late shows "call has ended" | ☐ | ☐ |
| 23 | Already in a meeting: second call doesn't interrupt | ☐ | ☐ |
| 24 | In PiP: call push doesn't break the current call | ☐ | ☐ |
| 25 | Camera or mic permission denied on Join: same error as today | ☐ | ☐ |

### Permission and regressions

| # | Case | Android | iOS |
|---|---|---|---|
| 26 | Prompt appears once, after login, with explanation first | ☐ | ☐ |
| 27 | Denied: app works; enabling in Settings later starts delivery | ☐ | ☐ |
| 28 | Android 12 and below (no runtime permission) | ☐ | n/a |
| 29 | Existing PDF download notification still opens the file | ☐ | ☐ |
| 30 | Ongoing-call notification and foreground service still work | ☐ | n/a |
| 31 | **Release build** repeats cases 3, 4, 19 (Play internal track, TestFlight) | ☐ | ☐ |

Case 31 is required. iOS debug builds use the APNs sandbox and TestFlight uses production, so a debug pass doesn't prove production works.

### When a push doesn't arrive

1. Is the token on the backend the one on the device?
2. Does the Firebase test message reach that token? If yes, the problem is in the backend or payload. If no, the problem is on the device or in credentials.
3. iOS: is the APNs key uploaded, does the bundle ID match, and are the entitlements present in the signed build?
4. Android: is the channel blocked, or is battery optimisation restricting the app? Force-stopped Android apps receive nothing until reopened. That's how Android works, and no code can change it.
5. Are the app's notifications turned off in system settings?

---

## 11. Known limitations

| Limitation | Effect | What would change it |
|---|---|---|
| iOS call push rings once, for under 30 seconds, as a normal notification | No native full-screen call UI on iOS | PushKit and CallKit in a later phase: a VoIP key or certificate, direct backend-to-APNs sending (FCM can't do it), and native call code |
| iPhone Focus or silent mode can quiet alerts | Patient may miss a call | Time Sensitive helps if Focus allows it. CallKit is the full fix |
| Force-stopped Android apps get no pushes | No delivery until reopened | None. Some brands force-stop on swipe, so add a battery-settings tip later if support tickets show this |
| Android 14+ full-screen intent may not be granted | Heads-up notification rather than full-screen | Play Console declaration (section 12) |
| Android has no `showWhenLocked` in this version | Patient must unlock to answer | A dedicated lock-screen call activity |
| Dev and production share one bundle ID, one Firebase app | Test sends need care not to reach real users | Build flavours and separate apps |

If iOS call reliability matters, measure answer rates after launch and decide on CallKit with that data.

---

## 12. Release checklist

**Google Play**
- [ ] Full-screen intent declaration in Play Console → App content, describing doctor video calls.
- [ ] Data safety form updated: device identifiers, app interactions.
- [ ] `versionCode` increased.

**App Store**
- [ ] App Privacy answers updated: device ID, and Firebase data collection.
- [ ] Decision taken on `voip` background mode (section 6.2).
- [ ] Provisioning profile includes Push Notifications. Check `aps-environment` is `production` in the archive.

**Project**
- [ ] `.p8` stored in the team password manager, with Key ID noted.
- [ ] No keys or service accounts in git: `git log --all --stat -- '*.p8' '*service-account*'`.
- [ ] `analyse.md` W4-04 marked resolved.
- [ ] Update `APP_VERSION` and `APP_BUILD` handling in `constants.ts` to use device info.

**After release**
- [ ] Watch the Firebase delivery reports and the backend's `UNREGISTERED` rate for the first week.

---

## 13. Separate security issue

`android/gradle.properties` is tracked in git and contains the release keystore passwords. This doesn't block push work, but it should be fixed separately: move them to `~/.gradle/gradle.properties` or CI secrets, then treat the passwords as exposed and follow Google's upload-key reset process. The `.jks` file itself is ignored by git.

Also, `build.gradle` silently signs release builds with the debug keystore if those properties are missing. Once the passwords move, a machine without them would produce a debug-signed release build, so make that case fail the build. It would also give a wrong SHA for any Firebase service relying on fingerprints.

---

## 14. References

- React Native Firebase: <https://rnfirebase.io> (Messaging: <https://rnfirebase.io/messaging/usage>)
- Notifee: <https://notifee.app/react-native/docs/overview>
- FCM HTTP v1 send API: <https://firebase.google.com/docs/cloud-messaging/send-message>
- Apple, registering with APNs: <https://developer.apple.com/documentation/usernotifications/registering-your-app-with-apns>
- Android full-screen intent: <https://developer.android.com/develop/ui/views/notifications/time-sensitive>
