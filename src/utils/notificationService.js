// ============================================================
//  src/utils/notificationService.js  (PATIENT APP)
//  Place at: PATIENTAPP/src/utils/notificationService.js
// ============================================================

import messaging, {
  isFirebaseNativeReady,
  AuthorizationStatus,
  requestFirebasePermission,
} from './firebaseMessaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, PermissionsAndroid } from 'react-native';

/** Matches android/app/build.gradle versionName */
const APP_VERSION = '1.1';
const FCM_TOKEN_KEY = 'fcm_token';
const DEVICE_ID_KEY = 'device_id';

// ============================================================
// 1. REQUEST NOTIFICATION PERMISSION
//    Requests Android 13+ POST_NOTIFICATIONS & iOS permissions cleanly
// ============================================================
export async function requestNotificationPermission() {
  if (!isFirebaseNativeReady) {
    console.warn('[NotificationService] Firebase native module not ready.');
    return { isGranted: false, status: AuthorizationStatus.DENIED, token: null };
  }

  try {
    // Android 13+ (API level 33+) explicit permission request
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        const hasAndroidPerm = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (!hasAndroidPerm) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Notification Permission',
              message: 'PredCare Patient App needs notification permission to send appointment updates and reminders.',
              buttonPositive: 'Allow',
              buttonNegative: 'Cancel',
            }
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.warn('[NotificationService] Android POST_NOTIFICATIONS denied by user.');
          }
        }
      } catch (androidErr) {
        console.warn('[NotificationService] Android 13+ POST_NOTIFICATIONS error:', androidErr?.message || androidErr);
      }
    }

    // Request iOS / Firebase messaging permission
    const { status, isGranted } = await requestFirebasePermission();

    let token = null;
    try {
      token = await messaging().getToken();
      if (token) {
        console.log('Patient FCM Token length:', token.length);
        console.log('Patient FCM Token (first 40):', token.substring(0, 40));
        await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      }
    } catch (tokenErr) {
      console.warn('[NotificationService] Failed to retrieve FCM token:', tokenErr?.message || tokenErr);
    }

    return { isGranted, status, token };
  } catch (error) {
    console.error('[NotificationService] Error requesting notification permission:', error);
    return { isGranted: false, status: AuthorizationStatus.DENIED, token: null };
  }
}

// ============================================================
// 2. REQUEST PERMISSION + GET TOKEN
//    Primary method used by Login/Signup/OTP screens
// ============================================================
export async function requestPermissionAndGetToken(userId = null) {
  if (!isFirebaseNativeReady) {
    console.warn('[NotificationService] Native module not ready - cannot get token');
    return null;
  }

  try {
    // Check if token already cached in AsyncStorage
    const cachedToken = await AsyncStorage.getItem(FCM_TOKEN_KEY);

    // Request permission & fresh token
    const { token } = await requestNotificationPermission();

    const finalToken = token || cachedToken || null;
    return finalToken;
  } catch (error) {
    console.error('[NotificationService] Error in requestPermissionAndGetToken:', error);
    return null;
  }
}

// ============================================================
// 3. GET FCM TOKEN QUIETLY
//    Get FCM token without forcing permission popup if cached
// ============================================================
export async function getFcmTokenQuiet() {
  if (!isFirebaseNativeReady) {
    console.warn('[NotificationService] Native module not ready - cannot get token');
    return null;
  }

  try {
    // 1. Return cached token if available
    const cached = await AsyncStorage.getItem(FCM_TOKEN_KEY);
    if (cached) return cached;

    // 2. Otherwise request permission and fetch token
    const token = await requestPermissionAndGetToken();
    return token;
  } catch (error) {
    console.error('[NotificationService] Error getting FCM token quietly:', error);
    return null;
  }
}

// ============================================================
// 4. DEVICE SESSION FIELDS
//    Prepares device metadata + FCM token for OTP/auth requests
// ============================================================
export async function getDeviceSessionFields() {
  const fcm_token = (await getFcmTokenQuiet()) || '';

  let device_id = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!device_id) {
    device_id = `rn-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    await AsyncStorage.setItem(DEVICE_ID_KEY, device_id);
  }

  const brand = Platform.constants?.Brand || Platform.constants?.Manufacturer || '';
  const model = Platform.constants?.Model || '';
  const device_name =
    [brand, model].filter(Boolean).join(' ').trim() ||
    (Platform.OS === 'ios' ? 'iOS Device' : 'Android Device');

  return {
    platform: Platform.OS || 'android',
    device_name,
    device_id,
    os_version: String(Platform.Version ?? ''),
    app_version: APP_VERSION,
    fcm_token,
  };
}

// ============================================================
// 5. LISTEN FOR TOKEN REFRESH
//    FCM rotates token - save to storage & invoke callback
// ============================================================
export function listenForTokenRefresh(callbackOrUserId) {
  if (!isFirebaseNativeReady) return () => {};

  return messaging().onTokenRefresh(async newToken => {
    console.log('[NotificationService] FCM Token refreshed, saving to AsyncStorage...');
    if (newToken) {
      await AsyncStorage.setItem(FCM_TOKEN_KEY, newToken);
    }
    if (typeof callbackOrUserId === 'function') {
      callbackOrUserId(newToken);
    }
  });
}

// ============================================================
// 6. FOREGROUND NOTIFICATION LISTENER
//    App is OPEN - FCM does NOT auto-show notification banner
// ============================================================
export function onForegroundNotification(onNotification) {
  if (!isFirebaseNativeReady) return () => {};

  return messaging().onMessage(async remoteMessage => {
    console.log('[NotificationService] Foreground notification received');
    console.log('   Title:', remoteMessage.notification?.title || remoteMessage.data?.title);
    console.log('   Type:', remoteMessage.data?.type);

    if (onNotification) {
      onNotification({
        title: remoteMessage.notification?.title || remoteMessage.data?.title || 'New Notification',
        body: remoteMessage.notification?.body || remoteMessage.data?.body || '',
        data: remoteMessage.data || {},
      });
    }
  });
}

// ============================================================
// 7. BACKGROUND TAP HANDLER
//    App in BACKGROUND - user taps notification in system tray
// ============================================================
export function onBackgroundNotificationTap(navigationRef) {
  if (!isFirebaseNativeReady) return () => {};

  return messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('[NotificationService] Tapped background notification:', remoteMessage?.data?.type);
    navigateFromNotification(navigationRef, remoteMessage.data);
  });
}

// ============================================================
// 8. QUIT STATE HANDLER
//    App was KILLED - user taps notification to open app
// ============================================================
export async function checkInitialNotification(navigationRef) {
  if (!isFirebaseNativeReady) return;

  const remoteMessage = await messaging().getInitialNotification();
  if (remoteMessage) {
    console.log('[NotificationService] App opened from killed state:', remoteMessage?.data?.type);
    setTimeout(() => {
      navigateFromNotification(navigationRef, remoteMessage.data);
    }, 1500);
  }
}

// ============================================================
// 9. NAVIGATE BASED ON NOTIFICATION TYPE
// ============================================================
export function navigateFromNotification(navigationRef, data) {
  if (!navigationRef?.current) {
    console.warn('[NotificationService] navigationRef not ready for notification navigation');
    return;
  }

  const type = (data?.event_category || data?.type || data?.category || '').toLowerCase();
  console.log('[NotificationService] Navigating for type:', type);

  switch (type) {
    case 'appointment':
    case 'appointment_booked':
    case 'appointment_confirmed':
    case 'appointment_rescheduled':
    case 'appointment_cancelled':
    case 'payment_success':
    case 'meeting_started':
    case 'doctor_joined':
    case 'doctor_in_call':
    case 'call_started':
    case 'video_call_started':
      navigationRef.current.navigate('Appointments');
      break;

    case 'prescription_uploaded':
      navigationRef.current.navigate('PrescriptionsList');
      break;

    case 'doctor_message':
      navigationRef.current.navigate('Dashboard');
      break;

    default:
      navigationRef.current.navigate('Dashboard');
      break;
  }
}
