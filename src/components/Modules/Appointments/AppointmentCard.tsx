import React from 'react';
import { Image, Linking, Text, TouchableOpacity, View } from 'react-native';
import { appointmentsStyles } from '../../../styled/AppointmentsScreen.styled';
import { theme } from '../../../styled/theme.styled';
import { CalendarIcon, ClockIcon, MapPinIcon, VideoIcon } from '../../ui/icons';

export interface AppointmentCardProps {
  appointment: any;
  activeTab: 'upcoming' | 'completed';
  onJoinVideo: (appointment: any) => void;
  onReschedule: (appointment: any) => void;
  onCancelPress: (appointment: any) => void;
  onDeletePress: (appointment: any) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment: a,
  activeTab,
  onJoinVideo,
  onReschedule,
  onCancelPress,
  onDeletePress,
}) => {
  const isVid = a.consultation_type === 'video';
  const isCancl = a.appointment_status === 'cancelled' || a.payment_status === 'cancelled';
  const isDone = a.appointment_status === 'completed';
  const isPart = a.appointment_status === 'in_progress';
  const isPending = a.payment_status === 'pending';

  let sLabel = 'Confirmed';
  let sColor: string = theme.colors.primary;
  if (isCancl) {
    sLabel = 'Cancelled';
    sColor = theme.colors.danger;
  } else if (isDone) {
    sLabel = 'Completed';
    sColor = theme.colors.primaryDark;
  } else if (isPart) {
    sLabel = 'In Progress';
    sColor = '#7C3AED';
  } else if (isPending) {
    sLabel = 'Pending';
    sColor = '#F59E0B';
  }

  const showJoin = activeTab === 'upcoming' && isVid && !isDone && !isCancl;
  const showRescheduleCancel = activeTab === 'upcoming' && !isCancl && !isDone;
  const showDelete = activeTab === 'completed' || isCancl;

  const docName = a.doctor_name?.startsWith('Dr.') ? a.doctor_name : `Dr. ${a.doctor_name || 'Doctor'}`;
  const clinic = a.clinic_name || 'ST. JUDE MEDICAL CENTER';
  const timeLabel = a.start_time || '10:30 AM';
  const dateLabel = a.appointment_date_label || a.appointment_date || '24 Aug';
  const durationLabel = `${a.slot_duration || 30}m Session`;
  const modeLabel = isVid ? 'Video Call' : 'In-person';

  const handleOpenDirections = () => {
    const address = a.clinic_address || 'New York';
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={appointmentsStyles.card}>
      {/* Live / In Progress Banner */}
      {isPart && isVid && !isDone && (
        <View style={[appointmentsStyles.banner, { backgroundColor: '#7C3AED' }]}>
          <View style={appointmentsStyles.bDot} />
          <Text style={appointmentsStyles.bTxt}>SLOT RUNNING • IN PROGRESS</Text>
        </View>
      )}

      <View style={appointmentsStyles.cardBody}>
        {/* Top Doctor Info Row */}
        <View style={appointmentsStyles.cardTop}>
          {a.doctor_image ? (
            <Image source={{ uri: a.doctor_image }} style={appointmentsStyles.av} />
          ) : (
            <View style={appointmentsStyles.av}>
              <Text style={appointmentsStyles.avTxt}>{docName.replace('Dr. ', '')[0] || 'D'}</Text>
            </View>
          )}

          <View style={appointmentsStyles.drInfo}>
            <Text style={appointmentsStyles.drName} numberOfLines={1}>
              {docName}
            </Text>
            <Text style={appointmentsStyles.clinic} numberOfLines={1}>
              {clinic.toUpperCase()}
            </Text>
            <Text style={appointmentsStyles.aptId} numberOfLines={1}>
              ID - {a.appointment_id || a.id}
            </Text>
          </View>

          <View
            style={[
              appointmentsStyles.pill,
              { backgroundColor: sColor + '15', borderColor: sColor + '40' },
            ]}
          >
            <Text style={[appointmentsStyles.pillTxt, { color: sColor }]}>{sLabel}</Text>
          </View>
        </View>

        {/* 2x2 Grid */}
        <View style={appointmentsStyles.grid}>
          <View style={appointmentsStyles.gridCell}>
            <View style={appointmentsStyles.gridIcon}>
              <CalendarIcon size={16} color={theme.colors.primary} />
            </View>
            <View style={appointmentsStyles.gridText}>
              <Text style={appointmentsStyles.gridLbl}>DATE</Text>
              <Text style={appointmentsStyles.gridVal}>{dateLabel}</Text>
            </View>
          </View>

          <View style={appointmentsStyles.gridCell}>
            <View style={appointmentsStyles.gridIcon}>
              <ClockIcon size={16} color={theme.colors.primary} />
            </View>
            <View style={appointmentsStyles.gridText}>
              <Text style={appointmentsStyles.gridLbl}>TIME</Text>
              <Text style={appointmentsStyles.gridVal}>{timeLabel}</Text>
            </View>
          </View>

          <View style={appointmentsStyles.gridCell}>
            <View style={appointmentsStyles.gridIcon}>
              <ClockIcon size={16} color={theme.colors.primary} />
            </View>
            <View style={appointmentsStyles.gridText}>
              <Text style={appointmentsStyles.gridLbl}>DURATION</Text>
              <Text style={appointmentsStyles.gridVal}>{durationLabel}</Text>
            </View>
          </View>

          <View style={appointmentsStyles.gridCell}>
            <View style={appointmentsStyles.gridIcon}>
              {isVid ? (
                <VideoIcon size={16} color={theme.colors.primary} />
              ) : (
                <MapPinIcon size={16} color={theme.colors.primary} />
              )}
            </View>
            <View style={appointmentsStyles.gridText}>
              <Text style={appointmentsStyles.gridLbl}>MODE</Text>
              <Text style={appointmentsStyles.gridVal}>{modeLabel}</Text>
            </View>
          </View>
        </View>

        {/* Clinic Address & Directions (for In-person) */}
        {!isVid && a.clinic_address && (
          <View style={appointmentsStyles.locBox}>
            <View style={appointmentsStyles.locRow}>
              <View style={{ marginTop: 2 }}>
                <MapPinIcon size={16} color={theme.colors.primary} />
              </View>
              <View style={appointmentsStyles.locTextCol}>
                <Text style={appointmentsStyles.locClinic}>{clinic}</Text>
                <Text style={appointmentsStyles.locAddress}>{a.clinic_address}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={appointmentsStyles.btnOutline}
              onPress={handleOpenDirections}
              activeOpacity={0.8}
            >
              <Text style={appointmentsStyles.btnOutlineTxt}>Get Directions</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Video Call Join Action */}
        {showJoin && (
          <TouchableOpacity
            style={[appointmentsStyles.btnJoin, isPart && appointmentsStyles.btnRejoin]}
            onPress={() => onJoinVideo(a)}
            activeOpacity={0.85}
          >
            <VideoIcon size={18} color={theme.colors.surface} />
            <Text style={appointmentsStyles.btnJoinTxt}>
              {isPart ? 'Rejoin Call' : 'Join Video Call'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Reschedule / Cancel Actions */}
        {showRescheduleCancel && (
          <View style={appointmentsStyles.bRow}>
            <TouchableOpacity
              style={appointmentsStyles.btnOutline}
              onPress={() => onReschedule(a)}
              activeOpacity={0.8}
            >
              <Text style={appointmentsStyles.btnOutlineTxt}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={appointmentsStyles.btnCancel}
              onPress={() => onCancelPress(a)}
              activeOpacity={0.85}
            >
              <Text style={appointmentsStyles.btnCancelTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Delete Record Action */}
        {showDelete && (
          <TouchableOpacity
            style={appointmentsStyles.btnCancel}
            onPress={() => onDeletePress(a)}
            activeOpacity={0.85}
          >
            <Text style={appointmentsStyles.btnCancelTxt}>Delete Record</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default AppointmentCard;
