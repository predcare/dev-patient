import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { doctorSearchStyles } from '../../../styled/DoctorSearchScreen.styled';
import { theme } from '../../../styled/theme.styled';
import { IClinicDoc } from '../../../typescripts/interfaces/doctors.interfaces';
import { ClinicIcon, MapPinIcon, StethoscopeIcon } from '../../ui/icons';

export interface ClinicCardProps {
  id: string;
  name: string;
  location?: string;
  city?: string;
  state?: string;
  specialities?: string[];
  availableDoctorsCount?: number;
  onPress?: () => void;
}

export const ClinicCard: React.FC<ClinicCardProps> = ({
  name,
  location,
  city,
  state,
  specialities,
  availableDoctorsCount = 0,
  onPress,
}) => {
  const doctorCount = availableDoctorsCount;
  const locationLabel = location || [city, state].filter(Boolean).join(', ');

  const handlePress = () => {
    if (onPress) onPress();
  };

  return (
    <TouchableOpacity
      style={doctorSearchStyles.clinicCard}
      activeOpacity={0.88}
      onPress={handlePress}
    >
      <View style={doctorSearchStyles.clinicCardHeader}>
        <View style={doctorSearchStyles.clinicIconWrapper}>
          <ClinicIcon size={28} color={theme.colors.primary} />
        </View>

        <View style={doctorSearchStyles.clinicInfoCol}>
          <Text style={doctorSearchStyles.clinicName} numberOfLines={1}>
            {name}
          </Text>
          {locationLabel ? (
            <View style={doctorSearchStyles.clinicLocRow}>
              <MapPinIcon size={14} color={theme.colors.textMuted} />
              <Text style={doctorSearchStyles.clinicLocTxt} numberOfLines={1}>
                {locationLabel}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Specialities Chips */}
      {specialities && specialities.length > 0 && (
        <View style={doctorSearchStyles.clinicChipsRow}>
          {specialities.slice(0, 3).map((spec, idx) => (
            <View key={idx} style={doctorSearchStyles.clinicSpecChip}>
              <Text style={doctorSearchStyles.clinicSpecChipTxt}>{spec}</Text>
            </View>
          ))}
          {specialities.length > 3 && (
            <View style={doctorSearchStyles.clinicSpecChipMore}>
              <Text style={doctorSearchStyles.clinicSpecChipMoreTxt}>
                +{specialities.length - 3}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Bottom Footer */}
      <View style={doctorSearchStyles.clinicFooter}>
        <View style={doctorSearchStyles.clinicDocCountRow}>
          <StethoscopeIcon size={14} color={theme.colors.primary} />
          <Text style={doctorSearchStyles.clinicDocCountTxt}>
            {doctorCount} Available Doctor{doctorCount !== 1 ? 's' : ''}
          </Text>
        </View>

        <TouchableOpacity
          style={doctorSearchStyles.viewClinicBtn}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Text style={doctorSearchStyles.viewClinicBtnTxt}>View Clinic →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default ClinicCard;
