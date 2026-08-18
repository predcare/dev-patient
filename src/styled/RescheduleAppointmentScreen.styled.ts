import { StyleSheet } from 'react-native';
import { theme } from './theme.styled';

export const rescheduleStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },

  // Current Appointment Header Box (Exact Reference Layout)
  currentCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: {
    color: theme.colors.surface,
    fontWeight: '800',
    fontSize: 18,
  },
  currentInfo: {
    flex: 1,
  },
  currentLbl: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  currentDoctor: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  currentSpec: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  metaTxt: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },

  // Section Styles
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  monthLbl: {
    fontSize: 13,
    color: theme.colors.primaryDark,
    fontWeight: '600',
  },
  emptyHint: {
    fontSize: 13,
    color: theme.colors.textMuted,
    paddingVertical: 8,
  },

  // Date Chip Selector
  dateRow: {
    gap: 10,
    paddingVertical: 4,
  },
  dateChip: {
    width: 64,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dateChipDay: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  dateChipNum: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  dateChipTxtSelected: {
    color: theme.colors.surface,
  },

  // Time Slot Selector
  slotGroup: {
    marginTop: 14,
  },
  slotGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  slotGroupTitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeChip: {
    minWidth: 96,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  timeChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  timeChipBooked: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.surfaceBorder,
  },
  timeChipTxt: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  timeChipTxtSelected: {
    color: theme.colors.surface,
  },
  timeChipTxtMuted: {
    color: theme.colors.textMuted,
  },

  // Reason Input
  reasonLbl: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    fontWeight: '700',
    marginBottom: 10,
  },
  reasonInput: {
    minHeight: 100,
    borderWidth: 1.5,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surface,
    textAlignVertical: 'top',
  },

  // Main Summary Card (Exact Reference Design)
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: theme.colors.tealBdr,
  },
  summaryLbl: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  summaryDate: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  summaryTime: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '700',
    marginTop: 2,
  },
  summaryIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  // Bottom Fixed Bar
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  primaryBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    backgroundColor: theme.colors.textMuted,
  },
  primaryBtnTxt: {
    fontSize: 15,
    color: theme.colors.surface,
    fontWeight: '700',
  },

  // Success View Styles
  successScroll: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  successHero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  checkHaloOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(15, 118, 110, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  checkHaloInner: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(15, 118, 110, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 22,
    lineHeight: 28,
    color: theme.colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSub: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 12,
    lineHeight: 22,
  },
  successCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  successIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  successIdLbl: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  successIdVal: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  successDivider: {
    height: 1,
    backgroundColor: theme.colors.surfaceBorder,
    marginVertical: 4,
  },
  successDoctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  avatarLg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLgTxt: {
    fontSize: 16,
    color: theme.colors.surface,
    fontWeight: '700',
  },
  successDoctorName: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  successSpec: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  // Info Cards inside Success Card
  infoMint: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.tealBdr,
    alignItems: 'center',
  },
  infoMintLbl: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoMintDate: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  infoMintTime: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
  infoBlue: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: theme.colors.infoSoft,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.infoLight,
    alignItems: 'center',
  },
  infoBlueLbl: {
    fontSize: 11,
    color: theme.colors.info,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoBlueTitle: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  infoBlueSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});

export default rescheduleStyles;
