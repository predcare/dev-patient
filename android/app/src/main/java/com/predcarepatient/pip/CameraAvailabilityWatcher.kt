package com.predcarepatient.pip

import android.content.Context
import android.hardware.camera2.CameraManager
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap

/**
 * Notifies JS when another app steals or releases the camera, so native PiP can restore
 * the meeting webcam after WhatsApp / system Camera closes.
 */
class CameraAvailabilityWatcher(
    context: Context,
    private val emit: (String, WritableMap?) -> Unit
) {
  companion object {
    private const val TAG = "PredPip"
    const val EVENT_UNAVAILABLE = "onAndroidCameraUnavailable"
    const val EVENT_AVAILABLE = "onAndroidCameraAvailable"
    private const val AVAILABLE_DEBOUNCE_MS = 400L
  }

  private val cameraManager = context.applicationContext.getSystemService(Context.CAMERA_SERVICE) as CameraManager
  private val mainHandler = Handler(Looper.getMainLooper())
  private var registered = false
  private var interrupted = false

  private val emitAvailableRunnable = Runnable {
    if (!interrupted) return@Runnable
    interrupted = false
    Log.d(TAG, "camera available after interruption")
    emit(EVENT_AVAILABLE, null)
  }

  private val callback =
      object : CameraManager.AvailabilityCallback() {
        override fun onCameraUnavailable(cameraId: String) {
          interrupted = true
          mainHandler.removeCallbacks(emitAvailableRunnable)
          Log.d(TAG, "camera unavailable: $cameraId")
          val params = Arguments.createMap().apply { putString("cameraId", cameraId) }
          emit(EVENT_UNAVAILABLE, params)
        }

        override fun onCameraAvailable(cameraId: String) {
          if (!interrupted) return
          Log.d(TAG, "camera available: $cameraId")
          mainHandler.removeCallbacks(emitAvailableRunnable)
          mainHandler.postDelayed(emitAvailableRunnable, AVAILABLE_DEBOUNCE_MS)
        }
      }

  fun start() {
    if (registered) return
    interrupted = false
    try {
      cameraManager.registerAvailabilityCallback(callback, mainHandler)
      registered = true
      Log.d(TAG, "camera availability watcher started")
    } catch (e: Exception) {
      Log.w(TAG, "registerAvailabilityCallback failed: ${e.message}")
    }
  }

  fun stop() {
    mainHandler.removeCallbacks(emitAvailableRunnable)
    interrupted = false
    if (!registered) return
    try {
      cameraManager.unregisterAvailabilityCallback(callback)
    } catch (e: Exception) {
      Log.w(TAG, "unregisterAvailabilityCallback failed: ${e.message}")
    }
    registered = false
    Log.d(TAG, "camera availability watcher stopped")
  }
}
