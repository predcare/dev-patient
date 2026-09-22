package com.predcarefrontendstable;

import android.os.Build;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class PiPModule extends ReactContextBaseJavaModule {

    // Read by MainActivity.onUserLeaveHint (Android 8-11 fallback)
    public static volatile boolean isCallActive = false;

    public PiPModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() { return "PiPModule"; }

    @ReactMethod
    public void setCallActive(boolean active, Promise promise) {
        isCallActive = active;
        android.app.Activity activity = getCurrentActivity();
        if (activity instanceof MainActivity) {
            activity.runOnUiThread(() -> {
                ((MainActivity) activity).updatePiPParams(active);
            });
        }
        if (promise != null) {
            promise.resolve(true);
        }
    }

    @ReactMethod
    public void enterPiP(Promise promise) {
        if (!isCallActive) {
            if (promise != null) promise.reject("NOT_IN_CALL", "Cannot enter PiP - no active call");
            return;
        }
        android.app.Activity activity = getCurrentActivity();
        if (activity == null) {
            if (promise != null) promise.reject("NO_ACTIVITY", "No activity");
            return;
        }
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            if (promise != null) promise.reject("NOT_SUPPORTED", "PiP requires Android 8+");
            return;
        }
        activity.runOnUiThread(() -> {
            try {
                android.app.PictureInPictureParams params =
                    new android.app.PictureInPictureParams.Builder()
                        .setAspectRatio(new android.util.Rational(9, 16))
                        .build();
                activity.enterPictureInPictureMode(params);
                if (promise != null) promise.resolve(true);
            } catch (Exception e) {
                if (promise != null) promise.reject("PIP_ERROR", e.getMessage());
            }
        });
    }

    @ReactMethod
    public void isSupported(Promise promise) {
        if (promise != null) promise.resolve(Build.VERSION.SDK_INT >= Build.VERSION_CODES.O);
    }

    @ReactMethod
    public void addListener(String eventName) {}

    @ReactMethod
    public void removeListeners(double count) {}

    public static void notifyPiPStateChanged(boolean isInPiP) {
        if (sReactContext != null) {
            try {
                sReactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onPiPModeChanged", isInPiP);
            } catch (Exception e) { /* ignore */ }
        }
    }

    public static void notifyPiPClosed() {
        if (sReactContext != null) {
            try {
                sReactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onPiPClosed", true);
            } catch (Exception e) { /* ignore */ }
        }
    }

    private static ReactApplicationContext sReactContext;

    @Override
    public void initialize() {
        super.initialize();
        sReactContext = getReactApplicationContext();
    }
}
