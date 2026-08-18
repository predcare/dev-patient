import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ClockIcon, VideoIcon } from '../../ui/icons';
import { theme } from '../../../styled/theme.styled';

export interface UpcomingAppointmentsSectionProps {
  appointments?: any[];
  loading?: boolean;
  emptyMessage?: string;
  emptyActionLabel?: string;
  onEmptyActionPress: () => void;
  onSeeAllPress: () => void;
  onAppointmentPress: (appointment: any) => void;
}

export const UpcomingAppointmentsSection: React.FC<UpcomingAppointmentsSectionProps> = ({
  appointments = [],
  emptyMessage = 'No appointments scheduled',
  emptyActionLabel = 'Book Now',
  onEmptyActionPress,
  onSeeAllPress,
  onAppointmentPress,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Consultations</Text>
        {appointments.length > 0 && (
          <TouchableOpacity onPress={onSeeAllPress} activeOpacity={0.7}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        )}
      </View>

      {appointments.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={onEmptyActionPress}
            activeOpacity={0.85}
          >
            <Text style={styles.emptyBtnText}>{emptyActionLabel}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        appointments.map(item => {
          const isVideo = String(item.consultation_type || '').toLowerCase().includes('video');
          const docName = item.doctor_name || 'Sarah Jenkins';
          const formattedDocName = docName.startsWith('Dr.') ? docName : `Dr. ${docName}`;

          return (
            <View key={String(item.id || item.appointment_id)} style={styles.card}>
              {/* Top row: Time badge & Date */}
              <View style={styles.topRow}>
                <View style={styles.timeBadge}>
                  <ClockIcon size={14} color={theme.colors.primary} />
                  <Text style={styles.timeText}>{item.start_time || '10:30 AM'}</Text>
                </View>
                <Text style={styles.dateText}>
                  {item.appointment_date_label || item.appointment_date || 'Mon, 24 Aug 2026'}
                </Text>
              </View>

              {/* ID Label */}
              {item.appointment_id && (
                <Text style={styles.idText}>
                  <Text style={styles.idLabel}>ID </Text>
                  {item.appointment_id}
                </Text>
              )}

              {/* Body row: Doctor Info + Action Button */}
              <View style={styles.bodyRow}>
                <View style={styles.info}>
                  <Text style={styles.doctorName} numberOfLines={1}>
                    {formattedDocName}
                  </Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.specialty} numberOfLines={1}>
                      {(item.specialization || 'CARDIOLOGY • MD').toUpperCase()}
                    </Text>
                    <Text style={[styles.typeBadge, isVideo ? styles.videoBadge : styles.inPersonBadge]}>
                      {isVideo ? 'VIDEO' : 'IN-PERSON'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => onAppointmentPress(item)}
                  activeOpacity={0.85}
                >
                  {isVideo && <VideoIcon size={16} color={theme.colors.surface} style={{ marginRight: 6 }} />}
                  <Text style={styles.actionBtnText}>
                    {isVideo ? 'Join Call' : 'Details'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  emptyCard: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSlate,
    marginBottom: 12,
  },
  emptyBtn: {
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 12,
  },
  emptyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  card: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    padding: 18,
    marginBottom: 12,
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  idText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 12,
  },
  idLabel: {
    fontWeight: '700',
    color: theme.colors.textSlate,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  specialty: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  typeBadge: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    textTransform: 'uppercase',
  },
  videoBadge: {
    color: theme.colors.primary,
    backgroundColor: theme.colors.mintBg,
  },
  inPersonBadge: {
    color: theme.colors.accent,
    backgroundColor: theme.colors.accentLight,
  },
  actionBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.surface,
  },
});

export default UpcomingAppointmentsSection;
