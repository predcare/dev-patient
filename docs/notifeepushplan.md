# Notifee + Firebase Push Plan: PRED Care Patient App (Android and iOS)

**Status:** plan only, no code changed yet.
**Goal:** any push notification that arrives is shown on a physical iPhone and Android phone, whether the app is open, in the background or closed.
**Follows on from:** [pushnotifyplan.md](./pushnotifyplan.md), which covers the Firebase setup.

---

## How it works

`@notifee/react-native` is already installed, so there's nothing new to install.

| App state | Who shows the notification | iOS work | Android work |
|---|---|---|---|
| Open | Notifee | Steps 3 and 4 | Steps 2, 3 and 4 |
| Background or closed | The phone's system | None | Step 1 |

Tapping a notification just opens the app.

Real pushes only work on physical devices. On an Apple Silicon iOS Simulator, `getToken` fails with `[messaging/unregistered]`, and that warning is expected.

---

## File and folder structure

`A` = add, `M` = modify. Everything else stays as it is.

```text
predcarepatient/
├── android/app/src/main/
│   └── AndroidManifest.xml       M  step 1: default channel and icon
└── src/services/notifications/
    ├── notification.core.ts      M  step 2: add the Android channel
    └── push/
        ├── pushDisplay.ts        A  step 3: show a push with Notifee
        └── pushSetup.ts          M  step 4: call it from onMessage
```

**iOS needs no native changes.** The push entitlement and `remote-notification` background mode are already in the project, and the APNs key is uploaded to Firebase.

---

## Step 1: Android: set the default channel and icon

In **`AndroidManifest.xml`**, add this inside `<application>`, just before `</application>`:

```xml
<meta-data
  android:name="com.google.firebase.messaging.default_notification_channel_id"
  android:value="default_channel_id"
  tools:replace="android:value" />
<meta-data
  android:name="com.google.firebase.messaging.default_notification_icon"
  android:resource="@mipmap/ic_launcher" />
```

- **Channel:** `tools:replace` is needed because React Native Firebase also sets this value. The manifest already declares `xmlns:tools`.
- **Icon:** this doesn't need `tools:replace`, because none of the installed Firebase or Notifee packages set it.

Rebuild the Android app after this change, because a JS reload won't pick it up.

---

## Step 2: Android: create the channel

The ID must match the manifest exactly, or background pushes won't use this channel. In **`notification.core.ts`**:

1. Add a `DEFAULT` entry to `NOTIFICATION_CHANNELS`, with `id: 'default_channel_id'`, `name: 'General'` and `importance: AndroidImportance.HIGH`.
2. Create it in `initNotificationChannels`, alongside the existing channels.

---

## Step 3: Both: show the push with Notifee

**`push/pushDisplay.ts`** (new):

```ts
import notifee from '@notifee/react-native';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { NOTIFICATION_CHANNELS } from '../notification.core';

export const displayPush = async (message: FirebaseMessagingTypes.RemoteMessage) => {
  await notifee.displayNotification({
    title: message.notification?.title,
    body: message.notification?.body,
    android: {
      channelId: NOTIFICATION_CHANNELS.DEFAULT.id,
      smallIcon: 'ic_launcher',
      pressAction: { id: 'default' },
      autoCancel: true,
    },
    ios: {
      sound: 'default',
      foregroundPresentationOptions: { banner: true, badge: true, sound: true },
    },
  });
};
```

- **Android:** `pressAction` is what makes a tap open the app.
- **iOS:** `foregroundPresentationOptions` is what makes the banner appear while the app is open.

---

## Step 4: Both: call it from `onMessage`

In **`push/pushSetup.ts`**, replace the log inside `onMessage`:

```ts
return onMessage(getMessaging(), displayPush);
```

Import `displayPush` from `./pushDisplay`.

---

## Step 5: Test on physical devices

1. Run the app on the phone, allow notifications, and copy `FCM token:` from the log.
2. Firebase console → **Messaging** → **New campaign** → **Notifications** → enter a title and text → **Send test message** → paste the token → **Test**.
3. Check each state:

| App state | Expected | iOS | Android |
|---|---|---|---|
| Open | Banner appears | ☐ | ☐ |
| Background | Notification appears | ☐ | ☐ |
| Closed (swiped away) | Notification appears | ☐ | ☐ |

**Messages must include a title and text** (the `notification` part). Data-only messages won't show in the background or closed states with this setup.

An Android app force-stopped from Settings receives nothing until it's opened again.

---

## Not included

- **Sending from your backend:** this setup is tested with the Firebase console. `fcm_token` is still sent as an empty string at login, so the backend can't target a device until that's connected.
