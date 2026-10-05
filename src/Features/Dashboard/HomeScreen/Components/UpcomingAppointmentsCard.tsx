import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Image, Text, TouchableOpacity, View } from 'react-native';
import {
  CalendarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClinicIcon,
  ClockIcon,
  MapPinIcon,
  StethoscopeIcon,
  VideoIcon,
} from '../../../../components/ui/icons';
import { useMyAppointments } from '../../../../hooks/react-query/appointments/appointments.hooks';
import { _formatTime, getInitials, openLocationOnMap } from '../../../../lib/common/common.utils';
import { showInfoToast } from '../../../../lib/common/toast.utils';
import { AppRoute } from '../../../../route';
import { UpcomingApptStyles } from '../../../../styled/DashboardScreen.styled';
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

  const handleCardPress = (type: string, item: IMyAppointmentDoc) => {
    if (type === 'details') {
      navigation.navigate(AppRoute.APPOINTMENT_DETAILS, {
        appointmentId: item.appointment_id,
      });
    } else {
      navigation.navigate(AppRoute.SCHEDULE);
    }
  };

  const handleClinicDirections = (item: IMyAppointmentDoc) => {
    openLocationOnMap({
      address: item?.clinicInfo?.fulladdress,
      lat: item?.clinicInfo?.location?.lat,
      long: item?.clinicInfo?.location?.lng,
    });
  };

  const handleJoinVideoCall = useCallback(async (appointment: IMyAppointmentDoc) => {
    if (!appointment) return;
    showInfoToast('VideoCall Coming Soon');
  }, []);

  return (
    <View style={UpcomingApptStyles.section}>
      <View style={UpcomingApptStyles.sectionHeader}>
        <View style={UpcomingApptStyles.titleContainer}>
          <Text style={UpcomingApptStyles.sectionTitle}>
            {t('dashboard.upcomingConsultations')}
          </Text>
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
          <TouchableOpacity
            style={UpcomingApptStyles.emptyBtn}
            onPress={handleBookNow}
            activeOpacity={0.85}
          >
            <Text style={UpcomingApptStyles.emptyBtnText}>+ Book Consultation</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={UpcomingApptStyles.listContainer}>
          {appointmentsList.map((item, index) => {
            const isVideo = String(item.consultation_type || '')
              .toLowerCase()
              .includes('video');
            const statusInfo = getStatusBadgeInfo(item.appointment_status);
            const dateInfo = getRelativeDateInfo(item.appointment_date);
            const formattedDate = dayjs(item.appointment_date).format('ddd, DD MMM YYYY');
            const doctorRawName = item.doctorInfo?.name || 'Doctor';
            const doctorDisplayName = doctorRawName.startsWith('Dr')
              ? doctorRawName
              : `Dr. ${doctorRawName}`;

            return (
              <TouchableOpacity
                key={String(item.appointment_id || index)}
                style={[
                  UpcomingApptStyles.card,
                  isVideo
                    ? UpcomingApptStyles.cardVideoAccent
                    : UpcomingApptStyles.cardClinicAccent,
                ]}
                activeOpacity={0.94}
                onPress={() => handleCardPress('schedule', item)}
              >
                <View style={UpcomingApptStyles.cardHeader}>
                  <View
                    style={[
                      UpcomingApptStyles.typePill,
                      isVideo
                        ? UpcomingApptStyles.typePillVideo
                        : UpcomingApptStyles.typePillClinic,
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
                        isVideo
                          ? UpcomingApptStyles.typePillTextVideo
                          : UpcomingApptStyles.typePillTextClinic,
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
                      <Text
                        style={[UpcomingApptStyles.statusBadgeText, { color: statusInfo.text }]}
                      >
                        {statusInfo.label}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={UpcomingApptStyles.doctorInfoRow}>
                  <View style={UpcomingApptStyles.avatarWrapper}>
                    {item.doctorInfo?.profileImage ? (
                      <Image
                        source={{ uri: item.doctorInfo.profileImage }}
                        style={UpcomingApptStyles.avatarImage}
                      />
                    ) : (
                      <View
                        style={[
                          UpcomingApptStyles.avatarPlaceholder,
                          isVideo
                            ? UpcomingApptStyles.avatarPlaceholderVideo
                            : UpcomingApptStyles.avatarPlaceholderClinic,
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
                      style={[
                        UpcomingApptStyles.actionButton,
                        UpcomingApptStyles.actionButtonClinic,
                      ]}
                      onPress={() => handleClinicDirections(item)}
                      activeOpacity={0.86}
                    >
                      <MapPinIcon size={14} color="#FFFFFF" />
                      <Text style={UpcomingApptStyles.actionButtonText}>Get Directions</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[
                        UpcomingApptStyles.actionButton,
                        UpcomingApptStyles.actionButtonVideo,
                      ]}
                      onPress={() => handleJoinVideoCall(item)}
                      activeOpacity={0.86}
                    >
                      <VideoIcon size={14} color="#FFFFFF" />
                      <Text style={UpcomingApptStyles.actionButtonText}>
                        {item?.appointment_status === 'in_progress'
                          ? 'Re-Join Call'
                          : 'Join Video Call'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={UpcomingApptStyles.detailsButton}
                    onPress={() => handleCardPress('details', item)}
                    activeOpacity={0.7}
                  >
                    <Text style={UpcomingApptStyles.detailsButtonText}>Details</Text>
                    <ChevronRightIcon size={12} color={theme.colors.textSlate} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};



export default UpcomingAppointmentsCard;
