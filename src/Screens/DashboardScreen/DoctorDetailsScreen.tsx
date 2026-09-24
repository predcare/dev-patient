import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, Text, View } from 'react-native';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import { ClinicBookingCard } from '../../components/Modules/Doctors';
import DoctorDetailsSkeleton from '../../components/Skeletons/DoctorDetailsSkeleton';
import CommonErrorCard from '../../components/commons/CommonErrorCard/CommonErrorCard';
import AppHeader from '../../components/ui/AppHeader';
import { CheckIcon, GlobeIcon, PatientsIcon, StethoscopeIcon } from '../../components/ui/icons';
import { useDoctorDetails } from '../../hooks/react-query/doctors/doctor.hooks';
import { getInitials } from '../../lib/common/common.utils';
import { showErrorToast } from '../../lib/common/toast.utils';
import { doctorDetailsStyles } from '../../styled/DoctorDetailsScreen.styled';
import { theme } from '../../styled/theme.styled';

export const DoctorDetailsScreen: React.FC = () => {
  const { t } = useTranslation();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const doctorId: number = Number(route.params?.doctorId);

  const {
    data: doctorDetailsData,
    isFetching: doctorDetailsPending,
    error: doctorDetailsError,
    refetch,
  } = useDoctorDetails(doctorId);

  const handleBookAppointment = (clinicId: string) => {
    if (!doctorDetailsData)
      return showErrorToast(t('commons.error'), t('doctorDetailsScreen.doctorNotFound'));
    navigation.navigate('BookAppointment', {
      doctorId: doctorDetailsData.user_id,
      clinicId,
    });
  };

  return (
    <SafeAreaWrapper style={doctorDetailsStyles.screen}>
      <AppHeader title={t('doctorDetailsScreen.title')} showBack={true} />
      {doctorDetailsPending ? (
        <DoctorDetailsSkeleton cardOnly={true} />
      ) : !doctorDetailsData || doctorDetailsError ? (
        <CommonErrorCard
          title={t('doctorDetailsScreen.unableToLoadProfile')}
          message={t('doctorDetailsScreen.unableToLoadProfileMsg')}
          onRetry={() => refetch()}
        />
      ) : (
        <ScrollView
          style={doctorDetailsStyles.scroll}
          contentContainerStyle={doctorDetailsStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={doctorDetailsStyles.profileHeader}>
            <View style={doctorDetailsStyles.avatarWrap}>
              {doctorDetailsData.profile_image ? (
                <Image
                  source={{ uri: doctorDetailsData.profile_image }}
                  style={doctorDetailsStyles.avatar}
                />
              ) : (
                <View style={doctorDetailsStyles.avatarPlaceholder}>
                  <Text style={doctorDetailsStyles.avatarText}>
                    {getInitials(doctorDetailsData.name || '')}
                  </Text>
                </View>
              )}
              <View style={doctorDetailsStyles.verifiedBadge}>
                <CheckIcon size={12} color={theme.colors.surface} />
              </View>
            </View>

            <View style={doctorDetailsStyles.nameRow}>
              <Text style={doctorDetailsStyles.name}>{doctorDetailsData?.name || ''}</Text>
              <View style={doctorDetailsStyles.verifiedPill}>
                <Text style={doctorDetailsStyles.verifiedPillText}>VERIFIED</Text>
              </View>
            </View>

            {doctorDetailsData.specialization ? (
              <Text style={doctorDetailsStyles.titleLine}>
                {doctorDetailsData.specialization.toUpperCase()}
              </Text>
            ) : null}

            {doctorDetailsData.qualifications ? (
              <Text style={doctorDetailsStyles.metaLine}>{doctorDetailsData.qualifications}</Text>
            ) : null}
          </View>
          <View style={doctorDetailsStyles.statsRow}>
            <View style={doctorDetailsStyles.statCard}>
              <StethoscopeIcon size={22} color={theme.colors.primary} />
              <Text style={doctorDetailsStyles.statValue}>
                {doctorDetailsData.experience_years
                  ? t('doctorDetailsScreen.experienceYrs', {
                      count: doctorDetailsData.experience_years,
                    })
                  : t('commons.na')}
              </Text>
              <Text style={doctorDetailsStyles.statLabel}>
                {t('doctorDetailsScreen.experience')}
              </Text>
            </View>

            <View style={doctorDetailsStyles.statCard}>
              <PatientsIcon size={22} color={theme.colors.primary} />
              <Text style={doctorDetailsStyles.statValue}>
                {doctorDetailsData.reviews_count ? `${doctorDetailsData.reviews_count}+` : '0'}
              </Text>
              <Text style={doctorDetailsStyles.statLabel}>{t('doctorDetailsScreen.consults')}</Text>
            </View>
          </View>
          {doctorDetailsData.bio ? (
            <>
              <Text style={doctorDetailsStyles.sectionTitle}>
                {t('doctorDetailsScreen.professionalBio')}
              </Text>
              <View style={doctorDetailsStyles.card}>
                <Text style={doctorDetailsStyles.bioText}>{doctorDetailsData.bio}</Text>
              </View>
            </>
          ) : null}
          {Array.isArray(doctorDetailsData.languages_spoken) &&
            doctorDetailsData.languages_spoken.length > 0 && (
              <>
                <Text style={doctorDetailsStyles.sectionTitle}>
                  {t('doctorDetailsScreen.languagesSpoken')}
                </Text>
                <View style={doctorDetailsStyles.card}>
                  <View style={doctorDetailsStyles.langRow}>
                    <GlobeIcon size={18} color={theme.colors.primary} />
                    <Text style={doctorDetailsStyles.langText}>
                      {doctorDetailsData.languages_spoken.join(', ')}
                    </Text>
                  </View>
                </View>
              </>
            )}
          {Array.isArray(doctorDetailsData.clinics) && doctorDetailsData.clinics.length > 0 && (
            <>
              <Text style={doctorDetailsStyles.sectionTitle}>
                {t('doctorDetailsScreen.clinicalLocations')}
              </Text>
              {doctorDetailsData.clinics.map(clinic => (
                <ClinicBookingCard
                  key={clinic.id}
                  id={clinic.id}
                  name={clinic.name}
                  address={clinic.address}
                  availableDates={clinic.available_dates}
                  onBookAppointment={handleBookAppointment}
                />
              ))}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaWrapper>
  );
};

export default DoctorDetailsScreen;
