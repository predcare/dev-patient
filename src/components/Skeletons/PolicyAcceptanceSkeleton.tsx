import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export const PolicyAcceptanceSkeleton: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
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
      {/* Inset Box Skeleton */}
      <Animated.View style={[styles.boxSkeleton, { opacity: pulseAnim }]}>
        <View style={styles.lineRow}>
          <View style={styles.labelSkeleton} />
          <View style={[styles.valueSkeleton, { width: '65%' }]} />
        </View>
        <View style={styles.lineRow}>
          <View style={styles.labelSkeleton} />
          <View style={[styles.valueSkeleton, { width: '60%' }]} />
        </View>
        <View style={styles.lineRow}>
          <View style={[styles.labelSkeleton, { width: 90 }]} />
          <View style={[styles.valueSkeleton, { width: '50%' }]} />
        </View>
      </Animated.View>

      {/* Notice Text Skeleton */}
      <Animated.View style={[styles.noticeSkeleton, { opacity: pulseAnim }]}>
        <View style={styles.textLineFull} />
        <View style={styles.textLineHalf} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  boxSkeleton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 12,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelSkeleton: {
    width: 50,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  valueSkeleton: {
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  noticeSkeleton: {
    gap: 6,
    marginBottom: 8,
  },
  textLineFull: {
    width: '100%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  textLineHalf: {
    width: '60%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
});

export default PolicyAcceptanceSkeleton;
