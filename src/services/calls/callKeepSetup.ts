import { Platform } from 'react-native';
import RNCallKeep from 'react-native-callkeep';

let setupDone: Promise<unknown> | null = null;

// Android only for now: iOS needs VoIP pushes from the backend before CallKit can be used.
// Also called from the FCM background handler, so it must not depend on React.
export const ensureCallKeep = (): Promise<unknown> => {
  if (Platform.OS !== 'android') return Promise.resolve();

  setupDone ??= RNCallKeep.setup({
    ios: { appName: 'PRED Care' },
    android: {
      alertTitle: 'Permission required',
      alertDescription: 'PRED Care needs this to ring for doctor calls',
      cancelButton: 'Cancel',
      okButton: 'OK',
      additionalPermissions: [],
      // The app shows its own ring, so no phone account or phone permissions are needed.
      selfManaged: true,
      // The ring must continue if the background JS instance stops.
      endCallsWhenReactNativeStops: false,
    },
  }).catch(err => {
    setupDone = null;
    console.warn('[CallKeep] Setup failed:', err);
  });

  return setupDone;
};
