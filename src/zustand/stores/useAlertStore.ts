import { create } from 'zustand';
import { AlertType } from '../../components/commons/PopupAlert/PopupAlert';

export interface ShowAlertOptions {
  type?: AlertType;
  title?: string;
  message?: string;
  buttonText?: string;
  cancelText?: string;
  showCancel?: boolean;
  closeOnBackdrop?: boolean;
  onPress?: () => void;
  onCancel?: () => void;
}

export interface ShowConfirmOptions {
  title?: string;
  message: string;
  buttonText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface AlertState {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  buttonText: string;
  cancelText: string;
  showCancel: boolean;
  closeOnBackdrop: boolean;
  onPress?: () => void;
  onCancel?: () => void;

  showAlert: (options: ShowAlertOptions) => void;
  hideAlert: () => void;
  showSuccess: (message: string, title?: string, onPress?: () => void) => void;
  showError: (message: string, title?: string, onPress?: () => void) => void;
  showWarning: (message: string, title?: string, onPress?: () => void) => void;
  showInfo: (message: string, title?: string, onPress?: () => void) => void;
  showConfirm: (options: ShowConfirmOptions) => void;
  showComingSoon: (message?: string, title?: string) => void;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  visible: false,
  type: 'info',
  title: '',
  message: '',
  buttonText: 'OK',
  cancelText: 'Cancel',
  showCancel: false,
  closeOnBackdrop: false,
  onPress: undefined,
  onCancel: undefined,

  showAlert: (options: ShowAlertOptions) => {
    set({
      visible: true,
      type: options.type || 'info',
      title: options.title || '',
      message: options.message || '',
      buttonText: options.buttonText || 'OK',
      cancelText: options.cancelText || 'Cancel',
      showCancel: options.showCancel ?? false,
      closeOnBackdrop: options.closeOnBackdrop ?? false,
      onPress: options.onPress,
      onCancel: options.onCancel,
    });
  },

  hideAlert: () => {
    set({
      visible: false,
      onPress: undefined,
      onCancel: undefined,
    });
  },

  showSuccess: (message: string, title = 'Success', onPress?: () => void) => {
    get().showAlert({
      type: 'success',
      title,
      message,
      onPress: () => {
        get().hideAlert();
        onPress?.();
      },
    });
  },

  showError: (message: string, title = 'Error', onPress?: () => void) => {
    get().showAlert({
      type: 'error',
      title,
      message,
      onPress: () => {
        get().hideAlert();
        onPress?.();
      },
    });
  },

  showWarning: (message: string, title = 'Warning', onPress?: () => void) => {
    get().showAlert({
      type: 'warning',
      title,
      message,
      onPress: () => {
        get().hideAlert();
        onPress?.();
      },
    });
  },

  showInfo: (message: string, title = 'Information', onPress?: () => void) => {
    get().showAlert({
      type: 'info',
      title,
      message,
      onPress: () => {
        get().hideAlert();
        onPress?.();
      },
    });
  },

  showConfirm: ({
    title = 'Confirmation',
    message,
    buttonText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
  }: ShowConfirmOptions) => {
    get().showAlert({
      type: 'confirm',
      title,
      message,
      showCancel: true,
      buttonText,
      cancelText,
      onPress: () => {
        get().hideAlert();
        onConfirm();
      },
      onCancel: () => {
        get().hideAlert();
        onCancel?.();
      },
    });
  },

  showComingSoon: (message = 'This feature is coming soon.', title = 'Coming Soon') => {
    get().showAlert({
      type: 'info',
      title,
      message,
      buttonText: 'OK',
      onPress: () => {
        get().hideAlert();
      },
    });
  },
}));
