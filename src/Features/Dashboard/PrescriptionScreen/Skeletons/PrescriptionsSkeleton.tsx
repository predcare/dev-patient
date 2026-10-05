import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export const PrescriptionsSkeleton: React.FC = () => {
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
      {[1, 2, 3, 4, 5].map(key => (
        <Animated.View key={key} style={[styles.card, { opacity: pulseAnim }]}>
          <View style={styles.dateCol}>
            <View style={styles.dateDaySkeleton} />
            <View style={styles.dateMonthSkeleton} />
          </View>
          <View style={styles.cardMid}>
            <View style={styles.doctorNameSkeleton} />
            <View style={styles.rxIdSkeleton} />
          </View>
          <View style={styles.cardActions}>
            <View style={styles.iconBtnSkeleton} />
            <View style={styles.iconBtnSkeleton} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateCol: {
    width: 48,
    alignItems: 'center',
    marginRight: 14,
    gap: 4,
  },
  dateDaySkeleton: {
    width: 32,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
  dateMonthSkeleton: {
    width: 28,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  cardMid: {
    flex: 1,
    paddingRight: 8,
    gap: 8,
  },
  doctorNameSkeleton: {
    width: '70%',
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  rxIdSkeleton: {
    width: '45%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtnSkeleton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
  },
});

export default PrescriptionsSkeleton;
