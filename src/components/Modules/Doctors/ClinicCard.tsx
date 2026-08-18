import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MockClinicItem } from '../../../resources/mockData';
import { doctorSearchStyles } from '../../../styled/DoctorSearchScreen.styled';
import { theme } from '../../../styled/theme.styled';
import { ClinicIcon, MapPinIcon, StethoscopeIcon } from '../../ui/icons';

export interface ClinicCardProps {
  clinic: MockClinicItem;
  onPress: (clinic: MockClinicItem) => void;
}

export const ClinicCard: React.FC<ClinicCardProps> = ({ clinic, onPress }) => {
  const doctorCount = clinic.doctors?.length || 0;
  const locationLabel = [clinic.city, clinic.state].filter(Boolean).join(', ') || 'New York, NY';

  return (
    <TouchableOpacity
      style={doctorSearchStyles.clinicCard}
      activeOpacity={0.88}
      onPress={() => onPress(clinic)}
    >
      <View style={doctorSearchStyles.clinicCardHeader}>
        <View style={doctorSearchStyles.clinicIconWrapper}>
          <ClinicIcon size={28} color={theme.colors.primary} />
        </View>

        <View style={doctorSearchStyles.clinicInfoCol}>
          <Text style={doctorSearchStyles.clinicName} numberOfLines={1}>
            {clinic.clinic_name}
          </Text>
          <View style={doctorSearchStyles.clinicLocRow}>
            <MapPinIcon size={14} color={theme.colors.textMuted} />
            <Text style={doctorSearchStyles.clinicLocTxt} numberOfLines={1}>
              {locationLabel}
            </Text>
          </View>
        </View>
      </View>

      {/* Specialities Chips */}
      {clinic.specialities && clinic.specialities.length > 0 && (
        <View style={doctorSearchStyles.clinicChipsRow}>
          {clinic.specialities.slice(0, 3).map((spec, idx) => (
            <View key={idx} style={doctorSearchStyles.clinicSpecChip}>
              <Text style={doctorSearchStyles.clinicSpecChipTxt}>{spec}</Text>
            </View>
          ))}
          {clinic.specialities.length > 3 && (
            <View style={doctorSearchStyles.clinicSpecChipMore}>
              <Text style={doctorSearchStyles.clinicSpecChipMoreTxt}>
                +{clinic.specialities.length - 3}
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
          onPress={() => onPress(clinic)}
          activeOpacity={0.8}
        >
          <Text style={doctorSearchStyles.viewClinicBtnTxt}>View Clinic →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default ClinicCard;
