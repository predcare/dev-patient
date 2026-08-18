import { StyleSheet } from 'react-native';
import { theme } from './theme.styled';

export const memberStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Inherited banner
  inheritedBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.primarySoft,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  inheritedText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.primaryDark,
    lineHeight: 18,
  },

  // Sections
  section: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    padding: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 16,
  },

  // Field wrapper
  fieldWrapper: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  required: {
    color: theme.colors.errorRed,
  },

  // Text input
  textInput: {
    height: 50,
    borderWidth: 1.5,
    borderColor: theme.colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surface,
  },
  input: {
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: theme.colors.inputBorder,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  inputDisabled: {
    backgroundColor: theme.colors.inputBg,
    color: theme.colors.textSecondary,
  },

  // Dropdown trigger
  dropdownTrigger: {
    height: 50,
    borderWidth: 1.5,
    borderColor: theme.colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  dropdownValue: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  dropdownPlaceholder: {
    color: theme.colors.textMuted,
  },

  // Error
  fieldError: {
    borderColor: theme.colors.errorRed,
    borderWidth: 2,
  },
  inputError: {
    borderColor: theme.colors.errorRed,
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.errorRed,
    marginTop: 4,
  },

  // DOB clear
  clearDobBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  clearDobText: {
    fontSize: 12,
    color: theme.colors.errorRed,
  },

  // Read-only fields
  readOnlyField: {
    minHeight: 50,
    borderWidth: 1.5,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBg,
    gap: 10,
  },
  readOnlyValue: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  lockedBadge: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  readOnlyHint: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 4,
  },

  // Submit button
  submitBtn: {
    height: 54,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.65,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.surface,
    letterSpacing: 0.3,
  },

  // Profile Setup Screen Specific Styles
  profilePicSection: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 8,
  },
  profilePicContainer: {
    position: 'relative',
    marginBottom: 10,
    width: 120,
    height: 120,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: theme.colors.primaryLight,
  },
  uploadCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.primaryLight,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  uploadPhotoTxt: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.surface,
  },
  removeImageButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
  },
  removeImageText: {
    color: theme.colors.errorRed,
    fontSize: 13,
    fontWeight: '600',
  },
  formSection: {
    marginBottom: 8,
  },
  inputWrapper: {
    marginBottom: 18,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.inputBorder,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  genderButtonTextActive: {
    color: theme.colors.surface,
  },
  saveButton: {
    height: 56,
    backgroundColor: theme.colors.primary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },

  // Modal picker
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    maxHeight: '60%',
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.surfaceBorder,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  modalDivider: {
    height: 1,
    backgroundColor: theme.colors.surfaceBorder,
    marginBottom: 4,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  modalOptionActive: {
    backgroundColor: theme.colors.primarySoft,
  },
  modalOptionText: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  modalOptionTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default memberStyles;
