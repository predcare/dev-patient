import React from 'react';
import { Text, View } from 'react-native';
import { HeartIcon, PillIcon, PulseIcon, ShieldIcon } from '../../ui/icons';
import { DashboardVitalReading, MOCK_DASHBOARD_VITALS } from '../../../resources/mockData';
import { dashboardStyles } from '../../../styled/DashboardScreen.styled';
import { theme } from '../../../styled/theme.styled';

export interface DashboardVitalsProps {
  vitals?: DashboardVitalReading[];
}

export const DashboardVitals: React.FC<DashboardVitalsProps> = ({
  vitals = MOCK_DASHBOARD_VITALS,
}) => {
  const renderVitalIcon = (iconName: string) => {
    switch (iconName) {
      case 'heart':
        return <HeartIcon size={18} color={theme.colors.primary} />;
      case 'pulse':
        return <PulseIcon size={18} color={theme.colors.primary} />;
      case 'pill':
        return <PillIcon size={18} color={theme.colors.primary} />;
      case 'shield':
        return <ShieldIcon size={18} color={theme.colors.primary} />;
      default:
        return <HeartIcon size={18} color={theme.colors.primary} />;
    }
  };

  return (
    <View style={dashboardStyles.blockSpacing}>
      <Text style={[dashboardStyles.sectionTitle, { marginBottom: 12 }]}>Vitals & Health Overview</Text>
      <View style={dashboardStyles.vitalsGrid}>
        {vitals.map(item => (
          <View key={item.id} style={dashboardStyles.vitalCard}>
            <View style={dashboardStyles.vitalHeader}>
              <View style={dashboardStyles.vitalIconWrapper}>{renderVitalIcon(item.iconName)}</View>
              <View
                style={[
                  dashboardStyles.vitalBadge,
                  { backgroundColor: `${item.statusColor}15` },
                ]}
              >
                <Text style={[dashboardStyles.vitalBadgeText, { color: item.statusColor }]}>
                  {item.status}
                </Text>
              </View>
            </View>

            <Text style={dashboardStyles.vitalTitle}>{item.title}</Text>
            <View style={dashboardStyles.vitalValueRow}>
              <Text style={dashboardStyles.vitalValue}>{item.value}</Text>
              <Text style={dashboardStyles.vitalUnit}>{item.unit}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default DashboardVitals;
