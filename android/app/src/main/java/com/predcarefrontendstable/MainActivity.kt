package com.predcarefrontendstable

import android.app.PictureInPictureParams
import android.os.Build
import android.util.Rational
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "predcarepatient"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    /**
     * Called by PiPModule.setCallActive(true/false) from JS.
     * true  -> enable auto-enter PiP (Android 12+) or manual on Home press (O+)
     * false -> disable PiP completely so Home button works normally on all other screens
     */
    fun updatePiPParams(callActive: Boolean) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        try {
            val builder = PictureInPictureParams.Builder()
                .setAspectRatio(Rational(9, 16)) // portrait video call

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                // Android 12+: auto-enter PiP when Home is pressed -> only when call is active
                builder.setAutoEnterEnabled(callActive)
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                // Android 13+: hide the PiP button entirely when not in a call
                builder.setSeamlessResizeEnabled(callActive)
            }

            setPictureInPictureParams(builder.build())
        } catch (e: Exception) {
            // Not all devices support all PiP params -> safe to ignore
        }
    }

    /**
     * Triggered when Home button / Home swipe gesture is pressed on Android.
     * Enters OS Picture-in-Picture mode whenever a call is active.
     */
    override fun onUserLeaveHint() {
        super.onUserLeaveHint()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && PiPModule.isCallActive) {
            try {
                val params = PictureInPictureParams.Builder()
                    .setAspectRatio(Rational(9, 16))
                    .build()
                enterPictureInPictureMode(params)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private var wasInPiPMode: Boolean = false

    override fun onResume() {
        super.onResume()
        // If resumed from PiP mode via expand button, clear flag
        wasInPiPMode = false
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
