import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export const ReportsSkeleton: React.FC = () => {
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
    <View style={styles.container}>
      {/* Overview Section Title Skeleton */}
      <Animated.View style={[styles.sectionTitleSkeleton, { opacity: pulseAnim }]} />

      {/* 4 Main Stat Cards Skeleton */}
      {[1, 2, 3, 4].map(key => (
        <Animated.View key={`main-${key}`} style={[styles.mainCard, { opacity: pulseAnim }]}>
          <View style={styles.cardHeader}>
            <View style={styles.labelSkeleton} />
            <View style={styles.iconBadgeSkeleton} />
          </View>
          <View style={styles.valueWrap}>
            <View style={styles.valueSkeleton} />
          </View>
        </Animated.View>
      ))}

      {/* Appointment Breakdown Section Title Skeleton */}
      <Animated.View
        style={[styles.sectionTitleSkeleton, styles.sectionTitleSecondary, { opacity: pulseAnim }]}
      />

      {/* 2x2 Breakdown Grid Skeleton */}
      <View style={styles.gridContainer}>
        {[1, 2, 3, 4].map(key => (
          <Animated.View key={`grid-${key}`} style={[styles.gridCard, { opacity: pulseAnim }]}>
            <View style={styles.gridCardTop}>
              <View style={styles.gridIconBadgeSkeleton} />
            </View>
            <View style={styles.gridCardBottom}>
              <View style={styles.gridLabelSkeleton} />
              <View style={styles.gridValueSkeleton} />
            </View>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionTitleSkeleton: {
    width: 90,
    height: 14,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  sectionTitleSecondary: {
    marginTop: 16,
    width: 160,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  labelSkeleton: {
    width: '45%',
    height: 14,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    marginTop: 4,
  },
  iconBadgeSkeleton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  valueWrap: {
    marginTop: 12,
  },
  valueSkeleton: {
    width: '30%',
    height: 28,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  gridCardTop: {
    marginBottom: 12,
  },
  gridIconBadgeSkeleton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  gridCardBottom: {
    gap: 6,
  },
  gridLabelSkeleton: {
    width: '60%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  gridValueSkeleton: {
    width: '40%',
    height: 20,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
});

export default ReportsSkeleton;
