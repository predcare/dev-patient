import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { getInitials } from '../../../lib/common/common.utils';
import { appointmentsStyles } from '../../../styled/AppointmentsScreen.styled';
import { theme } from '../../../styled/theme.styled';
import {
  CalendarIcon,
  ChevronRightIcon,
  ClockIcon,
  FileTextIcon,
  MapPinIcon,
  VideoIcon,
} from '../../ui/icons';

export interface AppointmentCardProps {
  apptId: string;
  apptStatus: string;
  docImage: string;
  doctorName: string;
  clinicName: string;
  clinicAddress: string;
  date: string;
  time: string;
  duration: string;
  mode: string;
  onJoinVideo: () => void;
  onReschedule: () => void;
  onCancelPress: () => void;
  onOpenDirections?: () => void;
  onView?: () => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  apptId,
  apptStatus,
  clinicAddress,
  clinicName,
  date,
  docImage,
  doctorName,
  duration,
  time,
  mode,
  onCancelPress,
  onJoinVideo,
  onReschedule,
  onOpenDirections,
  onView,
}) => {
  const { t } = useTranslation();

  const statusConfig = useMemo(() => {
    const s = String(apptStatus || '')
      .toLowerCase()
      .trim();
    switch (s) {
      case 'online':
        return {
          label: 'Online',
          color: '#10B981',
          bgColor: '#ECFDF5',
          borderColor: '#A7F3D0',
        };
      case 'offline':
        return {
          label: 'Offline',
          color: '#64748B',
          bgColor: '#F1F5F9',
          borderColor: '#CBD5E1',
        };
      case 'pending':
        return {
          label: 'Pending',
          color: '#F59E0B',
          bgColor: '#FEF3C7',
          borderColor: '#FDE68A',
        };
      case 'confirmed':
        return {
          label: 'Confirmed',
          color: '#0F766E',
          bgColor: '#F0FDFA',
          borderColor: '#99F6E4',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          color: '#EF4444',
          bgColor: '#FEE2E2',
          borderColor: '#FECACA',
        };
      case 'refunded':
        return {
          label: 'Refunded',
          color: '#8B5CF6',
          bgColor: '#F5F3FF',
          borderColor: '#DDD6FE',
        };
      case 'completed':
        return {
          label: 'Completed',
          color: '#0D9488',
          bgColor: '#CCFBF1',
          borderColor: '#99F6E4',
        };
      case 'no_show':
        return {
          label: 'No Show',
          color: '#EA580C',
          bgColor: '#FFEDD5',
          borderColor: '#FED7AA',
        };
      case 'in_progress':
      case 'in-progress':
        return {
          label: 'In Progress',
          color: '#7C3AED',
          bgColor: '#EDE9FE',
          borderColor: '#DDD6FE',
        };
      default:
        return {
          label: apptStatus
            ? apptStatus.charAt(0).toUpperCase() + apptStatus.slice(1).replace('_', ' ')
            : 'Unknown',
          color: '#0F766E',
          bgColor: '#F0FDFA',
          borderColor: '#99F6E4',
        };
    }
  }, [apptStatus]);

  const isInProgress =
    String(apptStatus || '')
      .toLowerCase()
      .trim() === 'in_progress' ||
    String(apptStatus || '')
      .toLowerCase()
      .trim() === 'in-progress';

  return (
    <View style={appointmentsStyles.card}>
      {isInProgress && (
        <View style={[appointmentsStyles.banner, { backgroundColor: '#7C3AED' }]}>
          <View style={appointmentsStyles.bDot} />
          <Text style={appointmentsStyles.bTxt}>{t('appointments.slotRunningInProgress')}</Text>
        </View>
      )}

      <View style={appointmentsStyles.cardBody}>
        <View style={appointmentsStyles.cardTop}>
          {docImage ? (
            <Image source={{ uri: docImage }} style={appointmentsStyles.av} />
          ) : (
            <View style={appointmentsStyles.av}>
              <Text style={appointmentsStyles.avTxt}>{getInitials(doctorName)}</Text>
            </View>
          )}

          <View style={appointmentsStyles.drInfo}>
            <Text style={appointmentsStyles.drName} numberOfLines={1}>
              {doctorName || t('appointments.unknownDoctor')}
            </Text>
            <Text style={appointmentsStyles.clinic} numberOfLines={1}>
              {clinicName || t('appointments.unknownClinic')}
            </Text>
            <Text style={appointmentsStyles.aptId} numberOfLines={1}>
              {t('appointments.idPrefix', { id: apptId })}
            </Text>
          </View>

          <View
            style={[
              appointmentsStyles.pill,
              { backgroundColor: statusConfig.bgColor, borderColor: statusConfig.borderColor },
            ]}
          >
            <Text style={[appointmentsStyles.pillTxt, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>
        <View style={appointmentsStyles.grid}>
          <View style={appointmentsStyles.gridCell}>
            <View style={appointmentsStyles.gridIcon}>
              <CalendarIcon size={16} color={theme.colors.primary} />
            </View>
            <View style={appointmentsStyles.gridText}>
              <Text style={appointmentsStyles.gridLbl}>{t('appointments.dateLabel')}</Text>
              <Text style={appointmentsStyles.gridVal}>{date}</Text>
            </View>
          </View>

          <View style={appointmentsStyles.gridCell}>
            <View style={appointmentsStyles.gridIcon}>
              <ClockIcon size={16} color={theme.colors.primary} />
            </View>
            <View style={appointmentsStyles.gridText}>
              <Text style={appointmentsStyles.gridLbl}>{t('appointments.timeLabel')}</Text>
              <Text style={appointmentsStyles.gridVal}>{time}</Text>
            </View>
          </View>

          <View style={appointmentsStyles.gridCell}>
            <View style={appointmentsStyles.gridIcon}>
              <ClockIcon size={16} color={theme.colors.primary} />
            </View>
            <View style={appointmentsStyles.gridText}>
              <Text style={appointmentsStyles.gridLbl}>{t('appointments.durationLabel')}</Text>
              <Text style={appointmentsStyles.gridVal}>{duration}</Text>
            </View>
          </View>

          <View style={appointmentsStyles.gridCell}>
            <View style={appointmentsStyles.gridIcon}>
              {mode === 'video' ? (
                <VideoIcon size={16} color={theme.colors.primary} />
              ) : (
                <MapPinIcon size={16} color={theme.colors.primary} />
              )}
            </View>
            <View style={appointmentsStyles.gridText}>
              <Text style={appointmentsStyles.gridLbl}>{t('appointments.modeLabel')}</Text>
              <Text style={appointmentsStyles.gridVal}>
                {mode === 'video' ? t('appointments.videoCall') : t('appointments.inPerson')}
              </Text>
            </View>
          </View>
        </View>
        {clinicAddress &&
          mode === 'in-person' &&
          ['in-progress', 'in_progress', 'confirmed'].includes(apptStatus) && (
            <View style={appointmentsStyles.locBox}>
              <View style={appointmentsStyles.locRow}>
                <View style={{ marginTop: 2 }}>
                  <MapPinIcon size={16} color={theme.colors.primary} />
                </View>
                <View style={appointmentsStyles.locTextCol}>
                  <Text style={appointmentsStyles.locClinic}>{clinicName || ''}</Text>
                  <Text style={appointmentsStyles.locAddress}>{clinicAddress || ''}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={appointmentsStyles.btnOutline}
                activeOpacity={0.8}
                onPress={onOpenDirections}
              >
                <Text style={appointmentsStyles.btnOutlineTxt}>
                  {t('appointments.getDirections')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        {onView && (
          <TouchableOpacity
            style={appointmentsStyles.btnViewDetails}
            activeOpacity={0.7}
            onPress={onView}
          >
            <View style={appointmentsStyles.btnViewDetailsLeft}>
              <View style={appointmentsStyles.viewDetailsIconCircle}>
                <FileTextIcon size={14} color={theme.colors.primary} />
              </View>
              <Text style={appointmentsStyles.btnViewDetailsTxt}>
                {t('appointments.viewDetails')}
              </Text>
            </View>
            <ChevronRightIcon size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
        {mode === 'video' && ['in_progress', 'in-progress', 'confirmed'].includes(apptStatus) && (
          <TouchableOpacity
            style={[appointmentsStyles.btnJoin, appointmentsStyles.btnRejoin]}
            activeOpacity={1}
            onPress={onJoinVideo}
          >
            <VideoIcon size={18} color={theme.colors.surface} />
            <Text style={appointmentsStyles.btnJoinTxt}>{t('appointments.joinVideoCall')}</Text>
          </TouchableOpacity>
        )}
        {apptStatus === 'confirmed' && (
          <View style={appointmentsStyles.bRow}>
            <TouchableOpacity
              style={appointmentsStyles.btnOutline}
              activeOpacity={1}
              onPress={onReschedule}
            >
              <Text style={appointmentsStyles.btnOutlineTxt}>{t('appointments.reschedule')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={appointmentsStyles.btnCancel}
              activeOpacity={1}
              onPress={onCancelPress}
            >
              <Text style={appointmentsStyles.btnCancelTxt}>{t('appointments.cancel')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default AppointmentCard;
