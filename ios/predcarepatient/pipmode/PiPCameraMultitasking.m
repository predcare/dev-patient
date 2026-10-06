#import "PiPCameraMultitasking.h"

#import <AVFoundation/AVFoundation.h>
#import <React/RCTBridge.h>

#import "WebRTCModule.h"

@interface PiPCameraMultitasking ()
@property (nonatomic, assign) BOOL active;
@property (nonatomic, assign) BOOL enabled;
@property (nonatomic, assign) BOOL observing;
@end

@implementation PiPCameraMultitasking

+ (PiPCameraMultitasking *)shared {
    static PiPCameraMultitasking *instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[PiPCameraMultitasking alloc] init];
    });
    return instance;
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)setActive:(BOOL)active bridge:(nullable id)bridge {
    self.active = active;

    if (!active) {
        self.enabled = NO;
        return;
    }

    if (!self.observing) {
        // The capture session is created lazily by WebRTC, so catch whichever session starts next.
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                selector:@selector(handleSessionDidStartRunning:)
                                                    name:AVCaptureSessionDidStartRunningNotification
                                                  object:nil];
        self.observing = YES;
    }

    [self applyToSessionFromBridge:bridge];
}

- (void)handleSessionDidStartRunning:(NSNotification *)notification {
    if (!self.active) {
        return;
    }
    if ([notification.object isKindOfClass:[AVCaptureSession class]]) {
        [self applyToSession:(AVCaptureSession *)notification.object];
    }
}

- (void)applyToSessionFromBridge:(nullable id)bridge {
    if (![bridge respondsToSelector:@selector(moduleForName:)]) {
        return;
    }

    WebRTCModule *module = [(RCTBridge *)bridge moduleForName:@"WebRTCModule"];
    AVCaptureSession *session = module.videoCapturer.captureSession;
    if (session != nil) {
        [self applyToSession:session];
    }
}

- (void)applyToSession:(AVCaptureSession *)session {
    if (@available(iOS 16.0, *)) {
        if (!session.isMultitaskingCameraAccessSupported) {
            NSLog(@"[PiPCameraMultitasking] Multitasking camera access unsupported on this device");
            return;
        }
        if (session.isMultitaskingCameraAccessEnabled) {
            self.enabled = YES;
            return;
        }

        [session beginConfiguration];
        session.multitaskingCameraAccessEnabled = YES;
        [session commitConfiguration];

        self.enabled = session.isMultitaskingCameraAccessEnabled;
        NSLog(@"[PiPCameraMultitasking] Multitasking camera access enabled: %@",
              self.enabled ? @"YES" : @"NO");
    } else {
        NSLog(@"[PiPCameraMultitasking] iOS 16+ is required to keep the camera on in background");
    }
}

@end
