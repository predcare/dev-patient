import { StyleSheet } from 'react-native';
import { theme } from './theme.styled';

export const consultationCompletedStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  checkCircleOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: theme.colors.mintBg,
    borderWidth: 3,
    borderColor: theme.colors.mintBdr,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  checkCircleInner: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },

  // Generic Card
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    padding: 16,
    marginBottom: 14,
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  // Doctor Header inside Card
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  doctorAvatarWrap: {
    position: 'relative',
  },
  doctorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorAvatarTxt: {
    color: theme.colors.surface,
    fontSize: 20,
    fontWeight: '700',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  doctorClinic: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },

  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.greenBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.green,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.green,
  },

  // Card Divider
  cardDivider: {
    height: 1,
    backgroundColor: theme.colors.surfaceBorder,
    marginVertical: 12,
  },

  // Doctor Card Meta Row
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.tealBdr,
  },
  typePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  refIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refIdLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  refIdValue: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },

  // Grid
  gridRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  gridCell: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  gridCellHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  gridIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  gridValue: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },

  // Section Headers
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
  },

  // Physician Advice Box
  adviceBox: {
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.tealBdr,
    marginBottom: 12,
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  adviceTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
  adviceText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 19,
  },

  // Follow-up Row
  followUpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  followUpIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followUpContent: {
    flex: 1,
  },
  followUpLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  followUpValue: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },

  // Prescription Card
  rxCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.tealBdr,
    padding: 14,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  rxIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.tealBdr,
  },
  rxInfo: {
    flex: 1,
  },
  rxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  rxSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  rxActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  rxActionChipText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },

  // Action Buttons
  primaryBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  primaryBtnTxt: {
    color: theme.colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    marginBottom: 12,
  },
  secondaryBtnTxt: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default consultationCompletedStyles;
