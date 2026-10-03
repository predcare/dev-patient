import { StyleSheet } from 'react-native';
import { theme } from './theme.styled';

export const toastStyles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999999,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  toastCard: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  contentBox: {
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    flexWrap: 'wrap',
  },
  closeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
});

export const getToastVariantStyles = (type: 'success' | 'error' | 'warning' | 'info') => {
  switch (type) {
    case 'success':
      return {
        accentColor: theme.colors.success,
        iconBg: theme.colors.successLight,
        iconColor: theme.colors.success,
        borderColor: '#BBF7D0',
      };
    case 'error':
      return {
        accentColor: theme.colors.danger,
        iconBg: theme.colors.dangerLight,
        iconColor: theme.colors.danger,
        borderColor: '#FECACA',
      };
    case 'warning':
      return {
        accentColor: theme.colors.warning,
        iconBg: theme.colors.warningLight,
        iconColor: theme.colors.warning,
        borderColor: '#FDE68A',
      };
    case 'info':
    default:
      return {
        accentColor: theme.colors.info,
        iconBg: theme.colors.infoLight,
        iconColor: theme.colors.info,
        borderColor: '#BFDBFE',
      };
  }
};
