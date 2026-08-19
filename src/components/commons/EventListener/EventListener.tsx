import React, { useCallback } from 'react';
import Toast from 'react-native-toast-message';
import useEventEmitter from '../../../hooks/commons/useEventEmitter';
import useAuthProfile from '../../../hooks/react-query/common/useAuthProfile';
import { showErrorToast, showInfoToast, showSuccessToast } from '../../../lib/common/toast.utils';
import events from '../../../lib/services/events/events';
import { useAuthStore } from '../../../zustand/stores/useAuthStore';

interface EventListenerProps {
  onLogout?: () => void;
}

export default function EventListener({ onLogout }: EventListenerProps) {
  const logout = useAuthStore(state => state.logout);
  useAuthProfile();
  const handleLogout = useCallback(
    (data?: { intentional?: boolean }) => {
      if (data?.intentional) {
        showSuccessToast('Logged out successfully');
      } else {
        showErrorToast('Please login again.', 'Session Expired');
      }
      logout();
      onLogout?.();
    },
    [logout, onLogout]
  );

  const showNotifications = useCallback(
    (data: { message: string; options: { variant: string } }) => {
      const variant = data?.options?.variant;
      if (variant === 'error' || variant === 'warning') {
        showErrorToast(data.message || '');
      } else if (variant === 'success') {
        showSuccessToast(data.message);
      } else {
        showInfoToast(data.message);
      }
    },
    []
  );

  useEventEmitter(events.showToast, showNotifications);
  useEventEmitter(events.logoutCurrentUser, handleLogout);

  return <Toast position="bottom" />;
}
