import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { dashboardStyles } from '../../../styled/DashboardScreen.styled';
import { theme } from '../../../styled/theme.styled';
import { StethoscopeIcon } from '../../ui/icons';

export interface FindSpecialistCardProps {
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  onPress: () => void;
}

export const FindSpecialistCard: React.FC<FindSpecialistCardProps> = ({
  title,
  subtitle,
  buttonLabel,
  onPress,
}) => {
  const { t } = useTranslation();

  const cardTitle = title ?? t('dashboard.findSpecialistTitle');
  const cardSubtitle = subtitle ?? t('dashboard.findSpecialistSubtitle');
  const cardButtonLabel = buttonLabel ?? t('dashboard.searchDoctors');

  return (
    <View style={dashboardStyles.specialistCard}>
      <View style={dashboardStyles.specialistContent}>
        <Text style={dashboardStyles.specialistTitle}>{cardTitle}</Text>
        <Text style={dashboardStyles.specialistSubtitle}>{cardSubtitle}</Text>
        <TouchableOpacity
          style={dashboardStyles.specialistBtn}
          onPress={onPress}
          activeOpacity={0.85}
        >
          <Text style={dashboardStyles.specialistBtnText}>{cardButtonLabel}</Text>
        </TouchableOpacity>
      </View>

      <View style={dashboardStyles.specialistIconCircle}>
        <StethoscopeIcon size={32} color={theme.colors.surface} />
      </View>
    </View>
  );
};

export default FindSpecialistCard;
