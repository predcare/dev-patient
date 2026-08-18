import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, SafeAreaView, ScrollView, Text, View } from 'react-native';
import PopupAlert, { AlertType } from '../../components/commons/PopupAlert/PopupAlert';
import { ClinicBookingCard } from '../../components/Modules/Doctors';
import AppHeader from '../../components/ui/AppHeader';
import { CheckIcon, GlobeIcon, PatientsIcon, StethoscopeIcon } from '../../components/ui/icons';
import { ClinicLocationData, MOCK_SEARCH_DOCTORS, SearchDoctorData } from '../../resources/mockData';
import { doctorDetailsStyles } from '../../styled/DoctorDetailsScreen.styled';
import { theme } from '../../styled/theme.styled';

export const DoctorDetailsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const routeDoctor: any = route.params?.doctor;
  const doctorId: number =
    route.params?.doctorId ||
    routeDoctor?.doctor_user_id ||
    routeDoctor?.doctor_id ||
    101;

  const foundDoctor =
    MOCK_SEARCH_DOCTORS.find(
      d =>
        d.doctor_id === doctorId ||
        (routeDoctor?.doctor_name &&
          d.doctor_name
            .toLowerCase()
            .includes(routeDoctor.doctor_name.toLowerCase().replace('dr.', '').trim()))
    ) || MOCK_SEARCH_DOCTORS[0];

  const doctor: SearchDoctorData = {
    ...foundDoctor,
    ...(routeDoctor || {}),
    doctor_id: foundDoctor.doctor_id,
    doctor_name: routeDoctor?.doctor_name || foundDoctor.doctor_name,
    specialization: routeDoctor?.specialization || foundDoctor.specialization,
    languages:
      Array.isArray(routeDoctor?.languages) && routeDoctor.languages.length > 0
        ? routeDoctor.languages
        : foundDoctor.languages,
    clinics:
      Array.isArray(routeDoctor?.clinics) && routeDoctor.clinics.length > 0
        ? routeDoctor.clinics
        : foundDoctor.clinics,
    years_of_experience: routeDoctor?.years_of_experience || foundDoctor.years_of_experience,
    patients_treated: routeDoctor?.patients_treated || foundDoctor.patients_treated || '1.2k+',
    bio: routeDoctor?.bio || foundDoctor.bio,
    initials: routeDoctor?.initials || foundDoctor.initials,
    profile_image:
      routeDoctor?.profile_image !== undefined
        ? routeDoctor.profile_image
        : foundDoctor.profile_image,
  };

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type?: AlertType;
    title?: string;
    message?: string;
    onPress?: () => void;
  }>({ visible: false });

  const handleBookAppointment = (clinic: ClinicLocationData, selectedDate: string) => {
    navigation.navigate('BookAppointment', {
      doctorId: doctor.doctor_id,
      doctor,
      clinicId: clinic.clinic_id,
      clinicName: clinic.clinic_name,
    });
  };

  const rawName = doctor.doctor_name.startsWith('Dr.')
    ? doctor.doctor_name
    : `Dr. ${doctor.doctor_name}`;
  const languagesList = doctor.languages || ['English', 'Hindi'];
  const clinicsList = doctor.clinics || [];
  const expText = doctor.years_of_experience ? `${doctor.years_of_experience}+ Years` : '12+ Years';
  const consultsText = doctor.patients_treated || '1.2k+';

  return (
    <SafeAreaView style={doctorDetailsStyles.screen}>
      <AppHeader title="Doctor Profile" showBack={true} />

      <ScrollView
        style={doctorDetailsStyles.scroll}
        contentContainerStyle={doctorDetailsStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={doctorDetailsStyles.profileHeader}>
          <View style={doctorDetailsStyles.avatarWrap}>
            {doctor.profile_image ? (
              <Image
                source={{ uri: doctor.profile_image }}
                style={doctorDetailsStyles.avatar}
              />
            ) : (
              <View style={doctorDetailsStyles.avatarPlaceholder}>
                <Text style={doctorDetailsStyles.avatarText}>{doctor.initials}</Text>
              </View>
            )}
            <View style={doctorDetailsStyles.verifiedBadge}>
              <CheckIcon size={12} color={theme.colors.surface} />
            </View>
          </View>

          <View style={doctorDetailsStyles.nameRow}>
            <Text style={doctorDetailsStyles.name}>{rawName}</Text>
            <View style={doctorDetailsStyles.verifiedPill}>
              <Text style={doctorDetailsStyles.verifiedPillText}>VERIFIED</Text>
            </View>
          </View>

          <Text style={doctorDetailsStyles.titleLine}>
            {(doctor.specialization || '').toUpperCase()}
          </Text>

          <Text style={doctorDetailsStyles.metaLine}>
            {doctor.qualifications || `${doctor.specialization} • MD`}
          </Text>
        </View>

        {/* Stats Row */}
        <View style={doctorDetailsStyles.statsRow}>
          <View style={doctorDetailsStyles.statCard}>
            <StethoscopeIcon size={22} color={theme.colors.primary} />
            <Text style={doctorDetailsStyles.statValue}>{expText}</Text>
            <Text style={doctorDetailsStyles.statLabel}>EXPERIENCE</Text>
          </View>

          <View style={doctorDetailsStyles.statCard}>
            <PatientsIcon size={22} color={theme.colors.primary} />
            <Text style={doctorDetailsStyles.statValue}>{consultsText}</Text>
            <Text style={doctorDetailsStyles.statLabel}>CONSULTS</Text>
          </View>
        </View>

        {/* Professional Bio */}
        <Text style={doctorDetailsStyles.sectionTitle}>Professional Bio</Text>
        <View style={doctorDetailsStyles.card}>
          <Text style={doctorDetailsStyles.bioText}>{doctor.bio}</Text>
        </View>

        {/* Languages Spoken */}
        {languagesList.length > 0 && (
          <>
            <Text style={doctorDetailsStyles.sectionTitle}>Languages Spoken</Text>
            <View style={doctorDetailsStyles.card}>
              <View style={doctorDetailsStyles.langRow}>
                <GlobeIcon size={18} color={theme.colors.primary} />
                <Text style={doctorDetailsStyles.langText}>
                  {languagesList.join(', ')}
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Clinical Locations */}
        <Text style={doctorDetailsStyles.sectionTitle}>Clinical Locations</Text>
        {clinicsList.map(clinic => (
          <ClinicBookingCard
            key={clinic.clinic_id}
            clinic={clinic}
            onBookAppointment={handleBookAppointment}
          />
        ))}
      </ScrollView>

      {/* Popup Alert */}
      <PopupAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onPress={alertConfig.onPress || (() => setAlertConfig({ visible: false }))}
      />
    </SafeAreaView>
  );
};

export default DoctorDetailsScreen;
