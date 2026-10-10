package com.predcarepatient.pip

import android.app.Activity
import android.app.AppOpsManager
import android.app.PictureInPictureParams
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.Color
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.Process
import android.util.Log
import android.util.Rational
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.predcarepatient.R

/**
 * Process-wide PiP state shared by [PipModule] (JS side) and MainActivity (lifecycle side).
 */
object PipController {
  private const val TAG = "PredPip"

  const val EVENT_PIP_WILL_ENTER = "onAndroidPipWillEnter"
  const val EVENT_PIP_CHANGED = "onAndroidPipChanged"
  const val EVENT_PIP_DISMISSED = "onAndroidPipDismissed"

  // Portrait call layout; Android only accepts ratios between 1:2.39 and 2.39:1.
  private val ASPECT_RATIO = Rational(9, 16)

  // White so the blue wordmark and black label stay readable while the window shrinks.
  private val COVER_COLOR = Color.WHITE
  private const val COVER_TIMEOUT_MS = 2500L
  private const val MIN_PIP_TRANSITION_DURATION_MS = 600L

  private val mainHandler = Handler(Looper.getMainLooper())
  private var coverView: View? = null
  private var coverShownTimeMs: Long = 0L

  private val hideCoverRunnable = Runnable {
    coverView?.let { (it.parent as? ViewGroup)?.removeView(it) }
    if (coverView != null) Log.d(TAG, "cover hidden")
    coverView = null
  }

  @Volatile
  var isMeetingActive: Boolean = false
    private set

  /** When true, Home / camera / gallery must not auto-enter system PiP. */
  @Volatile
  var suppressAutoEnter: Boolean = false
    private set

  var emitter: ((String, WritableMap?) -> Unit)? = null

  fun isPipSupported(context: Context): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return false
    if (!context.packageManager.hasSystemFeature(PackageManager.FEATURE_PICTURE_IN_PICTURE)) {
      return false
    }
    return try {
      val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
      val mode =
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            appOps.unsafeCheckOpNoThrow(
                AppOpsManager.OPSTR_PICTURE_IN_PICTURE, Process.myUid(), context.packageName)
          } else {
            @Suppress("DEPRECATION")
            appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_PICTURE_IN_PICTURE, Process.myUid(), context.packageName)
          }
      mode == AppOpsManager.MODE_ALLOWED
    } catch (e: Exception) {
      true
    }
  }

  fun setMeetingActive(activity: Activity?, active: Boolean) {
    isMeetingActive = active
    if (!active) suppressAutoEnter = false
    activity?.let { applyParams(it) }
  }

  fun setSuppressAutoEnter(activity: Activity?, suppress: Boolean) {
    suppressAutoEnter = suppress
    Log.d(TAG, "suppressAutoEnter=$suppress")
    activity?.let { applyParams(it) }
  }

  /** Pushes the current params so API 31+ auto-enters PiP only while a meeting is active. */
  fun applyParams(activity: Activity) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O || !isPipSupported(activity)) return
    activity.runOnUiThread {
      try {
        activity.setPictureInPictureParams(buildParams())
      } catch (e: Exception) {
        Log.w(TAG, "setPictureInPictureParams failed: ${e.message}")
      }
    }
  }

  fun enter(activity: Activity): Boolean {
    if (!canEnter(activity)) return false
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return false
    if (activity.isInPictureInPictureMode) return true
    return try {
      activity.enterPictureInPictureMode(buildParams())
    } catch (e: Exception) {
      Log.w(TAG, "enterPictureInPictureMode failed: ${e.message}")
      false
    }
  }

  fun canEnter(activity: Activity): Boolean =
      isMeetingActive && !suppressAutoEnter && isPipSupported(activity)

  /**
   * Covers the React UI while it swaps to the compact PiP stage, so the shrinking window never
   * shows the previous screen. Removed by [hideCover] once JS reports the stage is laid out.
   */
  fun showCover(activity: Activity) {
    activity.runOnUiThread {
      if (coverView != null) return@runOnUiThread
      val root = (activity.window?.decorView as? ViewGroup)
          ?: activity.findViewById<ViewGroup>(android.R.id.content)
          ?: return@runOnUiThread

      val cover =
          FrameLayout(activity).apply {
            setBackgroundColor(COVER_COLOR)
            elevation = 10_000f
            translationZ = 10_000f
            isClickable = false
            val labelGapPx =
                TypedValue.applyDimension(
                        TypedValue.COMPLEX_UNIT_DIP, 4f, activity.resources.displayMetrics)
                    .toInt()
            addView(
                LinearLayout(activity).apply {
                  orientation = LinearLayout.VERTICAL
                  gravity = Gravity.CENTER_HORIZONTAL
                  val logo =
                      ImageView(activity).apply {
                        setImageResource(R.drawable.predcare_logo)
                        adjustViewBounds = true
                        scaleType = ImageView.ScaleType.FIT_CENTER
                        addOnLayoutChangeListener { view, _, _, _, _, _, _, _, _ ->
                          val parentWidth =
                              (view.parent as? View)?.width ?: return@addOnLayoutChangeListener
                          if (parentWidth <= 0) return@addOnLayoutChangeListener
                          val inset = (parentWidth * 0.15f).toInt()
                          val lp =
                              view.layoutParams as? LinearLayout.LayoutParams
                                  ?: return@addOnLayoutChangeListener
                          if (lp.leftMargin != inset || lp.rightMargin != inset) {
                            lp.leftMargin = inset
                            lp.rightMargin = inset
                            view.layoutParams = lp
                          }
                        }
                      }
                  addView(
                      logo,
                      LinearLayout.LayoutParams(
                          ViewGroup.LayoutParams.MATCH_PARENT,
                          ViewGroup.LayoutParams.WRAP_CONTENT))
                  addView(
                      TextView(activity).apply {
                        text = "PRED Care Consultation"
                        setTextColor(Color.BLACK)
                        setTextSize(TypedValue.COMPLEX_UNIT_SP, 11f)
                        gravity = Gravity.CENTER
                      },
                      LinearLayout.LayoutParams(
                              ViewGroup.LayoutParams.WRAP_CONTENT,
                              ViewGroup.LayoutParams.WRAP_CONTENT)
                          .apply { topMargin = labelGapPx })
                },
                FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT,
                    Gravity.CENTER))
          }
      root.addView(
          cover,
          ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
      cover.bringToFront()
      root.requestLayout()
      root.invalidate()
      coverView = cover
      coverShownTimeMs = System.currentTimeMillis()
      Log.d(TAG, "cover shown")
      mainHandler.removeCallbacks(hideCoverRunnable)
      mainHandler.postDelayed(hideCoverRunnable, COVER_TIMEOUT_MS)
    }
  }

  fun hideCoverWhenReady(delayMs: Long = 250L) {
    mainHandler.post {
      val elapsed = System.currentTimeMillis() - coverShownTimeMs
      val remaining = (MIN_PIP_TRANSITION_DURATION_MS - elapsed).coerceAtLeast(0L)
      val totalDelay = remaining + delayMs
      Log.d(TAG, "hideCoverWhenReady: elapsed=$elapsed ms, delaying hide by $totalDelay ms")
      mainHandler.removeCallbacks(hideCoverRunnable)
      mainHandler.postDelayed(hideCoverRunnable, totalDelay)
    }
  }

  fun hideCoverImmediately() {
    mainHandler.removeCallbacks(hideCoverRunnable)
    mainHandler.post(hideCoverRunnable)
  }

  fun hideCover(delayMs: Long = 0L) {
    if (delayMs > 0) {
      hideCoverWhenReady(delayMs)
    } else {
      hideCoverImmediately()
    }
  }

  fun emitPipWillEnter() {
    Log.d(TAG, "will enter PiP")
    emitter?.invoke(EVENT_PIP_WILL_ENTER, null)
  }

  fun emitPipChanged(active: Boolean) {
    Log.d(TAG, "PiP changed: active=$active")
    val params = Arguments.createMap().apply { putBoolean("active", active) }
    emitter?.invoke(EVENT_PIP_CHANGED, params)
  }

  fun emitPipDismissed() {
    Log.d(TAG, "PiP dismissed")
    emitter?.invoke(EVENT_PIP_DISMISSED, null)
  }

  @RequiresApi(Build.VERSION_CODES.O)
  private fun buildParams(): PictureInPictureParams {
    val builder = PictureInPictureParams.Builder().setAspectRatio(ASPECT_RATIO)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      builder.setAutoEnterEnabled(isMeetingActive && !suppressAutoEnter)
      builder.setSeamlessResizeEnabled(false)
    }
    return builder.build()
  }
}
