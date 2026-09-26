package com.predcarefrontendstable;

import android.content.Context;
import android.hardware.camera2.CameraManager;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class PiPModule extends ReactContextBaseJavaModule {

    // Read by MainActivity.onUserLeaveHint (Android 8-11 fallback)
    public static volatile boolean isCallActive = false;

    // Set to true while opening camera/gallery to prevent onUserLeaveHint from triggering PiP
    public static volatile boolean isCameraCaptureActive = false;

    // Tracks if another app (e.g. WhatsApp/system Camera) seized the camera hardware
    public static volatile boolean wasCameraInterrupted = false;

    private static CameraManager.AvailabilityCallback cameraAvailabilityCallback = null;
    private static ReactApplicationContext sReactContext;

    public PiPModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() { return "PiPModule"; }

    @ReactMethod
    public void setCameraCaptureActive(boolean active, Promise promise) {
        isCameraCaptureActive = active;
        if (promise != null) {
            promise.resolve(true);
        }
    }

    @ReactMethod
    public void setCallActive(boolean active, Promise promise) {
        isCallActive = active;
        if (!active) {
            wasCameraInterrupted = false;
            unregisterCameraAvailabilityListener();
        } else {
            registerCameraAvailabilityListener();
        }

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
                notifyPiPEntering();
                new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(() -> {
                    try {
                        if (isCallActive) {
                            android.app.PictureInPictureParams params =
                                new android.app.PictureInPictureParams.Builder()
                                    .setAspectRatio(new android.util.Rational(9, 16))
                                    .build();
                            activity.enterPictureInPictureMode(params);
                        }
                        if (promise != null) promise.resolve(true);
                    } catch (Exception e) {
                        if (promise != null) promise.reject("PIP_ERROR", e.getMessage());
                    }
                }, 200);
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

    private synchronized void registerCameraAvailabilityListener() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) return;
        if (cameraAvailabilityCallback != null) return;

        try {
            CameraManager cameraManager = (CameraManager) getReactApplicationContext().getSystemService(Context.CAMERA_SERVICE);
            if (cameraManager == null) return;

            cameraAvailabilityCallback = new CameraManager.AvailabilityCallback() {
                @Override
                public void onCameraAvailable(@NonNull String cameraId) {
                    super.onCameraAvailable(cameraId);
                    if (isCallActive && wasCameraInterrupted) {
                        wasCameraInterrupted = false;
                        notifyCameraAccessRestored(cameraId);
                    }
                }

                @Override
                public void onCameraUnavailable(@NonNull String cameraId) {
                    super.onCameraUnavailable(cameraId);
                    if (isCallActive) {
                        wasCameraInterrupted = true;
                        notifyCameraInterrupted(cameraId);
                    }
                }

                @Override
                public void onCameraAccessPrioritiesChanged() {
                    super.onCameraAccessPrioritiesChanged();
                    if (isCallActive && wasCameraInterrupted) {
                        wasCameraInterrupted = false;
                        notifyCameraAccessRestored(null);
                    }
                }
            };

            Handler handler = new Handler(Looper.getMainLooper());
            cameraManager.registerAvailabilityCallback(cameraAvailabilityCallback, handler);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private synchronized void unregisterCameraAvailabilityListener() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) return;
        if (cameraAvailabilityCallback == null) return;

        try {
            CameraManager cameraManager = (CameraManager) getReactApplicationContext().getSystemService(Context.CAMERA_SERVICE);
            if (cameraManager != null) {
                cameraManager.unregisterAvailabilityCallback(cameraAvailabilityCallback);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            cameraAvailabilityCallback = null;
        }
    }

    public static void notifyCameraInterrupted(String cameraId) {
        if (sReactContext != null) {
            try {
                sReactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onCameraInterrupted", cameraId != null ? cameraId : "");
            } catch (Exception e) { /* ignore */ }
        }
    }

    public static void notifyCameraAccessRestored(String cameraId) {
        if (sReactContext != null) {
            try {
                sReactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onCameraAccessRestored", cameraId != null ? cameraId : "");
            } catch (Exception e) { /* ignore */ }
        }
    }

    public static void notifyActivityFocusRestored() {
        if (sReactContext != null) {
            try {
                sReactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onActivityFocusRestored", true);
            } catch (Exception e) { /* ignore */ }
        }
    }

    public static void notifyPiPEntering() {
        if (sReactContext != null) {
            try {
                sReactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onPiPEntering", true);
            } catch (Exception e) { /* ignore */ }
        }
    }

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

    @Override
    public void initialize() {
        super.initialize();
        sReactContext = getReactApplicationContext();
    }

    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        unregisterCameraAvailabilityListener();
        sReactContext = null;
    }
}
