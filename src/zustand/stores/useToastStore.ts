import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  id?: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastState {
  toast: ToastConfig | null;
  showToast: (config: Omit<ToastConfig, 'id'>) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>(set => ({
  toast: null,
  showToast: config => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    set({
      toast: { ...config, id },
    });
  },
  hideToast: () => set({ toast: null }),
}));
