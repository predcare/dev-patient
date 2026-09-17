import React, { useEffect, useRef } from 'react';
import { Animated, SafeAreaView, StyleSheet, View } from 'react-native';

export interface DoctorSearchSkeletonProps {
  cardOnly?: boolean;
}

export const DoctorSearchSkeleton: React.FC<DoctorSearchSkeletonProps> = ({ cardOnly }) => {
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

  const cardsList = (
    <View style={styles.listPadding}>
      {[1, 2, 3, 4].map(key => (
        <Animated.View key={key} style={[styles.cardSkeleton, { opacity: pulseAnim }]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.avatarSkeleton} />
            <View style={styles.headerInfoSkeleton}>
              <View style={styles.nameLineSkeleton} />
              <View style={styles.specLineSkeleton} />
              <View style={styles.locationLineSkeleton} />
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardFooterRow}>
            <View style={styles.badgeSkeleton} />
            <View style={styles.actionBtnSkeleton} />
          </View>
        </Animated.View>
      ))}
    </View>
  );

  if (cardOnly) {
    return cardsList;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar Skeleton */}
      <View style={styles.header}>
        <View style={styles.backBtnCircle} />
        <View style={styles.headerTitleSkeleton} />
      </View>

      {/* Search & Filter Chrome Skeleton */}
      <View style={styles.chromePadding}>
        <View style={styles.searchBoxSkeleton} />

        <View style={styles.pillRowSkeleton}>
          <View style={styles.pillSkeleton} />
          <View style={styles.pillSkeleton} />
          <View style={styles.pillSkeleton} />
        </View>

        <View style={styles.toggleRowSkeleton}>
          <View style={styles.toggleCardSkeleton} />
          <View style={styles.toggleCardSkeleton} />
        </View>

        <View style={styles.sectionTitleSkeleton} />
      </View>

      {/* Card Skeletons */}
      {cardsList}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  backBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
  },
  headerTitleSkeleton: {
    width: 140,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
  chromePadding: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchBoxSkeleton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    marginBottom: 14,
  },
  pillRowSkeleton: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  pillSkeleton: {
    width: 90,
    height: 34,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  toggleRowSkeleton: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  toggleCardSkeleton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  sectionTitleSkeleton: {
    width: 180,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
  },
  listPadding: {
    paddingHorizontal: 16,
  },
  cardSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSkeleton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E2E8F0',
    marginRight: 14,
  },
  headerInfoSkeleton: {
    flex: 1,
    gap: 8,
  },
  nameLineSkeleton: {
    width: '70%',
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  specLineSkeleton: {
    width: '50%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  locationLineSkeleton: {
    width: '40%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeSkeleton: {
    width: 80,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  actionBtnSkeleton: {
    width: 100,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
});

export default DoctorSearchSkeleton;
