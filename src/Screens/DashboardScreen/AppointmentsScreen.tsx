import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import CommonErrorCard from '../../components/commons/CommonErrorCard/CommonErrorCard';
import { AppointmentCard, BookNewSessionCard } from '../../components/Modules/Appointments';
import AppointmentsSkeleton from '../../components/Skeletons/AppointmentsSkeleton';
import { CalendarIcon } from '../../components/ui/icons';
import useJoinVideoCall from '../../hooks/commons/useJoinVideoCall';
import {
  useCancelMyAppt,
  useMyAppointments,
} from '../../hooks/react-query/appointments/appointments.hooks';
import { Header } from '../../Layout/Header';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import {
  _formatTime,
  formatDate,
  getDuration,
  openLocationOnMap,
} from '../../lib/common/common.utils';
import { showErrorToast, showInfoToast, showSuccessToast } from '../../lib/common/toast.utils';
import { AppRoute } from '../../route';
import { appointmentsStyles } from '../../styled/AppointmentsScreen.styled';
import { theme } from '../../styled/theme.styled';
import { IMyAppointmentDoc } from '../../typescripts/interfaces/appointments.interfaces';
import { useAlertStore } from '../../zustand/stores/useAlertStore';
import { useLoadingStore } from '../../zustand/stores/useLoadingStore';

export const AppointmentsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const rootNav = navigation.getParent() || navigation;

  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [refreshing, setRefreshing] = useState(false);
  const { showLoader, hideLoader } = useLoadingStore(state => state);
  const showConfirm = useAlertStore(state => state.showConfirm);
  const { handleJoinVideoCall } = useJoinVideoCall();
  const { mutate: cancelAppt } = useCancelMyAppt();

  const statusParam = useMemo(() => {
    return activeTab === 'upcoming'
      ? 'confirmed,pending,in_progress'
      : 'completed,cancelled,refunded';
  }, [activeTab]);

  const {
    data: allAppointmentData,
    isFetching: allAppointmentIsPending,
    isError: allAppointmentIsError,
    error: allAppointmentError,
    refetch: appointmentRefetch,
  } = useMyAppointments({
    status: statusParam,
    limit: 100,
    page: 1,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await appointmentRefetch();
    setRefreshing(false);
  }, [appointmentRefetch]);

  const handleCancelAppt = (apt: IMyAppointmentDoc) => {
    if (!apt?.id) return showErrorToast(t('appointments.noApptId'));
    const docName = apt.doctorInfo?.name || t('appointments.doctorDefault');
    const formattedDocName = docName.startsWith('Dr.') ? docName : `Dr. ${docName}`;
    const formattedDate = formatDate(apt.appointment_date) || t('appointments.scheduledDate');
    const formattedTime = _formatTime(apt?.start_time);
    const timeText = formattedTime ? ` at ${formattedTime}` : '';

    showConfirm({
      title: t('appointments.cancelAppointmentTitle'),
      message: t('appointments.cancelAppointmentConfirm', {
        doctorName: formattedDocName,
        date: formattedDate,
        time: timeText,
      }),
      buttonText: t('appointments.yesCancel'),
      cancelText: t('appointments.noKeep'),
      onConfirm: () => {
        showLoader(t('appointments.cancellingAppointment'));
        const payload = {
          appointment_id: String(apt.id),
          call_end_reason: 'Cancelled by patient',
        };
        cancelAppt(payload, {
          onSuccess: async res => {
            if (res?.success) {
              showSuccessToast(res?.message || t('appointments.appointmentCancelledSuccess'));
              await appointmentRefetch();
              hideLoader();
            } else {
              hideLoader();
            }
          },
          onSettled: () => {
            hideLoader();
          },
        });
      },
    });
  };

  return (
    <SafeAreaWrapper
      style={appointmentsStyles.root}
      showBottomBar={true}
      activeBottomTab="Schedule"
      isPathClear={true}
    >
      <Header title={t('appointments.title')} subTitle={t('appointments.subTitle')} />
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
                  {key === 'upcoming' ? t('appointments.upcoming') : t('appointments.completed')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      {allAppointmentIsPending ? (
        <AppointmentsSkeleton />
      ) : allAppointmentIsError ? (
        <CommonErrorCard
          title={t('appointments.unableToLoadAppointments')}
          message={
            (allAppointmentError as any)?.response?.data?.message ||
            allAppointmentError?.message ||
            t('appointments.errorLoadingAppointments')
          }
          onRetry={appointmentRefetch}
        />
      ) : (
        <FlatList
          data={allAppointmentData?.data || []}
          keyExtractor={item => String(item.id || item.appointment_id)}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item: apt }) => (
            <AppointmentCard
              apptId={apt?.appointment_id || ''}
              apptStatus={apt?.appointment_status || ''}
              clinicAddress={apt.clinicInfo?.fulladdress || ''}
              clinicName={apt.clinicInfo?.name || ''}
              date={formatDate(apt.appointment_date)}
              docImage={apt.doctorInfo?.profileImage}
              doctorName={apt.doctorInfo?.name || ''}
              duration={getDuration(apt?.start_time, apt?.end_time) || ''}
              mode={apt?.consultation_type || ''}
              time={_formatTime(apt?.start_time) || ''}
              onCancelPress={() => handleCancelAppt(apt)}
              onJoinVideo={() =>
                handleJoinVideoCall({
                  id: apt.id,
                  appointment_id: apt.appointment_id,
                  patient_id: apt.patient_id,
                  meeting_id: apt.meeting_id,
                  call_duration_seconds: apt.call_duration_seconds,
                  start_time: apt.start_time,
                  end_time: apt.end_time,
                  doctorName: apt.doctorInfo?.name,
                  patientAlphanumericId: apt.patientInfo?.patientId,
                })
              }
              onReschedule={() =>
                showInfoToast(
                  t('appointments.rescheduleUnavailable'),
                  t('appointments.underDevelopment')
                )
              }
              onOpenDirections={() =>
                openLocationOnMap({
                  address: apt.clinicInfo?.fulladdress,
                  lat: apt.clinicInfo?.location?.lat,
                  long: apt.clinicInfo?.location?.lng,
                })
              }
              onView={() =>
                navigation.navigate(AppRoute.APPOINTMENT_DETAILS, {
                  appointmentId: apt.id,
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
                  ? t('appointments.noUpcomingTitle')
                  : t('appointments.noCompletedTitle')}
              </Text>
              <Text style={appointmentsStyles.emptyB}>
                {activeTab === 'upcoming'
                  ? t('appointments.noUpcomingSubtitle')
                  : t('appointments.noCompletedSubtitle')}
              </Text>
            </View>
          }
          ListFooterComponent={
            <BookNewSessionCard onPress={() => rootNav.navigate('DoctorSearch')} />
          }
          contentContainerStyle={[appointmentsStyles.scrollContent, { paddingBottom: 120 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </SafeAreaWrapper>
  );
};

export default AppointmentsScreen;
