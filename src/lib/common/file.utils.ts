import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import * as FileViewerModule from 'react-native-file-viewer';
import * as RNFSModule from 'react-native-fs';
import { showErrorToast, showSuccessToast } from './toast.utils';

export type FileAction = 'open' | 'save';

export interface SaveOrOpenFileParams {
  /** Raw file data as ArrayBuffer, Uint8Array, or base64 string */
  data: ArrayBuffer | Uint8Array | string;
  /** Desired filename e.g. "Invoice_INV_1001.pdf" */
  filename: string;
  /** Action: "open" to preview in system default viewer, "save" to download to device storage */
  action: FileAction;
  /** Optional custom success message */
  successMessage?: string;
  /** Optional custom error toast title */
  errorTitle?: string;
  /** Optional custom notification title for Android status bar */
  notificationTitle?: string;
  /** Optional custom notification message for Android status bar */
  notificationMessage?: string;
}

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Safely resolves RNFS module interop across default and namespace imports.
 */
const getRNFS = (): any => {
  return (RNFSModule as any)?.default || RNFSModule;
};

/**
 * Safely resolves FileViewer module interop across default and namespace imports.
 */
const getFileViewer = (): any => {
  return (FileViewerModule as any)?.default || FileViewerModule;
};

/**
 * Requests Android notification & storage permissions to allow system status bar download notifications.
 */
const requestAndroidPermissions = async (): Promise<void> => {
  if (Platform.OS !== 'android') return;
  try {
    if (Platform.Version >= 33) {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    } else if (Platform.Version < 29) {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
    }
  } catch (err) {
    console.log('[file.utils] Permission request error:', err);
  }
};

/**
 * Safely converts an ArrayBuffer, Uint8Array, or base64 string into a base64 string.
 * Uses a pure JavaScript bitwise encoder to guarantee zero runtime dependencies
 * and avoid missing btoa/global errors in Hermes or JSC engines.
 */
export const arrayBufferToBase64 = (data: ArrayBuffer | Uint8Array | string): string => {
  if (typeof data === 'string') return data;
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  let base64 = '';
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < len ? bytes[i + 1] : 0;
    const b3 = i + 2 < len ? bytes[i + 2] : 0;

    const c1 = b1 >> 2;
    const c2 = ((b1 & 3) << 4) | (b2 >> 4);
    const c3 = ((b2 & 15) << 2) | (b3 >> 6);
    const c4 = b3 & 63;

    base64 += BASE64_CHARS[c1] + BASE64_CHARS[c2];
    base64 += i + 1 < len ? BASE64_CHARS[c3] : '=';
    base64 += i + 2 < len ? BASE64_CHARS[c4] : '=';
  }
  return base64;
};

export const sanitizeFilename = (filename: string, defaultName = 'Document.pdf'): string => {
  if (!filename) return defaultName;
  const lastDot = filename.lastIndexOf('.');
  let name = filename;
  let ext = '';
  if (lastDot !== -1) {
    name = filename.substring(0, lastDot);
    ext = filename.substring(lastDot);
  }
  const safeName = name.replace(/[^A-Za-z0-9_-]/g, '_');
  return `${safeName}${ext || '.pdf'}`;
};

export const saveOrOpenFile = async ({
  data,
  filename,
  action,
  successMessage,
  errorTitle = 'Failed',
  notificationTitle,
  notificationMessage,
}: SaveOrOpenFileParams): Promise<string | null> => {
  try {
    const RNFS = getRNFS();
    const FileViewer = getFileViewer();

    if (!RNFS || typeof RNFS.CachesDirectoryPath === 'undefined') {
      const nativeModuleErr =
        'Native FileSystem module (react-native-fs) is not linked or loaded. Please rebuild your native app (npx react-native run-android).';
      console.warn(nativeModuleErr);
      showErrorToast('Please rebuild app (npx react-native run-android)', 'Module Not Linked');
      return null;
    }

    const cleanFilename = sanitizeFilename(filename);
    const cachePath = `${RNFS.CachesDirectoryPath}/${cleanFilename}`;
    const base64Data = arrayBufferToBase64(data);

    if (await RNFS.exists(cachePath)) {
      await RNFS.unlink(cachePath);
    }

    await RNFS.writeFile(cachePath, base64Data, 'base64');

    if (action === 'open') {
      if (FileViewer && typeof FileViewer.open === 'function') {
        try {
          await FileViewer.open(cachePath, {
            showOpenWithDialog: true,
          });
        } catch (err: any) {
          try {
            await FileViewer.open(cachePath, {
              showOpenWithDialog: false,
            });
          } catch (viewerError: any) {
            showErrorToast(
              viewerError?.message || 'No PDF viewer application found on device',
              'Cannot Open File'
            );
          }
        }
      }
      return cachePath;
    } else {
      await requestAndroidPermissions();

      const candidateDirs = [
        RNFS.DownloadDirectoryPath,
        Platform.OS === 'android' ? `${RNFS.ExternalStorageDirectoryPath}/Download` : null,
        RNFS.ExternalDirectoryPath,
        RNFS.DocumentDirectoryPath,
        RNFS.CachesDirectoryPath,
      ].filter(Boolean) as string[];

      let destPath: string | null = null;
      let lastError: any = null;

      for (const dir of candidateDirs) {
        try {
          if (!(await RNFS.exists(dir))) {
            await RNFS.mkdir(dir);
          }
          const testPath = `${dir}/${cleanFilename}`;
          if (await RNFS.exists(testPath)) {
            await RNFS.unlink(testPath);
          }
          await RNFS.copyFile(cachePath, testPath);
          destPath = testPath;
          break;
        } catch (copyErr: any) {
          lastError = copyErr;
          console.log(`[file.utils] Could not save to ${dir}:`, copyErr?.message);
        }
      }

      if (!destPath) {
        throw lastError || new Error('Failed to save file to any accessible directory');
      }

      if (Platform.OS === 'android') {
        if (typeof RNFS.scanFile === 'function') {
          try {
            await RNFS.scanFile(destPath);
          } catch {}
        }

        await notifyDownloadComplete(
          destPath,
          cleanFilename,
          notificationTitle || 'Download Complete',
          notificationMessage || `${cleanFilename} saved to Downloads. Tap to open.`
        );
      }

      showSuccessToast(successMessage || `${cleanFilename} saved to Downloads`);
      return destPath;
    }
  } catch (error: any) {
    console.log('file.utils error:', error?.message);
    showErrorToast(error?.message || 'Could not process file', errorTitle);
    return null;
  }
};

/**
 * Triggers native system download notification with tap-to-open intent (Android).
 */
export const notifyDownloadComplete = async (
  filePath: string,
  fileName: string,
  title = 'Download Complete',
  message?: string
): Promise<void> => {
  if (Platform.OS !== 'android') return;
  const { DownloadNotificationModule } = NativeModules;
  if (
    DownloadNotificationModule &&
    typeof DownloadNotificationModule.notifyDownloadComplete === 'function'
  ) {
    try {
      await DownloadNotificationModule.notifyDownloadComplete(
        filePath,
        fileName,
        title,
        message || `${fileName} saved to Downloads. Tap to open.`
      );
    } catch (notifErr) {
      console.log('[file.utils] Notification module error:', notifErr);
    }
  }
};

export const handleInvoicePdfAction = async (
  inv: { id: number | string; invoice_number?: string },
  action: FileAction,
  pdfData: ArrayBuffer | Uint8Array | string
): Promise<string | null> => {
  const safeName = (inv.invoice_number || `INV-${inv.id}`).replace(/[^A-Za-z0-9_-]/g, '_');
  const filename = `Invoice_${safeName}.pdf`;

  return saveOrOpenFile({
    data: pdfData,
    filename,
    action,
    notificationTitle: 'Invoice Downloaded',
    notificationMessage: `${filename} saved to Downloads. Tap to open.`,
  });
};
