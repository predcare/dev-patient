import { StyleSheet } from 'react-native';
import { theme } from './theme.styled';

export const emailVerifyStyles = StyleSheet.create({
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

  // Card
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 28,
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    width: '100%',
    maxWidth: 480,
  },

  // Title Section
  titleContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  titleIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.mintBdr,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
  },
  emailBadge: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: theme.colors.brandBlueSoft,
    borderRadius: 8,
    color: theme.colors.brandBlue,
    fontSize: 14,
    fontWeight: '600',
  },

  // OTP Section
  otpSection: {
    marginTop: 10,
    marginBottom: 16,
  },
  otpLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },

  // Resend Container
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  resendText: {
    color: theme.colors.textSlate,
    fontSize: 13,
  },
  resendLink: {
    color: theme.colors.brandBlue,
    fontSize: 13,
    fontWeight: '700',
  },
  timerText: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  timerBold: {
    fontWeight: '700',
    color: theme.colors.brandBlue,
  },

  // Buttons
  primaryButton: {
    backgroundColor: theme.colors.brandBlue,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 14,
    shadowColor: theme.colors.brandBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonDisabled: {
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
    paddingVertical: 8,
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: theme.colors.brandBlue,
    fontSize: 13,
    fontWeight: '600',
  },

  // Bottom Section
  bottomSection: {
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
    alignItems: 'center',
  },
  helpText: {
    fontSize: 13,
    color: theme.colors.textSlate,
  },
});

export default emailVerifyStyles;
