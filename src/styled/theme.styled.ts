import { StyleSheet } from 'react-native';

export const theme = {
  colors: {
    // Teal Mint Core Medical Theme
    primary: '#0F766E', // Deep Teal Primary
    primaryDark: '#0D9488', // Darker Teal
    primaryLight: '#14B8A6', // Bright Mint Teal
    primarySoft: '#F0FDFA', // Soft Mint Light Background

    // Mint Accents & Badges
    mint: '#2DD4BF', // Vibrant Mint
    mintBg: '#CCFBF1', // Light Mint Badge Background
    mintBdr: '#99F6E4', // Mint Border

    accent: '#0284C7', // Sky Blue Accent
    accentLight: '#E0F2FE', // Light Sky Blue

    // Status colors
    success: '#22C55E',
    successLight: '#DCFCE7',
    successSoft: '#DCFCE7',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    warningSoft: '#FEF3C7',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    dangerSoft: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
    infoSoft: '#DBEAFE',

    // Neutral & Surface Colors
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F5F9',
    surfaceBorder: '#E2E8F0',

    // Typography Colors
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#94A3B8',
    textSlate: '#64748B',
    textInverted: '#FFFFFF',

    // Compatibility Tokens
    teal: '#0F766E',
    tealBg: '#F0FDFA',
    tealBdr: '#99F6E4',
    dark: '#0F172A',
    body: '#334155',
    muted: '#94A3B8',
    slate: '#64748B',
    bg: '#F1F5F9',
    white: '#FFFFFF',
    border: '#E2E8F0',
    green: '#22C55E',
    greenBg: '#DCFCE7',
    red: '#EF4444',
    redBg: '#FEE2E2',
    onlineBadge: '#22C55E',
    cardShadow: 'rgba(15, 23, 42, 0.08)',
    brandBlue: '#0052CC',
    brandBlueDark: '#003D99',
    brandBlueSoft: '#EEF4FF',
    tabBg: '#F0F0F0',
    inputBg: '#F8F9FA',
    inputBorder: '#E0E0E0',
    errorRed: '#FF3B30',
    errorBg: '#FFF5F5',
    navBorder: 'rgba(15, 118, 110, 0.12)',
    transparent: 'transparent',
    overlayWhite10: 'rgba(255, 255, 255, 0.1)',
    overlayWhite15: 'rgba(255, 255, 255, 0.15)',
    overlayWhite25: 'rgba(255, 255, 255, 0.25)',
    overlayWhite75: 'rgba(255, 255, 255, 0.75)',
    overlayWhite80: 'rgba(255, 255, 255, 0.8)',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    hero: 34,
  },

  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Global direct export aliases for backward/forward compatibility
export const Colors = theme.colors;
export const ProfileScreenColor = theme.colors;

export const globalShadows = StyleSheet.create({
  card: {
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  glow: {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
});

export default theme;
