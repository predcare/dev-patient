package com.predcarepatient

import android.content.res.Configuration
import android.os.Build
import android.util.Log
import androidx.lifecycle.Lifecycle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.predcarepatient.pip.PipController

class MainActivity : ReactActivity() {

  private companion object {
    const val TAG = "PredPip"
  }

  // Set when the PiP window closes but we don't yet know if it was expanded or dismissed.
  private var awaitingPipExitResult = false

  // React Native stops mounting UI while the host is paused, and a PiP activity stays paused.
  // While this is true we have re-resumed React so the PiP window keeps updating.
  private var reactKeptAliveForPip = false

  // A will-enter event was sent to JS; if PiP never actually starts, JS must be told to revert.
  private var pipWillEnterPending = false

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "predcarepatient"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onResume() {
    super.onResume()
    Log.d(TAG, "onResume")
    awaitingPipExitResult = false
    reactKeptAliveForPip = false
    PipController.hideCoverImmediately()
    if (pipWillEnterPending && !isInPipMode()) {
      pipWillEnterPending = false
      PipController.emitPipChanged(false)
    }
    PipController.applyParams(this)
  }

  override fun onPause() {
    super.onPause()
    if (isInPipMode()) {
      Log.d(TAG, "onPause in PiP, keeping React resumed")
      keepReactAliveForPip()
    }
  }

  // Home button / recents. API 31+ then auto-enters via setAutoEnterEnabled; API 26-30 enter here.
  override fun onUserLeaveHint() {
    super.onUserLeaveHint()
    if (!PipController.canEnter(this) || isInPipMode()) return

    pipWillEnterPending = true
    PipController.showCover(this)
    PipController.emitPipWillEnter()
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
      PipController.enter(this)
    }
  }

  override fun onPictureInPictureRequested(): Boolean {
    if (PipController.canEnter(this)) {
      pipWillEnterPending = true
      PipController.showCover(this)
      PipController.emitPipWillEnter()
    }
    return PipController.enter(this) || super.onPictureInPictureRequested()
  }

  override fun onPictureInPictureModeChanged(
      isInPictureInPictureMode: Boolean,
      newConfig: Configuration
  ) {
    super.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig)
    PipController.emitPipChanged(isInPictureInPictureMode)

    if (isInPictureInPictureMode) {
      PipController.showCover(this)
      pipWillEnterPending = false
      awaitingPipExitResult = false
      keepReactAliveForPip()
      return
    }

    PipController.hideCoverImmediately()

    // Expanding resumes the activity; closing the window stops it.
    when {
      lifecycle.currentState.isAtLeast(Lifecycle.State.RESUMED) -> awaitingPipExitResult = false
      lifecycle.currentState.isAtLeast(Lifecycle.State.STARTED) -> awaitingPipExitResult = true
      else -> PipController.emitPipDismissed()
    }
  }

  override fun onStop() {
    super.onStop()
    Log.d(TAG, "onStop (inPip=${isInPipMode()})")
    if (reactKeptAliveForPip) {
      reactKeptAliveForPip = false
      reactHost?.onHostPause(this)
    }
    if (awaitingPipExitResult) {
      awaitingPipExitResult = false
      PipController.emitPipDismissed()
    }
  }

  private fun keepReactAliveForPip() {
    if (reactKeptAliveForPip) return
    reactKeptAliveForPip = true
    reactHost?.onHostResume(this)
  }

  private fun isInPipMode(): Boolean =
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && isInPictureInPictureMode
}
