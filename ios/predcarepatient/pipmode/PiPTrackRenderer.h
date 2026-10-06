#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/// Pulls frames off the doctor's remote WebRTC video track and feeds them into the
/// AVSampleBufferDisplayLayer shown inside the system Picture in Picture window.
@interface PiPTrackRenderer : NSObject

@property (class, nonatomic, readonly) PiPTrackRenderer *shared;

/// Looks the track up in the WebRTC remote track registry and starts rendering it.
/// Returns NO when the track is not registered yet.
- (BOOL)attachTrackId:(NSString *)trackId;

/// Stops rendering and clears the window back to the placeholder.
- (void)detach;

@end

NS_ASSUME_NONNULL_END
