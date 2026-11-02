# Push Notification Setup Plan: PRED Care Patient App (Android and iOS)

**Status:** plan only, no code changed yet. Do the steps in order.
**Goal:** a test message from the Firebase console shows up on a physical Android phone and a physical iPhone.
**Firebase project:** `predcare-ba1f9`
**App IDs:** `com.predcarepatient` on both platforms. Apple team `88X8RN3KC7`.
**Docs checked on 2026-11-02:** React Native Firebase `27.1.0` (Firebase Apple SDK `13.1.1`).

---

## What you need

| Platform | Item | Required? | Where it goes |
|---|---|---|---|
| Android | `google-services.json` | **Yes** | `android/app/` |
| Android | SHA fingerprints | Optional | Firebase console |
| iOS | `GoogleService-Info.plist` | **Yes** | `ios/predcarepatient/`, added in Xcode |
| iOS | APNs key (`.p8`) | **Yes** | Uploaded to Firebase, never in git |
| iOS | Push certificate (`.p12`) | **No** | Not used |

### Is a `.p12` required?

**No.** iOS needs one APNs credential in Firebase, and this plan uses the `.p8` key.

| | `.p8` key (use this) | `.p12` certificate (skip) |
|---|---|---|
| Expiry | Doesn't expire | Expires every year, then pushes stop until it's replaced |
| Apps covered | Every app in the Apple team | One app only |
| Sandbox and production | One key can cover both | Usually separate certificates |
| Official setup docs | The method both React Native Firebase and Firebase describe | Not covered in either setup page |

Android doesn't need any certificate for push.

Your normal Apple signing certificate and provisioning profile are a separate thing. Xcode still needs those to install the app on an iPhone.

### Requirements from the official docs

| Requirement | This project | OK? |
|---|---|---|
| React Native 0.75+ | 0.87.1 | Yes |
| New Architecture (messaging v26+) | Enabled on Android (`newArchEnabled=true`) | Yes |
| Xcode 26.2+, Swift 6.2.3+, macOS 15+ | Xcode 27.2, Swift 6.4.2, macOS 26.7.1 | Yes |
| Android `minSdk` 24 | 24 | Yes |
| **iOS dynamic frameworks** | **Not used today (static)** | **Needs a change, see step 8** |

---

## File and folder structure

`A` = add, `M` = modify.

```text
predcarepatient/
├── notifyfiles/                                  source copies, deleted after step 3
├── .gitignore                                    M  step 4: block secrets
├── package.json                                  M  step 6: Firebase packages
├── App.tsx                                       M  step 9: call setupPush
├── index.js                                      M  step 9: background handler
├── android/
│   ├── build.gradle                              M  step 7: google-services classpath
│   └── app/
│       ├── build.gradle                          M  step 7: apply plugin
│       └── google-services.json                  A  step 2: copied from notifyfiles
├── ios/
│   ├── Podfile                                   M  step 8: dynamic frameworks
│   ├── predcarepatient.xcodeproj/project.pbxproj M  steps 3 and 5: done by Xcode
│   └── predcarepatient/
│       ├── GoogleService-Info.plist              A  step 3: copied from notifyfiles
│       ├── predcarepatient.entitlements          A  step 5: created by Xcode
│       ├── Info.plist                            M  step 5: changed by Xcode
│       └── AppDelegate.swift                     M  step 8: FirebaseApp.configure()
└── src/services/notifications/
    ├── index.ts                                  M  step 9: exports
    └── push/pushSetup.ts                         A  step 9: permission, token, handlers
```

---

## Part 1: Console and config files

### Step 1. Android: add the fingerprints (optional)

The official docs say the signing certificate is optional and only required for features like Phone Authentication, so **push works without this step**. It's quick, so add them now.

Firebase console → Project settings → General → Your apps → **`com.predcarepatient`** → **Add fingerprint**. Add each value as a separate entry:

| Keystore | Type | Value |
|---|---|---|
| Debug | SHA-1 | `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` |
| Debug | SHA-256 | `FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C` |
| Release | SHA-1 | `6C:03:17:E7:6B:59:0F:71:DA:ED:5A:32:C3:21:3C:43:90:C9:AA:DF` |
| Release | SHA-256 | `5E:9E:A9:A6:6D:6A:43:90:F4:97:35:6F:0E:50:BA:9C:B2:16:4D:72:DC:77:A6:E6:F0:2B:D3:9B:B0:59:02:CE` |

These came from `cd android && ./gradlew :app:signingReport`. The debug values are the same ones the docs refer to under the `debugAndroidTest` variant.

### Step 2. Android: copy the config file

1. In the same Firebase screen, download `google-services.json` again and replace `notifyfiles/google-services.json`.
2. Copy it into the Android app:

```bash
cp notifyfiles/google-services.json android/app/google-services.json
```

The file also lists the two doctor app packages. That's fine: the Gradle plugin picks the `com.predcarepatient` entry.

### Step 3. iOS: copy the config file and add it to Xcode

```bash
cp notifyfiles/GoogleService-Info.plist ios/predcarepatient/GoogleService-Info.plist
```

Copying isn't enough on iOS, because the file must be part of the build target:

1. Open `ios/predcarepatient.xcworkspace` in Xcode.
2. Right-click the `predcarepatient` group → **Add Files to "predcarepatient"…** → select `GoogleService-Info.plist`.
3. Tick the **predcarepatient** target. **Copy items if needed** can stay off, since the file is already in the folder.

**Check:** target → Build Phases → **Copy Bundle Resources** lists `GoogleService-Info.plist`.

Then delete `notifyfiles/`, because the builds only read the platform copies.

### Step 4. iOS: APNs key and upload

1. Apple Developer → Certificates, Identifiers & Profiles → **Identifiers** → `com.predcarepatient` → enable **Push Notifications** → Save.
2. **Keys** → **+** → name it `PRED Care APNs` → tick **Apple Push Notifications service (APNs)**. If Apple asks for an environment, choose **Sandbox & Production**. If the team already has an APNs key, such as one for the doctor app, reuse it.
3. Download the `.p8` and note the **Key ID**. **It can only be downloaded once**, so store it in the team password manager.
4. Firebase → Project settings → **Cloud Messaging** → iOS app `com.predcarepatient` → **APNs Authentication Key** → **Upload** under both the development and production entries, with the Key ID and Team ID `88X8RN3KC7`.
5. Add to `.gitignore`:

```gitignore
*.p8
*.p12
```

**Check:** the Cloud Messaging page shows the key under the iOS app.

### Step 5. iOS: Xcode push notification changes

In Xcode: target **predcarepatient** → **Signing & Capabilities**, with the **All** tab selected so Debug and Release both get the change.

1. **+ Capability → Push Notifications.** This creates `predcarepatient.entitlements`.
2. **+ Capability → Background Modes**. It may already be there because of `audio` and `voip`. Tick **Background fetch** and **Remote notifications**. Leave `audio` and `voip` as they are.
3. Keep **Automatically manage signing** on, so Xcode updates the provisioning profile. If signing is manual, create a new profile in Apple Developer and assign it here.

**Check:**

```bash
grep -c CODE_SIGN_ENTITLEMENTS ios/predcarepatient.xcodeproj/project.pbxproj   # expect 2
plutil -p ios/predcarepatient/predcarepatient.entitlements                     # shows aps-environment
grep -A6 UIBackgroundModes ios/predcarepatient/Info.plist                      # shows fetch and remote-notification
```

---

## Part 2: Packages and native setup

### Step 6. Install the packages

Use a separate branch, because step 8 changes how every iOS pod links.

```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
```

### Step 7. Android native setup

**`android/build.gradle`**, in `buildscript.dependencies`:

```groovy
classpath("com.google.gms:google-services:4.5.0")
```

**`android/app/build.gradle`**, after the existing plugins:

```groovy
apply plugin: "com.google.gms.google-services"
```

`POST_NOTIFICATIONS` is already in `AndroidManifest.xml`, so no manifest change is needed.

**Check:** `npx react-native run-android` builds.

### Step 8. iOS native setup

**`ios/Podfile`**, inside `target 'predcarepatient' do`, right before `use_react_native!`:

```ruby
use_frameworks! :linkage => :dynamic
```

The official docs require **dynamic** linkage. Firebase Apple SDK 13+ is only available through Swift Package Manager, so these no longer work:

- `use_frameworks! :linkage => :static`: `pod install` rejects it.
- No `use_frameworks!` line, which is how this project is today: it counts as static, so `pod install` rejects it too.
- `$RNFirebaseDisableSPM` or Firebase CocoaPods with modular headers: not available for SDK 13+.

**`ios/predcarepatient/AppDelegate.swift`**:

```swift
import ReactAppDependencyProvider
import Firebase   // new

// ...
  ) -> Bool {
    FirebaseApp.configure()   // new, first line
    let delegate = ReactNativeDelegate()
    // ...unchanged
```

Then:

```bash
cd ios && pod install && cd ..
npx react-native run-ios --device
```

**Check:**

- [ ] `pod install` prints `RNFBApp: Using SPM for Firebase dependency resolution`.
- [ ] Target → Build Phases contains `[RNFB] Embed Firebase SPM Frameworks`.
- [ ] Debug and Release builds both succeed.
- [ ] **A video call still works, including camera and PiP.**

**Main risk:** this project has never been built with dynamic frameworks. It hasn't been tested with VideoSDK/WebRTC, Razorpay, Notifee, the `pipmode` native code, its bridging header, or the InCallManager header path in the `Podfile`. Check these first if the build fails. If they can't be fixed, the alternative is an older React Native Firebase version that still supports CocoaPods, which you'd need to confirm against that version's docs.

---

## Part 3: Get the token and send a test

### Step 9. Minimum code to receive a push

**`src/services/notifications/push/pushSetup.ts`** (new):

```ts
import {
  getMessaging,
  getToken,
  onMessage,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import { requestNotificationPermission } from '../notification.core';

// Runs outside React, so it's registered from index.js.
export const registerBackgroundPushHandler = () => {
  setBackgroundMessageHandler(getMessaging(), async () => {});
};

// Returns the foreground listener's unsubscribe function.
export const setupPush = async () => {
  await requestNotificationPermission();
  const token = await getToken(getMessaging());
  if (__DEV__) console.log('FCM token:', token);
  return onMessage(getMessaging(), async message => {
    if (__DEV__) console.log('Push in foreground:', message);
  });
};
```

Export both from `src/services/notifications/index.ts`.

**`index.js`**, after the existing `registerBackgroundNotificationHandler()`:

```js
registerBackgroundPushHandler();
```

**`App.tsx`**: call `setupPush()` once in a `useEffect` when the app starts, and call the returned unsubscribe function on cleanup.

`requestNotificationPermission` is the existing Notifee function, and it also covers Android 13+. The official docs mark Firebase's own `requestPermission` as deprecated.

### Step 10. Send a test message

1. Run the app on a **physical** device, allow notifications, and copy `FCM token:` from the log. iOS Simulators don't handle cloud messages.
2. Firebase console → **Messaging** → **New campaign** → **Notifications** → enter a title and text → **Send test message** → paste the token → **Test**.
3. Check each state:

| App state | Expected | Android | iOS |
|---|---|---|---|
| Foreground | **No banner.** `Push in foreground:` appears in the log | ☐ | ☐ |
| Background | Notification appears | ☐ | ☐ |
| Quit (swiped away) | Notification appears | ☐ | ☐ |

No banner in the foreground is normal: the official docs say the system doesn't show notifications while the app is open. An app force-stopped from Android settings receives nothing until it's opened again.

**Setup is finished when all six boxes are ticked.**

### If a push doesn't arrive

| Symptom | Check |
|---|---|
| iOS: `getToken` fails or hangs | Physical device? Steps 4 and 5 done? Is the app's signing profile up to date? |
| iOS: token works but nothing arrives | APNs key uploaded under the right iOS app? Is the bundle ID `com.predcarepatient`? |
| iOS: `FirebaseApp.configure()` crashes on launch | Is `GoogleService-Info.plist` in Copy Bundle Resources (step 3)? |
| iOS: `pod install` fails with "SPM + static linkage" | Is the `use_frameworks! :linkage => :dynamic` line in place (step 8)? |
| Android: build says "No matching client" | Is `android/app/google-services.json` the file with `com.predcarepatient`? |
| Either: still nothing | Notifications allowed in system settings? Battery optimisation restricting the app? |

---

## Not in this plan

This plan stops at receiving a test notification. These are separate work for later:

- Saving the token on the backend, login and logout token handling, and sending real notifications. The backend will also need a Firebase service account for this.
- Opening the right screen on tap. The official docs note that with Notifee installed, Firebase's `onNotificationOpenedApp` and `getInitialNotification` no longer fire, so tap handling has to go through Notifee.
- Incoming call pushes, ringtones and notification channels.
- A custom Android notification icon. Until it's added, Android shows a default icon.
- App Store and Google Play release changes, including testing with a production build. iOS debug builds use the APNs sandbox.

---

## References

- [React Native Firebase: getting started](https://rnfirebase.io/)
- [iOS SPM support](https://rnfirebase.io/ios-spm)
- [Messaging usage](https://rnfirebase.io/messaging/usage)
- [iOS messaging setup](https://rnfirebase.io/messaging/usage/ios-setup)
- [Firebase Cloud Messaging for Apple platforms](https://firebase.google.com/docs/cloud-messaging/ios/get-started)
