import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, SafeAreaView, Text, View } from 'react-native';
import { AlertType } from '../../components/commons/PopupAlert/PopupAlert';
import { DoctorCard, FindDoctorCard } from '../../components/Modules/Doctors';
import { MyDoctorsSkeleton } from '../../components/Skeletons/MyDoctorsSkeleton';
import { StethoscopeIcon } from '../../components/ui/icons';
import { useGetMyDoctors } from '../../hooks/react-query/doctors/doctor.hooks';
import { Header } from '../../Layout/Header';
import { showErrorToast } from '../../lib/common/toast.utils';
import { AppRoute } from '../../route';
import { doctorStyles } from '../../styled/DoctorScreen.styled';
import { theme } from '../../styled/theme.styled';

interface PopupAlertState {
  visible: boolean;
  type?: AlertType;
  title?: string;
  message?: string;
  buttonText?: string;
  onPress?: () => void;
}

export const MyDoctorsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const rootNav = navigation.getParent() || navigation;
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const {
    data: myDoctorsData,
    isFetching: isPendingMyDoctors,
    refetch: refetchMyDoctors,
  } = useGetMyDoctors();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchMyDoctors();
    setRefreshing(false);
  };
  const handleExploreDoctors = () => {
    rootNav.navigate('DoctorSearch');
  };

  const handleNavigate = (type: string, options: { doctorId: number; clinicId: number }) => {
    const { clinicId, doctorId } = options;
    if (!clinicId && !doctorId && type === 'book') {
      return showErrorToast('Invalid doctor information');
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
      showErrorToast("Can't book or view this doctor");
    }
  };

  useFocusEffect(
    useCallback(() => {
      refetchMyDoctors();
    }, [])
  );

  return (
    <SafeAreaView style={doctorStyles.container}>
      <Header />
      {isPendingMyDoctors && !refreshing ? (
        <MyDoctorsSkeleton />
      ) : (
        <FlatList
          data={myDoctorsData?.data || []}
          keyExtractor={item => String(item.doctor_id)}
          showsVerticalScrollIndicator={false}
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
              <Text style={doctorStyles.emptyTitle}>No Doctors Added Yet</Text>
              <Text style={doctorStyles.emptyDescription}>
                Doctors you consult with or book appointments with will automatically appear here
                for easy access and rebooking.
              </Text>
            </View>
          }
          ListFooterComponent={
            <>
              <FindDoctorCard onExplorePress={handleExploreDoctors} />
              <View style={doctorStyles.bottomPadding} />
            </>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default MyDoctorsScreen;
