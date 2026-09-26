package com.predcarefrontendstable

import android.app.PictureInPictureParams
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Rational
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "predcarepatient"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    private val mainHandler = Handler(Looper.getMainLooper())

    private fun buildPiPParams(callActive: Boolean = true): PictureInPictureParams {
        val builder = PictureInPictureParams.Builder()
            .setAspectRatio(Rational(9, 16)) // portrait video call

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            builder.setSeamlessResizeEnabled(callActive)
        }

        return builder.build()
    }

    fun updatePiPParams(callActive: Boolean) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        try {
            setPictureInPictureParams(buildPiPParams(callActive))
        } catch (e: Exception) {
            // Not all devices support all PiP params -> safe to ignore
        }
    }

    /**
     * Triggered when Home button / Home swipe gesture is pressed on Android.
     * 1. Dispatches onPiPEntering to React so it hides all controls and shows video only.
     * 2. Waits 200ms for React to render, then calls enterPictureInPictureMode.
     */
    override fun onUserLeaveHint() {
        super.onUserLeaveHint()
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O || !PiPModule.isCallActive) return

        // Do not enter PiP when opening camera/gallery for photo capture
        if (PiPModule.isCameraCaptureActive) return

        try {
            // Step 1: Tell React Native to switch to video-only layout immediately
            PiPModule.notifyPiPEntering()

            // Step 2: Wait 200ms for React to render the clean video surface, then enter PiP
            mainHandler.postDelayed({
                try {
                    if (PiPModule.isCallActive && !PiPModule.isCameraCaptureActive) {
                        enterPictureInPictureMode(buildPiPParams(true))
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }, 200)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private var wasInPiPMode: Boolean = false

    override fun onResume() {
        super.onResume()
        // Only notify PiP state changed if the activity was genuinely in PiP mode
        if (wasInPiPMode) {
            wasInPiPMode = false
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                if (!isInPictureInPictureMode) {
                    PiPModule.notifyPiPStateChanged(false)
                }
            } else {
                PiPModule.notifyPiPStateChanged(false)
            }
        }
    }

    override fun onStop() {
        super.onStop()
        // If stopped while in PiP or immediately after exiting PiP without entering foreground (user tapped 'X')
        if (wasInPiPMode && PiPModule.isCallActive) {
            wasInPiPMode = false
            PiPModule.notifyPiPClosed()
        }
    }

    override fun onPictureInPictureModeChanged(
        isInPiPMode: Boolean,
        newConfig: android.content.res.Configuration
    ) {
        super.onPictureInPictureModeChanged(isInPiPMode, newConfig)
        if (isInPiPMode) {
            wasInPiPMode = true
        }
        // Notify JS so MeetingScreen can switch to video-only render mode
        PiPModule.notifyPiPStateChanged(isInPiPMode)
    }
}
