#import "PiPTrackRenderer.h"

#import <WebRTC/RTCCVPixelBuffer.h>
#import <WebRTC/RTCI420Buffer.h>
#import <WebRTC/RTCVideoFrame.h>
#import <WebRTC/RTCVideoFrameBuffer.h>
#import <WebRTC/RTCVideoRenderer.h>
#import <WebRTC/RTCVideoTrack.h>
#import <WebRTC/RTCYUVHelper.h>

#import "RemoteTrackRegistry.h"
#import "predcarepatient-Swift.h"

@interface PiPTrackRenderer () <RTCVideoRenderer>
@property (nonatomic, strong, nullable) RTCVideoTrack *track;
@end

@implementation PiPTrackRenderer

+ (PiPTrackRenderer *)shared {
    static PiPTrackRenderer *instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[PiPTrackRenderer alloc] init];
    });
    return instance;
}

- (PiPVideoView *)videoView {
    return PiPContainerView.shared.remoteVideoView;
}

- (BOOL)attachTrackId:(NSString *)trackId {
    if (trackId.length == 0) {
        return NO;
    }

    RTCVideoTrack *track = [[RemoteTrackRegistry shared] remoteTrackForId:trackId];
    if (track == nil) {
        NSLog(@"[PiPTrackRenderer] No registered remote track for id %@", trackId);
        return NO;
    }

    if (self.track == track) {
        return YES;
    }

    [self detach];
    self.track = track;
    [track addRenderer:self];
    [PiPContainerView.shared updateRemoteVisibility:YES];
    return YES;
}

- (void)detach {
    if (self.track != nil) {
        [self.track removeRenderer:self];
        self.track = nil;
    }
    [PiPContainerView.shared updateRemoteVisibility:NO];
}

#pragma mark - RTCVideoRenderer

- (void)setSize:(CGSize)size {
    // The display layer derives its size from the frames themselves.
}

- (void)renderFrame:(nullable RTCVideoFrame *)frame {
    if (frame == nil) {
        return;
    }

    PiPVideoView *view = [self videoView];
    [view setVideoRotation:(NSInteger)frame.rotation];

    if ([frame.buffer isKindOfClass:[RTCCVPixelBuffer class]]) {
        RTCCVPixelBuffer *buffer = (RTCCVPixelBuffer *)frame.buffer;
        [view enqueuePixelBuffer:buffer.pixelBuffer];
        return;
    }

    id<RTCI420Buffer> i420 = [frame.buffer toI420];
    if (i420 == nil) {
        return;
    }

    CVPixelBufferRef pixelBuffer = [view bgraPixelBufferWithWidth:i420.width height:i420.height];
    if (pixelBuffer == NULL) {
        return;
    }

    if (CVPixelBufferLockBaseAddress(pixelBuffer, 0) != kCVReturnSuccess) {
        return;
    }

    uint8_t *destination = (uint8_t *)CVPixelBufferGetBaseAddress(pixelBuffer);
    if (destination != NULL) {
        // libyuv's ARGB output is B,G,R,A in memory, which is what kCVPixelFormatType_32BGRA wants.
        [RTCYUVHelper I420ToARGB:i420.dataY
                      srcStrideY:i420.strideY
                            srcU:i420.dataU
                      srcStrideU:i420.strideU
                            srcV:i420.dataV
                      srcStrideV:i420.strideV
                         dstARGB:destination
                   dstStrideARGB:(int)CVPixelBufferGetBytesPerRow(pixelBuffer)
                           width:i420.width
                          height:i420.height];
    }

    CVPixelBufferUnlockBaseAddress(pixelBuffer, 0);
    [view enqueuePixelBuffer:pixelBuffer];
}

@end
