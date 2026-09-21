import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import CommonErrorCard from '../../components/commons/CommonErrorCard/CommonErrorCard';
import { AppointmentCard, BookNewSessionCard } from '../../components/Modules/Appointments';
import AppointmentsSkeleton from '../../components/Skeletons/AppointmentsSkeleton';
import { CalendarIcon } from '../../components/ui/icons';
import { useMyAppointments } from '../../hooks/react-query/appointments/appointments.hooks';
import { Header } from '../../Layout/Header';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import {
  _formatTime,
  formatDate,
  getDuration,
  openLocationOnMap,
} from '../../lib/common/common.utils';
import { appointmentsStyles } from '../../styled/AppointmentsScreen.styled';
import { theme } from '../../styled/theme.styled';

export const AppointmentsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const rootNav = navigation.getParent() || navigation;

  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  const statusParam = useMemo(() => {
    return activeTab === 'upcoming' ? 'confirmed,pending' : 'completed,cancelled,refunded';
  }, [activeTab]);

  const {
    data: allAppointmentData,
    isFetching: allAppointmentIsPending,
    isError: allAppointmentIsError,
    error: allAppointmentError,
    refetch: appointmentRefetch,
  } = useMyAppointments({
    status: statusParam,
    limit: 10,
    page: 1,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await appointmentRefetch();
    setRefreshing(false);
  }, [appointmentRefetch]);

  useFocusEffect(
    useCallback(() => {
      appointmentRefetch();
    }, [])
  );

  return (
    <SafeAreaWrapper style={appointmentsStyles.root}>
      <Header greeting="My Appointments" userName="Schedule & Visits" unreadCount={1} />
      <View style={appointmentsStyles.segmentWrap}>
        <View style={appointmentsStyles.segmentTrack}>
          {(['upcoming', 'completed'] as const).map(key => {
            const active = activeTab === key;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  appointmentsStyles.segmentBtn,
                  active && appointmentsStyles.segmentBtnActive,
                ]}
                onPress={() => setActiveTab(key)}
                activeOpacity={2}
              >
                <Text
                  style={[
                    appointmentsStyles.segmentTxt,
                    active && appointmentsStyles.segmentTxtActive,
                  ]}
                >
                  {key === 'upcoming' ? 'Upcoming' : 'Completed'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      {allAppointmentIsPending && allAppointmentData?.data?.length === 0 ? (
        <AppointmentsSkeleton />
      ) : allAppointmentIsError ? (
        <CommonErrorCard
          title="Unable to Load Appointments"
          message={
            (allAppointmentError as any)?.response?.data?.message ||
            allAppointmentError?.message ||
            'Something went wrong while loading your appointments.'
          }
          onRetry={appointmentRefetch}
        />
      ) : (
        <FlatList
          data={allAppointmentData?.data || []}
          keyExtractor={item => String(item.id || item.appointment_id)}
          renderItem={({ item: apt }) => (
            <AppointmentCard
              apptId={apt?.appointment_id}
              apptStatus={apt?.appointment_status}
              clinicAddress={apt.clinicInfo?.fulladdress}
              clinicName={apt.clinicInfo?.name}
              date={formatDate(apt.appointment_date)}
              docImage={apt.doctorInfo?.profileImage}
              doctorName={apt.doctorInfo?.name}
              duration={getDuration(apt?.start_time, apt?.end_time) || ''}
              mode={apt?.consultation_type || ''}
              time={_formatTime(apt?.start_time) || ''}
              onCancelPress={() => {}}
              onDeletePress={() => {}}
              onJoinVideo={() =>
                rootNav.navigate('Meeting', {
                  appointmentId: apt.appointment_id || apt.id,
                  appointment: apt,
                })
              }
              onReschedule={() =>
                rootNav.navigate('RescheduleAppointment', {
                  appointmentId: apt.appointment_id || apt.id,
                  appointment: apt,
                })
              }
              onOpenDirections={() =>
                openLocationOnMap({
                  address: apt.clinicInfo?.fulladdress,
                  lat: apt.clinicInfo?.location?.lat,
                  long: apt.clinicInfo?.location?.lng,
                })
              }
            />
          )}
          ListEmptyComponent={
            <View style={appointmentsStyles.empty}>
              <View style={appointmentsStyles.emptyIconWrap}>
                <CalendarIcon size={32} color={theme.colors.primary} />
              </View>
              <Text style={appointmentsStyles.emptyH}>
                {activeTab === 'upcoming'
                  ? 'No Upcoming Appointments'
                  : 'No Completed Appointments'}
              </Text>
              <Text style={appointmentsStyles.emptyB}>
                {activeTab === 'upcoming'
                  ? "You don't have any upcoming doctor consultations scheduled right now."
                  : 'No completed or past appointments found.'}
              </Text>
            </View>
          }
          ListFooterComponent={
            <BookNewSessionCard onPress={() => rootNav.navigate('DoctorSearch')} />
          }
          contentContainerStyle={[appointmentsStyles.scrollContent, { paddingBottom: 120 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* Modals
      <AppointmentCancelModal
        visible={!!selectedCancelApt}
        appointment={selectedCancelApt}
        onClose={() => setSelectedCancelApt(null)}
        onConfirmCancel={() => {}}
      /> */}
    </SafeAreaWrapper>
  );
};

export default AppointmentsScreen;
