#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ConnifyWidgetBridge, NSObject)

RCT_EXTERN_METHOD(updateWidgetState:(NSString *)jsonString
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getWidgetState:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
