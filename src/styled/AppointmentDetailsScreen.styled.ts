import { StyleSheet } from 'react-native';
import { theme } from './theme.styled';

export const appointmentDetailsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  scrollContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },

  // Status Banner Card
  statusBanner: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statusTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  apptIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  apptIdLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  apptIdValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statusDivider: {
    height: 1,
    backgroundColor: theme.colors.surfaceSecondary,
    marginVertical: 10,
  },
  statusInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfoText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  statusInfoBold: {
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },

  // Action CTA Button (Get Directions / Join Video Call)
  actionCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  actionCtaDirections: {
    backgroundColor: theme.colors.primary,
  },
  actionCtaVideo: {
    backgroundColor: theme.colors.info,
  },
  actionCtaText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textInverted,
    letterSpacing: 0.3,
  },

  // Base Section Card
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  cardHeaderLink: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },

  // Doctor Card
  doctorProfileRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  doctorAvatarWrap: {
    position: 'relative',
  },
  doctorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.mintBdr,
  },
  doctorAvatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  doctorInitials: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.primaryDark,
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
    gap: 3,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  doctorSpecialty: {
    fontSize: 13,
    color: theme.colors.primaryDark,
    fontWeight: '600',
  },
  doctorClinic: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  doctorStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceSecondary,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  statDividerVertical: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.surfaceSecondary,
  },

  // Tags & Languages
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  tagPill: {
    backgroundColor: theme.colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagPillText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },

  // Schedule & Appointment Details
  gridContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 12,
  },
  detailIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  detailSubValue: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  mapActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 6,
  },
  mapActionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },

  // Patient Card
  patientInfoGrid: {
    gap: 10,
  },
  patientInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceSecondary,
  },
  patientInfoLabel: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  patientInfoVal: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    maxWidth: '65%',
    textAlign: 'right',
  },

  // Notes & Clinical Information
  noteBox: {
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.mintBdr,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  noteText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 19,
  },

  // Billing
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  billLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  billValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  billTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  billTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  billTotalValue: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  paymentBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    padding: 10,
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 10,
  },
  paymentBadgeLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  paymentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paymentStatusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
