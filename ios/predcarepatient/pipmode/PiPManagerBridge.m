#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(PiPManager, RCTEventEmitter)

RCT_EXTERN_METHOD(setupPiP)
RCT_EXTERN_METHOD(stopPiP)
RCT_EXTERN_METHOD(setMeetingActive:(BOOL)active)
RCT_EXTERN_METHOD(attachRemoteTrack:(NSString *)trackId)
RCT_EXTERN_METHOD(detachRemoteTrack)
RCT_EXTERN_METHOD(setPlaceholderText:(NSString *)text)
RCT_EXTERN_METHOD(startPiP:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(isPiPSupported:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(isBackgroundCameraSupported:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
