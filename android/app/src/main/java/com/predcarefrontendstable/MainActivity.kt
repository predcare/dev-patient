package com.predcarefrontendstable

import android.content.res.Configuration
import android.os.Bundle
import androidx.activity.OnBackPressedCallback
import live.videosdk.pipmode.AndroidPipModule
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "predcarepatient"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                val mainApp = application as? MainApplication
                val manager = mainApp?.reactNativeHost?.reactInstanceManager
                val context = manager?.currentReactContext

                if (context != null) {
                    manager.onBackPressed()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                    isEnabled = true
                }
            }
        })
    }

    override fun invokeDefaultOnBackPressed() {
        moveTaskToBack(true)
    }

    override fun onUserLeaveHint() {
        super.onUserLeaveHint()
        try {
            AndroidPipModule.pipModeReq()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun onPictureInPictureModeChanged(
        isInPiPMode: Boolean,
        newConfig: Configuration
    ) {
        super.onPictureInPictureModeChanged(isInPiPMode, newConfig)
        AndroidPipModule.pipModeChanged(isInPiPMode)
    }
}
