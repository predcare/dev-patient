---
name: Full-screen meeting video, unstable-connection banner, and remote video recovery (patient app)
overview: Three changes to the patient app. (1) Port the doctor app's unstable-connection monitor and banner. (2) Make the meeting video edge-to-edge (no bands above, below, or beside it). (3) Fix the bug where the remote participant's video does not come back after the network goes from weak to strong. Ends with the full issues list.
todos:
  - id: unstable-monitor
    content: Port useUnstableConnectionMonitor, network.constants, isUnstable in useNetworkStore, GlobalUnstableConnectionBanner, bannerUnstable style; mount it
    status: completed
  - id: fullscreen-video
    content: Remote video fills the whole screen (cover, behind status bar and nav bar); header, self-view and controls float on top using safe-area insets
    status: completed
  - id: fix-limitation-direction
    content: Use onQualityLimitation only for the outgoing camera, never to stop or lower the incoming video; track each limitation type separately; ignore cpu for the network ladder
    status: completed
  - id: fix-reset-on-rejoin
    content: Reset qualityLimitation and networkQuality on rejoin and after the SDK reconnects
    status: completed
  - id: fix-offline-hysteresis
    content: After a reconnect, restart call quality from GOOD instead of OFFLINE (no 9 s of "Offline" bars)
    status: completed
  - id: fix-fast-recovery
    content: Leave audio-only straight to low as soon as the link is good (no 10 s per step to get video back); then climb normally
    status: completed
  - id: fix-consume-retry
    content: Retry consumeWebcamStreams until it succeeds; re-request on every reconnect; fall back to consuming if video stays missing
    status: completed
  - id: fix-renderer-reattach
    content: Re-attach the remote RTCView when the stream resumes or the session reconnects (remote video epoch)
    status: completed
  - id: doctor-app-sync
    content: Apply the same recovery fixes to the doctor app (same code; the screenshot is from the doctor app)
    status: pending
isProject: false
---

# Full-screen meeting video, unstable-connection banner, and remote video recovery (patient app)

Scope: `predcarepatient`. Reference: `predcaredoctor/src` for the unstable-connection monitor. The recovery bug lives in code that **both apps share** (`useAdaptiveVideo`, `useCallQualityMonitor`, `MeetingSessionHost`), and the screenshot is from the doctor app. So every fix in Part 3 must also go into the doctor app (last todo).

---

## Part 1. Unstable-connection monitor and banner (port from doctor)

Today the patient app only knows **offline** (NetInfo). The doctor app also detects **online but too weak to work**: a very weak link (wifi under 30 % or 2G), a slow or failing API probe, or a weak live call. It shows a small amber banner, "Unstable Connection".

How the doctor version works (`predcaredoctor/src/hooks/commons/useUnstableConnectionMonitor.ts`):
- Runs every 5 s (`CONNECTION_CHECK_MS`) while the app is active or in native PiP.
- Every 3rd check (about every 15 s) it times a `HEAD` request to `baseUrl`. Slower than 2 s, or failing within 5 s, counts as bad.
- Bad = `linkCap <= 1` (wifi < 30 % or 2G) **or** a slow probe **or** (in a call and `networkQuality === 'WEAK'`).
- 2 bad readings in a row → `isUnstable = true`; 2 good in a row → `false`. Offline resets everything; the offline blocker and banner handle that case.

### Files

```text
src/
├── config/network.constants.ts                         NEW   copy verbatim from doctor
├── hooks/commons/useUnstableConnectionMonitor.ts       NEW   copy verbatim (imports exist in patient:
│                                                              services/api/endpoints baseUrl,
│                                                              meeting/callQuality.utils getLinkSignalCap)
├── zustand/stores/useNetworkStore.ts                   EDIT  isUnstable: boolean, setIsUnstable (no-op when unchanged)
├── components/commons/Network/NetworkEventListener.tsx EDIT  call useUnstableConnectionMonitor()
├── components/commons/Network/GlobalUnstableConnectionBanner.tsx  NEW  copy from doctor
├── styled/OfflineBanner.styled.ts                      EDIT  add bannerUnstable (amber #B45309, border #F59E0B)
└── App.tsx (root)                                      EDIT  <GlobalUnstableConnectionBanner /> right after
                                                               <GlobalOfflineBanner /> inside HideDuringAndroidPip
```

- Banner copy for patients: title "Unstable Connection", subtitle "Your internet is weak. Things may load slowly." (same as doctor).
- Visible only when `isUnstable && !isOffline && !wasOffline`, so it never stacks with the offline banner or the "Back online" banner.
- `pointerEvents="none"`: it never blocks taps (important on the meeting screen, where it overlays the header area).
- Inside a call the header signal bars already show Weak / Fair. The banner adds the probe result (API slow), which the bars don't see. Keep it on the meeting screen like the doctor app; see open question Q2.

---

## Part 2. Full-screen meeting video

### What's wrong today

`MeetingStageOverlay` wraps the stage in `SafeAreaWrapper`, which pads the content by the top inset (status bar) and bottom inset (nav bar). The remote `RTCView` is `absoluteFill` **inside** that padded box, and `DoctorStageView` uses `objectFit="contain"`. So:
- Bands of background colour show above the video (status bar) and below it (gesture / nav bar; the white strip in the screenshot).
- With `contain`, a 16:9 or 4:3 doctor camera on a tall phone leaves extra bands left/right or top/bottom.

### Target

The remote video covers the **whole screen**, edge to edge, behind the status bar and nav bar. Header, self-view and controls float on top at their current positions, shifted by the safe-area insets so they never sit under the notch or the gesture bar. Nothing else changes visually.

### Changes

- `MeetingStageOverlay.tsx`
  - Render `<DoctorStageView />` as the first child of the outer `absoluteFill` view, **outside** `SafeAreaWrapper`, so it is full-bleed.
  - Pass `fullBleed` to `SafeAreaWrapper` (it then adds no padding) and use `backgroundColor="transparent"`, or drop the wrapper and keep a plain `View`. Recommended: `fullBleed`, because it keeps the screen structure the same.
  - `StatusBar`: `barStyle="light-content"`, plus on Android `translucent` and `backgroundColor="transparent"` (the app already runs edge-to-edge).
- `DoctorStageView.tsx`: `objectFit="cover"` for the full-screen stage. Cover crops the edges a little instead of showing bars, which is the usual video-call behaviour. The placeholder (avatar / "WAITING FOR DOCTOR...") stays centred on the dark background.
- Inset-aware positions (computed with `useSafeAreaInsets()`; the base values stay in `MeetingScreen.styled.ts`):
  - `MeetingHeader` → `top: insets.top + 10` (today `10` inside the padded box, so it lands where it is now).
  - `LocalPipCard` → `top: insets.top + 80`.
  - `MeetingController` (`bottomHud`) → `bottom: insets.bottom + 10`.
  - Per CLAUDE.md, put static parts in the styled file and merge only the inset number at the call site.
- `MeetingScreen.tsx` (the route under the overlay) keeps its dark background; nothing shows through.
- Not touched: `InAppPipWindow` (already `cover` in a card) and `AndroidPipStage` (already `cover`, full window).

Check on: a notch iPhone, an Android with gesture nav, an Android with 3-button nav (the screenshot), landscape doctor camera, portrait doctor camera, and the camera-off placeholder.

---

## Part 3. Bug: remote video does not come back after weak → strong network

### Repro (from the report)

During a call the network becomes weak, then switches to a strong network. Audio continues, but the **remote participant's video never reappears**, or only after a long time.

### How the current code behaves on that path

1. Weak link → `useCallQualityMonitor` reports `WEAK`, and the SDK fires `onQualityLimitation({ type: 'bandwidth', state: 'detected' })`.
2. `useAdaptiveVideo` steps `hd → sd → low → audio` (`audio` after 20 s of weak, or 20 s of the bandwidth limitation).
3. On `audio` it calls `remote.stopConsumingWebcamStreams()`, and every view hides the remote track (`isAudioOnly`).
4. Network gets strong. To show video again **all** of these must happen:
   - the monitor climbs back to `GOOD` (3 good samples × 3 s = 9 s, or longer, see B3);
   - `qualityLimitation` goes back to `null`, which needs a `resolved` event for the **same** type;
   - `goodFor >= 10 s` → `audio → low`;
   - `consumeWebcamStreams()` succeeds;
   - a new remote track arrives and the `RTCView` attaches.

If any one of those fails, the video stays off. Several of them can fail.

### Root causes (found in code and in the SDK source)

**B1. The upload limitation turns off the incoming video (main cause).**
`onQualityLimitation` comes only from the **outgoing** encoder stats (`outbound-rtp.qualityLimitationReason` in `@videosdk.live/js-sdk`). It describes *our upload*. `useAdaptiveVideo` still treats any limitation as "bad" (`isBad = networkQuality !== 'GOOD' || qualityLimitation !== null`, line 55), jumps to `audio` on `bandwidth` (line 69), and then **stops consuming the doctor's video**. A weak uplink (common on mobile data, and also on wifi with a poor upload) therefore kills a downlink that is fine.

**B2. `qualityLimitation` can stay stuck forever.**
- It is one value, but the SDK reports each type on its own. `bandwidth detected` → `cpu detected` → `bandwidth resolved` sets it to `null` while CPU is still limited. In the other order (`cpu detected`, `bandwidth detected`, `cpu resolved`) it's cleared while bandwidth is limited.
- `cpu` counts as "bad network", so a busy phone (Android, camera on, PiP) holds the ladder down and blocks the climb back up.
- On a rejoin (`rejoinCallInfo`) or a provider remount, the old SDK session never sends `resolved`, and the store keeps the old `detected` value. `isBad` stays `true`, `goodFor` never starts, and the tier **never leaves `audio`**: the remote video never comes back. This matches the report exactly when the weak period ended in a reconnect.

**B3. After a reconnect, quality restarts at `OFFLINE` and climbs slowly.**
During `RECONNECTING` / `DISCONNECTED` the monitor forces `OFFLINE`. When the call reconnects, `applyHysteresis` needs **3 samples (9 s)** to move up, so the bars show "Offline" and the ladder stays frozen for about 9 s while the call is already fine. Also, `rejoinCallInfo` does not reset `networkQuality`.

**B4. Getting video back from audio-only is slow by design.**
`restore` climbs one step every 10 s of good network: `audio → low` needs 10 s of `GOOD`, after the ~9 s from B3. That's about 20 s with no remote video after the link is already strong, and about 40 s to get back to HD. Users read that as "video is not coming".

**B5. A failed `consumeWebcamStreams()` is never retried.**
`consumeWebcamStreams` is a socket request to the SFU. Right after a network switch the socket is often still reconnecting, so the request fails. The code sets `wasAudioOnlyRef.current = false` **before** the call, swallows the error (`.catch(() => undefined)`, line 137), and never asks again. The SFU still thinks we don't want video, so it never arrives, even after `videoTier` is back to HD.

**B6. The renderer does not re-attach after pause/resume or an SDK reconnect.**
`DoctorStageView`, `InAppPipWindow` and `AndroidPipStage` memoise the stream URL on the track object. On a network switch the SDK can pause and resume the consumer (`stream-paused` / `stream-resumed`) or resume an ICE restart **with the same track object**. The URL doesn't change, so Android `RTCView` keeps showing a frozen or black frame. There is no listener for `onStreamResumed`.

**B7. Stopping consumption also blinds the quality monitor.**
In `audio`, the remote video stats are empty, so the monitor only measures our own upload (the local side). A weak uplink then keeps the whole call "WEAK" (feeding B1) even when the download is perfect.

### Fixes

**F1. Separate directions (fixes B1, B7).**
- `onQualityLimitation` only affects the **outgoing camera tier** (what we send). It never stops or lowers the doctor's incoming video.
- Split the ladder into two values:
  - `sendTier`: driven by upload signals (local stats + limitation `bandwidth` / `congestion`).
  - `receiveTier`: driven by download signals (remote stats only). Only `receiveTier` may reach `audio` and call `stopConsumingWebcamStreams()`.
- `useCallQualityMonitor` writes `uplinkQuality` and `downlinkQuality` (it already samples `local` and `remote` separately; keep two hysteresis states). `networkQuality` stays as `min(up, down)` for the header bars, so the UI doesn't change.
- `cpu` never drives the network ladder. At most it may cap `sendTier` at `sd` while detected.

**F2. Track limitations per type, and reset them (fixes B2).**
- Store `qualityLimitations: { bandwidth: boolean; congestion: boolean; cpu: boolean }`. `detected` sets that key, `resolved` clears that key. Keep a derived `qualityLimitation` (first active of bandwidth / congestion) so `MeetingSignalBadge` and the unstable monitor keep working.
- Reset all limitations and `networkQuality = 'GOOD'` in `rejoinCallInfo`, in `onMeetingJoined`, and when the SDK state goes back to `CONNECTED` after a reconnect.
- Safety net: a limitation older than 30 s with no new `detected` and with good stats is cleared.

**F3. Restart quality at GOOD after a reconnect (fixes B3).**
When the monitor leaves `RECONNECTING` / `DISCONNECTED` / offline, set the hysteresis to `{ current: 'GOOD', candidate: null, streak: 0 }` and clear the previous totals. It drops quickly again (2 bad samples) if the link is really weak.

**F4. Fast exit from audio-only (fixes B4).**
- In `audio`, as soon as `downlinkQuality` is `GOOD` or `FAIR` for **one** sample (3 s), go straight to `low` and consume video. After that, climb `low → sd → hd` with the normal 10 s steps.
- New constant `VIDEO_TIER_STEP_MS.audioExit = 3000`.
- Target: video visible again within about 5 s of the network becoming good.

**F5. Make consume reliable (fixes B5).**
- Keep a `wantVideo` flag (`receiveTier !== 'audio'`) separate from whether the request succeeded.
- While `wantVideo` and the doctor's `webcamOn` is true but no remote track has arrived, call `consumeWebcamStreams()` with retry: 1 s, 2 s, 4 s, then every 5 s, until a track arrives or `wantVideo` goes false. Set the success flag only after the promise resolves.
- Call `consumeWebcamStreams()` once more after every SDK `CONNECTED` following a reconnect, and after every provider remount, whenever `wantVideo` is true. The server's subscription state can't be trusted across a reconnect.
- Fallback: if `webcamOn` has been true with no track for 15 s while not in `audio`, log a warning and keep retrying. Never stay in "camera on but nothing shown" silently.

**F6. Re-attach the renderer (fixes B6).**
- Add `remoteVideoEpoch` to the meeting store, bumped on: `useParticipant(doctorId, { onStreamResumed })` for video, SDK `CONNECTED` after a reconnect, `consumeWebcamStreams()` success, and `audio → low`.
- In `DoctorStageView`, `InAppPipWindow`, `AndroidPipStage`: add `remoteVideoEpoch` to the stream-URL `useMemo` deps and to the `RTCView` `key`. On iOS, `usePipRemoteTrack` re-runs `attachRemoteRenderer(trackId)` when the epoch changes.
- Register `onStreamResumed` / `onStreamPaused` **once**, in `useMeetingParticipants` (which lives in the controller), not in the 4 `useDoctorStream` callers.

**F7. Logging for field debugging (no UI).**
`console.warn` with a `[MeetingRecovery]` prefix on: tier change (send / receive, from → to, reason), limitation detected / resolved, consume / stopConsume result, consume retry count, epoch bump. That's enough to read a single bad call from `adb logcat` / Xcode.

### Files (Part 3)

```text
src/
├── config/meeting.constants.ts                     EDIT  VIDEO_TIER_STEP_MS.audioExit, CONSUME_RETRY_MS,
│                                                          QUALITY_LIMITATION_STALE_MS
├── zustand/interfaces/meeting.interfaces.ts        EDIT  uplinkQuality, downlinkQuality, qualityLimitations,
│                                                          sendTier, receiveTier, remoteVideoEpoch
├── zustand/stores/useMeetingStore.ts               EDIT  setters, per-type limitation, resets in rejoinCallInfo,
│                                                          bumpRemoteVideoEpoch; keep videoTier as receiveTier alias
│                                                          so views and tests keep working
├── hooks/commons/meeting/callQuality.utils.ts      EDIT  pure tier decision functions (decideSendTier,
│                                                          decideReceiveTier) so they are unit-testable
├── hooks/commons/meeting/useCallQualityMonitor.ts  EDIT  separate up/down hysteresis, restart at GOOD after reconnect
├── hooks/commons/meeting/useAdaptiveVideo.ts       EDIT  split send/receive, fast audio exit, consume retry loop
├── hooks/commons/meeting/useMeetingParticipants.ts EDIT  onStreamResumed/onStreamPaused → bumpRemoteVideoEpoch
├── hooks/commons/meeting/usePipRemoteTrack.ts      EDIT  re-attach on epoch
├── components/meeting/MeetingSessionHost.tsx       EDIT  per-type onQualityLimitation; resets on joined/CONNECTED
├── Features/.../DoctorStageView.tsx                EDIT  epoch in memo + key (and cover, Part 2)
├── components/meeting/InAppPipWindow.tsx           EDIT  epoch in memo + key
├── components/meeting/AndroidPipStage.tsx          EDIT  epoch in memo + key
└── __tests__/callQuality.utils.test.ts             EDIT  tests for the tier decisions and limitation reset
```

### Tests

- **Unit** (Jest, pure functions):
  - an upload limitation never moves `receiveTier`;
  - `audio` exits to `low` after one good downlink sample;
  - a stale limitation is cleared;
  - per-type resolve keeps the other types.
- **Device**, with the doctor app on the same build:
  1. Weak wifi (or Network Link Conditioner "Very Bad Network") for 30 s until audio-only, then switch to strong wifi → doctor video back within about 5 s, then HD within about 30 s.
  2. Same, but switching **weak wifi → mobile data**, where the IP changes and the SDK reconnects → video back after reconnect.
  3. Weak **upload only** (throttle upload, download fine) → doctor's video stays HD on the patient; only our camera steps down.
  4. Airplane mode 10 s while in audio-only → rejoin → video back (checks the limitation reset and consume after remount).
  5. Doctor turns camera off and on while the patient is in `low` → video comes back.
  6. Android 3-button nav and gesture nav, iOS notch → full-screen video, controls clear of the system bars.
  7. Unstable banner: throttle to 2G or a 3 s API delay → banner after about 10 s; restore → hides after about 10 s; never shows together with the offline banner.

---

## Order of work

1. **Part 3 F2 + F3** (limitation per type + reset, restart at GOOD). Small, and removes the "stuck forever" case.
2. **Part 3 F1 + F4 + F5** (split directions, fast exit, consume retry). The core of the fix.
3. **Part 3 F6 + F7** (re-attach, logs).
4. **Part 2** (full-screen video). Independent, low risk.
5. **Part 1** (unstable banner). Independent.
6. Port Part 3 to the doctor app (same files, `patient` ↔ `doctor` names) and run the device tests with both apps.

## Open questions

- **Q1.** "Make the meeting video full screen, remove video": I read this as removing the empty bands around the video (status bar / nav bar strips and the `contain` letterbox), so the remote video fills the screen. If you meant something else, such as hiding the self-view tile, tell me before Part 2 starts.
- **Q2.** Should the unstable banner also show on the meeting screen (doctor app does), or only outside the call, since the header bars already show weak signal? Default in this plan: same as the doctor app.
- **Q3.** `cover` crops the edges of the doctor's video. For a consultation that is normally fine (face centred). If the doctor often shows documents to the camera, consider double-tap to switch `cover` / `contain`. That would be a new interaction, so it's out of scope unless you want it.

---

## Issues list

| # | Issue | Where | Effect | Fix |
|---|---|---|---|---|
| 1 | Upload limitation (`onQualityLimitation`, from outbound encoder stats) stops and lowers the **incoming** doctor video | `useAdaptiveVideo.ts:55,69,131-132` | Weak upload → doctor video disappears although download is fine | F1 |
| 2 | One `qualityLimitation` value for all types; `resolved` for one type clears another | `MeetingSessionHost` `onQualityLimitation`, `useMeetingStore.setQualityLimitation` | Wrong bad / good state | F2 |
| 3 | `qualityLimitation` not reset on rejoin / remount; the old session never sends `resolved` | `useMeetingStore.rejoinCallInfo` | Ladder stuck in `audio`, **remote video never returns** | F2 |
| 4 | `cpu` limitation counted as a bad network | `useAdaptiveVideo.ts:55` | Busy phone blocks the video from climbing back | F1, F2 |
| 5 | Quality restarts at `OFFLINE` after a reconnect and needs 3 samples (9 s) to climb | `useCallQualityMonitor.ts:47` + `applyHysteresis` | "Offline" bars and a frozen ladder for about 9 s after reconnect | F3 |
| 6 | `networkQuality` not reset on rejoin | `useMeetingStore.rejoinCallInfo` | Stale quality after rejoin | F2, F3 |
| 7 | Audio-only → video needs 10 s of good network per step | `useAdaptiveVideo.ts:77`, `VIDEO_TIER_STEP_MS.restore` | About 20 s with no doctor video after the network is already strong | F4 |
| 8 | `consumeWebcamStreams()` failure swallowed; flag cleared before the call; never retried | `useAdaptiveVideo.ts:135-137` | SFU never resumes video; **remote video stays off** | F5 |
| 9 | Consume not re-requested after an SDK reconnect / provider remount | `useAdaptiveVideo.ts` part 3 deps | Video may stay unsubscribed after the network switch | F5 |
| 10 | `RTCView` not re-attached after stream pause/resume or ICE restart with the same track | `DoctorStageView`, `InAppPipWindow`, `AndroidPipStage`, `usePipRemoteTrack` | Frozen or black remote video on Android after a network switch | F6 |
| 11 | In audio-only the remote stats are empty, so the call quality is measured from the upload only | `useCallQualityMonitor.ts` | Weak upload keeps the whole call "WEAK" | F1 |
| 12 | Remote video uses `contain` inside a safe-area-padded box | `MeetingStageOverlay.tsx`, `DoctorStageView.tsx:31` | Bands above, below, and beside the video (white strip in screenshot) | Part 2 |
| 13 | No "online but too weak" detection in the patient app | — | Patient gets no warning on a slow or failing connection | Part 1 |
| 14 | Same recovery bugs (1-11) exist in the doctor app (shared code; screenshot is from the doctor app) | `predcaredoctor/src/hooks/commons/meeting/*`, `MeetingSessionHost.tsx` | Doctor also loses the patient's video after weak → strong | Port Part 3 |
| 15 | No recovery logs, so field reports can't be diagnosed | meeting hooks | Hard to debug real calls | F7 |
