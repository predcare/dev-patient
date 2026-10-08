package com.predcarepatient.pip

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = PipModule.NAME)
class PipModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  companion object {
    const val NAME = "PredPip"

    // Gives the video surfaces a frame or two to draw before revealing them.
    private const val CONTENT_READY_DELAY_MS = 120L
  }

  init {
    PipController.emitter = { event, params ->
      if (reactApplicationContext.hasActiveReactInstance()) {
        reactApplicationContext.emitDeviceEvent(event, params)
      }
    }
  }

  override fun getName(): String = NAME

  @ReactMethod
  fun setMeetingActive(active: Boolean) {
    PipController.setMeetingActive(reactApplicationContext.currentActivity, active)
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
    PipController.emitter = null
    super.invalidate()
  }
}
