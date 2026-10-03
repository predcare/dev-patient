import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CalendarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClinicIcon,
  ClockIcon,
  MapPinIcon,
  StethoscopeIcon,
  VideoIcon
} from '../../../../components/ui/icons';
import { useMyAppointments } from '../../../../hooks/react-query/appointments/appointments.hooks';
import { _formatTime, getInitials, openLocationOnMap } from '../../../../lib/common/common.utils';
import { showInfoToast } from '../../../../lib/common/toast.utils';
import { AppRoute } from '../../../../route';
import theme from '../../../../styled/theme.styled';
import { IMyAppointmentDoc } from '../../../../typescripts/interfaces/appointments.interfaces';


const getStatusBadgeInfo = (status?: string | null) => {
  const normalized = (status || '').toLowerCase().trim();
  switch (normalized) {
    case 'in_progress':
      return {
        label: 'LIVE NOW',
        bg: '#DCFCE7',
        text: '#15803D',
        border: '#86EFAC',
        isLive: true,
      };
    case 'confirmed':
      return {
        label: 'Confirmed',
        bg: '#F0FDF4',
        text: '#16A34A',
        border: '#BBF7D0',
        isLive: false,
      };
    case 'pending':
      return {
        label: 'Pending',
        bg: '#FEF3C7',
        text: '#D97706',
        border: '#FDE68A',
        isLive: false,
      };
    case 'rescheduled':
      return {
        label: 'Rescheduled',
        bg: '#EFF6FF',
        text: '#2563EB',
        border: '#BFDBFE',
        isLive: false,
      };
    default:
      return {
        label: status ? status.toUpperCase() : 'CONFIRMED',
        bg: '#F1F5F9',
        text: '#475569',
        border: '#E2E8F0',
        isLive: false,
      };
  }
};

const getRelativeDateInfo = (dateStr?: string | null) => {
  if (!dateStr) return { label: 'Scheduled', isToday: false, isTomorrow: false };
  const target = dayjs(dateStr);
  const today = dayjs();
  if (target.isSame(today, 'day')) {
    return { label: 'TODAY', isToday: true, isTomorrow: false };
  }
  if (target.isSame(today.add(1, 'day'), 'day')) {
    return { label: 'TOMORROW', isToday: false, isTomorrow: true };
  }
  return { label: target.format('ddd, D MMM'), isToday: false, isTomorrow: false };
};

const formatSlotWindow = (startTime?: string | null, endTime?: string | null): string => {
  const start = _formatTime(startTime);
  const end = _formatTime(endTime);
  if (start && end) return `${start} - ${end}`;
  if (start) return start;
  return 'Time Scheduled';
};


const AppointmentCardSkeleton: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <Animated.View style={[UpcomingApptStyles.skeletonCard, { opacity: pulseAnim }]}>
      <View style={UpcomingApptStyles.skeletonHeader}>
        <View style={UpcomingApptStyles.skeletonPill} />
        <View style={UpcomingApptStyles.skeletonTag} />
      </View>
      <View style={UpcomingApptStyles.skeletonDoctorRow}>
        <View style={UpcomingApptStyles.skeletonAvatar} />
        <View style={UpcomingApptStyles.skeletonDoctorDetails}>
          <View style={UpcomingApptStyles.skeletonLineLarge} />
          <View style={UpcomingApptStyles.skeletonLineSmall} />
        </View>
      </View>
      <View style={UpcomingApptStyles.skeletonLocationBar} />
      <View style={UpcomingApptStyles.skeletonScheduleBar} />
      <View style={UpcomingApptStyles.skeletonButton} />
    </Animated.View>
  );
};

export const UpcomingAppointmentsCard: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const { data: upcomingAppts, isFetching: upcomingAppointmentsIsPending } = useMyAppointments({
    status: 'pending,confirmed,in_progress',
    limit: 3,
    page: 1,
  });

  const appointmentsList = upcomingAppts?.data || [];
  const totalCount = appointmentsList.length;

  const handleSeeAll = () => {
    navigation.navigate(AppRoute.SCHEDULE);
  };

  const handleBookNow = () => {
    navigation.navigate(AppRoute.DOCTOR_SEARCH);
  };

  const handleCardPress = (item: IMyAppointmentDoc) => {
    navigation.navigate(AppRoute.SCHEDULE);
  };

  const handleClinicDirections = (item: IMyAppointmentDoc) => {
    openLocationOnMap({
      address: item?.clinicInfo?.fulladdress,
      lat: item?.clinicInfo?.location?.lat,
      long: item?.clinicInfo?.location?.lng,
    });
  };

  const handleJoinVideoCall = useCallback(
    async (appointment: IMyAppointmentDoc) => {
      if (!appointment) return;
      showInfoToast('VideoCall Coming Soon');
    },
    []
  );

  const renderCard = (item: IMyAppointmentDoc, index: number) => {
    const isVideo = String(item.consultation_type || '')
      .toLowerCase()
      .includes('video');
    const statusInfo = getStatusBadgeInfo(item.appointment_status);
    const dateInfo = getRelativeDateInfo(item.appointment_date);
    const formattedDate = dayjs(item.appointment_date).format('ddd, DD MMM YYYY');
    const doctorRawName = item.doctorInfo?.name || 'Doctor';
    const doctorDisplayName = doctorRawName.startsWith('Dr') ? doctorRawName : `Dr. ${doctorRawName}`;

    return (
      <TouchableOpacity
        key={String(item.appointment_id || index)}
        style={[
          UpcomingApptStyles.card,
          isVideo ? UpcomingApptStyles.cardVideoAccent : UpcomingApptStyles.cardClinicAccent,
        ]}
        activeOpacity={0.94}
        onPress={() => handleCardPress(item)}
      >
        <View style={UpcomingApptStyles.cardHeader}>
          <View
            style={[
              UpcomingApptStyles.typePill,
              isVideo ? UpcomingApptStyles.typePillVideo : UpcomingApptStyles.typePillClinic,
            ]}
          >
            {isVideo ? (
              <VideoIcon size={12} color={theme.colors.primary} />
            ) : (
              <ClinicIcon size={12} color={theme.colors.accent} />
            )}
            <Text
              style={[
                UpcomingApptStyles.typePillText,
                isVideo ? UpcomingApptStyles.typePillTextVideo : UpcomingApptStyles.typePillTextClinic,
              ]}
            >
              {isVideo ? 'VIDEO CONSULT' : 'IN-CLINIC VISIT'}
            </Text>
          </View>
          <View style={UpcomingApptStyles.headerRight}>
            {dateInfo.isToday && (
              <View style={UpcomingApptStyles.todayBadge}>
                <Text style={UpcomingApptStyles.todayBadgeText}>TODAY</Text>
              </View>
            )}

            <View
              style={[
                UpcomingApptStyles.statusBadge,
                { backgroundColor: statusInfo.bg, borderColor: statusInfo.border },
              ]}
            >
              {statusInfo.isLive ? (
                <View style={UpcomingApptStyles.livePulsingDot} />
              ) : (
                <CheckCircleIcon size={11} color={statusInfo.text} />
              )}
              <Text style={[UpcomingApptStyles.statusBadgeText, { color: statusInfo.text }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>
        </View>
        <View style={UpcomingApptStyles.doctorInfoRow}>
          <View style={UpcomingApptStyles.avatarWrapper}>
            {item.doctorInfo?.profileImage ? (
              <Image source={{ uri: item.doctorInfo.profileImage }} style={UpcomingApptStyles.avatarImage} />
            ) : (
              <View
                style={[
                  UpcomingApptStyles.avatarPlaceholder,
                  isVideo ? UpcomingApptStyles.avatarPlaceholderVideo : UpcomingApptStyles.avatarPlaceholderClinic,
                ]}
              >
                <Text style={UpcomingApptStyles.avatarInitials}>
                  {getInitials(doctorRawName)}
                </Text>
              </View>
            )}
            <View style={UpcomingApptStyles.activeDot} />
          </View>

          <View style={UpcomingApptStyles.doctorDetails}>
            <Text style={UpcomingApptStyles.doctorName} numberOfLines={1}>
              {doctorDisplayName}
            </Text>

            <View style={UpcomingApptStyles.metaRow}>
              {Boolean(item.specialization) && (
                <View style={UpcomingApptStyles.specialtyChip}>
                  <StethoscopeIcon size={11} color={theme.colors.primary} />
                  <Text style={UpcomingApptStyles.specialtyText} numberOfLines={1}>
                    {item.specialization}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <View style={UpcomingApptStyles.scheduleBar}>
          <View style={UpcomingApptStyles.scheduleItem}>
            <View style={UpcomingApptStyles.scheduleIconWrap}>
              <CalendarIcon size={13} color={theme.colors.primary} />
            </View>
            <Text style={UpcomingApptStyles.scheduleItemText}>{formattedDate}</Text>
          </View>

          <View style={UpcomingApptStyles.scheduleDivider} />

          <View style={UpcomingApptStyles.scheduleItem}>
            <View style={UpcomingApptStyles.scheduleIconWrap}>
              <ClockIcon size={13} color={theme.colors.primary} />
            </View>
            <Text style={UpcomingApptStyles.scheduleItemText}>
              {formatSlotWindow(item.start_time, item.end_time)}
            </Text>
          </View>
        </View>
        <View style={UpcomingApptStyles.cardFooter}>
          {!isVideo ? (
            <TouchableOpacity
              style={[UpcomingApptStyles.actionButton, UpcomingApptStyles.actionButtonClinic]}
              onPress={() => handleClinicDirections(item)}
              activeOpacity={0.86}
            >
              <MapPinIcon size={14} color="#FFFFFF" />
              <Text style={UpcomingApptStyles.actionButtonText}>Get Directions</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[UpcomingApptStyles.actionButton, UpcomingApptStyles.actionButtonVideo]}
              onPress={() => handleJoinVideoCall(item)}
              activeOpacity={0.86}
            >
              <VideoIcon size={14} color="#FFFFFF" />
              <Text style={UpcomingApptStyles.actionButtonText}>
                {item?.appointment_status === 'in_progress' ? 'Re-Join Call' : 'Join Video Call'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={UpcomingApptStyles.detailsButton}
            onPress={() => handleCardPress(item)}
            activeOpacity={0.7}
          >
            <Text style={UpcomingApptStyles.detailsButtonText}>Details</Text>
            <ChevronRightIcon size={12} color={theme.colors.textSlate} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={UpcomingApptStyles.section}>
      {/* Section Header */}
      <View style={UpcomingApptStyles.sectionHeader}>
        <View style={UpcomingApptStyles.titleContainer}>
          <Text style={UpcomingApptStyles.sectionTitle}>{t('dashboard.upcomingConsultations')}</Text>
          {totalCount > 0 && (
            <View style={UpcomingApptStyles.countBadge}>
              <Text style={UpcomingApptStyles.countBadgeText}>{totalCount}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={handleSeeAll}
          activeOpacity={0.7}
          style={UpcomingApptStyles.seeAllButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={UpcomingApptStyles.seeAllText}>{t('commons.seeAll')}</Text>
          <ChevronRightIcon size={13} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Main Body */}
      {upcomingAppointmentsIsPending && !upcomingAppts ? (
        <View style={UpcomingApptStyles.listContainer}>
          <AppointmentCardSkeleton />
        </View>
      ) : totalCount === 0 ? (
        <View style={UpcomingApptStyles.emptyCard}>
          <View style={UpcomingApptStyles.emptyIconCircle}>
            <CalendarIcon size={26} color={theme.colors.primary} />
          </View>
          <Text style={UpcomingApptStyles.emptyTitle}>No Consultations Scheduled</Text>
          <Text style={UpcomingApptStyles.emptyText}>
            You do not have any upcoming doctor appointments booked right now.
          </Text>
          <TouchableOpacity style={UpcomingApptStyles.emptyBtn} onPress={handleBookNow} activeOpacity={0.85}>
            <Text style={UpcomingApptStyles.emptyBtnText}>+ Book Consultation</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={UpcomingApptStyles.listContainer}>
          {appointmentsList.map((item, index) => renderCard(item, index))}
        </View>
      )}
    </View>
  );
};

export const UpcomingApptStyles = StyleSheet.create({
  section: {
    marginTop: 20,
    marginBottom: 8,
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    letterSpacing: -0.3,
  },
  countBadge: {
    backgroundColor: theme.colors.mintBg,
    paddingHorizontal: 8,
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
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.1)',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },

  // Column List Container
  listContainer: {
    width: '100%',
  },

  // Skeleton Loader Styles
  skeletonCard: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    padding: 16,
    marginBottom: 12,
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  skeletonPill: {
    width: 90,
    height: 22,
    borderRadius: 6,
    backgroundColor: theme.colors.surfaceSecondary,
  },
  skeletonTag: {
    width: 70,
    height: 22,
    borderRadius: 6,
    backgroundColor: theme.colors.surfaceSecondary,
  },
  skeletonDoctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceSecondary,
    marginRight: 12,
  },
  skeletonDoctorDetails: {
    flex: 1,
    gap: 8,
  },
  skeletonLineLarge: {
    width: '60%',
    height: 14,
    borderRadius: 4,
    backgroundColor: theme.colors.surfaceSecondary,
  },
  skeletonLineSmall: {
    width: '40%',
    height: 10,
    borderRadius: 4,
    backgroundColor: theme.colors.surfaceSecondary,
  },
  skeletonLocationBar: {
    height: 38,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceSecondary,
    marginBottom: 12,
  },
  skeletonScheduleBar: {
    height: 38,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceSecondary,
    marginBottom: 14,
  },
  skeletonButton: {
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceSecondary,
  },

  // Empty State Styles
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
    width: 56,
    height: 56,
    borderRadius: 28,
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

  // Appointment Card Styles
  card: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardVideoAccent: {
    borderColor: 'rgba(15, 118, 110, 0.16)',
  },
  cardClinicAccent: {
    borderColor: 'rgba(2, 132, 199, 0.18)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  todayBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  todayBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  livePulsingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#16A34A',
  },

  // Doctor Info Block
  doctorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholderVideo: {
    backgroundColor: theme.colors.primary,
  },
  avatarPlaceholderClinic: {
    backgroundColor: theme.colors.accent,
  },
  avatarInitials: {
    fontSize: 18,
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
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  specialtyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.12)',
  },
  specialtyText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  patientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surfaceSecondary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  patientText: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textSlate,
  },

  // Middle Context Rows
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 10,
    gap: 8,
  },
  locationIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationTextContainer: {
    flex: 1,
  },
  clinicNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 2,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  clinicAddressText: {
    fontSize: 11,
    color: theme.colors.textSlate,
    flex: 1,
  },
  telehealthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.mintBdr,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 10,
    gap: 8,
  },
  telehealthIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.mintBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  telehealthTextContainer: {
    flex: 1,
  },
  telehealthTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primaryDark,
    marginBottom: 1,
  },
  telehealthSub: {
    fontSize: 11,
    color: theme.colors.textSlate,
  },

  // Schedule Ticket Bar
  scheduleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleItemText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  scheduleDivider: {
    width: 1,
    height: 16,
    backgroundColor: theme.colors.surfaceBorder,
  },

  // Card Footer & Action Buttons
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
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
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    backgroundColor: theme.colors.surfaceSecondary,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  detailsButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
});

export default UpcomingAppointmentsCard;
