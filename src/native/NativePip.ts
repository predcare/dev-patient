import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

let PipHandler: any = null;
if (Platform.OS === 'android') {
  try {
    const androidPip = require('@videosdk.live/react-native-pip-android');
    PipHandler = androidPip.default || androidPip;
  } catch (err) {
    console.warn('[NativePip] Failed to load @videosdk.live/react-native-pip-android', err);
  }
}

const { PiPManager } = NativeModules;

const iosEmitter =
  Platform.OS === 'ios' && PiPManager ? new NativeEventEmitter(PiPManager) : null;

export const NativePip = {
  /** Resolves true only when the system PiP window actually opened. */
  enterPipMode: async (width = 300, height = 500): Promise<boolean> => {
    try {
      if (Platform.OS === 'android' && PipHandler?.enterPipMode) {
        PipHandler.enterPipMode(width, height);
        return true;
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
      if (Platform.OS === 'android' && PipHandler) {
        PipHandler.setDefaultPipDimensions(300, 500);
        PipHandler.setMeetingScreenState(active);
      }
      if (Platform.OS === 'ios' && PiPManager?.setMeetingActive) {
        PiPManager.setMeetingActive(active);
      }
    } catch (err) {
      console.error('[NativePip] setMeetingScreenState error:', err);
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
        return Platform.Version >= 26;
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
};

export default NativePip;
