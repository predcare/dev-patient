import { useToastStore } from '../../zustand/stores/useToastStore';

export const showSuccessToast = (message: string, title = 'Success') => {
  useToastStore.getState().showToast({
    type: 'success',
    title,
    message,
    duration: 3500,
  });
};

export const showErrorToast = (message: string, title = 'Error') => {
  useToastStore.getState().showToast({
    type: 'error',
    title,
    message,
    duration: 3500,
  });
};

export const showInfoToast = (message: string, title = 'Info') => {
  useToastStore.getState().showToast({
    type: 'info',
    title,
    message,
    duration: 3500,
  });
};

export const showWarningToast = (message: string, title = 'Warning') => {
  useToastStore.getState().showToast({
    type: 'warning',
    title,
    message,
    duration: 3500,
  });
};
