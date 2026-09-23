import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export const HealthRecordsSkeleton: React.FC = () => {
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
      {/* Summary Cards Skeleton */}
      <View style={styles.summaryRow}>
        <Animated.View style={[styles.summaryCard, { opacity: pulseAnim }]}>
          <View style={styles.summaryLabelSkeleton} />
          <View style={styles.summaryValueSkeleton} />
        </Animated.View>
        <Animated.View style={[styles.summaryCard, { opacity: pulseAnim }]}>
          <View style={styles.summaryLabelSkeleton} />
          <View style={styles.summaryValueSkeleton} />
        </Animated.View>
      </View>

      {/* Section Title Skeleton */}
      <Animated.View style={[styles.sectionTitleSkeleton, { opacity: pulseAnim }]} />

      {/* Folder Categories Skeleton List */}
      <View style={styles.folderList}>
        {[1, 2, 3, 4, 5].map(key => (
          <Animated.View key={key} style={[styles.folderCard, { opacity: pulseAnim }]}>
            <View style={styles.folderIconSkeleton} />
            <View style={styles.folderInfo}>
              <View style={styles.folderNameSkeleton} />
              <View style={styles.folderMetaSkeleton} />
            </View>
            <View style={styles.chevronSkeleton} />
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  summaryLabelSkeleton: {
    width: '60%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  summaryValueSkeleton: {
    width: '40%',
    height: 24,
    borderRadius: 6,
    backgroundColor: '#CBD5E1',
  },
  sectionTitleSkeleton: {
    width: 140,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    marginBottom: 14,
  },
  folderList: {
    gap: 12,
  },
  folderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  folderIconSkeleton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    marginRight: 14,
  },
  folderInfo: {
    flex: 1,
    gap: 8,
  },
  folderNameSkeleton: {
    width: '55%',
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  folderMetaSkeleton: {
    width: '40%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  chevronSkeleton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
});

export default HealthRecordsSkeleton;
