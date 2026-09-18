import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import {
  BackIcon,
  ChevronRightIcon,
  ClinicIcon,
  InfoCircleIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  SpecializationIcon,
  StethoscopeIcon,
} from '../../components/ui/icons';
import { MOCK_CLINICS, MockClinicItem } from '../../resources/mockData';
import { clinicDetailsStyles } from '../../styled/ClinicDetailsScreen.styled';
import { theme } from '../../styled/theme.styled';

export const ClinicDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const clinicId = route.params?.clinicId ?? 1;
  const clinic: MockClinicItem =
    MOCK_CLINICS.find(c => c.clinic_id === clinicId) || MOCK_CLINICS[0];

  const fullAddress = [
    clinic.line1,
    clinic.city,
    clinic.state,
    clinic.pincode,
    clinic.country,
  ]
    .filter(Boolean)
    .join(', ');

  const getInitials = (name: string) => {
    if (!name) return 'D';
    const cleaned = name.replace(/^Dr\.?\s*/i, '').trim();
    const parts = cleaned.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return cleaned[0].toUpperCase();
  };

  return (
    <SafeAreaWrapper
      style={clinicDetailsStyles.screen}
      backgroundColor={theme.colors.primary}
      barStyle="light-content"
    >

      {/* Top Header Bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: theme.colors.primary,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={{ padding: 4 }}>
          <BackIcon size={22} color={theme.colors.surface} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.surface }}>
          Clinic Details
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={clinicDetailsStyles.container} showsVerticalScrollIndicator={false}>
        {/* Clinic Identity Banner */}
        <View style={clinicDetailsStyles.headerSection}>
          <View style={clinicDetailsStyles.headerGradient}>
            <View style={clinicDetailsStyles.profileContainer}>
              <View style={clinicDetailsStyles.iconWrapper}>
                <ClinicIcon size={44} color={theme.colors.surface} />
              </View>

              <Text style={clinicDetailsStyles.name}>{clinic.clinic_name}</Text>

              {(clinic.city || clinic.state) && (
                <View style={clinicDetailsStyles.addressBadge}>
                  <Text style={clinicDetailsStyles.addressText}>
                    📍 {[clinic.city, clinic.state].filter(Boolean).join(', ')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Content Cards */}
        <View style={clinicDetailsStyles.contentContainer}>
          {/* About Card */}
          {clinic.about && (
            <View style={clinicDetailsStyles.card}>
              <View style={clinicDetailsStyles.cardHeader}>
                <View style={clinicDetailsStyles.iconCircle}>
                  <InfoCircleIcon size={20} color={theme.colors.primary} />
                </View>
                <Text style={clinicDetailsStyles.cardTitle}>About Clinic</Text>
              </View>
              <Text style={clinicDetailsStyles.bioText}>{clinic.about}</Text>
            </View>
          )}

          {/* Contact Card */}
          <View style={clinicDetailsStyles.card}>
            <View style={clinicDetailsStyles.cardHeader}>
              <View style={clinicDetailsStyles.iconCircle}>
                <PhoneIcon size={20} color={theme.colors.primary} />
              </View>
              <Text style={clinicDetailsStyles.cardTitle}>Contact Information</Text>
            </View>

            {clinic.email && (
              <View style={clinicDetailsStyles.contactRow}>
                <MailIcon size={18} color={theme.colors.primary} style={clinicDetailsStyles.contactIcon} />
                <Text style={clinicDetailsStyles.contactText}>{clinic.email}</Text>
              </View>
            )}

            {clinic.contact_numbers && clinic.contact_numbers.length > 0 && (
              <>
                {clinic.contact_numbers.map((phone, idx) => (
                  <View key={idx} style={clinicDetailsStyles.contactRow}>
                    <PhoneIcon size={18} color={theme.colors.primary} style={clinicDetailsStyles.contactIcon} />
                    <Text style={clinicDetailsStyles.contactText}>{phone}</Text>
                  </View>
                ))}
              </>
            )}

            {fullAddress && (
              <View style={clinicDetailsStyles.contactRow}>
                <View style={clinicDetailsStyles.contactIcon}>
                  <MapPinIcon size={18} color={theme.colors.primary} />
                </View>
                <Text style={clinicDetailsStyles.contactText}>{fullAddress}</Text>
              </View>
            )}
          </View>

          {/* Specialities Card */}
          {clinic.specialities && clinic.specialities.length > 0 && (
            <View style={clinicDetailsStyles.card}>
              <View style={clinicDetailsStyles.cardHeader}>
                <View style={clinicDetailsStyles.iconCircle}>
                  <SpecializationIcon size={20} color={theme.colors.primary} />
                </View>
                <Text style={clinicDetailsStyles.cardTitle}>Specialities</Text>
              </View>
              <View style={clinicDetailsStyles.specialitiesGrid}>
                {clinic.specialities.map((spec, idx) => (
                  <View key={idx} style={clinicDetailsStyles.specialityChip}>
                    <Text style={clinicDetailsStyles.specialityText}>{spec}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Available Doctors Card */}
          {clinic.doctors && clinic.doctors.length > 0 && (
            <View style={clinicDetailsStyles.card}>
              <View style={clinicDetailsStyles.cardHeader}>
                <View style={clinicDetailsStyles.iconCircle}>
                  <StethoscopeIcon size={20} color={theme.colors.primary} />
                </View>
                <Text style={clinicDetailsStyles.cardTitle}>Available Doctors</Text>
              </View>

              <View style={clinicDetailsStyles.doctorsList}>
                {clinic.doctors.map(doctor => (
                  <TouchableOpacity
                    key={doctor.doctor_id}
                    style={clinicDetailsStyles.doctorCard}
                    onPress={() =>
                      navigation.navigate('DoctorDetails', {
                        doctorId: doctor.doctor_id,
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <View style={clinicDetailsStyles.doctorAvatar}>
                      <Text style={clinicDetailsStyles.doctorAvatarText}>
                        {getInitials(doctor.doctor_name)}
                      </Text>
                    </View>
                    <View style={clinicDetailsStyles.doctorInfo}>
                      <Text style={clinicDetailsStyles.doctorName}>
                        Dr. {doctor.doctor_name.replace(/^Dr\.?\s*/i, '')}
                      </Text>
                      <Text style={clinicDetailsStyles.doctorSpec}>
                        {doctor.specialization || 'General Physician'}
                      </Text>
                      {doctor.experience_years && (
                        <Text style={clinicDetailsStyles.doctorExp}>
                          {doctor.experience_years} Years Experience
                        </Text>
                      )}
                    </View>
                    <View style={clinicDetailsStyles.arrowContainer}>
                      <ChevronRightIcon size={20} color={theme.colors.textMuted} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

export default ClinicDetailsScreen;
