import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { doctorStyles } from '../../../styled/DoctorScreen.styled';
import { theme } from '../../../styled/theme.styled';
import { ChevronRightIcon, PlusIcon } from '../../ui/icons';

export interface FindDoctorCardProps {
  onExplorePress?: () => void;
}

export const FindDoctorCard: React.FC<FindDoctorCardProps> = ({ onExplorePress }) => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const rootNav = navigation.getParent() || navigation;

  const handlePress = () => {
    if (onExplorePress) {
      onExplorePress();
    } else {
      rootNav.navigate('DoctorSearch');
    }
  };

  return (
    <TouchableOpacity style={doctorStyles.findCard} onPress={handlePress} activeOpacity={0.9}>
      <View style={doctorStyles.findPlus}>
        <PlusIcon size={24} color={theme.colors.primaryDark} />
      </View>
      <Text style={doctorStyles.findTitle}>{t('myDoctorsScreen.findNewDoctorsTitle')}</Text>
      <Text style={doctorStyles.findSub}>{t('myDoctorsScreen.findNewDoctorsSub')}</Text>
      <View style={doctorStyles.findLinkRow}>
        <Text style={doctorStyles.findLink}>{t('myDoctorsScreen.findSpecialistLink')}</Text>
        <ChevronRightIcon size={16} color={theme.colors.primaryDark} />
      </View>
    </TouchableOpacity>
  );
};

export default FindDoctorCard;
