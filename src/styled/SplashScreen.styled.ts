import { StyleSheet } from 'react-native';
import { theme } from './theme.styled';

export const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primaryDark,
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
  },
  topDecor: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.overlayWhite15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.overlayWhite25,
  },
  brandTitleContainer: {
    alignItems: 'center',
  },
  brandName: {
    fontSize: theme.fontSize.hero,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textInverted,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: theme.fontSize.md,
    color: theme.colors.overlayWhite80,
    marginTop: theme.spacing.xs,
    fontWeight: theme.fontWeight.medium,
  },
  doctorRoleBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.md,
  },
  doctorRoleText: {
    color: theme.colors.textInverted,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  centerGraphic: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  illustrationCard: {
    width: '100%',
    backgroundColor: theme.colors.overlayWhite10,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.overlayWhite15,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  featureIconDot: {
    width: 10,
    height: 10,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryLight,
    marginRight: theme.spacing.md,
  },
  featureText: {
    color: theme.colors.textInverted,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },

  bottomContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primaryLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: theme.colors.textInverted,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  secondaryLink: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.xs,
  },
  secondaryLinkText: {
    color: theme.colors.overlayWhite75,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
  versionText: {
    color: theme.colors.overlayWhite75,
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.md,
  },
});
