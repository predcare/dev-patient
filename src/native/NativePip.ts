import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

const { PiPManager, PredPip } = NativeModules;

const iosEmitter =
  Platform.OS === 'ios' && PiPManager ? new NativeEventEmitter(PiPManager) : null;

const androidEmitter =
  Platform.OS === 'android' && PredPip ? new NativeEventEmitter(PredPip) : null;

export const NativePip = {
  /** Resolves true only when the system PiP window actually opened. */
  enterPipMode: async (_width = 300, _height = 500): Promise<boolean> => {
    try {
      if (Platform.OS === 'android' && PredPip?.enterPip) {
        return Boolean(await PredPip.enterPip());
      }
      if (Platform.OS === 'ios' && PiPManager?.startPiP) {
        return Boolean(await PiPManager.startPiP());
      }
    } catch (err) {
      console.error('[NativePip] enterPipMode error:', err);
    }
    return false;
  },

  exitPipMode: (): void => {
    try {
      if (Platform.OS === 'ios' && PiPManager?.stopPiP) {
        PiPManager.stopPiP();
      }
    } catch (err) {
      console.error('[NativePip] exitPipMode error:', err);
    }
  },

  setMeetingScreenState: (active: boolean): void => {
    try {
      if (Platform.OS === 'android' && PredPip?.setMeetingActive) {
        PredPip.setMeetingActive(active);
      }
      if (Platform.OS === 'ios' && PiPManager?.setMeetingActive) {
        PiPManager.setMeetingActive(active);
      }
    } catch (err) {
      console.error('[NativePip] setMeetingScreenState error:', err);
    }
  },

  /** Android only: stop the meeting from auto-entering system PiP (camera / gallery Activities). */
  setSuppressAutoEnter: async (suppress: boolean): Promise<void> => {
    if (Platform.OS !== 'android' || !PredPip?.setSuppressAutoEnter) {
      return;
    }
    try {
      await PredPip.setSuppressAutoEnter(suppress);
    } catch (err) {
      console.error('[NativePip] setSuppressAutoEnter error:', err);
    }
  },

  attachRemoteRenderer: (trackId?: string): void => {
    if (Platform.OS === 'ios' && trackId && PiPManager?.attachRemoteTrack) {
      PiPManager.attachRemoteTrack(trackId);
    }
  },

  detachRemoteRenderer: (): void => {
    if (Platform.OS === 'ios' && PiPManager?.detachRemoteTrack) {
      PiPManager.detachRemoteTrack();
    }
  },

  setPlaceholderText: (text: string): void => {
    if (Platform.OS === 'ios' && PiPManager?.setPlaceholderText) {
      PiPManager.setPlaceholderText(text);
    }
  },

  isPipSupported: async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        return Boolean(await PredPip?.isPipSupported?.());
      }
      if (Platform.OS === 'ios' && PiPManager?.isPiPSupported) {
        return await PiPManager.isPiPSupported();
      }
    } catch {
      return false;
    }
    return false;
  },

  /** True when the camera can keep capturing while the app sits in the background. */
  isBackgroundCameraSupported: async (): Promise<boolean> => {
    try {
      // The call runs a camera|microphone foreground service on Android.
      if (Platform.OS === 'android') {
        return true;
      }
      if (Platform.OS === 'ios' && PiPManager?.isBackgroundCameraSupported) {
        return Boolean(await PiPManager.isBackgroundCameraSupported());
      }
    } catch {
      return false;
    }
    return false;
  },

  addPipChangeListener: (listener: (active: boolean) => void) => {
    if (!iosEmitter) {
      return null;
    }
    return iosEmitter.addListener('onPipChanged', (event: { active?: boolean }) => {
      listener(Boolean(event?.active));
    });
  },

  addAndroidPipListener: (listener: (active: boolean) => void) => {
    if (!androidEmitter) {
      return null;
    }
    return androidEmitter.addListener('onAndroidPipChanged', (event: { active?: boolean }) => {
      listener(Boolean(event?.active));
    });
  },

  addAndroidPipDismissListener: (listener: () => void) => {
    if (!androidEmitter) {
      return null;
    }
    return androidEmitter.addListener('onAndroidPipDismissed', listener);
  },

  /** Fires just before Android starts the PiP transition (Home / swipe up). */
  addAndroidPipWillEnterListener: (listener: () => void) => {
    if (!androidEmitter) {
      return null;
    }
    return androidEmitter.addListener('onAndroidPipWillEnter', listener);
  },

  addAndroidCameraUnavailableListener: (listener: () => void) => {
    if (!androidEmitter) {
      return null;
    }
    return androidEmitter.addListener('onAndroidCameraUnavailable', listener);
  },

  addAndroidCameraAvailableListener: (listener: () => void) => {
    if (!androidEmitter) {
      return null;
    }
    return androidEmitter.addListener('onAndroidCameraAvailable', listener);
  },

  notifyAndroidPipContentReady: (): void => {
    if (Platform.OS === 'android' && PredPip?.pipContentReady) {
      PredPip.pipContentReady();
    }
  },
};

export default NativePip;
