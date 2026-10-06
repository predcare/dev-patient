import AVKit
import Foundation
import React
import UIKit

@objc(PiPManager)
public class PiPManager: RCTEventEmitter, AVPictureInPictureControllerDelegate {
    /// React Native owns the lifetime of this module, so the instance it creates is the only one
    /// allowed to hold the controller. Other native code reaches it through here.
    private(set) static weak var current: PiPManager?

    private static let pipChangedEvent = "onPipChanged"

    private var pipController: AVPictureInPictureController?
    private var pipVideoCallViewController: AVPictureInPictureVideoCallViewController?
    private var hasListeners = false
    private var meetingActive = false

    public override init() {
        super.init()
        PiPManager.current = self
    }

    @objc public override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    public override func supportedEvents() -> [String] {
        return [PiPManager.pipChangedEvent]
    }

    public override func startObserving() {
        hasListeners = true
    }

    public override func stopObserving() {
        hasListeners = false
    }

    // MARK: - Bridge methods

    @objc public func isPiPSupported(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        if #available(iOS 15.0, *) {
            resolve(AVPictureInPictureController.isPictureInPictureSupported())
        } else {
            resolve(false)
        }
    }

    @objc public func isBackgroundCameraSupported(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        resolve(PiPCameraMultitasking.shared.enabled)
    }

    /// Called when a meeting starts or ends. Building the controller up front is what allows iOS
    /// to move the call into Picture in Picture automatically when the app is backgrounded.
    @objc(setMeetingActive:)
    public func setMeetingActive(_ active: Bool) {
        meetingActive = active

        if active {
            PiPCameraMultitasking.shared.setActive(true, bridge: bridge)
            setupPiP()
        } else {
            PiPCameraMultitasking.shared.setActive(false, bridge: nil)
            stopPiP()
            tearDownController()
        }
    }

    @objc public func setupPiP() {
        DispatchQueue.main.async { [weak self] in
            self?.setupControllerIfNeeded()
        }
    }

    @objc public func startPiP(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                resolve(false)
                return
            }
            guard #available(iOS 15.0, *) else {
                resolve(false)
                return
            }

            self.setupControllerIfNeeded()

            guard let controller = self.pipController else {
                resolve(false)
                return
            }

            if controller.isPictureInPictureActive {
                resolve(true)
                return
            }

            // isPictureInPicturePossible flips to true a beat after the controller is created,
            // and calling start before then is silently ignored by iOS.
            self.whenPiPPossible(controller: controller, attemptsLeft: 10) { possible in
                guard possible else {
                    resolve(false)
                    return
                }
                controller.startPictureInPicture()
                resolve(true)
            }
        }
    }

    @objc public func stopPiP() {
        DispatchQueue.main.async { [weak self] in
            guard let self = self, #available(iOS 15.0, *) else { return }
            if self.pipController?.isPictureInPictureActive == true {
                self.pipController?.stopPictureInPicture()
            }
        }
    }

    /// Attaches the doctor's remote video track to the Picture in Picture window. The track can
    /// reach JS before WebRTC has registered it natively, so retry for a short while.
    @objc(attachRemoteTrack:)
    public func attachRemoteTrack(_ trackId: String) {
        attachRemoteTrack(trackId, attemptsLeft: 10)
    }

    private func attachRemoteTrack(_ trackId: String, attemptsLeft: Int) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            if PiPTrackRenderer.shared.attachTrackId(trackId) {
                return
            }
            guard attemptsLeft > 0 else {
                print("[PiPManager] Remote track \(trackId) never showed up in the registry")
                return
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                self.attachRemoteTrack(trackId, attemptsLeft: attemptsLeft - 1)
            }
        }
    }

    @objc public func detachRemoteTrack() {
        DispatchQueue.main.async {
            PiPTrackRenderer.shared.detach()
        }
    }

    @objc(setPlaceholderText:)
    public func setPlaceholderText(_ text: String) {
        PiPContainerView.shared.setPlaceholderText(text)
    }

    // MARK: - Controller

    private func setupControllerIfNeeded() {
        guard #available(iOS 15.0, *) else {
            print("[PiPManager] iOS 15+ is required for PiP")
            return
        }
        guard AVPictureInPictureController.isPictureInPictureSupported() else {
            print("[PiPManager] PiP is not supported on this device")
            return
        }
        guard pipController == nil else { return }

        guard let rootView = PiPManager.activeRootView() else {
            print("[PiPManager] Root view not found")
            return
        }

        let pipVC = AVPictureInPictureVideoCallViewController()
        pipVC.preferredContentSize = CGSize(width: 120, height: 160)

        let container = PiPContainerView.shared
        container.removeFromSuperview()
        pipVC.view.addSubview(container)
        container.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            container.topAnchor.constraint(equalTo: pipVC.view.topAnchor),
            container.bottomAnchor.constraint(equalTo: pipVC.view.bottomAnchor),
            container.leadingAnchor.constraint(equalTo: pipVC.view.leadingAnchor),
            container.trailingAnchor.constraint(equalTo: pipVC.view.trailingAnchor)
        ])

        let contentSource = AVPictureInPictureController.ContentSource(
            activeVideoCallSourceView: rootView,
            contentViewController: pipVC
        )

        let controller = AVPictureInPictureController(contentSource: contentSource)
        controller.delegate = self
        controller.canStartPictureInPictureAutomaticallyFromInline = true

        pipController = controller
        pipVideoCallViewController = pipVC

        print("[PiPManager] PiP setup complete")
    }

    private func tearDownController() {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            PiPTrackRenderer.shared.detach()
            self.pipController?.delegate = nil
            self.pipController = nil
            self.pipVideoCallViewController = nil
        }
    }

    @available(iOS 15.0, *)
    private func whenPiPPossible(
        controller: AVPictureInPictureController,
        attemptsLeft: Int,
        completion: @escaping (Bool) -> Void
    ) {
        if controller.isPictureInPicturePossible {
            completion(true)
            return
        }
        guard attemptsLeft > 0 else {
            print("[PiPManager] PiP never became possible")
            completion(false)
            return
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.05) { [weak self] in
            self?.whenPiPPossible(
                controller: controller,
                attemptsLeft: attemptsLeft - 1,
                completion: completion
            )
        }
    }

    private static func activeRootView() -> UIView? {
        let scenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
        let scene = scenes.first { $0.activationState == .foregroundActive } ?? scenes.first
        guard let windowScene = scene else { return nil }
        let window = windowScene.windows.first(where: { $0.isKeyWindow }) ?? windowScene.windows.first
        return window?.rootViewController?.view
    }

    private func emitPipChanged(active: Bool) {
        guard hasListeners else { return }
        sendEvent(withName: PiPManager.pipChangedEvent, body: ["active": active])
    }

    // MARK: - AVPictureInPictureControllerDelegate

    public func pictureInPictureControllerDidStartPictureInPicture(
        _ controller: AVPictureInPictureController
    ) {
        emitPipChanged(active: true)
    }

    public func pictureInPictureController(
        _ controller: AVPictureInPictureController,
        failedToStartPictureInPictureWithError error: Error
    ) {
        print("[PiPManager] Failed to start PiP: \(error.localizedDescription)")
        emitPipChanged(active: false)
    }

    public func pictureInPictureControllerDidStopPictureInPicture(
        _ controller: AVPictureInPictureController
    ) {
        emitPipChanged(active: false)
    }

    public func pictureInPictureController(
        _ controller: AVPictureInPictureController,
        restoreUserInterfaceForPictureInPictureStopWithCompletionHandler completionHandler:
            @escaping (Bool) -> Void
    ) {
        emitPipChanged(active: false)
        completionHandler(true)
    }
}
