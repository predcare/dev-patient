import { NativeModules } from 'react-native';

/** Check if Native Firebase module is available */
export const isFirebaseNativeReady = !!NativeModules.RNFBAppModule;

let messagingFn = null;

export const AuthorizationStatus = {
  NOT_DETERMINED: -1,
  DENIED: 0,
  AUTHORIZED: 1,
  PROVISIONAL: 2,
};

if (isFirebaseNativeReady) {
  try {
    const mod = require('@react-native-firebase/messaging');
    messagingFn = mod.default;
    const nativeAuthStatus = mod.AuthorizationStatus || messagingFn?.AuthorizationStatus;
    if (nativeAuthStatus) {
      Object.assign(AuthorizationStatus, nativeAuthStatus);
    }
  } catch (e) {
    console.warn('[Firebase] Failed to load messaging module:', e?.message || e);
  }
} else {
  console.warn(
    '[Firebase] Native module RNFBAppModule not found. Rebuild the app after pod install / gradle sync.'
  );
}

/** Access default Firebase Messaging instance safely */
export default function messaging() {
  if (!messagingFn) {
    throw new Error('Firebase Messaging is not available. Rebuild the native app.');
  }
  return messagingFn();
}

messaging.AuthorizationStatus = AuthorizationStatus;

export function getMessaging() {
  return messagingFn;
}

/** Check if current authorization status is granted */
export function isPermissionGranted(status) {
  return (
    status === AuthorizationStatus.AUTHORIZED ||
    status === AuthorizationStatus.PROVISIONAL ||
    status === 1 ||
    status === 2
  );
}

/** Request FCM permission safely */
export async function requestFirebasePermission() {
  if (!isFirebaseNativeReady || !messagingFn) {
    console.warn('[Firebase] Cannot request permission: Native module not ready.');
    return { status: AuthorizationStatus.DENIED, isGranted: false };
  }
  try {
    const status = await messagingFn().requestPermission();
    const isGranted = isPermissionGranted(status);
    return { status, isGranted };
  } catch (error) {
    console.error('[Firebase] Permission request error:', error?.message || error);
    return { status: AuthorizationStatus.DENIED, isGranted: false };
  }
}

/** Get current permission status without prompting */
export async function checkFirebasePermission() {
  if (!isFirebaseNativeReady || !messagingFn) {
    return { status: AuthorizationStatus.DENIED, isGranted: false };
  }
  try {
    const status = await messagingFn().hasPermission();
    const isGranted = isPermissionGranted(status);
    return { status, isGranted };
  } catch (error) {
    console.warn('[Firebase] Check permission error:', error?.message || error);
    return { status: AuthorizationStatus.DENIED, isGranted: false };
  }
}

/** Get FCM Token safely */
export async function getFirebaseToken() {
  if (!isFirebaseNativeReady || !messagingFn) {
    console.warn('[Firebase] Cannot get FCM token: Native module not ready.');
    return null;
  }
  try {
    const token = await messagingFn().getToken();
    return token || null;
  } catch (error) {
    console.error('[Firebase] Error fetching FCM token:', error?.message || error);
    return null;
  }
}
