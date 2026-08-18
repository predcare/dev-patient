import { StyleSheet } from 'react-native';
import { theme } from './theme.styled';

export const paymentStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    shadowColor: 'rgba(15, 23, 42, 0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  doctorSpecialization: {
    fontSize: 14,
    color: theme.colors.primaryDark,
    fontWeight: '600',
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  feeLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  feeAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.surfaceBorder,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    padding: 14,
    borderRadius: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.primaryDark,
  },
  payButton: {
    backgroundColor: theme.colors.primaryDark,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    marginTop: 6,
  },
  payButtonText: {
    fontSize: 16,
    color: theme.colors.surface,
    fontWeight: '700',
  },
  securityNotice: {
    alignItems: 'center',
    marginBottom: 10,
  },
  securityText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  securitySubtext: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
});

export default paymentStyles;
