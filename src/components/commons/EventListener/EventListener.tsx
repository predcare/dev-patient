import { useCallback } from 'react';
import useEventEmitter from '../../../hooks/commons/useEventEmitter';
import useAuthProfile from '../../../hooks/react-query/common/useAuthProfile';
import { resetToLogin } from '../../../lib/common/navigation.utils';
import { showErrorToast, showInfoToast, showSuccessToast } from '../../../lib/common/toast.utils';
import events from '../../../lib/services/events/events';
import { navigationRef } from '../../../navigation/navigationRef';
import { useAuthStore } from '../../../zustand/stores/useAuthStore';
import { queryClient } from '../../providers/ReactQueryProvider';

interface EventListenerProps {
  onLogout?: () => void;
}

export default function EventListener({ onLogout }: EventListenerProps) {
  useAuthProfile();
  const { logout } = useAuthStore(state => state);
  const handleLogout = useCallback(
    async (data?: { intentional?: boolean }) => {
      if (data?.intentional) {
        showSuccessToast('Logged out successfully');
      } else {
        showErrorToast('Please login again.', 'Session Expired');
      }
      onLogout?.();
      await queryClient.clear();
      await logout();
      resetToLogin(navigationRef);
    },
    [onLogout, logout]
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

  return null;
}
