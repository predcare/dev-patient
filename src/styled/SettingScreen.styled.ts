import { StyleSheet } from 'react-native';
import { theme } from './theme.styled';

export const settingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerBar: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 48,
  },

  // Section Header
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },

  // Cards
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.surfaceBorder,
    marginLeft: 64,
  },

  // Profile Card Header
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileAvatarText: {
    color: theme.colors.surface,
    fontWeight: '700',
    fontSize: 18,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  profileEmail: {
    fontSize: 13,
    color: theme.colors.textSlate,
    marginTop: 2,
  },

  // Settings Row
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: theme.colors.surface,
  },
  settingsRowDanger: {
    backgroundColor: theme.colors.errorBg,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowIconDanger: {
    backgroundColor: theme.colors.errorBg,
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  rowTitleDanger: {
    color: theme.colors.errorRed,
  },
  rowSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  rowRight: {
    marginLeft: 8,
  },
  rowArrow: {
    fontSize: 18,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },

  // Family Members Section
  membersLoading: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
  },
  memberMainPress: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberRowActive: {
    backgroundColor: theme.colors.primarySoft,
  },
  memberRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  memberRowBorderTop: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  memberAvatarText: {
    color: theme.colors.surface,
    fontWeight: '700',
    fontSize: 14,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  memberRelation: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  youBadge: {
    backgroundColor: theme.colors.mintBg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginRight: 8,
  },
  youBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 8,
  },
  memberActionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  memberEditText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  memberDeleteText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.errorRed,
  },
  memberActiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  addMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: theme.colors.surface,
  },
  addMemberPlusCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addMemberPlusText: {
    fontSize: 20,
    color: theme.colors.primary,
    fontWeight: '700',
    marginTop: -1,
  },
  addMemberLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
  },

  // Family Members Error State
  membersErrorContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  membersErrorIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.errorBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  membersErrorTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  membersErrorMessage: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 18,
  },
  membersRetryButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  membersRetryText: {
    color: theme.colors.surface,
    fontSize: 13,
    fontWeight: '600',
  },

  // Version Footer
  versionText: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textMuted,
    marginTop: 28,
    marginBottom: 50,
  },
});

export default settingStyles;
