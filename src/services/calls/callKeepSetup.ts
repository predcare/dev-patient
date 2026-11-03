import { NativeModules, Platform } from 'react-native';
import RNCallKeep from 'react-native-callkeep';

// Managed mode: Android's Phone app and iOS CallKit draw the incoming call screen.
const CALLKEEP_OPTIONS = {
  ios: {
    appName: 'PRED Care',
    supportsVideo: false,
    includesCallsInRecents: false,
    maximumCallGroups: '1',
    maximumCallsPerCallGroup: '1',
    ringtoneSound: 'ringtone.caf',
    imageName: 'CallKitBlank',
  },
  android: {
    alertTitle: 'Allow doctor calls',
    alertDescription:
      "Turn on PRED Care in your calling accounts so your doctor's video calls ring like a normal phone call.",
    cancelButton: 'Not now',
    okButton: 'Open settings',
    additionalPermissions: [],
    selfManaged: false,
    // The call must keep ringing if the background JS instance stops.
    endCallsWhenReactNativeStops: false,
    // Transparent icon: without one, the Phone app shows the app's launcher icon on the call screen.
    imageName: 'ic_call_blank',
  },
};

let nativeSetupDone = false;

/**
 * Registers the calling account without any prompt. Safe in the FCM background handler, where
 * there's no screen for a prompt. iOS is set up natively in AppDelegate.
 */
export const ensureCallKeep = async (): Promise<void> => {
  if (Platform.OS !== 'android' || nativeSetupDone) return;
  try {
    // The native part of RNCallKeep.setup(), without the JS permission alert.
    NativeModules.RNCallKeep?.setup(CALLKEEP_OPTIONS.android);
    nativeSetupDone = true;
  } catch (err) {
    console.warn('[CallKeep] Native setup failed:', err);
  }
};

/**
 * Asks for the phone permission and opens the calling-account settings if the account is off.
 * Needs a screen, so call it only while the app is open. Android only.
 */
export const setupCallKeepWithPrompt = async (): Promise<void> => {
  if (Platform.OS !== 'android') return;
  try {
    await RNCallKeep.setup(CALLKEEP_OPTIONS);
    nativeSetupDone = true;
  } catch {
    // The patient tapped "Not now"; calls fall back to the Notifee ring.
  }
};

// iOS always has CallKit. Android needs the patient to have turned the calling account on.
export const canShowSystemCall = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') return true;
  try {
    return Boolean(await RNCallKeep.hasPhoneAccount());
  } catch {
    return false;
  }
};
