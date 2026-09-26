import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import CommonErrorCard from '../../components/commons/CommonErrorCard/CommonErrorCard';

import AppointmentDetailsSkeleton from '../../components/Skeletons/AppointmentDetailsSkeleton';
import AppHeader from '../../components/ui/AppHeader';
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
} from '../../components/ui/icons';
import useJoinVideoCall from '../../hooks/commons/useJoinVideoCall';
import { useGetApptInfo } from '../../hooks/react-query/appointments/appointments.hooks';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import {
  _formatTime,
  capitalize,
  formatDate,
  getDuration,
  getInitials,
  openLocationOnMap,
} from '../../lib/common/common.utils';

import { AppRoute } from '../../route';
import { appointmentDetailsStyles as styles } from '../../styled/AppointmentDetailsScreen.styled';
import { theme } from '../../styled/theme.styled';
import useIncomingCallStore from '../../zustand/stores/useIncomingCallStore';

export const AppointmentDetailsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const apptId = route.params?.appointmentId;
  const isComingFromNotification = route.params?.isComingFromNotification;
  const [refreshing, setRefreshing] = useState(false);
  const { hideCallBanner } = useIncomingCallStore(state => state);
  const { handleJoinVideoCall } = useJoinVideoCall();

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
      status === 'in_progress' ||
      status === 'confirmed' ||
      (status === 'in-progress' && consultationType === 'video')
    ) {
      return true;
    }
    return false;
  }, [apptInfo?.appointment_status]);

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
    <SafeAreaWrapper style={styles.container} showBottomBar isPathClear>
      <AppHeader title="Appointment Details" showBack />
      {apptInfoIsPending ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <AppointmentDetailsSkeleton />
        </ScrollView>
      ) : apptInfoIsError ? (
        <View style={{ flex: 1, padding: 16 }}>
          <CommonErrorCard
            title="Unable to Load Appointment"
            message="Failed to retrieve appointment details. Please try again."
            onRetry={refetchApptInfo}
          />
        </View>
      ) : !apptInfo ? (
        <View style={{ flex: 1, padding: 16 }}>
          <CommonErrorCard
            title="Appointment Not Found"
            message="No details found for this appointment ID."
            onRetry={refetchApptInfo}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
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
          <View style={styles.statusBanner}>
            <View style={styles.statusTopRow}>
              <View style={styles.apptIdContainer}>
                <Text style={styles.apptIdLabel}>Ref ID:</Text>
                <Text style={styles.apptIdValue}>
                  {apptInfo.appointment_id || `#${apptInfo.id}`}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                <View style={[styles.statusDot, { backgroundColor: statusConfig.dot }]} />
                <Text style={[styles.statusBadgeText, { color: statusConfig.text }]}>
                  {statusConfig.label}
                </Text>
              </View>
            </View>

            <View style={styles.statusDivider} />

            <View style={styles.statusInfoRow}>
              <Text style={styles.statusInfoText}>
                Booked on:{' '}
                <Text style={styles.statusInfoBold}>
                  {formatDate(apptInfo.created_at, 'DD MMM YYYY')}
                </Text>
              </Text>
              <Text style={styles.statusInfoText}>
                Type:{' '}
                <Text style={styles.statusInfoBold}>
                  {apptInfo.consultation_type === 'video' ? 'Video Call' : 'In-Clinic Visit'}
                </Text>
              </Text>
            </View>
            {isVideoBtnShow && (
              <TouchableOpacity
                style={[styles.actionCtaButton, styles.actionCtaVideo]}
                activeOpacity={0.75}
                onPress={() => {
                  handleJoinVideoCall({
                    id: apptInfo?.id || '',
                    appointment_id: apptInfo?.appointment_id || '',
                    patient_id: apptInfo?.patient?.user_id || '',
                    start_time: apptInfo?.start_time || '',
                    end_time: apptInfo?.end_time || '',
                    doctorName: apptInfo?.doctor?.name || '',
                    patientAlphanumericId: apptInfo?.patient?.patient_id,
                  });
                }}
              >
                <VideoIcon size={18} color={theme.colors.textInverted} />
                <Text style={styles.actionCtaText}>Join Video Call</Text>
              </TouchableOpacity>
            )}
          </View>
          {apptInfo.doctor && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <StethoscopeIcon size={18} color={theme.colors.primary} />
                  <Text style={styles.cardTitle}>Doctor Information</Text>
                </View>
                <TouchableOpacity onPress={handleNavigateToDoctor} activeOpacity={0.7}>
                  <Text style={styles.cardHeaderLink}>View Profile</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.doctorProfileRow}>
                <View style={styles.doctorAvatarWrap}>
                  <View style={styles.doctorAvatar}>
                    {apptInfo.doctor.profile_image ? (
                      <Image
                        source={{ uri: apptInfo.doctor.profile_image }}
                        style={styles.doctorAvatarImage}
                      />
                    ) : (
                      <Text style={styles.doctorInitials}>
                        {getInitials(apptInfo.doctor.name || 'Doctor')}
                      </Text>
                    )}
                  </View>
                  <View style={styles.verifiedBadge}>
                    <CheckBadgeIcon size={18} color={theme.colors.primary} />
                  </View>
                </View>

                <View style={styles.doctorDetails}>
                  <Text style={styles.doctorName}>Dr. {apptInfo?.doctor?.name || ''}</Text>
                  <Text style={styles.doctorSpecialty} numberOfLines={2}>
                    {apptInfo.doctor.specialization || apptInfo.specialization || '-'}
                  </Text>
                  {apptInfo.doctor.qualifications ? (
                    <Text style={styles.doctorClinic} numberOfLines={1}>
                      {apptInfo.doctor.qualifications}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.doctorStatsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {apptInfo.doctor.experience_years
                      ? `${apptInfo.doctor.experience_years} Yrs`
                      : '1+ Yrs'}
                  </Text>
                  <Text style={styles.statLabel}>Experience</Text>
                </View>
                <View style={styles.statDividerVertical} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    ★ {apptInfo.doctor.rating ? Number(apptInfo.doctor.rating).toFixed(1) : '5.0'}
                  </Text>
                  <Text style={styles.statLabel}>{apptInfo.doctor.reviews_count || 0} Reviews</Text>
                </View>
                <View style={styles.statDividerVertical} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>Verified</Text>
                  <Text style={styles.statLabel}>Doctor</Text>
                </View>
              </View>
              {Array.isArray(apptInfo.doctor.languages_spoken) &&
              apptInfo.doctor.languages_spoken.length > 0 ? (
                <View style={styles.tagsContainer}>
                  {apptInfo.doctor.languages_spoken.map((lang, idx) => (
                    <View key={idx} style={styles.tagPill}>
                      <Text style={styles.tagPillText}>🗣 {lang}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          )}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <CalendarIcon size={18} color={theme.colors.primary} />
                <Text style={styles.cardTitle}>Schedule & Timing</Text>
              </View>
            </View>

            <View style={styles.gridContainer}>
              <View style={styles.detailRow}>
                <View style={styles.detailIconWrap}>
                  <ClockIcon size={18} color={theme.colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Slot Timing</Text>
                  <Text style={styles.detailValue}>
                    {_formatTime(apptInfo.start_time)} - {_formatTime(apptInfo.end_time)}
                  </Text>
                  <Text style={styles.detailSubValue}>
                    {formatDate(apptInfo.appointment_date, 'dddd, DD MMM YYYY')}
                    {apptInfo.slot_duration_minutes
                      ? ` (${apptInfo.slot_duration_minutes} Mins)`
                      : getDuration(apptInfo.start_time, apptInfo.end_time)
                      ? ` (${getDuration(apptInfo.start_time, apptInfo.end_time)})`
                      : ''}
                  </Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailIconWrap}>
                  {apptInfo.consultation_type === 'video' ? (
                    <VideoIcon size={18} color={theme.colors.primary} />
                  ) : (
                    <ClinicIcon size={18} color={theme.colors.primary} />
                  )}
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>
                    {apptInfo.consultation_type === 'video'
                      ? 'Consultation Channel'
                      : 'Hospital / Clinic'}
                  </Text>
                  <Text style={styles.detailValue}>
                    {apptInfo.consultation_type === 'video'
                      ? 'Online Video Consultation'
                      : apptInfo.clinic?.name || 'In-Person Consultation'}
                  </Text>
                  {apptInfo.clinic?.full_address || apptInfo.clinic?.line1 ? (
                    <Text style={styles.detailSubValue}>
                      {apptInfo.clinic.full_address ||
                        `${apptInfo.clinic.line1}, ${apptInfo.clinic.city || ''} ${
                          apptInfo.clinic.state || ''
                        }`}
                    </Text>
                  ) : null}

                  {apptInfo.clinic?.location?.lat && apptInfo.clinic?.location?.lng ? (
                    <TouchableOpacity
                      style={styles.mapActionBtn}
                      onPress={handleOpenClinicMap}
                      activeOpacity={0.7}
                    >
                      <MapPinIcon size={14} color={theme.colors.primaryDark} />
                      <Text style={styles.mapActionBtnText}>View on Google Maps</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            </View>
          </View>
          {apptInfo.patient && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <ProfileIcon size={18} color={theme.colors.primary} />
                  <Text style={styles.cardTitle}>Patient Details</Text>
                </View>
              </View>

              <View style={styles.patientInfoGrid}>
                <View style={styles.patientInfoRow}>
                  <Text style={styles.patientInfoLabel}>Patient Name</Text>
                  <Text style={styles.patientInfoVal}>{apptInfo.patient.name}</Text>
                </View>

                {apptInfo.patient.patient_id ? (
                  <View style={styles.patientInfoRow}>
                    <Text style={styles.patientInfoLabel}>Patient ID</Text>
                    <Text style={styles.patientInfoVal}>{apptInfo.patient.patient_id}</Text>
                  </View>
                ) : null}

                <View style={styles.patientInfoRow}>
                  <Text style={styles.patientInfoLabel}>Gender & Age</Text>
                  <Text style={styles.patientInfoVal}>
                    {capitalize(apptInfo.patient.gender || '')}
                    {apptInfo.patient.age ? `, ${apptInfo.patient.age} Yrs` : ''}
                  </Text>
                </View>

                {apptInfo.patient.date_of_birth ? (
                  <View style={styles.patientInfoRow}>
                    <Text style={styles.patientInfoLabel}>Date of Birth</Text>
                    <Text style={styles.patientInfoVal}>
                      {formatDate(apptInfo.patient.date_of_birth, 'DD MMM YYYY')}
                    </Text>
                  </View>
                ) : null}

                {apptInfo.patient.phone_number ? (
                  <View style={styles.patientInfoRow}>
                    <Text style={styles.patientInfoLabel}>Phone</Text>
                    <Text style={styles.patientInfoVal}>{apptInfo.patient.phone_number}</Text>
                  </View>
                ) : null}

                {apptInfo.patient.email ? (
                  <View style={styles.patientInfoRow}>
                    <Text style={styles.patientInfoLabel}>Email</Text>
                    <Text style={styles.patientInfoVal}>{apptInfo.patient.email}</Text>
                  </View>
                ) : null}

                {apptInfo.patient.city || apptInfo.patient.address ? (
                  <View style={[styles.patientInfoRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.patientInfoLabel}>Address</Text>
                    <Text style={styles.patientInfoVal}>
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
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <InfoCircleIcon size={18} color={theme.colors.primary} />
                  <Text style={styles.cardTitle}>Clinical Notes & Reason</Text>
                </View>
              </View>

              <View style={{ gap: 12 }}>
                {apptInfo.reason ? (
                  <View>
                    <Text style={styles.detailLabel}>Reason for Consultation</Text>
                    <Text style={[styles.detailValue, { marginTop: 4, fontWeight: '500' }]}>
                      {typeof apptInfo.reason === 'string'
                        ? apptInfo.reason
                        : JSON.stringify(apptInfo.reason)}
                    </Text>
                  </View>
                ) : null}

                {apptInfo.doctor_note ? (
                  <View style={styles.noteBox}>
                    <View style={styles.noteHeader}>
                      <InfoCircleIcon size={16} color={theme.colors.primary} />
                      <Text style={styles.noteTitle}>Doctor's Note</Text>
                    </View>
                    <Text style={styles.noteText}>
                      {typeof apptInfo.doctor_note === 'string'
                        ? apptInfo.doctor_note
                        : JSON.stringify(apptInfo.doctor_note)}
                    </Text>
                  </View>
                ) : null}

                {apptInfo.symptoms ? (
                  <View style={styles.noteBox}>
                    <View style={styles.noteHeader}>
                      <InfoCircleIcon size={16} color={theme.colors.primary} />
                      <Text style={styles.noteTitle}>Symptoms Reported</Text>
                    </View>
                    <Text style={styles.noteText}>
                      {typeof apptInfo.symptoms === 'string'
                        ? apptInfo.symptoms
                        : JSON.stringify(apptInfo.symptoms)}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          ) : null}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <InvoiceIcon size={18} color={theme.colors.primary} />
                <Text style={styles.cardTitle}>Payment Summary</Text>
              </View>
            </View>

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Consultation Fee</Text>
              <Text style={styles.billValue}>
                ₹{Number(apptInfo.appointment_fee || 0).toFixed(2)}
              </Text>
            </View>

            {apptInfo.fee_type ? (
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Fee Type</Text>
                <Text style={styles.billValue}>
                  {apptInfo.fee_type.replace(/_/g, ' ').toUpperCase()}
                </Text>
              </View>
            ) : null}

            <View style={styles.billTotalRow}>
              <Text style={styles.billTotalLabel}>Total Amount</Text>
              <Text style={styles.billTotalValue}>
                ₹{Number(apptInfo.appointment_fee || 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.paymentBadgeRow}>
              <View>
                <Text style={styles.paymentBadgeLabel}>
                  Payment Mode: {capitalize(apptInfo.payment_type || 'Cash')}
                </Text>
                {apptInfo.transaction_id ? (
                  <Text style={[styles.paymentBadgeLabel, { fontSize: 11, marginTop: 2 }]}>
                    Txn ID: {apptInfo.transaction_id}
                  </Text>
                ) : null}
              </View>

              <View
                style={[styles.paymentStatusBadge, { backgroundColor: paymentStatusConfig.bg }]}
              >
                <Text style={[styles.paymentStatusText, { color: paymentStatusConfig.text }]}>
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
