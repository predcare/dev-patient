import { Platform } from 'react-native';
import {
  CameraOptions,
  ImageLibraryOptions,
  ImagePickerResponse,
  launchCamera as rawLaunchCamera,
  launchImageLibrary as rawLaunchImageLibrary,
} from 'react-native-image-picker';
import {
  beginAndroidPickerGuard,
  endAndroidPickerGuard,
  pauseMeetingCameraForCapture,
  resumeMeetingCameraAfterCapture,
} from '../../hooks/commons/meeting/meetingCaptureHandoff';
import { useMeetingStore } from '../../zustand/stores/useMeetingStore';

const launchCameraAndroid = async (
  options: CameraOptions,
  callback: (response: ImagePickerResponse) => void
) => {
  try {
    await pauseMeetingCameraForCapture();
    rawLaunchCamera(options, response => {
      void resumeMeetingCameraAfterCapture().finally(() => {
        callback(response);
      });
    });
  } catch (err) {
    try {
      await resumeMeetingCameraAfterCapture();
    } catch {
      // Ignore reset error
    }
    callback({
      didCancel: false,
      errorCode: 'others',
      errorMessage: err instanceof Error ? err.message : 'Unknown camera error',
    });
  }
};

const launchImageLibraryAndroid = async (
  options: ImageLibraryOptions,
  callback: (response: ImagePickerResponse) => void
) => {
  try {
    await beginAndroidPickerGuard();
    rawLaunchImageLibrary(options, response => {
      void endAndroidPickerGuard().finally(() => {
        callback(response);
      });
    });
  } catch (err) {
    try {
      await endAndroidPickerGuard();
    } catch {
      // Ignore reset error
    }
    callback({
      didCancel: false,
      errorCode: 'others',
      errorMessage: err instanceof Error ? err.message : 'Unknown gallery error',
    });
  }
};

/**
 * Safely launches the Camera while managing consultation video stream pause/resume.
 */
export const safeLaunchCamera = (
  options: CameraOptions,
  callback: (response: ImagePickerResponse) => void
) => {
  if (Platform.OS === 'android') {
    void launchCameraAndroid(options, callback);
    return;
  }

  try {
    // Pause active video consultation camera to free hardware sensor
    useMeetingStore.getState().setIsCameraPausedForCapture(true);

    setTimeout(
      () => {
        rawLaunchCamera(options, response => {
          try {
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
    useMeetingStore.getState().setIsCameraPausedForCapture(false);
    callback({
      didCancel: false,
      errorCode: 'others',
      errorMessage: err instanceof Error ? err.message : 'Unknown camera error',
    });
  }
};

/**
 * Safely launches the Photo Gallery / File picker while managing consultation video stream pause/resume.
 */
export const safeLaunchImageLibrary = (
  options: ImageLibraryOptions,
  callback: (response: ImagePickerResponse) => void
) => {
  if (Platform.OS === 'android') {
    void launchImageLibraryAndroid(options, callback);
    return;
  }

  try {
    // Pause camera before opening picker to avoid resource contention
    useMeetingStore.getState().setIsCameraPausedForCapture(true);

    setTimeout(
      () => {
        rawLaunchImageLibrary(options, response => {
          try {
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
    useMeetingStore.getState().setIsCameraPausedForCapture(false);
    callback({
      didCancel: false,
      errorCode: 'others',
      errorMessage: err instanceof Error ? err.message : 'Unknown gallery error',
    });
  }
};
