# Fix Plan: System Call Screen in the Background, and the Ringing Sound

**Status:** done on 2026-11-03 in `src/services/calls/callService.ts` only. Not yet tested on devices. `showAndroidRing` is left in `androidRing.ts`, unused. iOS background still needs the backend VoIP push.
**Scope:** two fixes only. Everything else (socket, banner components, join flow, iOS PushKit code) stays as it is.
**Code today:** commit `5504a23`, `src/services/calls/`.
**Checked on:** 2026-11-03.

## Fix 1. Background and closed: system call screen, no Notifee ring

### What happens now

| App state | Android | iOS |
| --- | --- | --- |
| App open | System call screen | CallKit |
| Background or closed | **Notifee notification ring** | Backend's notification |

### Why

**Android.** In `callService.ts` → `ringIncomingCall`, the system screen is shown only when `canShowSystemCall()` is true. Otherwise the code falls back to the Notifee ring (lines 66–80):

```ts
if (await canShowSystemCall()) {
  RNCallKeep.displayIncomingCall(...);   // system call screen
  return;
}
if (isAppActive()) showBanner(call);
else if (Platform.OS === 'android') await showAndroidRing(call);   // ← Notifee ring
```

`canShowSystemCall()` is true only when the patient has granted the phone permission **and** turned on the PRED Care calling account. In the background the check fails on phones where that isn't done, so Notifee rings.

**iOS.** `ringIncomingCall` returns early in the background (line 63), because a closed iPhone can only show CallKit from a VoIP push, and the backend still sends a normal notification.

### Change

**Android, in `callService.ts` only:**

1. In `ringIncomingCall`, remove the `canShowSystemCall()` check and the Notifee fallback. Always call `RNCallKeep.displayIncomingCall(...)`, in every app state.
2. Leave `showAndroidRing` in `androidRing.ts` unused, or delete it.

That is the whole code change. One requirement comes with it: **the PRED Care calling account must be on**. Without it, Android ignores the call and nothing rings. The existing prompt (`promptCallAccountIfNeeded` at Splash) asks for it; on each test phone, accept the phone permission and turn PRED Care on in the calling-account settings that open.

Check it on a test phone:

```bash
adb logcat -s RNCallKeep
```

- `onCreateIncomingConnection`: the system call screen showed.
- `displayIncomingCall ignored … no phone account`: the calling account is off on that phone.

Reinstall the app first, so the account left over from the earlier self-managed build is cleared.

**iOS:** no app code change. The app side is done (`AppDelegate+PushKit.swift`, `voipToken.ts`). The backend needs to:

1. Save the `voip_token` the app already sends to `register-token`.
2. Send the ring and the cancel to APNs as a VoIP push (`apns-push-type: voip`, `apns-topic: com.predcarepatient.voip`), with the same fields as the FCM data (`type`, `uuid`, `caller_name`, `appointment_id`, `timestamp`, `timeout_seconds`).
3. Stop sending the normal notification to those iPhones.

Then a closed or backgrounded iPhone shows CallKit too.

## Fix 2. The ringing sound

### What's wrong

Up to three sounds can play for one call, and which one plays depends on the state:

| Sound | Where it comes from | When |
| --- | --- | --- |
| Phone's call ringtone | Android's system call screen / CallKit (`ringtone.caf` on iOS) | System call screen |
| `ringtone.mp3` (Notifee) | `androidRing.ts`, channel `incoming_call`, `loopSound: true` | Android background (removed by Fix 1) |
| `ringtone.mp3` (banner) | `IncomingCallBanner.tsx` (`new Sound('ringtone.mp3')` + vibration) | App open, when the **socket** shows the banner at the same time as the system call screen |

### Change

Goal: **one sound per call, from the system call screen**.

1. **Notifee sound:** gone with Fix 1.
2. **Banner sound while the system call screen rings:** the socket isn't changed, so in `callService.ts` (only), after `displayIncomingCall`, hide the banner if it's showing for the same appointment. Also hide it if the socket shows it later while the call is ringing (subscribe to `useIncomingCallStore`). The banner keeps working as before when there's no system call.
3. **System ringtone:**
   - **Android:** the system call screen plays the phone's own ringtone at the ring volume, and stays silent in silent or Do Not Disturb mode, like a normal call. Android's Phone app chooses the sound, so `ringtone.mp3` can't be used there.
   - **iOS:** CallKit plays `ringtone.caf` (set in `AppDelegate.swift` as `ringtoneSound`). Remove that line if the iPhone's default ringtone is preferred.

## Files touched

| File | Change |
| --- | --- |
| `src/services/calls/callService.ts` | Fix 1 (always system call) and Fix 2 (hide banner while the system call rings) |
| `src/services/calls/androidRing.ts` | Optional: delete the unused `showAndroidRing` |
| Backend | iOS VoIP push (Fix 1, iOS) |

Nothing else changes.

## Test

- [ ] Android, calling account on: app open, background, closed and locked all show the **system call screen**
- [ ] Android: no Notifee ring in any state
- [ ] Android: one sound only (phone ringtone), including when the app is open and the socket fires
- [ ] Android: Answer joins; Decline and the doctor's cancel close the call screen
- [ ] iOS, app open: CallKit with `ringtone.caf`, no banner sound
- [ ] iOS, closed and background: CallKit after the backend sends VoIP pushes
