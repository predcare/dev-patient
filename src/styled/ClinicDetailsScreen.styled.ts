import { StyleSheet } from 'react-native';
import { theme } from './theme.styled';

export const clinicDetailsStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },

  // Header Banner
  headerSection: {
    backgroundColor: theme.colors.primary,
  },
  headerGradient: {
    paddingTop: 24,
    paddingBottom: 32,
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileContainer: {
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: 16,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: theme.colors.surface,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.surface,
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  addressBadge: {
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addressText: {
    fontSize: 13,
    color: theme.colors.surface,
    fontWeight: '600',
  },

  // Content Container Cards
  contentContainer: {
    padding: 16,
    marginTop: -10,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  bioText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    paddingHorizontal: 4,
  },

  // Contact Rows
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  contactIcon: {
    marginRight: 12,
  },
  contactText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    flex: 1,
    fontWeight: '500',
  },

  // Specialities Grid
  specialitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialityChip: {
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.tealBdr,
  },
  specialityText: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '600',
  },

  // Doctors List
  doctorsList: {
    gap: 12,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doctorAvatarText: {
    color: theme.colors.surface,
    fontSize: 18,
    fontWeight: '700',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  doctorSpec: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  doctorExp: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  arrowContainer: {
    paddingLeft: 8,
  },
});

export default clinicDetailsStyles;
