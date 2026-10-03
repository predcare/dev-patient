import { StyleSheet } from 'react-native';
import { theme } from './theme.styled';

export const appointmentsStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Segment Bar
  segmentWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  segmentTrack: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  segmentTxt: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  segmentTxtActive: {
    color: theme.colors.primaryDark,
    fontWeight: '700',
  },

  // Scrollable Content
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },

  // Empty State
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTxt: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  emptyH: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  emptyB: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },

  // Card Container
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardBody: {
    padding: 16,
    gap: 14,
  },
  banner: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  bDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.surface,
  },
  bTxt: {
    color: theme.colors.surface,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    flex: 1,
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  av: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avTxt: {
    color: theme.colors.surface,
    fontSize: 18,
    fontWeight: '800',
  },
  drInfo: {
    flex: 1,
    paddingRight: 4,
  },
  drName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  clinic: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  aptId: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillTxt: {
    fontSize: 11,
    fontWeight: '700',
  },

  // 2x2 Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridCell: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  gridIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridText: { flex: 1 },
  gridLbl: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  gridVal: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },

  // Location / Directions Box
  locBox: {
    gap: 8,
    marginTop: 4,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  locTextCol: {
    flex: 1,
    gap: 2,
  },
  locClinic: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  locAddress: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },

  // Buttons
  btnViewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.mintBdr,
  },
  btnViewDetailsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  viewDetailsIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.mintBdr,
  },
  btnViewDetailsTxt: {
    color: theme.colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
  btnJoin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
  },
  btnRejoin: {
    backgroundColor: '#7C3AED',
  },
  btnJoinTxt: {
    color: theme.colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },
  bRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btnOutline: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surface,
  },
  btnOutlineTxt: {
    color: theme.colors.primaryDark,
    fontSize: 14,
    fontWeight: '700',
  },
  btnCancel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.dangerLight,
  },
  btnCancelTxt: {
    color: theme.colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },

  // Book New Session Card
  bookCard: {
    marginTop: 8,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: theme.colors.surfaceBorder,
    borderStyle: 'dashed',
    backgroundColor: theme.colors.surface,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  bookPlus: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  bookTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.primaryDark,
    marginBottom: 6,
  },
  bookSub: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  bookLink: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '700',
  },
});

export default appointmentsStyles;
