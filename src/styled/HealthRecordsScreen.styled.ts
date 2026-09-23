import { Dimensions, Platform, StyleSheet } from 'react-native';
import { theme } from './theme.styled';

const { width } = Dimensions.get('window');

export const healthRecordsStyles = StyleSheet.create({
  // Screen Container
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentScroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },

  // Summary Metrics Cards (DOCUMENTS / STORAGE)
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.primary,
  },

  // Section Header
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 14,
  },

  // Folder / Category Card
  folderList: {
    gap: 12,
  },
  folderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  folderIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  folderInfo: {
    flex: 1,
  },
  folderName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 3,
  },
  folderMeta: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },

  // Floating Action Button
  fabButton: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
    zIndex: 99,
  },

  // ----------------------------------------------------
  // Folder Detail Screen
  // ----------------------------------------------------
  folderHeaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: 16,
  },
  folderBannerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FDF2F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  folderBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  folderBannerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },

  // Dashed Upload Box
  uploadDashedBox: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  uploadDashedIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  uploadDashedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  uploadDashedSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },

  // Document Item Card inside Folder
  docItemCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  docItemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  docItemIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  docItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 3,
  },
  docItemMeta: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  docItemActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  docItemViewBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docItemViewBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textInverted,
  },
  docItemCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  docItemShareBtn: {
    borderColor: '#99F6E4',
    backgroundColor: '#F0FDFA',
  },
  docItemDeleteBtn: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },

  // ----------------------------------------------------
  // Multi-Step Upload Modal
  // ----------------------------------------------------
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '92%',
    paddingTop: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  modalHeaderBackBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  modalHeaderStepBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalHeaderStepBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },

  // Stepper Component
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: theme.colors.primary,
  },
  stepCircleCompleted: {
    backgroundColor: theme.colors.primary,
  },
  stepCircleInactive: {
    backgroundColor: '#E2E8F0',
  },
  stepCircleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepCircleTextActive: {
    color: '#FFFFFF',
  },
  stepCircleTextInactive: {
    color: '#64748B',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  stepLabelActive: {
    color: theme.colors.primary,
  },
  stepLabelInactive: {
    color: '#94A3B8',
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  stepLineActive: {
    backgroundColor: theme.colors.primary,
  },
  stepLineInactive: {
    backgroundColor: '#E2E8F0',
  },

  // Step 1: Category Selection List
  categoryListScroll: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  categoryOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginBottom: 10,
  },
  categoryOptionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  categoryOptionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },

  // Step 2: Upload Method Selection
  step2Body: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  step2Title: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  step2Subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 20,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginBottom: 12,
  },
  methodIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 3,
  },
  methodDesc: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },

  // Step 3: Document Details Form
  step3Scroll: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  filePreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#99F6E4',
    marginBottom: 18,
  },
  filePreviewIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  filePreviewName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  filePreviewMeta: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  fileSuccessCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  // Form Section
  formGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  categoryValueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  categoryValueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryValueText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  categoryChangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryChangeText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  inputBox: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  textAreaBox: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: theme.colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Doctor Visibility Card
  doctorVisibilityCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 12,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  doctorRowLast: {
    borderBottomWidth: 0,
  },
  doctorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doctorAvatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  doctorSpecialty: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  doctorHiddenBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  doctorHiddenBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#EF4444',
    letterSpacing: 0.5,
  },
  doctorSharedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  doctorSharedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },

  // Security Note
  securityNoteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  securityNoteText: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },

  // Submit Button
  submitBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textInverted,
  },
});
