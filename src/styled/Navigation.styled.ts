import { Platform, StyleSheet } from 'react-native';
import { theme } from './theme.styled';

export const navigationStyles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 70,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.navBorder,
    paddingBottom: 6,
    paddingTop: 6,
    paddingHorizontal: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginTop: 3,
  },
  activeIndicatorDot: {
    width: 14,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
    marginBottom: 3,
  },
  inactiveIndicatorDot: {
    width: 14,
    height: 3,
    backgroundColor: theme.colors.transparent,
    marginBottom: 3,
  },
  activeIconContainer: {
    width: 48,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.mintBdr,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveIconContainer: {
    width: 48,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
