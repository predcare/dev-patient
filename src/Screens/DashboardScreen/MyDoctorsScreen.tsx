import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { DoctorCard, FindDoctorCard } from '../../components/Modules/Doctors';
import { MyDoctorsSkeleton } from '../../components/Skeletons/MyDoctorsSkeleton';
import { StethoscopeIcon } from '../../components/ui/icons';
import { useGetMyDoctors } from '../../hooks/react-query/doctors/doctor.hooks';
import { Header } from '../../Layout/Header';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import { showErrorToast } from '../../lib/common/toast.utils';
import { AppRoute } from '../../route';
import { doctorStyles } from '../../styled/DoctorScreen.styled';
import { theme } from '../../styled/theme.styled';

export const MyDoctorsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const rootNav = navigation.getParent() || navigation;
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const {
    data: myDoctorsData,
    isLoading: isLoadingMyDoctors,
    refetch: refetchMyDoctors,
  } = useGetMyDoctors();

  const doctorsList = myDoctorsData?.data || [];
  const hasDoctors = doctorsList.length > 0;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchMyDoctors();
    setRefreshing(false);
  };
  const handleExploreDoctors = () => {
    rootNav.navigate(AppRoute.DOCTOR_SEARCH);
  };

  const handleNavigate = (type: string, options: { doctorId: number; clinicId: number }) => {
    const { clinicId, doctorId } = options;
    if (!clinicId && !doctorId && type === 'book') {
      return showErrorToast(t('myDoctorsScreen.invalidDoctorInfo'));
    }
    if (type === 'profile') {
      rootNav.navigate(AppRoute.DOCTOR_DETAILS, {
        doctorId: options?.doctorId,
      });
    } else if (type === 'book') {
      rootNav.navigate(AppRoute.BOOK_APPOINTMENT, {
        doctorId: options?.doctorId,
        clinicId: options?.clinicId,
      });
    } else {
      showErrorToast(t('myDoctorsScreen.cannotBookOrViewDoctor'));
    }
  };

  return (
    <SafeAreaWrapper
      style={doctorStyles.container}
      showBottomBar={true}
      activeBottomTab="Doctors"
      isPathClear={true}
    >
      <Header title={t('commons.myDoctors')} subTitle={t('myDoctorsScreen.subTitle')} />
      {isLoadingMyDoctors && !refreshing && !myDoctorsData ? (
        <MyDoctorsSkeleton />
      ) : (
        <FlatList
          data={doctorsList}
          keyExtractor={item => String(item.doctor_id)}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={doctorStyles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 14 }}>
              <DoctorCard
                clinicName={item?.clinic?.name || ''}
                name={item?.name}
                profile_image={item?.profile_image}
                specialization={item?.specialization}
                onProfilePress={() =>
                  handleNavigate('profile', {
                    doctorId: Number(item?.user_id),
                    clinicId: Number(item?.clinic?.id),
                  })
                }
                onBookPress={() =>
                  handleNavigate('book', {
                    doctorId: Number(item?.user_id),
                    clinicId: Number(item?.clinic?.id),
                  })
                }
              />
            </View>
          )}
          ListEmptyComponent={
            <View style={doctorStyles.emptyContainer}>
              <View style={doctorStyles.emptyIconWrapper}>
                <StethoscopeIcon size={32} color={theme.colors.primaryDark} />
              </View>
              <Text style={doctorStyles.emptyTitle}>{t('dashboard.noDoctorsAddedYet')}</Text>
              <Text style={doctorStyles.emptyDescription}>
                {t('myDoctorsScreen.noDoctorsDescription')}
              </Text>
              <TouchableOpacity
                style={doctorStyles.emptyActionButton}
                onPress={handleExploreDoctors}
                activeOpacity={0.8}
              >
                <Text style={doctorStyles.emptyActionButtonText}>
                  {t('myDoctorsScreen.findAndBookDoctor')}
                </Text>
              </TouchableOpacity>
            </View>
          }
          ListFooterComponent={
            <>
              {hasDoctors && <FindDoctorCard onExplorePress={handleExploreDoctors} />}
              <View style={doctorStyles.bottomPadding} />
            </>
          }
        />
      )}
    </SafeAreaWrapper>
  );
};

export default MyDoctorsScreen;
