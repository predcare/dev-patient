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
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.messageText}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 220,
    maxWidth: 320,
    elevation: 8,
    shadowColor: theme.colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  messageText: {
    marginTop: theme.spacing.lg,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default BackdropLoader;
