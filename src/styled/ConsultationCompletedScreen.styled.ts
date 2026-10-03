import { Platform, StyleSheet } from 'react-native';
import { theme } from './theme.styled';

export const consultationCompletedStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  bellWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },

  // Check Circle Hero
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  missedCircle: {
    backgroundColor: theme.colors.danger,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 24,
  },

  // People Comparison Card
  card: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    padding: 20,
    marginBottom: 20,
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  peopleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  personCol: {
    flex: 1,
    alignItems: 'center',
  },
  midCol: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  midLine: {
    width: 1,
    height: 18,
    backgroundColor: theme.colors.surfaceBorder,
  },
  midIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarDoctor: {
    backgroundColor: theme.colors.primary,
  },
  avatarPatient: {
    backgroundColor: theme.colors.primaryDark,
  },
  avatarTxt: {
    color: theme.colors.surface,
    fontSize: 22,
    fontWeight: '700',
  },
  personName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  personRole: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },

  // 3-Box Metadata Grid
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaBox: {
    flex: 1,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.tealBdr,
  },
  metaLbl: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  metaVal: {
    fontSize: 13,
    color: theme.colors.primaryDark,
    fontWeight: '700',
  },

  // Action Buttons
  primaryBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 12,
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
    gap: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    marginBottom: 20,
  },
  secondaryBtnTxt: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  homeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  homeLinkTxt: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});

export default consultationCompletedStyles;
