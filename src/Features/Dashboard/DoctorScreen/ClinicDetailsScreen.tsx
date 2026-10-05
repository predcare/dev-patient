import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CommonErrorCard from '../../../components/commons/CommonErrorCard/CommonErrorCard';
import {
  ChevronRightIcon,
  ClinicIcon,
  InfoCircleIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  SpecializationIcon,
  StethoscopeIcon,
} from '../../../components/ui/icons';
import { useClinicDoctors, useClinicInfo } from '../../../hooks/react-query/clinics/clinics.hooks';
import Header from '../../../Layout/Header';
import SafeAreaWrapper from '../../../Layout/SafeAreaWrapper';
import { getInitials } from '../../../lib/common/common.utils';
import clinicDetailsStyles from '../../../styled/ClinicDetailsScreen.styled';
import theme from '../../../styled/theme.styled';
import ClinicDetailsSkeleton from './Skeletons/ClinicDetailsSkeleton';

export const ClinicDetailsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const clinicId = route.params?.clinicId ?? 0;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    data: clinicData,
    isFetching: isClinicFetching,
    refetch: refetchClinic,
    error: clinicError,
  } = useClinicInfo({
    clinicId: clinicId,
  });

  const {
    data: doctorsData,
    isFetching: isDoctorsFetching,
    refetch: refetchDoctors,
    error: doctorsError,
  } = useClinicDoctors({
    clinicId: clinicId,
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetchClinic();
    await refetchDoctors();
    setIsRefreshing(false);
  }, []);

  return (
    <SafeAreaWrapper
      showBottomBar={true}
      activeBottomTab="Doctors"
      header={
        <Header
          isBackBtn={true}
          title={t('clinicDetailsScreen.title')}
          onBackPress={() => navigation.goBack()}
        />
      }
    >
      {isClinicFetching ? (
        <ClinicDetailsSkeleton cardOnly={true} />
      ) : clinicError || !clinicData ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <CommonErrorCard
            title={t('clinicDetailsScreen.unableToLoadClinic')}
            message={t('clinicDetailsScreen.unableToLoadClinicMsg')}
            onRetry={() => refetchClinic()}
          />
        </View>
      ) : (
        <ScrollView
          style={clinicDetailsStyles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        >
          <View style={clinicDetailsStyles.headerSection}>
            <View style={clinicDetailsStyles.headerGradient}>
              <View style={clinicDetailsStyles.profileContainer}>
                <View style={clinicDetailsStyles.iconWrapper}>
                  <ClinicIcon size={44} color={theme.colors.surface} />
                </View>

                <Text style={clinicDetailsStyles.name}>
                  {clinicData?.name || t('clinicDetailsScreen.unknown')}
                </Text>

                {clinicData?.fullAddress ? (
                  <View style={clinicDetailsStyles.addressBadge}>
                    <View style={clinicDetailsStyles.addressBadgeIcon}>
                      <MapPinIcon size={14} color={theme.colors.surface} />
                    </View>
                    <Text style={clinicDetailsStyles.addressText}>{clinicData?.fullAddress}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          <View style={clinicDetailsStyles.contentContainer}>
            {clinicData?.about ? (
              <View style={clinicDetailsStyles.card}>
                <View style={clinicDetailsStyles.cardHeader}>
                  <View style={clinicDetailsStyles.iconCircle}>
                    <InfoCircleIcon size={20} color={theme.colors.primary} />
                  </View>
                  <Text style={clinicDetailsStyles.cardTitle}>
                    {t('clinicDetailsScreen.aboutClinic')}
                  </Text>
                </View>
                <Text style={clinicDetailsStyles.bioText}>{clinicData?.about}</Text>
              </View>
            ) : null}

            {/* Contact Card */}
            <View style={clinicDetailsStyles.card}>
              <View style={clinicDetailsStyles.cardHeader}>
                <View style={clinicDetailsStyles.iconCircle}>
                  <PhoneIcon size={20} color={theme.colors.primary} />
                </View>
                <Text style={clinicDetailsStyles.cardTitle}>
                  {t('clinicDetailsScreen.contactInformation')}
                </Text>
              </View>

              {clinicData?.email ? (
                <View style={clinicDetailsStyles.contactRow}>
                  <View style={clinicDetailsStyles.contactIcon}>
                    <MailIcon size={18} color={theme.colors.primary} />
                  </View>
                  <Text style={clinicDetailsStyles.contactText}>{clinicData?.email}</Text>
                </View>
              ) : null}

              {clinicData?.contact_numbers && clinicData?.contact_numbers.length > 0
                ? clinicData?.contact_numbers.map((phone, idx) => (
                  <View key={idx} style={clinicDetailsStyles.contactRow}>
                    <View style={clinicDetailsStyles.contactIcon}>
                      <PhoneIcon size={18} color={theme.colors.primary} />
                    </View>
                    <Text style={clinicDetailsStyles.contactText}>{phone}</Text>
                  </View>
                ))
                : null}

              {clinicData?.fullAddress ? (
                <View style={clinicDetailsStyles.contactRow}>
                  <View style={clinicDetailsStyles.contactIcon}>
                    <MapPinIcon size={18} color={theme.colors.primary} />
                  </View>
                  <Text style={clinicDetailsStyles.contactText}>{clinicData?.fullAddress}</Text>
                </View>
              ) : null}
            </View>

            {clinicData?.specialities && clinicData?.specialities.length > 0 ? (
              <View style={clinicDetailsStyles.card}>
                <View style={clinicDetailsStyles.cardHeader}>
                  <View style={clinicDetailsStyles.iconCircle}>
                    <SpecializationIcon size={20} color={theme.colors.primary} />
                  </View>
                  <Text style={clinicDetailsStyles.cardTitle}>
                    {t('clinicDetailsScreen.specialities')}
                  </Text>
                </View>
                <View style={clinicDetailsStyles.specialitiesGrid}>
                  {clinicData?.specialities.map((spec, idx) => (
                    <View key={idx} style={clinicDetailsStyles.specialityChip}>
                      <Text style={clinicDetailsStyles.specialityText}>{spec}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Available Doctors */}
            <View style={clinicDetailsStyles.card}>
              <View style={clinicDetailsStyles.cardHeader}>
                <View style={clinicDetailsStyles.iconCircle}>
                  <StethoscopeIcon size={20} color={theme.colors.primary} />
                </View>
                <Text style={clinicDetailsStyles.cardTitle}>
                  {t('clinicDetailsScreen.availableDoctors')}
                </Text>
              </View>

              {isDoctorsFetching && !doctorsData ? (
                <View style={clinicDetailsStyles.doctorsLoadingContainer}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={clinicDetailsStyles.doctorsLoadingText}>
                    {t('clinicDetailsScreen.loadingAvailableDoctors')}
                  </Text>
                </View>
              ) : doctorsError ? (
                <View style={clinicDetailsStyles.doctorsErrorContainer}>
                  <Text style={clinicDetailsStyles.doctorsErrorText}>
                    {t('clinicDetailsScreen.failedToLoadDoctors')}
                  </Text>
                  <TouchableOpacity
                    style={clinicDetailsStyles.retryButton}
                    onPress={() => refetchDoctors()}
                    activeOpacity={0.7}
                  >
                    <Text style={clinicDetailsStyles.retryButtonText}>{t('commons.retry')}</Text>
                  </TouchableOpacity>
                </View>
              ) : !doctorsData || doctorsData.length === 0 ? (
                <View style={clinicDetailsStyles.doctorsEmptyContainer}>
                  <Text style={clinicDetailsStyles.doctorsEmptyText}>
                    {t('clinicDetailsScreen.noDoctorsAvailable')}
                  </Text>
                </View>
              ) : (
                <View style={clinicDetailsStyles.doctorsList}>
                  {doctorsData?.map(doctor => {
                    return (
                      <TouchableOpacity
                        key={doctor.user_id}
                        style={clinicDetailsStyles.doctorCard}
                        activeOpacity={0.7}
                        onPress={() =>
                          navigation.navigate('DoctorDetails', { doctorId: doctor.user_id })
                        }
                      >
                        {doctor.profile_image ? (
                          <Image
                            source={{ uri: doctor.profile_image }}
                            style={clinicDetailsStyles.doctorAvatarImage}
                          />
                        ) : (
                          <View style={clinicDetailsStyles.doctorAvatar}>
                            <Text style={clinicDetailsStyles.doctorAvatarText}>
                              {getInitials(
                                doctor.doctor_name || t('clinicDetailsScreen.doctorDefault')
                              )}
                            </Text>
                          </View>
                        )}
                        <View style={clinicDetailsStyles.doctorInfo}>
                          <Text style={clinicDetailsStyles.doctorName}>
                            Dr. {doctor?.doctor_name}
                          </Text>
                          {doctor.specialization ? (
                            <Text style={clinicDetailsStyles.doctorSpec}>
                              {doctor.specialization}
                            </Text>
                          ) : null}
                          {doctor.year_of_experience !== null &&
                            doctor.year_of_experience !== undefined ? (
                            <Text style={clinicDetailsStyles.doctorExp}>
                              {doctor.year_of_experience === 1
                                ? t('clinicDetailsScreen.yearsExperienceSingle', {
                                  count: doctor.year_of_experience,
                                })
                                : t('clinicDetailsScreen.yearsExperience', {
                                  count: doctor.year_of_experience,
                                })}
                            </Text>
                          ) : null}
                        </View>

                        <View style={clinicDetailsStyles.arrowContainer}>
                          <ChevronRightIcon size={20} color={theme.colors.textMuted} />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      )}
    </SafeAreaWrapper>
  );
};

export default ClinicDetailsScreen;
