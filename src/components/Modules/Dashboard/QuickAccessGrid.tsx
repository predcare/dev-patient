import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showInfoToast } from '../../../lib/common/toast.utils';
import { AppRoute } from '../../../route';
import { theme } from '../../../styled/theme.styled';
import {
  CalendarIcon,
  FolderIcon,
  HelpIcon,
  InvoiceIcon,
  PrescriptionIcon,
  ReportsIcon,
  ShieldIcon,
  StethoscopeIcon,
} from '../../ui/icons';

export type QuickAccessKey =
  | 'appointments'
  | 'doctors'
  | 'prescriptions'
  | 'records'
  | 'insurance'
  | 'reports'
  | 'invoices'
  | 'support';

export interface QuickAccessItem {
  key: string;
  label: string;
  icon: QuickAccessKey;
  onPress: () => void;
}

export const QuickAccessGrid: React.FC = () => {
  const { t } = useTranslation();
  const rootNav = useNavigation();
  const quickAccessItems = [
    {
      key: 'appointments',
      label: t('quickAccess.appointments'),
      icon: 'appointments' as const,
      onPress: () => rootNav.navigate(AppRoute.SCHEDULE),
    },
    {
      key: 'doctors',
      label: t('quickAccess.myDoctors'),
      icon: 'doctors' as const,
      onPress: () => rootNav.navigate(AppRoute.DOCTORS),
    },
    {
      key: 'prescriptions',
      label: t('quickAccess.prescriptions'),
      icon: 'prescriptions' as const,
      onPress: () => rootNav.navigate(AppRoute.PRESCRIPTIONS_LIST),
    },
    {
      key: 'records',
      label: t('quickAccess.healthRecords'),
      icon: 'records' as const,
      onPress: () => rootNav.navigate(AppRoute.HEALTH_RECORDS),
    },
    {
      key: 'insurance',
      label: t('quickAccess.insurance'),
      icon: 'insurance' as const,
      onPress: () =>
        showInfoToast(
          t('quickAccess.insurance'),
          t('quickAccess.featureComingSoon', { feature: t('quickAccess.insurance') })
        ),
    },
    {
      key: 'reports',
      label: t('quickAccess.reports'),
      icon: 'reports' as const,
      onPress: () => rootNav.navigate(AppRoute.REPORTS),
    },
    {
      key: 'invoices',
      label: t('quickAccess.invoices'),
      icon: 'invoices' as const,
      onPress: () => rootNav.navigate(AppRoute.INVOICES_LIST),
    },
    {
      key: 'support',
      label: t('quickAccess.support'),
      icon: 'support' as const,
      onPress: () => rootNav.navigate(AppRoute.SUPPORT),
    },
  ];
  const renderIcon = (iconName: QuickAccessKey) => {
    switch (iconName) {
      case 'appointments':
        return <CalendarIcon size={22} color={theme.colors.primary} />;
      case 'doctors':
        return <StethoscopeIcon size={22} color={theme.colors.primary} />;
      case 'prescriptions':
        return <PrescriptionIcon size={22} color={theme.colors.primary} />;
      case 'records':
        return <FolderIcon size={22} color={theme.colors.primary} />;
      case 'insurance':
        return <ShieldIcon size={22} color={theme.colors.primary} />;
      case 'reports':
        return <ReportsIcon size={22} color={theme.colors.primary} />;
      case 'invoices':
        return <InvoiceIcon size={22} color={theme.colors.primary} />;
      case 'support':
        return <HelpIcon size={22} color={theme.colors.primary} />;
      default:
        return <CalendarIcon size={22} color={theme.colors.primary} />;
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.headerWrap}>
        <Text style={styles.headerTitle}>{t('quickAccess.title')}</Text>
      </View>
      <View style={styles.grid}>
        {quickAccessItems.map(item => (
          <TouchableOpacity
            key={item.key}
            style={styles.card}
            activeOpacity={0.8}
            onPress={item.onPress}
          >
            <View style={styles.iconCircle}>{renderIcon(item.icon)}</View>
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
    marginBottom: 8,
  },
  headerWrap: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    minHeight: 104,
    marginBottom: 12,
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

export default QuickAccessGrid;
