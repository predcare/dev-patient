import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export const HealthRecordFolderSkeleton: React.FC = () => {
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
      {/* Folder Header Banner Skeleton */}
      <Animated.View style={[styles.headerBanner, { opacity: pulseAnim }]}>
        <View style={styles.bannerIconSkeleton} />
        <View style={styles.bannerInfo}>
          <View style={styles.bannerTitleSkeleton} />
          <View style={styles.bannerSubtitleSkeleton} />
        </View>
      </Animated.View>

      {/* Document Items Skeleton List */}
      <View style={styles.docList}>
        {[1, 2, 3, 4].map(key => (
          <Animated.View key={key} style={[styles.docCard, { opacity: pulseAnim }]}>
            {/* Top Row */}
            <View style={styles.docTopRow}>
              <View style={styles.docIconSkeleton} />
              <View style={styles.docInfo}>
                <View style={styles.docTitleSkeleton} />
                <View style={styles.docMetaSkeleton} />
              </View>
            </View>

            {/* Action Buttons Row */}
            <View style={styles.docActionsRow}>
              <View style={styles.viewBtnSkeleton} />
              <View style={styles.circleBtnSkeleton} />
              <View style={styles.circleBtnSkeleton} />
            </View>
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
  headerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  bannerIconSkeleton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    marginRight: 12,
  },
  bannerInfo: {
    flex: 1,
    gap: 8,
  },
  bannerTitleSkeleton: {
    width: '50%',
    height: 16,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  bannerSubtitleSkeleton: {
    width: '35%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  docList: {
    gap: 12,
  },
  docCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  docTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  docIconSkeleton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    marginRight: 12,
  },
  docInfo: {
    flex: 1,
    gap: 8,
  },
  docTitleSkeleton: {
    width: '65%',
    height: 15,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  docMetaSkeleton: {
    width: '45%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  docActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewBtnSkeleton: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  circleBtnSkeleton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E2E8F0',
  },
});

export default HealthRecordFolderSkeleton;
