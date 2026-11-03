import PushKit
import RNCallKeep
import RNVoipPushNotification

// VoIP pushes for incoming doctor calls. A VoIP push wakes the app even when it's closed, and iOS
// requires every one to be reported to CallKit, or it terminates the app and stops VoIP delivery.
extension AppDelegate: PKPushRegistryDelegate {
  func pushRegistry(
    _ registry: PKPushRegistry,
    didUpdate credentials: PKPushCredentials,
    for type: PKPushType
  ) {
    // Sends the VoIP token to JS (voipToken.ts), which sends it to the backend.
    RNVoipPushNotificationManager.didUpdate(credentials, forType: type.rawValue)
  }

  func pushRegistry(_ registry: PKPushRegistry, didInvalidatePushTokenFor type: PKPushType) {}

  func pushRegistry(
    _ registry: PKPushRegistry,
    didReceiveIncomingPushWith payload: PKPushPayload,
    for type: PKPushType,
    completion: @escaping () -> Void
  ) {
    let data = payload.dictionaryPayload
    // Same fields as the backend's FCM call push.
    let uuid = (data["uuid"] as? String).flatMap { $0.isEmpty ? nil : $0 } ?? UUID().uuidString
    let callerName = (data["caller_name"] as? String) ?? "Your doctor"
    let isCancel = (data["type"] as? String) == "CALL_CANCELLED"

    RNVoipPushNotificationManager.didReceiveIncomingPush(with: payload, forType: type.rawValue)

    // A cancel is reported as well (same uuid, so CallKit sees the same call), then ended at once.
    RNCallKeep.reportNewIncomingCall(
      uuid,
      handle: "PRED Care",
      handleType: "generic",
      hasVideo: false,
      localizedCallerName: callerName,
      supportsHolding: false,
      supportsDTMF: false,
      supportsGrouping: false,
      supportsUngrouping: false,
      fromPushKit: true,
      payload: data as? [String: Any],
      withCompletionHandler: {
        if isCancel {
          RNCallKeep.endCall(withUUID: uuid, reason: 2) // REMOTE_ENDED
        }
        completion()
      }
    )
  }
}
