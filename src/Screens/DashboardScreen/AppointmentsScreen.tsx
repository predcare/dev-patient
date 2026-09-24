import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
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
    limit: 10,
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
        showInfoToast(
          'You are currently in an active consultation. Please end that call first.',
          'Active Call Ongoing'
        );
        return;
      }

      const hasPermissions = await requestAudioVideoPermissions();
      if (!hasPermissions) {
        showErrorToast('Camera and Microphone permissions are required to join the consultation.');
        return;
      }

      const apptId = appointment.id;
      let token: string | undefined;
      let meetingId: string | undefined = appointment.meeting_id;
      let call_duration_seconds: number | undefined = appointment.call_duration_seconds;
      if (!apptId) {
        showErrorToast('No valid appointment ID found to fetch token');
        return;
      }
      if (!appointment?.patient_id)
        return showErrorToast('No valid patient ID found to fetch token');

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
        return showErrorToast('Failed to fetch meeting credentials');
      }

      const cleanedToken = token?.trim().replace(/^["']|["']$/g, '');
      const cleanedMeetingId = meetingId?.trim().replace(/^["']|["']$/g, '');

      if (!cleanedToken || !cleanedMeetingId) {
        showErrorToast('Meeting credentials missing or invalid');
        return;
      }

      const docName = appointment.doctorInfo?.name || 'Doctor';
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
    [navigation, queryClient, setMeetingSession, requestAudioVideoPermissions]
  );

  const handleCancelAppt = (apt: IMyAppointmentDoc) => {
    if (!apt?.id) return;
    const docName = apt.doctorInfo?.name || 'Doctor';
    const formattedDocName = docName.startsWith('Dr.') ? docName : `Dr. ${docName}`;
    const formattedDate = formatDate(apt.appointment_date) || 'scheduled date';
    const formattedTime = _formatTime(apt?.start_time);
    const timeText = formattedTime ? ` at ${formattedTime}` : '';

    showConfirm({
      title: 'Cancel Appointment',
      message: `Are you sure you want to cancel your appointment with ${formattedDocName} on ${formattedDate}${timeText}?`,
      buttonText: 'Yes, Cancel',
      cancelText: 'No, Keep',
      onConfirm: () => {
        showLoader('Cancelling appointment...');
        const payload = {
          appointment_id: String(apt.id),
          call_end_reason: 'Cancelled by patient',
        };
        cancelAppt(payload, {
          onSuccess: async res => {
            if (res?.success) {
              showSuccessToast(res?.message || 'Appointment cancelled successfully');
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
      <Header greeting="My Appointments" userName="Schedule & Visits" />
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
      {allAppointmentIsPending ? (
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
                  'Reschedule functionality will be available in the next update.',
                  'Under Development'
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
        />
      )}
    </SafeAreaWrapper>
  );
};

export default AppointmentsScreen;
