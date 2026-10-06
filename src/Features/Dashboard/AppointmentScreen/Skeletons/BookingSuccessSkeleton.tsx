import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import theme from '../../../../styled/theme.styled';

export const BookingSuccessSkeleton: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
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
      <Animated.View style={[styles.circleSkeleton, { opacity: pulseAnim }]} />
      <Animated.View style={[styles.titleSkeleton, { opacity: pulseAnim }]} />
      <Animated.View style={[styles.subtitleSkeleton, { opacity: pulseAnim }]} />

      {/* Doctor Card Skeleton */}
      <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
        <View style={styles.doctorRow}>
          <View style={styles.doctorAvatar} />
          <View style={styles.doctorInfo}>
            <View style={styles.doctorNameLine} />
            <View style={styles.doctorMetaLine} />
          </View>
        </View>
      </Animated.View>

      {/* Appointment Details Card Skeleton */}
      <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
        <View style={styles.sectionTitleLine} />
        {[1, 2, 3].map(item => (
          <View key={item} style={styles.infoRow}>
            <View style={styles.iconSkeleton} />
            <View style={styles.infoTextWrap}>
              <View style={styles.infoLabelLine} />
              <View style={styles.infoValueLine} />
            </View>
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  circleSkeleton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#E2E8F0',
    marginBottom: 18,
  },
  titleSkeleton: {
    width: '65%',
    height: 24,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
  },
  subtitleSkeleton: {
    width: '80%',
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginBottom: 24,
  },
  card: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    padding: 16,
    marginBottom: 14,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  doctorAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E2E8F0',
  },
  doctorInfo: {
    flex: 1,
    gap: 8,
  },
  doctorNameLine: {
    width: '55%',
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  doctorMetaLine: {
    width: '40%',
    height: 13,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  sectionTitleLine: {
    width: 140,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  iconSkeleton: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
  infoTextWrap: {
    flex: 1,
    gap: 6,
  },
  infoLabelLine: {
    width: 100,
    height: 11,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  infoValueLine: {
    width: '70%',
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
});

export default BookingSuccessSkeleton;
