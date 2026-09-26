import { NativeModules, Platform } from 'react-native';
import {
  CameraOptions,
  ImageLibraryOptions,
  ImagePickerResponse,
  launchCamera as rawLaunchCamera,
  launchImageLibrary as rawLaunchImageLibrary,
} from 'react-native-image-picker';
import { useMeetingStore } from '../../zustand/stores/useMeetingStore';

const { PiPModule } = NativeModules;

/**
 * Safely launches the Camera while managing consultation video stream pause/resume
 * and native Android PiP prevention.
 */
export const safeLaunchCamera = (
  options: CameraOptions,
  callback: (response: ImagePickerResponse) => void
) => {
  try {
    // Notify native PiP module not to enter PiP when external camera intent opens
    PiPModule?.setCameraCaptureActive?.(true);

    // Pause active video consultation camera to free hardware sensor
    useMeetingStore.getState().setIsCameraPausedForCapture(true);

    setTimeout(
      () => {
        rawLaunchCamera(options, response => {
          try {
            // Reset camera capture & pause state
            PiPModule?.setCameraCaptureActive?.(false);
            useMeetingStore.getState().setIsCameraPausedForCapture(false);
          } catch (e) {
            // Ignore reset error
          }
          callback(response);
        });
      },
      Platform.OS === 'android' ? 250 : 50
    );
  } catch (err) {
    PiPModule?.setCameraCaptureActive?.(false);
    useMeetingStore.getState().setIsCameraPausedForCapture(false);
    callback({
      didCancel: false,
      errorCode: 'others',
      errorMessage: err instanceof Error ? err.message : 'Unknown camera error',
    });
  }
};

/**
 * Safely launches the Photo Gallery / File picker while managing consultation video stream
 * pause/resume and native Android PiP prevention.
 */
export const safeLaunchImageLibrary = (
  options: ImageLibraryOptions,
  callback: (response: ImagePickerResponse) => void
) => {
  try {
    // Notify native PiP module not to enter PiP when photo picker opens
    PiPModule?.setCameraCaptureActive?.(true);

    // Pause camera before opening picker to avoid resource contention
    useMeetingStore.getState().setIsCameraPausedForCapture(true);

    setTimeout(
      () => {
        rawLaunchImageLibrary(options, response => {
          try {
            // Reset camera capture & pause state
            PiPModule?.setCameraCaptureActive?.(false);
            useMeetingStore.getState().setIsCameraPausedForCapture(false);
          } catch (e) {
            // Ignore reset error
          }
          callback(response);
        });
      },
      Platform.OS === 'android' ? 250 : 50
    );
  } catch (err) {
    PiPModule?.setCameraCaptureActive?.(false);
    useMeetingStore.getState().setIsCameraPausedForCapture(false);
    callback({
      didCancel: false,
      errorCode: 'others',
      errorMessage: err instanceof Error ? err.message : 'Unknown gallery error',
    });
  }
};
