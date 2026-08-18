import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { MyDoctorData } from '../../../resources/mockData';
import { doctorStyles } from '../../../styled/DoctorScreen.styled';
import { theme } from '../../../styled/theme.styled';
import { CalendarIcon, ClockIcon } from '../../ui/icons';

export interface DoctorCardProps {
  doctor: MyDoctorData;
  onProfilePress?: (doctor: MyDoctorData) => void;
  onBookPress?: (doctor: MyDoctorData) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
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
      rootNav.navigate('DoctorDetails', { doctorId: doctor.doctor_user_id, doctor });
    }
  };

  const handleBook = () => {
    if (onBookPress) {
      onBookPress(doctor);
    } else {
      rootNav.navigate('BookAppointment', { doctorId: doctor.doctor_user_id, doctor });
    }
  };
  return (
    <View style={doctorStyles.doctorCard}>
      {/* Main Info Row */}
      <View style={doctorStyles.doctorMainInfo}>
        {doctor.profile_image ? (
          <Image source={{ uri: doctor.profile_image }} style={doctorStyles.doctorAvatarImage} />
        ) : (
          <View style={doctorStyles.doctorAvatar}>
            <Text style={doctorStyles.doctorAvatarText}>{doctor.initials}</Text>
          </View>
        )}

        <View style={doctorStyles.doctorDetails}>
          <Text style={doctorStyles.doctorName} numberOfLines={1}>
            {doctor.doctor_name}
          </Text>
          <Text style={doctorStyles.doctorSpecialization} numberOfLines={1}>
            {doctor.specialization}
          </Text>
          {doctor.clinic_name ? (
            <Text style={doctorStyles.clinicName} numberOfLines={1}>
              {doctor.clinic_name}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Upcoming Appointments Box */}
      {doctor.upcoming_appointments && doctor.upcoming_appointments.length > 0 && (
        <View style={doctorStyles.scheduledBox}>
          <Text style={doctorStyles.sectionLabel}>UPCOMING APPOINTMENT</Text>
          <View style={doctorStyles.upcomingList}>
            {doctor.upcoming_appointments.map(apt => (
              <View key={apt.id} style={doctorStyles.upcomingRow}>
                <View style={doctorStyles.upcomingMeta}>
                  <Text style={doctorStyles.typeBadge}>
                    {apt.consultation_type || 'VIDEO CONSULTATION'}
                  </Text>
                  <View style={doctorStyles.scheduledRow}>
                    <View style={doctorStyles.scheduledCol}>
                      <View style={doctorStyles.metaIconRow}>
                        <CalendarIcon size={12} color={theme.colors.primaryDark} />
                        <Text style={doctorStyles.metaLbl}>DATE</Text>
                      </View>
                      <Text style={doctorStyles.metaVal}>
                        {apt.appointment_date_label || apt.appointment_date}
                      </Text>
                    </View>

                    {apt.start_time_label && (
                      <View style={doctorStyles.scheduledCol}>
                        <View style={doctorStyles.metaIconRow}>
                          <ClockIcon size={12} color={theme.colors.primaryDark} />
                          <Text style={doctorStyles.metaLbl}>TIME</Text>
                        </View>
                        <Text style={doctorStyles.metaVal}>{apt.start_time_label}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Past Appointments Box */}
      {doctor.past_appointments && doctor.past_appointments.length > 0 && (
        <View style={doctorStyles.pastBox}>
          <Text style={doctorStyles.sectionLabel}>PAST VISITS</Text>
          <View style={doctorStyles.pastList}>
            {doctor.past_appointments.map((apt, idx) => {
              const isLast = apt.is_last_visit || idx === 0;
              return (
                <View key={apt.id} style={doctorStyles.pastRow}>
                  {isLast ? (
                    <ClockIcon size={14} color={theme.colors.primaryDark} />
                  ) : (
                    <CalendarIcon size={14} color={theme.colors.textMuted} />
                  )}
                  <Text style={doctorStyles.pastDate}>
                    {apt.appointment_date_label || apt.appointment_date}
                  </Text>
                  {isLast && <Text style={doctorStyles.lastVisit}>LAST VISIT</Text>}
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={doctorStyles.actionButtons}>
        <TouchableOpacity
          style={doctorStyles.profileBtn}
          onPress={handleProfile}
          activeOpacity={0.85}
        >
          <Text style={doctorStyles.profileBtnTxt}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={doctorStyles.bookBtn}
          onPress={handleBook}
          activeOpacity={0.85}
        >
          <Text style={doctorStyles.bookBtnTxt}>{doctor.book_label}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DoctorCard;
