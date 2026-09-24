import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import CommonErrorCard from '../../components/commons/CommonErrorCard/CommonErrorCard';
import { AppointmentCard, BookNewSessionCard } from '../../components/Modules/Appointments';
import { queryClient } from '../../components/providers/ReactQueryProvider';
import AppointmentsSkeleton from '../../components/Skeletons/AppointmentsSkeleton';
import { CalendarIcon } from '../../components/ui/icons';
import useDevicePermissions from '../../hooks/commons/useDevicePermissions';
import { getApptToken } from '../../hooks/react-query/appointments/appointments.funcs';
import {
  useCancelMyAppt,
  useMyAppointments,
} from '../../hooks/react-query/appointments/appointments.hooks';
import { AppointmemntQueryKey } from '../../hooks/react-query/query.keys';
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
import { useMeetingStore } from '../../zustand/stores/useMeetingStore';

export const AppointmentsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const rootNav = navigation.getParent() || navigation;

  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [refreshing, setRefreshing] = useState(false);
  const { setMeetingSession } = useMeetingStore(state => state);
  const { showLoader, hideLoader } = useLoadingStore(state => state);
  const showConfirm = useAlertStore(state => state.showConfirm);
  const { requestAudioVideoPermissions } = useDevicePermissions();
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

  const handleJoinVideoCall = useCallback(
    async (appointment: IMyAppointmentDoc) => {
      if (!appointment) return;

      const storeState = useMeetingStore.getState();
      const isCallActive =
        (storeState.callState === 'CONNECTED' || storeState.callState === 'CONNECTING') &&
        Boolean(storeState.token && storeState.meetingId);

      const isCurrentAppt =
        isCallActive &&
        (String(storeState.appointmentId) === String(appointment.id) ||
          (Boolean(appointment.appointment_id) &&
            storeState.appointmentGeneratedId === appointment.appointment_id));

      if (isCurrentAppt) {
        storeState.setIsInAppPip(false);
        navigation.navigate(AppRoute.MEETING);
        return;
      }

      if (isCallActive) {
        showInfoToast(t('appointments.activeCallToast'), t('appointments.activeCallOngoing'));
        return;
      }

      const hasPermissions = await requestAudioVideoPermissions();
      if (!hasPermissions) {
        showErrorToast(t('appointments.permissionsRequired'));
        return;
      }

      const apptId = appointment.id;
      let token: string | undefined;
      let meetingId: string | undefined = appointment.meeting_id;
      let call_duration_seconds: number | undefined = appointment.call_duration_seconds;
      if (!apptId) {
        showErrorToast(t('appointments.noApptId'));
        return;
      }
      if (!appointment?.patient_id) return showErrorToast(t('appointments.noPatientId'));

      try {
        const tokenResponse = await queryClient.fetchQuery({
          queryKey: [AppointmemntQueryKey.ALL_APPOINTMENTS, 'token', apptId],
          queryFn: () => getApptToken(apptId),
        });
        token = tokenResponse?.data?.token || '';
        meetingId = tokenResponse?.data?.meeting_id || '';
      } catch (error) {
        console.error('Failed to fetch fresh appointment token:', error);
      }

      if (!token || !meetingId) {
        return showErrorToast(t('appointments.failedMeetingCredentials'));
      }

      const cleanedToken = token?.trim().replace(/^["']|["']$/g, '');
      const cleanedMeetingId = meetingId?.trim().replace(/^["']|["']$/g, '');

      if (!cleanedToken || !cleanedMeetingId) {
        showErrorToast(t('appointments.invalidMeetingCredentials'));
        return;
      }

      const docName = appointment.doctorInfo?.name || t('appointments.doctorDefault');
      const docDisplayName = docName.startsWith('Dr.') ? docName : `Dr. ${docName}`;

      setMeetingSession({
        token: cleanedToken,
        meetingId: cleanedMeetingId,
        appointmentId: apptId,
        patientName: docDisplayName,
        patientAlphanumericId: appointment.patientInfo?.patientId,
        appointmentGeneratedId: appointment.appointment_id,
        startTime: appointment.start_time,
        endTime: appointment.end_time,
        callDurationSeconds: call_duration_seconds ?? 0,
        patientUserId: String(appointment?.patient_id),
      });

      navigation.navigate(AppRoute.MEETING);
    },
    [navigation, queryClient, setMeetingSession, requestAudioVideoPermissions, t]
  );

  const handleCancelAppt = (apt: IMyAppointmentDoc) => {
    if (!apt?.id) return;
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
          onError: () => {
            hideLoader();
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
              onCancelPress={() => handleCancelAppt(apt)}
              onJoinVideo={() => handleJoinVideoCall(apt)}
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
