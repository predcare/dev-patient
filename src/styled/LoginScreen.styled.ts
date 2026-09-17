import { StyleSheet } from 'react-native';
import { theme } from './theme.styled';

export const loginStyles = StyleSheet.create({
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

  // Tabs Switcher
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 22,
    backgroundColor: theme.colors.tabBg,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: theme.colors.brandBlue,
    shadowColor: theme.colors.brandBlue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  tabTextActive: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.surface,
  },

  // Input Fields
  inputSection: {
    marginBottom: 10,
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

  // OTP Inputs Section
  otpSection: {
    marginTop: 14,
    marginBottom: 4,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  otpInput: {
    width: 44,
    height: 52,
    borderWidth: 2,
    borderColor: theme.colors.inputBorder,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: theme.colors.inputBg,
    color: theme.colors.textPrimary,
  },
  otpInputFilled: {
    borderColor: theme.colors.brandBlue,
    backgroundColor: theme.colors.brandBlueSoft,
  },
  otpInputFocused: {
    borderColor: theme.colors.brandBlue,
    borderWidth: 2.5,
    backgroundColor: theme.colors.brandBlueSoft,
    shadowColor: theme.colors.brandBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },

  // Resend & Links
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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

  // Primary Button
  primaryButton: {
    backgroundColor: theme.colors.brandBlue,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 12,
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

  // Verify button inner row
  verifyBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyBtnIcon: {
    color: theme.colors.surface,
    fontSize: 18,
    fontWeight: '800',
    marginRight: 8,
  },

  // Change number link
  changeNumberBtn: {
    alignItems: 'center',
    marginBottom: 12,
  },
  changeNumberText: {
    color: theme.colors.brandBlue,
    fontSize: 13,
    fontWeight: '600',
  },

  // Footer notice
  footerNotice: {
    marginTop: 16,
    alignItems: 'center',
  },
  securityText: {
    fontSize: 12,
    color: theme.colors.surfaceSecondary,
    textAlign: 'center',
  },

  // Bottom signup link
  bottomSection: {
    paddingTop: 16,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  signupText: {
    color: theme.colors.textSlate,
    fontSize: 14,
    fontWeight: '500',
  },
  signupLink: {
    color: theme.colors.brandBlue,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default loginStyles;
