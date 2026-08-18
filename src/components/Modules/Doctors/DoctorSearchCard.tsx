import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SearchDoctorData } from '../../../resources/mockData';
import { doctorSearchStyles } from '../../../styled/DoctorSearchScreen.styled';
import { theme } from '../../../styled/theme.styled';
import { CalendarIcon, VideoIcon } from '../../ui/icons';

export interface DoctorSearchCardProps {
  doctor: SearchDoctorData;
  onProfilePress?: (doctor: SearchDoctorData) => void;
  onBookPress?: (doctor: SearchDoctorData) => void;
}

export const DoctorSearchCard: React.FC<DoctorSearchCardProps> = ({
  doctor,
  onProfilePress,
  onBookPress,
}) => {
  const navigation = useNavigation<any>();
  const rootNav = navigation.getParent() || navigation;

  const handleProfile = () => {
    if (onProfilePress) {
      onProfilePress(doctor);
    } else {
      rootNav.navigate('DoctorDetails', { doctorId: doctor.doctor_id, doctor });
    }
  };

  const handleBook = () => {
    if (onBookPress) {
      onBookPress(doctor);
    } else {
      rootNav.navigate('BookAppointment', { doctorId: doctor.doctor_id, doctor });
    }
  };
  const nextDate = doctor.next_available_dates[0] || 'Today';

  return (
    <View style={doctorSearchStyles.card}>
      <View style={doctorSearchStyles.cardTop}>
        {doctor.profile_image ? (
          <Image
            source={{ uri: doctor.profile_image }}
            style={{ width: 56, height: 56, borderRadius: 28, marginRight: 12 }}
          />
        ) : (
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: theme.colors.primaryDark,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Text style={{ color: theme.colors.surface, fontWeight: '700', fontSize: 16 }}>
              {doctor.initials}
            </Text>
          </View>
        )}

        <View style={doctorSearchStyles.cardInfo}>
          <Text style={doctorSearchStyles.doctorName}>{doctor.doctor_name}</Text>
          <Text style={doctorSearchStyles.doctorMeta}>
            {doctor.specialization} • {doctor.years_of_experience} yrs exp • {doctor.city}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => rootNav.navigate('ClinicDetails', { clinicId: 1 })}
            style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center' }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.colors.primary }}>
              🏥 ST. JUDE MEDICAL CENTER →
            </Text>
          </TouchableOpacity>
        </View>

        <View style={doctorSearchStyles.cardIcons}>
          {doctor.min_in_person_fee ? (
            <CalendarIcon size={16} color={theme.colors.primary} />
          ) : null}
          {doctor.min_video_fee ? (
            <VideoIcon size={16} color={theme.colors.primary} />
          ) : null}
        </View>
      </View>

      <View style={doctorSearchStyles.dateRow}>
        <View style={doctorSearchStyles.dateChip}>
          <Text style={doctorSearchStyles.dateChipText}>Next Available: {nextDate}</Text>
        </View>
      </View>

      <View style={doctorSearchStyles.actionRow}>
        <TouchableOpacity
          style={doctorSearchStyles.profileBtn}
          onPress={handleProfile}
          activeOpacity={0.85}
        >
          <Text style={doctorSearchStyles.profileBtnText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={doctorSearchStyles.bookBtn}
          onPress={handleBook}
          activeOpacity={0.85}
        >
          <Text style={doctorSearchStyles.bookBtnText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DoctorSearchCard;
