import { StyleSheet } from 'react-native';
import { theme } from './theme.styled';

export const policyStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.brandBlue,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: theme.colors.brandBlue,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 16,
  },

  // Logo Header
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    width: '100%',
  },
  logo: {
    width: 180,
    height: 70,
    tintColor: theme.colors.surface,
  },

  // Main Card
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 24,
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    width: '100%',
    maxWidth: 480,
  },

  // Title Container
  titleContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  titleBadgeContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.mintBdr,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 18,
  },

  // Scrollable Policy List
  scrollableContent: {
    maxHeight: 260,
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginBottom: 16,
  },
  scrollableContentInner: {
    paddingBottom: 8,
  },

  // Policy Items
  policyBox: {
    gap: 12,
  },
  policyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  policyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  policyCardTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  policyCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  policyVersionBadge: {
    backgroundColor: theme.colors.mintBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  policyVersionText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  policyDescription: {
    fontSize: 12,
    color: theme.colors.textSlate,
    lineHeight: 17,
    marginBottom: 8,
  },
  viewPolicyLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.brandBlue,
  },

  noticeText: {
    fontSize: 12,
    color: theme.colors.textSlate,
    textAlign: 'center',
    lineHeight: 17,
    marginVertical: 8,
  },

  // Checkboxes
  fixedBottomSection: {
    marginTop: 4,
  },
  checkboxContainer: {
    gap: 12,
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkboxSquare: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.slate,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    backgroundColor: theme.colors.surface,
  },
  checkboxSquareChecked: {
    backgroundColor: theme.colors.brandBlue,
    borderColor: theme.colors.brandBlue,
  },
  checkmarkIcon: {
    color: theme.colors.surface,
    fontSize: 13,
    fontWeight: '700',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  policyLinkBold: {
    fontWeight: '700',
    color: theme.colors.brandBlue,
  },

  // Buttons
  buttonGroup: {
    gap: 10,
  },
  primaryButton: {
    backgroundColor: theme.colors.brandBlue,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.brandBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonDisabled: {
    backgroundColor: theme.colors.surfaceBorder,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: theme.colors.textSlate,
    fontSize: 13,
    fontWeight: '600',
  },

  // Footer
  footerContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  copyrightText: {
    color: theme.colors.overlayWhite75,
    fontSize: 12,
  },
});

export default policyStyles;
