import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export const DoctorClinicCardSkeleton: React.FC = () => {
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
    <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
      <View style={styles.avatarSkeleton} />
      <View style={styles.detailsSkeleton}>
        <View style={styles.nameLineSkeleton} />
        <View style={styles.specLineSkeleton} />
        <View style={styles.clinicLineSkeleton} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatarSkeleton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E2E8F0',
    marginRight: 14,
  },
  detailsSkeleton: {
    flex: 1,
    gap: 8,
  },
  nameLineSkeleton: {
    width: '65%',
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  specLineSkeleton: {
    width: '85%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  clinicLineSkeleton: {
    width: '50%',
    height: 11,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
});

export default DoctorClinicCardSkeleton;
