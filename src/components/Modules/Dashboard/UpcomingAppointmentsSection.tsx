import { useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import useDevicePermissions from '../../../hooks/commons/useDevicePermissions';
import { getApptToken } from '../../../hooks/react-query/appointments/appointments.funcs';
import { useMyAppointments } from '../../../hooks/react-query/appointments/appointments.hooks';
import { AppointmemntQueryKey } from '../../../hooks/react-query/query.keys';
import { _formatTime, formatDate } from '../../../lib/common/common.utils';
import { showErrorToast, showInfoToast } from '../../../lib/common/toast.utils';
import { AppRoute } from '../../../route';
import { theme } from '../../../styled/theme.styled';
import { IMyAppointmentDoc } from '../../../typescripts/interfaces/appointments.interfaces';
import { useMeetingStore } from '../../../zustand/stores/useMeetingStore';
import { queryClient } from '../../providers/ReactQueryProvider';
import {
  CalendarIcon,
  ChevronRightIcon,
  ClinicIcon,
  ClockIcon,
  StethoscopeIcon,
  VideoIcon,
} from '../../ui/icons';

export const UpcomingAppointmentsSection: React.FC = () => {
  const navigation = useNavigation();
  const { setMeetingSession } = useMeetingStore(state => state);
  const { requestAudioVideoPermissions } = useDevicePermissions();
  const { data: upcomingAppts, isFetching: upcomingAppointmentsIsPending } = useMyAppointments({
    status: 'pending,confirmed,in_progress',
    limit: 3,
    page: 1,
  });

  const handleSeeAll = () => {
    navigation.navigate(AppRoute.SCHEDULE);
  };

  const handleBookNow = () => {
    navigation.navigate(AppRoute.DOCTOR_SEARCH);
  };

  const handleClinicView = (address: string, location: { lat: number; lng: number }) => {
    navigation.navigate(AppRoute.SCHEDULE);
  };

  const totalCount = upcomingAppts?.data?.length || 0;

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

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>Upcoming Consultations</Text>
          {totalCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{totalCount}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={handleSeeAll}
          activeOpacity={0.7}
          style={styles.seeAllButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.seeAllText}>See All</Text>
          <ChevronRightIcon size={14} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      {upcomingAppointmentsIsPending && !upcomingAppts ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your upcoming consultations...</Text>
        </View>
      ) : totalCount === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconCircle}>
            <CalendarIcon size={28} color={theme.colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No Consultations Scheduled</Text>
          <Text style={styles.emptyText}>
            You do not have any upcoming doctor appointments booked right now.
          </Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={handleBookNow} activeOpacity={0.85}>
            <Text style={styles.emptyBtnText}>+ Book Consultation</Text>
          </TouchableOpacity>
        </View>
      ) : (
        upcomingAppts?.data?.map(item => {
          const isVideo = String(item.consultation_type || '')
            .toLowerCase()
            .includes('video');
          const docName = item.doctorInfo?.name || 'Doctor';
          const formattedDocName = docName.startsWith('Dr.') ? docName : `Dr. ${docName}`;
          const profileImage = item.doctorInfo?.profileImage;
          const specialty = item.specialization || 'General Consultation';
          const formattedTime = _formatTime(item?.start_time) || '10:00 AM';
          const formattedDate = formatDate(item?.appointment_date) || 'Today';

          return (
            <TouchableOpacity
              key={String(item.id || item.appointment_id)}
              style={styles.card}
              activeOpacity={0.92}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[styles.typePill, isVideo ? styles.typePillVideo : styles.typePillClinic]}
                >
                  {isVideo ? (
                    <VideoIcon size={13} color={theme.colors.primary} />
                  ) : (
                    <ClinicIcon size={13} color={theme.colors.accent} />
                  )}
                  <Text
                    style={[
                      styles.typePillText,
                      isVideo ? styles.typePillTextVideo : styles.typePillTextClinic,
                    ]}
                  >
                    {isVideo ? 'VIDEO CALL' : 'IN-PERSON'}
                  </Text>
                </View>

                {item.appointment_id && (
                  <View style={styles.idTag}>
                    <Text style={styles.idTagText}>ID: #{item.appointment_id}</Text>
                  </View>
                )}
              </View>
              <View style={styles.doctorInfoRow}>
                <View style={styles.avatarWrapper}>
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarInitials}>
                        {docName
                          .replace(/^Dr\.\s*/i, '')
                          .charAt(0)
                          .toUpperCase() || 'D'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.activeDot} />
                </View>

                <View style={styles.doctorDetails}>
                  <Text style={styles.doctorName} numberOfLines={1}>
                    {formattedDocName}
                  </Text>
                  <View style={styles.specialtyRow}>
                    <StethoscopeIcon size={12} color={theme.colors.textSlate} />
                    <Text style={styles.specialtyText} numberOfLines={1}>
                      {specialty}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.scheduleBar}>
                <View style={styles.scheduleItem}>
                  <CalendarIcon size={15} color={theme.colors.primary} />
                  <Text style={styles.scheduleItemText}>{formattedDate}</Text>
                </View>

                <View style={styles.scheduleDivider} />

                <View style={styles.scheduleItem}>
                  <ClockIcon size={15} color={theme.colors.primary} />
                  <Text style={styles.scheduleItemText}>{formattedTime}</Text>
                </View>
              </View>
              <View style={styles.cardFooter}>
                {!isVideo && (
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      isVideo ? styles.actionButtonVideo : styles.actionButtonClinic,
                    ]}
                    onPress={() =>
                      handleClinicView(item?.clinicInfo?.fulladdress, item?.clinicInfo?.location)
                    }
                    activeOpacity={0.85}
                  >
                    <ClinicIcon size={15} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Get Direction</Text>
                  </TouchableOpacity>
                )}
                {isVideo && (
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      isVideo ? styles.actionButtonVideo : styles.actionButtonClinic,
                    ]}
                    onPress={() => handleJoinVideoCall(item)}
                    activeOpacity={0.85}
                  >
                    <VideoIcon size={15} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>
                      {item?.appointment_status === 'in_progress' ? 'Re-Join' : 'Join Video'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
    marginBottom: 8,
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    letterSpacing: -0.2,
  },
  countBadge: {
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.mintBdr,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  loadingContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: theme.colors.textSlate,
    fontWeight: '500',
  },
  emptyCard: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    padding: 24,
    alignItems: 'center',
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.mintBdr,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: theme.colors.textSlate,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  emptyBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  card: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.12)',
    padding: 16,
    marginBottom: 14,
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  typePillVideo: {
    backgroundColor: theme.colors.mintBg,
    borderColor: theme.colors.mintBdr,
  },
  typePillClinic: {
    backgroundColor: theme.colors.accentLight,
    borderColor: '#BAE6FD',
  },
  typePillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  typePillTextVideo: {
    color: theme.colors.primary,
  },
  typePillTextClinic: {
    color: theme.colors.accent,
  },
  idTag: {
    backgroundColor: theme.colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  idTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSlate,
  },
  doctorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceSecondary,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  activeDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  specialtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specialtyText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSlate,
  },
  scheduleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 14,
    justifyContent: 'space-around',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleItemText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  scheduleDivider: {
    width: 1,
    height: 16,
    backgroundColor: theme.colors.surfaceBorder,
  },
  cardFooter: {
    width: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonVideo: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
  },
  actionButtonClinic: {
    backgroundColor: theme.colors.accent,
    shadowColor: theme.colors.accent,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default UpcomingAppointmentsSection;
