import { Dimensions, StyleSheet } from 'react-native';
import { theme } from './theme.styled';

const { width } = Dimensions.get('window');

export const paymentProcessingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },

  // Main Elevated Card
  mainCard: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    shadowColor: 'rgba(15, 23, 42, 0.08)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 16,
  },

  // Pulsing Radar / Icon Container
  radarContainer: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    marginTop: 4,
  },
  radarOuterRing: {
    position: 'absolute',
    width: 126,
    height: 126,
    borderRadius: 63,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1.5,
    borderColor: theme.colors.mintBdr,
  },
  radarMiddleRing: {
    position: 'absolute',
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: theme.colors.mintBg,
  },
  centerBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  centerBadgeSuccess: {
    backgroundColor: theme.colors.success,
    shadowColor: theme.colors.success,
  },
  centerBadgeError: {
    backgroundColor: theme.colors.danger,
    shadowColor: theme.colors.danger,
  },
  centerBadgeWarning: {
    backgroundColor: theme.colors.warning,
    shadowColor: theme.colors.warning,
  },

  // Titles
  title: {
    fontSize: 21,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  titleSuccess: {
    color: theme.colors.success,
  },
  titleError: {
    color: theme.colors.danger,
  },
  titleWarning: {
    color: theme.colors.warning,
  },
  subtitle: {
    fontSize: 13.5,
    color: theme.colors.textSlate,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
    marginBottom: 24,
  },

  // Progress Bar Section
  progressSection: {
    width: '100%',
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginBottom: 22,
  },
  progressMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressStatusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primaryDark,
  },
  progressDotSuccess: {
    backgroundColor: theme.colors.success,
  },
  progressDotError: {
    backgroundColor: theme.colors.danger,
  },
  progressDotWarning: {
    backgroundColor: theme.colors.warning,
  },
  progressStatusText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  progressPercentText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
  progressPercentSuccess: {
    color: theme.colors.success,
  },
  progressPercentError: {
    color: theme.colors.danger,
  },
  progressPercentWarning: {
    color: theme.colors.warning,
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: theme.colors.primaryDark,
  },
  progressBarFillSuccess: {
    backgroundColor: theme.colors.success,
  },
  progressBarFillError: {
    backgroundColor: theme.colors.danger,
  },
  progressBarFillWarning: {
    backgroundColor: theme.colors.warning,
  },
  progressSubnote: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },

  // Trust Badge
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.mintBdr,
    gap: 6,
  },
  trustBadgeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },

  // Advisory / Warning Notice Box
  warningNotice: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.mintBdr,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 16,
  },
  warningNoticeText: {
    fontSize: 12,
    lineHeight: 18,
    color: theme.colors.textSecondary,
    flex: 1,
  },

  // Action Buttons (For Error / Timeout)
  actionButtonsWrap: {
    width: '100%',
    gap: 10,
    marginTop: 4,
  },
  primaryBtn: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.surface,
  },
  secondaryBtn: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },

  // Dedicated Refund Card for Scenario B (Payment Paid, Booking Failed)
  refundCard: {
    width: '100%',
    backgroundColor: '#FFFDF5',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 16,
    shadowColor: 'rgba(245, 158, 11, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  refundHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  refundHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  refundTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  refundBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  refundBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  refundDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.textSecondary,
    marginBottom: 14,
  },
  refundDivider: {
    height: 1,
    backgroundColor: '#FDE68A',
    opacity: 0.7,
    marginBottom: 12,
  },
  refundMetaWrap: {
    gap: 8,
  },
  refundMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refundMetaLabel: {
    fontSize: 12,
    color: theme.colors.textSlate,
  },
  refundMetaValue: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    maxWidth: '65%',
    textAlign: 'right',
  },
  refundReasonBox: {
    marginTop: 12,
    backgroundColor: theme.colors.surface,
    padding: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  refundReasonLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  refundReasonText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: theme.colors.textSecondary,
  },
});

export default paymentProcessingStyles;
