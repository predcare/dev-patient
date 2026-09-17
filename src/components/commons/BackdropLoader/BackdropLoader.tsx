import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../styled/theme.styled';
import { useLoadingStore } from '../../../zustand/stores/useLoadingStore';

export const BackdropLoader: React.FC = () => {
  const isLoading = useLoadingStore(state => state.isLoading);
  const message = useLoadingStore(state => state.message);

  if (!isLoading) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={isLoading}
      statusBarTranslucent
      hardwareAccelerated
      supportedOrientations={[
        'portrait',
        'portrait-upside-down',
        'landscape',
        'landscape-left',
        'landscape-right',
      ]}
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.loaderCard}>
          <View style={styles.loaderCircle}>
            <ActivityIndicator size="large" color={theme.colors.white} />
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {message || 'Please wait...'}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.80)',
  },

  loaderCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 130,
    maxWidth: 260,
    paddingVertical: 18,
    paddingHorizontal: 22,
  },

  loaderCircle: {
    width: 78,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderRadius: 29,
    backgroundColor: 'rgba(255, 255, 255, 0.30)',
  },

  title: {
    fontSize: 14,
    fontWeight: '600',

    color: '#FFFFFF',

    textAlign: 'center',

    lineHeight: 20,

    letterSpacing: 0.1,
  },
});

export default BackdropLoader;
