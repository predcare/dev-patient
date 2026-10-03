import { StyleSheet } from 'react-native';
import { theme } from './theme.styled';

export const registerStyles = StyleSheet.create({
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
  title: {
    fontSize: 28,
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

  // Field Groups & Inputs
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBg,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
  },
  inputRowFocused: {
    borderColor: theme.colors.brandBlue,
    borderWidth: 1.5,
    backgroundColor: theme.colors.brandBlueSoft,
  },
  inputIcon: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textPrimary,
    fontWeight: '500',
    padding: 0,
  },
  inputError: {
    borderColor: theme.colors.errorRed,
    borderWidth: 1.5,
    backgroundColor: theme.colors.errorBg,
  },
  errorText: {
    color: theme.colors.errorRed,
    fontSize: 12,
    marginTop: 5,
    marginLeft: 4,
    fontWeight: '500',
  },

  // OTP Section
  otpSection: {
    marginTop: 10,
    marginBottom: 4,
  },
  otpSubtext: {
    fontSize: 13,
    color: theme.colors.brandBlue,
    fontWeight: '500',
    marginBottom: 14,
  },

  // Resend Container
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    marginTop: 10,
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
    opacity: 0.65,
  },
  primaryButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  changeNumberBtn: {
    alignItems: 'center',
    marginBottom: 12,
  },
  changeNumberText: {
    color: theme.colors.brandBlue,
    fontSize: 13,
    fontWeight: '600',
  },

  // Bottom Login Section
  bottomSection: {
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  loginText: {
    color: theme.colors.textSlate,
    fontSize: 14,
    fontWeight: '500',
  },
  loginLink: {
    color: theme.colors.brandBlue,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default registerStyles;
