import notifee, { AndroidImportance } from '@notifee/react-native';
import {
  AuthorizationStatus,
  FirebaseMessagingTypes,
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import { showInfoToast } from '../lib/common/toast.utils';
import { getItem, setItem, STORAGE_KEYS } from '../lib/common/asyncStorage';

export interface DeviceSessionFields {
  platform: string;
  device_name: string;
  device_id: string;
  os_version: string;
  app_version: string;
  fcm_token: string;
}

/**
 * 1. requestNotificationPermission
 * Requests permission to receive push notifications on iOS and Android 13+ (POST_NOTIFICATIONS)
 */
export async function requestNotificationPermission(): Promise<{
  isGranted: boolean;
  status: number | null;
  token: string | null;
}> {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('[FCM] Android 13+ Notification Permission Denied');
        return { isGranted: false, status: 0, token: null };
      }
    }

    const messagingInstance = getMessaging();
    const authStatus = await requestPermission(messagingInstance, {
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    });

    const isGranted =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    let token: string | null = null;
    if (isGranted) {
      token = await getFirebaseToken();
    }

    console.log('[FCM] Permission Auth Status:', authStatus, 'Is Granted:', isGranted);
    if (isGranted) {
      await setupNotificationChannel();
    }
    return { isGranted, status: authStatus, token };
  } catch (error) {
    console.error('[FCM] Error requesting notification permission:', error);
    return { isGranted: false, status: null, token: null };
  }
}

/**
 * 2. getFirebaseToken
 * Fetches the current FCM token for this device with automatic retry for transient errors (e.g. SERVICE_NOT_AVAILABLE)
 * and persists it in AsyncStorage
 */
export async function getFirebaseToken(retries: number = 2, delayMs: number = 1500): Promise<string | null> {
  const messagingInstance = getMessaging();

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const token = await getToken(messagingInstance);
      if (token) {
        console.log('[FCM] Device Firebase FCM Token:', token);
        await setItem(STORAGE_KEYS.FCM_TOKEN, token);
        return token;
      } else {
        console.warn('[FCM] Failed to retrieve FCM token: Token is empty');
        break;
      }
    } catch (error: any) {
      const errorMsg = String(error?.message || error || '');
      const isServiceUnavailable =
        errorMsg.includes('SERVICE_NOT_AVAILABLE') ||
        error?.code === 'messaging/unknown' ||
        errorMsg.includes('ExecutionException');

      if (isServiceUnavailable && attempt <= retries) {
        console.warn(
          `[FCM] Google Play Services / FCM initializing or unavailable (attempt ${attempt}/${retries + 1}). Retrying in ${delayMs * attempt}ms...`
        );
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
        continue;
      }

      if (isServiceUnavailable) {
        console.warn(
          '[FCM] Google Play Services unavailable: If testing on an Android Emulator, ensure the AVD uses a "Google Play" image with internet access.'
        );
      } else {
        console.error('[FCM] Error getting Firebase token:', error);
      }
    }
  }

  const cachedToken = await getItem(STORAGE_KEYS.FCM_TOKEN);
  return cachedToken;
}

/**
 * 3. requestPermissionAndGetToken
 * Helper function that requests notification permission and returns FCM token if granted
 */
export async function requestPermissionAndGetToken(): Promise<{
  granted: boolean;
  token: string | null;
}> {
  const res = await requestNotificationPermission();
  return { granted: res.isGranted, token: res.token };
}

/**
 * 4. listenForTokenRefresh
 * Listens for FCM token refresh, persists new token to AsyncStorage, and executes callback
 */
export function listenForTokenRefresh(
  onTokenRefreshCallback: (newToken: string) => void
): () => void {
  console.log('[FCM] Listening for FCM token refresh...');
  const messagingInstance = getMessaging();
  const unsubscribe = onTokenRefresh(messagingInstance, async (newToken: string) => {
    console.log('[FCM] FCM Token Refreshed:', newToken);
    await setItem(STORAGE_KEYS.FCM_TOKEN, newToken);
    onTokenRefreshCallback(newToken);
  });
  return unsubscribe;
}

/**
 * 5. onForegroundNotification
 * Subscribes to foreground push notifications when the app is active
 */
export function onForegroundNotification(
  onMessageReceived?: (message: { title: string; body: string; data?: any }) => void
): () => void {
  console.log('[FCM] Registered foreground notification listener');
  const messagingInstance = getMessaging();
  const unsubscribe = onMessage(
    messagingInstance,
    async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('[FCM] Foreground Notification Received:', remoteMessage);

      const title =
        remoteMessage.notification?.title || remoteMessage.data?.title || 'New Notification';
      const body = remoteMessage.notification?.body || remoteMessage.data?.body || '';
      const notificationData = {
        title: String(title),
        body: String(body),
        data: remoteMessage.data,
      };

      showInfoToast(notificationData.body, notificationData.title);

      // Display system notification in mobile notification bar
      await displayLocalSystemNotification(
        notificationData.title,
        notificationData.body,
        notificationData.data
      );

      if (onMessageReceived) {
        onMessageReceived(notificationData);
      }
    }
  );

  return unsubscribe;
}

/**
 * Setup High-Importance Android Notification Channel for system status bar notifications
 */
export async function setupNotificationChannel(): Promise<string> {
  const channelId = 'default_channel_id';
  try {
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: channelId,
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
      });
    }
  } catch (error) {
    console.error('[FCM] Error creating notification channel:', error);
  }
  return channelId;
}

/**
 * Display a local system notification in the mobile status bar/notification tray
 */
export async function displayLocalSystemNotification(
  title: string,
  body: string,
  data?: any
): Promise<void> {
  try {
    const channelId = await setupNotificationChannel();
    await notifee.displayNotification({
      title,
      body,
      data,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
      },
      ios: {
        foregroundPresentationOptions: {
          badge: true,
          sound: true,
          banner: true,
          list: true,
        },
      },
    });
  } catch (error) {
    console.error('[FCM] Error displaying local system notification:', error);
  }
}

/**
 * 6. onBackgroundNotificationTap
 * Subscribes to notification click events when the app was running in the background
 */
export function onBackgroundNotificationTap(
  customNavRef?: any,
  onTapCallback?: (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => void
): () => void {
  console.log('[FCM] Registered background notification tap listener');
  const messagingInstance = getMessaging();
  const unsubscribe = onNotificationOpenedApp(
    messagingInstance,
    (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('[FCM] Notification opened app from background state:', remoteMessage);
      if (onTapCallback) {
        onTapCallback(remoteMessage);
      } else if (remoteMessage?.data?.screen) {
        const screenName = String(remoteMessage.data.screen);
        let params = undefined;
        if (remoteMessage.data.params) {
          try {
            params =
              typeof remoteMessage.data.params === 'string'
                ? JSON.parse(remoteMessage.data.params)
                : remoteMessage.data.params;
          } catch (e) {
            params = remoteMessage.data.params;
          }
        }
        if (customNavRef && customNavRef.isReady && customNavRef.isReady()) {
          // @ts-ignore
          customNavRef.navigate(screenName, params);
        }
      }
    }
  );

  return unsubscribe;
}

/**
 * 7. checkInitialNotification
 * Checks if the app was launched from a quit/killed state via a push notification tap
 */
export async function checkInitialNotification(
  customNavRef?: any,
  onTapCallback?: (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => void
): Promise<FirebaseMessagingTypes.RemoteMessage | null> {
  try {
    const messagingInstance = getMessaging();
    const remoteMessage = await getInitialNotification(messagingInstance);
    if (remoteMessage) {
      console.log('[FCM] App launched from quit state via notification:', remoteMessage);
      if (onTapCallback) {
        onTapCallback(remoteMessage);
      } else if (remoteMessage?.data?.screen) {
        const screenName = String(remoteMessage.data.screen);
        let params = undefined;
        if (remoteMessage.data.params) {
          try {
            params =
              typeof remoteMessage.data.params === 'string'
                ? JSON.parse(remoteMessage.data.params)
                : remoteMessage.data.params;
          } catch (e) {
            params = remoteMessage.data.params;
          }
        }
        if (customNavRef && customNavRef.isReady && customNavRef.isReady()) {
          // @ts-ignore
          customNavRef.navigate(screenName, params);
        }
      }
    } else {
      console.log('[FCM] No initial notification found on cold launch');
    }
    return remoteMessage;
  } catch (error) {
    console.error('[FCM] Error checking initial notification:', error);
    return null;
  }
}

/**
 * Helper to generate a unique UUID v4 string
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // fallback
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Retrieves an existing persistent device ID from AsyncStorage,
 * or generates a new unique UUID and persists it if one doesn't exist.
 */
export async function getOrCreateDeviceId(): Promise<string> {
  try {
    let deviceId = await getItem(STORAGE_KEYS.DEVICE_ID);
    if (!deviceId) {
      deviceId = generateUUID();
      await setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error('[FCM] Error retrieving or generating device ID:', error);
    return `device_${Platform.OS}_${Date.now()}`;
  }
}

/**
 * Gets a human-readable device name based on platform and model info
 */
export function getDeviceName(): string {
  if (Platform.OS === 'android') {
    const constants = Platform.constants as { Model?: string; Manufacturer?: string };
    const brand = constants.Manufacturer ? constants.Manufacturer.toUpperCase() : '';
    const model = constants.Model || 'Android Device';
    return brand ? `${brand} ${model}` : model;
  }
  return 'iOS Device';
}

/**
 * 8. getDeviceSessionFields
 * Helper to get device session information along with FCM token
 */
export async function getDeviceSessionFields(): Promise<DeviceSessionFields> {
  const token = (await getFirebaseToken()) || '';
  const deviceId = await getOrCreateDeviceId();
  return {
    platform: Platform.OS,
    device_name: getDeviceName(),
    device_id: deviceId,
    os_version: String(Platform.Version),
    app_version: '1.0.0',
    fcm_token: token,
  };
}

