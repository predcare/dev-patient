import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export interface BookingSlotsSkeletonProps {
  datesOnly?: boolean;
  slotsOnly?: boolean;
}

export const BookingSlotsSkeleton: React.FC<BookingSlotsSkeletonProps> = ({
  datesOnly,
  slotsOnly,
}) => {
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

  const datesSkeleton = (
    <View style={styles.datesRow}>
      {[1, 2, 3, 4].map(key => (
        <Animated.View key={key} style={[styles.dateChipSkeleton, { opacity: pulseAnim }]} />
      ))}
      <Animated.View style={[styles.calendarIconSkeleton, { opacity: pulseAnim }]} />
    </View>
  );

  const slotsSkeleton = (
    <View style={styles.slotsContainer}>
      {[1, 2].map(groupKey => (
        <View key={groupKey} style={styles.groupSkeleton}>
          <Animated.View style={[styles.groupTitleSkeleton, { opacity: pulseAnim }]} />
          <View style={styles.slotsGrid}>
            {[1, 2].map(key => (
              <Animated.View key={key} style={[styles.slotBtnSkeleton, { opacity: pulseAnim }]} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  if (datesOnly) return datesSkeleton;
  if (slotsOnly) return slotsSkeleton;

  return (
    <View>
      {datesSkeleton}
      {slotsSkeleton}
    </View>
  );
};

const styles = StyleSheet.create({
  datesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  dateChipSkeleton: {
    width: 68,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },
  calendarIconSkeleton: {
    width: 44,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },
  slotsContainer: {
    marginTop: 8,
  },
  groupSkeleton: {
    marginBottom: 16,
  },
  groupTitleSkeleton: {
    width: 90,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginBottom: 10,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotBtnSkeleton: {
    width: '48%',
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
});

export default BookingSlotsSkeleton;
