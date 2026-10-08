package com.predcarepatient.pip

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = PipModule.NAME)
class PipModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  companion object {
    const val NAME = "PredPip"

    // Gives the video surfaces a frame or two to draw before revealing them.
    private const val CONTENT_READY_DELAY_MS = 120L
  }

  private val emitToJs: (String, WritableMap?) -> Unit = { event, params ->
    if (reactApplicationContext.hasActiveReactInstance()) {
      reactApplicationContext.emitDeviceEvent(event, params)
    }
  }

  private val cameraWatcher = CameraAvailabilityWatcher(reactContext, emitToJs)

  init {
    PipController.emitter = emitToJs
  }

  override fun getName(): String = NAME

  @ReactMethod
  fun setMeetingActive(active: Boolean) {
    PipController.setMeetingActive(reactApplicationContext.currentActivity, active)
    if (active) {
      cameraWatcher.start()
    } else {
      cameraWatcher.stop()
    }
  }

  /** Blocks Home / other-activity auto-PiP (e.g. while the system camera is open). */
  @ReactMethod
  fun setSuppressAutoEnter(suppress: Boolean, promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      PipController.setSuppressAutoEnter(null, suppress)
      promise.resolve(true)
      return
    }
    activity.runOnUiThread {
      PipController.setSuppressAutoEnter(activity, suppress)
      promise.resolve(true)
    }
  }

  @ReactMethod
  fun enterPip(promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      promise.resolve(false)
      return
    }
    activity.runOnUiThread { promise.resolve(PipController.enter(activity)) }
  }

  /** Called once the compact PiP stage has been laid out, so the native cover can go. */
  @ReactMethod
  fun pipContentReady() {
    PipController.hideCover(CONTENT_READY_DELAY_MS)
  }

  @ReactMethod
  fun isPipSupported(promise: Promise) {
    promise.resolve(PipController.isPipSupported(reactApplicationContext))
  }

  @ReactMethod
  fun isInPipMode(promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    promise.resolve(
        android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N &&
            activity?.isInPictureInPictureMode == true)
  }

  // Required by NativeEventEmitter on Android.
  @ReactMethod fun addListener(eventName: String) {}

  @ReactMethod fun removeListeners(count: Double) {}

  override fun invalidate() {
    cameraWatcher.stop()
    PipController.emitter = null
    super.invalidate()
  }
}
