import { StyleSheet } from 'react-native';
import { globalShadows, theme } from './theme.styled';

export const headerStyles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm + 2,
    ...globalShadows.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    color: theme.colors.surface,
  },
  greetingWrap: {
    marginLeft: 12,
    flex: 1,
  },
  greeting: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    color: theme.colors.textPrimary,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
  },
  langText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.errorRed,
    borderWidth: 1.5,
    borderColor: theme.colors.surface,
  },
});

export default headerStyles;
