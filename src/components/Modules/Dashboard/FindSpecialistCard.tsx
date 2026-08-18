import React from 'react';
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
  title = 'Find your Specialist',
  subtitle = 'Book appointments with top verified doctors across multiple specialties.',
  buttonLabel = 'Search Doctors',
  onPress,
}) => {
  return (
    <View style={dashboardStyles.specialistCard}>
      <View style={dashboardStyles.specialistContent}>
        <Text style={dashboardStyles.specialistTitle}>{title}</Text>
        <Text style={dashboardStyles.specialistSubtitle}>{subtitle}</Text>
        <TouchableOpacity
          style={dashboardStyles.specialistBtn}
          onPress={onPress}
          activeOpacity={0.85}
        >
          <Text style={dashboardStyles.specialistBtnText}>{buttonLabel}</Text>
        </TouchableOpacity>
      </View>

      <View style={dashboardStyles.specialistIconCircle}>
        <StethoscopeIcon size={32} color={theme.colors.surface} />
      </View>
    </View>
  );
};

export default FindSpecialistCard;
