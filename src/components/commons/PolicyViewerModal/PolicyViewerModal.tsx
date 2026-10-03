import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { theme } from '../../../styled/theme.styled';

export interface PolicyItemType {
  title: string;
  version: string;
  content: string;
  updatedAt?: string;
}

interface PolicyViewerModalProps {
  visible: boolean;
  policy: PolicyItemType | null;
  onClose: () => void;
}

export const PolicyViewerModal: React.FC<PolicyViewerModalProps> = ({
  visible,
  policy,
  onClose,
}) => {
  if (!policy) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          {/* Header */}
          <View style={modalStyles.header}>
            <View style={modalStyles.titleRow}>
              <Text style={modalStyles.title}>{policy.title}</Text>
              <View style={modalStyles.versionBadge}>
                <Text style={modalStyles.versionText}>v{policy.version}</Text>
              </View>
            </View>
            {policy.updatedAt ? (
              <Text style={modalStyles.updatedText}>
                Last updated: {policy.updatedAt}
              </Text>
            ) : null}
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={modalStyles.scrollArea}
            contentContainerStyle={modalStyles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            <Text style={modalStyles.bodyText}>{policy.content}</Text>
          </ScrollView>

          {/* Footer Close Action */}
          <View style={modalStyles.footer}>
            <Pressable
              style={({ pressed }) => [
                modalStyles.closeButton,
                pressed && { opacity: 0.85 },
              ]}
              onPress={onClose}
            >
              <Text style={modalStyles.closeButtonText}>Close & Return</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    width: '100%',
    maxWidth: 520,
    maxHeight: '80%',
    overflow: 'hidden',
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.background,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  versionBadge: {
    backgroundColor: theme.colors.mintBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  updatedText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  scrollArea: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bodyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surface,
    alignItems: 'flex-end',
  },
  closeButton: {
    backgroundColor: theme.colors.brandBlue,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default PolicyViewerModal;
