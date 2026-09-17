import React from 'react';
import { useAlertStore } from '../../../zustand/stores/useAlertStore';
import PopupAlert from './PopupAlert';

export const GlobalPopupAlert: React.FC = () => {
  const visible = useAlertStore(state => state.visible);
  const type = useAlertStore(state => state.type);
  const title = useAlertStore(state => state.title);
  const message = useAlertStore(state => state.message);
  const buttonText = useAlertStore(state => state.buttonText);
  const cancelText = useAlertStore(state => state.cancelText);
  const showCancel = useAlertStore(state => state.showCancel);
  const closeOnBackdrop = useAlertStore(state => state.closeOnBackdrop);
  const onPress = useAlertStore(state => state.onPress);
  const onCancel = useAlertStore(state => state.onCancel);
  const hideAlert = useAlertStore(state => state.hideAlert);

  if (!visible) return null;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      hideAlert();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      hideAlert();
    }
  };

  return (
    <PopupAlert
      visible={visible}
      type={type}
      title={title}
      message={message}
      buttonText={buttonText}
      cancelText={cancelText}
      showCancel={showCancel}
      closeOnBackdrop={closeOnBackdrop}
      onPress={handlePress}
      onCancel={handleCancel}
    />
  );
};

export default GlobalPopupAlert;
