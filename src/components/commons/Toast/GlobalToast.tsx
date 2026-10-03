import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toastStyles as styles } from '../../../styled/Toast.styled';
import { useToastStore } from '../../../zustand/stores/useToastStore';
import CustomToast from './CustomToast';

export const GlobalToast: React.FC = () => {
  const toast = useToastStore(state => state.toast);
  const insets = useSafeAreaInsets();

  if (!toast) return null;

  const topOffset = Math.max(insets.top, 12) + 8;

  return (
    <View style={[styles.overlayContainer, { paddingTop: topOffset }]} pointerEvents="box-none">
      <CustomToast key={toast.id} toast={toast} />
    </View>
  );
};

export default GlobalToast;
