import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export const PrescriptionDetailSkeleton: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      {/* Rx ID Bar Skeleton */}
      <Animated.View style={[styles.rxIdBar, { opacity: pulseAnim }]}>
        <View style={styles.rxIdLabel} />
        <View style={styles.rxIdBadge} />
      </Animated.View>

      {/* Patient Card Skeleton */}
      <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
        <View style={styles.patientRow}>
          <View style={styles.avatarCircle} />
          <View style={styles.patientInfo}>
            <View style={styles.patientName} />
            <View style={styles.badgeRow}>
              <View style={styles.badge} />
              <View style={styles.badge} />
              <View style={styles.badge} />
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Doctor & Clinic Card Skeleton */}
      <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
        <View style={styles.doctorRow}>
          <View style={styles.doctorInfo}>
            <View style={styles.doctorName} />
            <View style={styles.doctorSpec} />
            <View style={styles.clinicName} />
          </View>
          <View style={styles.dateBadge} />
        </View>
      </Animated.View>

      {/* Section Title & Card Skeleton */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitle} />
      </View>
      <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
        <View style={styles.lineFull} />
        <View style={[styles.lineFull, { width: '80%', marginTop: 8 }]} />
      </Animated.View>

      {/* Vitals Grid Skeleton */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitle} />
      </View>
      <View style={styles.vitalsGrid}>
        {[1, 2, 3, 4].map(key => (
          <Animated.View key={key} style={[styles.vitalCard, { opacity: pulseAnim }]}>
            <View style={styles.vitalLabel} />
            <View style={styles.vitalValue} />
          </Animated.View>
        ))}
      </View>

      {/* Medications Section Skeleton */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitle} />
      </View>
      {[1, 2].map(key => (
        <Animated.View key={key} style={[styles.card, { opacity: pulseAnim }]}>
          <View style={styles.medTop}>
            <View style={styles.medLeft}>
              <View style={styles.medName} />
              <View style={styles.medDosage} />
            </View>
            <View style={styles.medSchedule} />
          </View>
          <View style={styles.medMeta} />
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  rxIdBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rxIdLabel: {
    width: 110,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  rxIdBadge: {
    width: 90,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
  },
  patientInfo: {
    flex: 1,
    gap: 8,
  },
  patientName: {
    width: '60%',
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    width: 54,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  doctorInfo: {
    flex: 1,
    gap: 6,
    paddingRight: 12,
  },
  doctorName: {
    width: '70%',
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  doctorSpec: {
    width: '50%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  clinicName: {
    width: '40%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  dateBadge: {
    width: 80,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  sectionHeader: {
    marginTop: 14,
    marginBottom: 8,
  },
  sectionTitle: {
    width: 140,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  lineFull: {
    width: '100%',
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  vitalCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  vitalLabel: {
    width: '50%',
    height: 10,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
  },
  vitalValue: {
    width: '70%',
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  medTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  medLeft: {
    flex: 1,
    gap: 6,
  },
  medName: {
    width: '60%',
    height: 15,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  medDosage: {
    width: '40%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  medSchedule: {
    width: 60,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  medMeta: {
    width: '80%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    marginTop: 10,
  },
});

export default PrescriptionDetailSkeleton;
