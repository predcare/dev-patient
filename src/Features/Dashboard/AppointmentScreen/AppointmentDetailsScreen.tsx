import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import CommonErrorCard from '../../../components/commons/CommonErrorCard/CommonErrorCard';
import {
  CalendarIcon,
  CheckBadgeIcon,
  ClinicIcon,
  ClockIcon,
  InfoCircleIcon,
  InvoiceIcon,
  MapPinIcon,
  ProfileIcon,
  StethoscopeIcon,
  VideoIcon,
} from '../../../components/ui/icons';
import useMeetingPermissions from '../../../hooks/commons/meeting/useMeetingPermissions';
import useMeetingPip from '../../../hooks/commons/meeting/useMeetingPip';
import {
  useGetApptInfo,
  useGetToken,
} from '../../../hooks/react-query/appointments/appointments.hooks';
import Header from '../../../Layout/Header';
import SafeAreaWrapper from '../../../Layout/SafeAreaWrapper';
import {
  _formatTime,
  capitalize,
  formatDate,
  getDuration,
  getInitials,
  openLocationOnMap,
} from '../../../lib/common/common.utils';
import { showErrorToast } from '../../../lib/common/toast.utils';
import { replace } from '../../../navigation/navigationRef';
import { AppRoute } from '../../../route';
import { appointmentDetailsStyles } from '../../../styled/AppointmentDetailsScreen.styled';
import theme from '../../../styled/theme.styled';
import { useLoadingStore } from '../../../zustand/stores/useLoadingStore';
import { useMeetingStore } from '../../../zustand/stores/useMeetingStore';
import AppointmentDetailsSkeleton from './Skeletons/AppointmentDetailsSkeleton';

export const AppointmentDetailsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const apptId = route.params?.appointmentId;
  const [refreshing, setRefreshing] = useState(false);
  const { restoreToMeeting } = useMeetingPip();
  const { requestPermissions } = useMeetingPermissions();
  const { mutate: getToken } = useGetToken();
  const showLoader = useLoadingStore(state => state.showLoader);
  const hideLoader = useLoadingStore(state => state.hideLoader);
  const setCallInfo = useMeetingStore(state => state.setCallInfo);
  const activeMeetingId = useMeetingStore(state => state.callInfo?.meetingId);
  const activeCallAppointmentId = useMeetingStore(state => state.callInfo?.appointment?.id);

  const {
    data: apptInfo,
    isFetching: apptInfoIsPending,
    isError: apptInfoIsError,
    refetch: refetchApptInfo,
  } = useGetApptInfo(apptId);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchApptInfo();
    setRefreshing(false);
  }, [refetchApptInfo]);

  const statusConfig = useMemo(() => {
    const rawStatus = (apptInfo?.appointment_status || '').toLowerCase().replace(/[-_\s]+/g, '_');
    switch (rawStatus) {
      case 'confirmed':
      case 'booked':
        return {
          bg: theme.colors.successLight,
          dot: theme.colors.success,
          text: theme.colors.success,
          label: 'Confirmed',
        };
      case 'in_progress':
        return {
          bg: theme.colors.infoLight,
          dot: theme.colors.info,
          text: theme.colors.info,
          label: 'In Progress',
        };
      case 'completed':
        return {
          bg: theme.colors.mintBg,
          dot: theme.colors.primary,
          text: theme.colors.primaryDark,
          label: 'Completed',
        };
      case 'cancelled':
        return {
          bg: theme.colors.dangerSoft,
          dot: theme.colors.danger,
          text: theme.colors.danger,
          label: 'Cancelled',
        };
      case 'pending':
        return {
          bg: theme.colors.warningLight,
          dot: theme.colors.warning,
          text: theme.colors.warning,
          label: 'Pending',
        };
      default:
        return {
          bg: theme.colors.surfaceSecondary,
          dot: theme.colors.textMuted,
          text: theme.colors.textSecondary,
          label: apptInfo?.appointment_status || 'Scheduled',
        };
    }
  }, [apptInfo?.appointment_status]);

  const paymentStatusConfig = useMemo(() => {
    const rawPayStatus = (apptInfo?.payment_status || '').toLowerCase();
    if (rawPayStatus === 'paid' || rawPayStatus === 'completed' || rawPayStatus === 'success') {
      return {
        bg: theme.colors.successLight,
        text: theme.colors.success,
        label: 'Paid',
      };
    }
    if (rawPayStatus === 'refunded') {
      return {
        bg: theme.colors.warningLight,
        text: theme.colors.warning,
        label: 'Refunded',
      };
    }
    return {
      bg: theme.colors.warningLight,
      text: theme.colors.warning,
      label: capitalize(apptInfo?.payment_status || 'Pending'),
    };
  }, [apptInfo?.payment_status]);

  const isVideoBtnShow = useMemo(() => {
    const status = apptInfo?.appointment_status?.toLowerCase();
    const consultationType = apptInfo?.consultation_type?.toLowerCase();
    if (
      (status === 'in_progress' ||
        status === 'confirmed' ||
        status === 'in-progress') && consultationType === 'video'
    ) {
      return true;
    }
    return false;
  }, [apptInfo?.appointment_status, apptInfo?.consultation_type]);

  console.log('apptInfo', apptInfo);

  const isCurrentCallActive = Boolean(
    activeMeetingId && String(activeCallAppointmentId) === String(apptInfo?.id || apptId)
  );

  const videoButtonLabel = useMemo(() => {
    if (isCurrentCallActive) {
      return t('appointments.returnToCall') || 'Return to Call';
    }
    const s = String(apptInfo?.appointment_status || '')
      .toLowerCase()
      .trim();
    if (s === 'in_progress' || s === 'in-progress') {
      return t('appointments.rejoin') || 'Re-Join';
    }
    return t('appointments.joinVideoCall') || 'Join Video Call';
  }, [isCurrentCallActive, apptInfo?.appointment_status, t]);

  const handleJoinVideoCall = async () => {
    const targetId = apptInfo?.id || apptId;
    if (!targetId) return;

    if (activeMeetingId && String(activeCallAppointmentId) === String(targetId)) {
      restoreToMeeting();
      return;
    }

    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      showErrorToast(
        'Camera and microphone permissions are required to join the video consultation.'
      );
      return;
    }

    showLoader('Joining Video Call...');
    getToken(
      {
        appointmentId: String(targetId),
      },
      {
        onSuccess: async res => {
          const videoCallData = res?.data;
          if (videoCallData && res?.success) {
            setCallInfo({
              token: videoCallData?.token,
              meeting_id: videoCallData?.meeting_id,
              appointment: videoCallData?.appointment,
              doctorInfo: {
                name: videoCallData?.doctor?.name,
                doctorId: videoCallData?.doctor?.id,
              },
            });
            navigation.navigate(AppRoute.MEETING);
          }
        },
        onSettled: () => {
          hideLoader();
        },
      }
    );
  };

  const handleOpenClinicMap = () => {
    if (!apptInfo?.clinic) return;
    openLocationOnMap({
      address: apptInfo.clinic.full_address || apptInfo.clinic.line1,
      lat: apptInfo.clinic.location?.lat,
      long: apptInfo.clinic.location?.lng,
    });
  };

  const handleNavigateToDoctor = () => {
    if (apptInfo?.doctor?.user_id) {
      navigation.navigate(AppRoute.DOCTOR_DETAILS, {
        doctorId: Number(apptInfo?.doctor?.user_id),
      });
    }
  };

  return (
    <SafeAreaWrapper
      showBottomBar={true}
      activeBottomTab="Schedule"
      header={
        <Header
          isBackBtn={true}
          title="Appointment Details"
          onBackPress={() => replace(AppRoute.SCHEDULE)}
          isLang={false}
        />
      }
    >
      {apptInfoIsPending ? (
        <ScrollView
          contentContainerStyle={appointmentDetailsStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <AppointmentDetailsSkeleton />
        </ScrollView>
      ) : apptInfoIsError ? (
        <View style={appointmentDetailsStyles.centeredState}>
          <CommonErrorCard
            title="Unable to Load Appointment"
            message="Failed to retrieve appointment details. Please try again."
            onRetry={refetchApptInfo}
          />
        </View>
      ) : !apptInfo ? (
        <View style={appointmentDetailsStyles.centeredState}>
          <CommonErrorCard
            title="Appointment Not Found"
            message="No details found for this appointment ID."
            onRetry={refetchApptInfo}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={appointmentDetailsStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        >
          <View style={appointmentDetailsStyles.statusBanner}>
            <View style={appointmentDetailsStyles.statusTopRow}>
              <View style={appointmentDetailsStyles.apptIdContainer}>
                <Text style={appointmentDetailsStyles.apptIdLabel}>Ref ID:</Text>
                <Text style={appointmentDetailsStyles.apptIdValue}>
                  {apptInfo.appointment_id || `#${apptInfo.id}`}
                </Text>
              </View>
              <View
                style={[appointmentDetailsStyles.statusBadge, { backgroundColor: statusConfig.bg }]}
              >
                <View
                  style={[
                    appointmentDetailsStyles.statusDot,
                    { backgroundColor: statusConfig.dot },
                  ]}
                />
                <Text
                  style={[appointmentDetailsStyles.statusBadgeText, { color: statusConfig.text }]}
                >
                  {statusConfig.label}
                </Text>
              </View>
            </View>
            <View style={appointmentDetailsStyles.statusDivider} />

            <View style={appointmentDetailsStyles.statusInfoRow}>
              <Text style={appointmentDetailsStyles.statusInfoText}>
                Booked on:{' '}
                <Text style={appointmentDetailsStyles.statusInfoBold}>
                  {formatDate(apptInfo.created_at, 'DD MMM YYYY')}
                </Text>
              </Text>
              <Text style={appointmentDetailsStyles.statusInfoText}>
                Type:{' '}
                <Text style={appointmentDetailsStyles.statusInfoBold}>
                  {apptInfo.consultation_type === 'video' ? 'Video Call' : 'In-Clinic Visit'}
                </Text>
              </Text>
            </View>
            {isVideoBtnShow && (
              <TouchableOpacity
                style={[
                  appointmentDetailsStyles.actionCtaButton,
                  appointmentDetailsStyles.actionCtaVideo,
                ]}
                activeOpacity={0.75}
                onPress={handleJoinVideoCall}
              >
                <VideoIcon size={18} color={theme.colors.textInverted} />
                <Text style={appointmentDetailsStyles.actionCtaText}>{videoButtonLabel}</Text>
              </TouchableOpacity>
            )}
          </View>
          {apptInfo.doctor && (
            <View style={appointmentDetailsStyles.card}>
              <View style={appointmentDetailsStyles.cardHeader}>
                <View style={appointmentDetailsStyles.cardTitleRow}>
                  <StethoscopeIcon size={18} color={theme.colors.primary} />
                  <Text style={appointmentDetailsStyles.cardTitle}>Doctor Information</Text>
                </View>
                <TouchableOpacity onPress={handleNavigateToDoctor} activeOpacity={0.7}>
                  <Text style={appointmentDetailsStyles.cardHeaderLink}>View Profile</Text>
                </TouchableOpacity>
              </View>

              <View style={appointmentDetailsStyles.doctorProfileRow}>
                <View style={appointmentDetailsStyles.doctorAvatarWrap}>
                  <View style={appointmentDetailsStyles.doctorAvatar}>
                    {apptInfo.doctor.profile_image ? (
                      <Image
                        source={{ uri: apptInfo.doctor.profile_image }}
                        style={appointmentDetailsStyles.doctorAvatarImage}
                      />
                    ) : (
                      <Text style={appointmentDetailsStyles.doctorInitials}>
                        {getInitials(apptInfo.doctor.name || 'Doctor')}
                      </Text>
                    )}
                  </View>
                  <View style={appointmentDetailsStyles.verifiedBadge}>
                    <CheckBadgeIcon size={18} color={theme.colors.primary} />
                  </View>
                </View>

                <View style={appointmentDetailsStyles.doctorDetails}>
                  <Text style={appointmentDetailsStyles.doctorName}>
                    Dr. {apptInfo?.doctor?.name || ''}
                  </Text>
                  <Text style={appointmentDetailsStyles.doctorSpecialty} numberOfLines={2}>
                    {apptInfo.doctor.specialization || apptInfo.specialization || '-'}
                  </Text>
                  {apptInfo.doctor.qualifications ? (
                    <Text style={appointmentDetailsStyles.doctorClinic} numberOfLines={1}>
                      {apptInfo.doctor.qualifications}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={appointmentDetailsStyles.doctorStatsRow}>
                <View style={appointmentDetailsStyles.statItem}>
                  <Text style={appointmentDetailsStyles.statValue}>
                    {apptInfo.doctor.experience_years
                      ? `${apptInfo.doctor.experience_years} Yrs`
                      : '-'}
                  </Text>
                  <Text style={appointmentDetailsStyles.statLabel}>Experience</Text>
                </View>
                <View style={appointmentDetailsStyles.statDividerVertical} />
                <View style={appointmentDetailsStyles.statItem}>
                  <Text style={appointmentDetailsStyles.statValue}>Verified</Text>
                  <Text style={appointmentDetailsStyles.statLabel}>Doctor</Text>
                </View>
              </View>
              {Array.isArray(apptInfo.doctor.languages_spoken) &&
                apptInfo.doctor.languages_spoken.length > 0 ? (
                <View style={appointmentDetailsStyles.tagsContainer}>
                  {apptInfo.doctor.languages_spoken.map((lang, idx) => (
                    <View key={idx} style={appointmentDetailsStyles.tagPill}>
                      <Text style={appointmentDetailsStyles.tagPillText}>🗣 {lang}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          )}
          <View style={appointmentDetailsStyles.card}>
            <View style={appointmentDetailsStyles.cardHeader}>
              <View style={appointmentDetailsStyles.cardTitleRow}>
                <CalendarIcon size={18} color={theme.colors.primary} />
                <Text style={appointmentDetailsStyles.cardTitle}>Schedule & Timing</Text>
              </View>
            </View>

            <View style={appointmentDetailsStyles.gridContainer}>
              <View style={appointmentDetailsStyles.detailRow}>
                <View style={appointmentDetailsStyles.detailIconWrap}>
                  <ClockIcon size={18} color={theme.colors.primary} />
                </View>
                <View style={appointmentDetailsStyles.detailContent}>
                  <Text style={appointmentDetailsStyles.detailLabel}>Slot Timing</Text>
                  <Text style={appointmentDetailsStyles.detailValue}>
                    {_formatTime(apptInfo.start_time)} - {_formatTime(apptInfo.end_time)}
                  </Text>
                  <Text style={appointmentDetailsStyles.detailSubValue}>
                    {formatDate(apptInfo.appointment_date, 'dddd, DD MMM YYYY')}
                    {apptInfo.slot_duration_minutes
                      ? ` (${apptInfo.slot_duration_minutes} Mins)`
                      : getDuration(apptInfo.start_time, apptInfo.end_time)
                        ? ` (${getDuration(apptInfo.start_time, apptInfo.end_time)})`
                        : ''}
                  </Text>
                </View>
              </View>
              <View style={appointmentDetailsStyles.detailRow}>
                <View style={appointmentDetailsStyles.detailIconWrap}>
                  {apptInfo.consultation_type === 'video' ? (
                    <VideoIcon size={18} color={theme.colors.primary} />
                  ) : (
                    <ClinicIcon size={18} color={theme.colors.primary} />
                  )}
                </View>
                <View style={appointmentDetailsStyles.detailContent}>
                  <Text style={appointmentDetailsStyles.detailLabel}>
                    {apptInfo.consultation_type === 'video'
                      ? 'Consultation Channel'
                      : 'Hospital / Clinic'}
                  </Text>
                  <Text style={appointmentDetailsStyles.detailValue}>
                    {apptInfo.consultation_type === 'video'
                      ? 'Online Video Consultation'
                      : apptInfo.clinic?.name || 'In-Person Consultation'}
                  </Text>
                  {apptInfo.clinic?.full_address || apptInfo.clinic?.line1 ? (
                    <Text style={appointmentDetailsStyles.detailSubValue}>
                      {apptInfo.clinic.full_address ||
                        `${apptInfo.clinic.line1}, ${apptInfo.clinic.city || ''} ${apptInfo.clinic.state || ''
                        }`}
                    </Text>
                  ) : null}

                  {apptInfo.clinic?.location?.lat && apptInfo.clinic?.location?.lng ? (
                    <TouchableOpacity
                      style={appointmentDetailsStyles.mapActionBtn}
                      onPress={handleOpenClinicMap}
                      activeOpacity={0.7}
                    >
                      <MapPinIcon size={14} color={theme.colors.primaryDark} />
                      <Text style={appointmentDetailsStyles.mapActionBtnText}>
                        View on Google Maps
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            </View>
          </View>
          {apptInfo.patient && (
            <View style={appointmentDetailsStyles.card}>
              <View style={appointmentDetailsStyles.cardHeader}>
                <View style={appointmentDetailsStyles.cardTitleRow}>
                  <ProfileIcon size={18} color={theme.colors.primary} />
                  <Text style={appointmentDetailsStyles.cardTitle}>Patient Details</Text>
                </View>
              </View>

              <View style={appointmentDetailsStyles.patientInfoGrid}>
                <View style={appointmentDetailsStyles.patientInfoRow}>
                  <Text style={appointmentDetailsStyles.patientInfoLabel}>Patient Name</Text>
                  <Text style={appointmentDetailsStyles.patientInfoVal}>
                    {apptInfo.patient.name}
                  </Text>
                </View>

                {apptInfo.patient.patient_id ? (
                  <View style={appointmentDetailsStyles.patientInfoRow}>
                    <Text style={appointmentDetailsStyles.patientInfoLabel}>Patient ID</Text>
                    <Text style={appointmentDetailsStyles.patientInfoVal}>
                      {apptInfo.patient.patient_id}
                    </Text>
                  </View>
                ) : null}

                <View style={appointmentDetailsStyles.patientInfoRow}>
                  <Text style={appointmentDetailsStyles.patientInfoLabel}>Gender & Age</Text>
                  <Text style={appointmentDetailsStyles.patientInfoVal}>
                    {capitalize(apptInfo.patient.gender || '')}
                    {apptInfo.patient.age ? `, ${apptInfo.patient.age} Yrs` : ''}
                  </Text>
                </View>

                {apptInfo.patient.date_of_birth ? (
                  <View style={appointmentDetailsStyles.patientInfoRow}>
                    <Text style={appointmentDetailsStyles.patientInfoLabel}>Date of Birth</Text>
                    <Text style={appointmentDetailsStyles.patientInfoVal}>
                      {formatDate(apptInfo.patient.date_of_birth, 'DD MMM YYYY')}
                    </Text>
                  </View>
                ) : null}

                {apptInfo.patient.phone_number ? (
                  <View style={appointmentDetailsStyles.patientInfoRow}>
                    <Text style={appointmentDetailsStyles.patientInfoLabel}>Phone</Text>
                    <Text style={appointmentDetailsStyles.patientInfoVal}>
                      {apptInfo.patient.phone_number}
                    </Text>
                  </View>
                ) : null}

                {apptInfo.patient.email ? (
                  <View style={appointmentDetailsStyles.patientInfoRow}>
                    <Text style={appointmentDetailsStyles.patientInfoLabel}>Email</Text>
                    <Text style={appointmentDetailsStyles.patientInfoVal}>
                      {apptInfo.patient.email}
                    </Text>
                  </View>
                ) : null}

                {apptInfo.patient.city || apptInfo.patient.address ? (
                  <View style={[appointmentDetailsStyles.patientInfoRow, { borderBottomWidth: 0 }]}>
                    <Text style={appointmentDetailsStyles.patientInfoLabel}>Address</Text>
                    <Text style={appointmentDetailsStyles.patientInfoVal}>
                      {[
                        apptInfo.patient.address,
                        apptInfo.patient.city,
                        apptInfo.patient.state,
                        apptInfo.patient.postal_code,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          )}
          {apptInfo.reason || apptInfo.doctor_note || apptInfo.symptoms || apptInfo.medications ? (
            <View style={appointmentDetailsStyles.card}>
              <View style={appointmentDetailsStyles.cardHeader}>
                <View style={appointmentDetailsStyles.cardTitleRow}>
                  <InfoCircleIcon size={18} color={theme.colors.primary} />
                  <Text style={appointmentDetailsStyles.cardTitle}>Clinical Notes & Reason</Text>
                </View>
              </View>

              <View style={appointmentDetailsStyles.notesStack}>
                {apptInfo.reason ? (
                  <View>
                    <Text style={appointmentDetailsStyles.detailLabel}>
                      Reason for Consultation
                    </Text>
                    <Text
                      style={[
                        appointmentDetailsStyles.detailValue,
                        { marginTop: 4, fontWeight: '400' },
                      ]}
                    >
                      {typeof apptInfo.reason === 'string'
                        ? apptInfo.reason
                        : JSON.stringify(apptInfo.reason)}
                    </Text>
                  </View>
                ) : null}

                {apptInfo.doctor_note ? (
                  <View style={appointmentDetailsStyles.noteBox}>
                    <View style={appointmentDetailsStyles.noteHeader}>
                      <InfoCircleIcon size={16} color={theme.colors.primary} />
                      <Text style={appointmentDetailsStyles.noteTitle}>Doctor's Note</Text>
                    </View>
                    <Text style={appointmentDetailsStyles.noteText}>
                      {typeof apptInfo.doctor_note === 'string'
                        ? apptInfo.doctor_note
                        : JSON.stringify(apptInfo.doctor_note)}
                    </Text>
                  </View>
                ) : null}

                {apptInfo.symptoms ? (
                  <View style={appointmentDetailsStyles.noteBox}>
                    <View style={appointmentDetailsStyles.noteHeader}>
                      <InfoCircleIcon size={16} color={theme.colors.primary} />
                      <Text style={appointmentDetailsStyles.noteTitle}>Symptoms Reported</Text>
                    </View>
                    <Text style={appointmentDetailsStyles.noteText}>
                      {typeof apptInfo.symptoms === 'string'
                        ? apptInfo.symptoms
                        : JSON.stringify(apptInfo.symptoms)}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          ) : null}
          <View style={appointmentDetailsStyles.card}>
            <View style={appointmentDetailsStyles.cardHeader}>
              <View style={appointmentDetailsStyles.cardTitleRow}>
                <InvoiceIcon size={18} color={theme.colors.primary} />
                <Text style={appointmentDetailsStyles.cardTitle}>Payment Summary</Text>
              </View>
            </View>

            <View style={appointmentDetailsStyles.billRow}>
              <Text style={appointmentDetailsStyles.billLabel}>Consultation Fee</Text>
              <Text style={appointmentDetailsStyles.billValue}>
                ₹{Number(apptInfo.appointment_fee || 0).toFixed(2)}
              </Text>
            </View>

            {apptInfo.fee_type ? (
              <View style={appointmentDetailsStyles.billRow}>
                <Text style={appointmentDetailsStyles.billLabel}>Fee Type</Text>
                <Text style={appointmentDetailsStyles.billValue}>
                  {apptInfo.fee_type.replace(/_/g, ' ').toUpperCase()}
                </Text>
              </View>
            ) : null}

            <View style={appointmentDetailsStyles.billTotalRow}>
              <Text style={appointmentDetailsStyles.billTotalLabel}>Total Amount</Text>
              <Text style={appointmentDetailsStyles.billTotalValue}>
                ₹{Number(apptInfo.appointment_fee || 0).toFixed(2)}
              </Text>
            </View>
            <View style={appointmentDetailsStyles.paymentBadgeRow}>
              <View>
                <Text style={appointmentDetailsStyles.paymentBadgeLabel}>
                  Payment Mode: {capitalize(apptInfo.payment_type || 'Cash')}
                </Text>
                {apptInfo.transaction_id ? (
                  <Text
                    style={[
                      appointmentDetailsStyles.paymentBadgeLabel,
                      { fontSize: 11, marginTop: 2 },
                    ]}
                  >
                    Txn ID: {apptInfo.transaction_id}
                  </Text>
                ) : null}
              </View>

              <View
                style={[
                  appointmentDetailsStyles.paymentStatusBadge,
                  { backgroundColor: paymentStatusConfig.bg },
                ]}
              >
                <Text
                  style={[
                    appointmentDetailsStyles.paymentStatusText,
                    { color: paymentStatusConfig.text },
                  ]}
                >
                  {paymentStatusConfig.label}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaWrapper>
  );
};

export default AppointmentDetailsScreen;
