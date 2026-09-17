import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  message: string;
  showLoader: (message?: string) => void;
  hideLoader: () => void;
}

export const useLoadingStore = create<LoadingState>(set => ({
  isLoading: false,
  message: 'Loading...',
  showLoader: (message = 'Please wait...') =>
    set({
      isLoading: true,
      message,
    }),
  hideLoader: () =>
    set({
      isLoading: false,
      message: 'Please wait...',
    }),
}));
