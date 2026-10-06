#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/// Turns on AVCaptureSession multitasking camera access for the WebRTC capture session so the
/// patient camera keeps running while the app is backgrounded inside Picture in Picture.
/// Without this, iOS interrupts capture with VideoDeviceNotAvailableInBackground.
@interface PiPCameraMultitasking : NSObject

@property (class, nonatomic, readonly) PiPCameraMultitasking *shared;

/// YES once multitasking camera access has actually been enabled on a live capture session.
@property (nonatomic, readonly) BOOL enabled;

/// Arms or disarms the helper for the lifetime of a meeting. `bridge` is an optional RCTBridge
/// used to reach a capture session that is already running.
- (void)setActive:(BOOL)active bridge:(nullable id)bridge;

@end

NS_ASSUME_NONNULL_END
