import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { doctorStyles } from '../../../styled/DoctorScreen.styled';
import { theme } from '../../../styled/theme.styled';
import { ChevronRightIcon, PlusIcon } from '../../ui/icons';

export interface FindDoctorCardProps {
  onExplorePress?: () => void;
}

export const FindDoctorCard: React.FC<FindDoctorCardProps> = ({ onExplorePress }) => {
  const navigation = useNavigation<any>();
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
      <Text style={doctorStyles.findTitle}>Find New Doctors</Text>
      <Text style={doctorStyles.findSub}>
        Browse our network of top specialists and book instant consultations.
      </Text>
      <View style={doctorStyles.findLinkRow}>
        <Text style={doctorStyles.findLink}>Find a Specialist</Text>
        <ChevronRightIcon size={16} color={theme.colors.primaryDark} />
      </View>
    </TouchableOpacity>
  );
};

export default FindDoctorCard;
