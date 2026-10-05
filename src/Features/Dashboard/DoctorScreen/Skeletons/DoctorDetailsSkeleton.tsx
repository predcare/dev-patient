import React, { useEffect, useRef } from 'react';
import { Animated, SafeAreaView, StyleSheet, View } from 'react-native';

export interface DoctorDetailsSkeletonProps {
  cardOnly?: boolean;
}

export const DoctorDetailsSkeleton: React.FC<DoctorDetailsSkeletonProps> = ({ cardOnly }) => {
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

  const content = (
    <View style={styles.contentPadding}>
      {/* Avatar & Profile Header Skeleton */}
      <Animated.View style={[styles.profileHeader, { opacity: pulseAnim }]}>
        <View style={styles.avatarSkeleton} />
        <View style={styles.nameSkeleton} />
        <View style={styles.titleLineSkeleton} />
        <View style={styles.metaLineSkeleton} />
      </Animated.View>

      {/* Stats Row Skeleton */}
      <View style={styles.statsRow}>
        <Animated.View style={[styles.statCardSkeleton, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.statCardSkeleton, { opacity: pulseAnim }]} />
      </View>

      {/* Section Title & Bio Skeleton */}
      <View style={styles.sectionTitleSkeleton} />
      <Animated.View style={[styles.cardSkeleton, { opacity: pulseAnim }]}>
        <View style={styles.textLineSkeleton} />
        <View style={[styles.textLineSkeleton, { width: '85%' }]} />
        <View style={[styles.textLineSkeleton, { width: '60%' }]} />
      </Animated.View>

      {/* Clinical Locations Skeleton */}
      <View style={styles.sectionTitleSkeleton} />
      <Animated.View style={[styles.clinicCardSkeleton, { opacity: pulseAnim }]}>
        <View style={styles.nameSkeleton} />
        <View style={[styles.textLineSkeleton, { width: '90%', marginTop: 8 }]} />
        <View style={styles.dateRowSkeleton}>
          <View style={styles.dateChipSkeleton} />
          <View style={styles.dateChipSkeleton} />
          <View style={styles.dateChipSkeleton} />
        </View>
        <View style={styles.btnSkeleton} />
      </Animated.View>
    </View>
  );

  if (cardOnly) {
    return content;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar Skeleton */}
      <View style={styles.header}>
        <View style={styles.backBtnCircle} />
        <View style={styles.headerTitleSkeleton} />
      </View>

      {content}
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
  contentPadding: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarSkeleton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E2E8F0',
    marginBottom: 14,
  },
  nameSkeleton: {
    width: 180,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    marginBottom: 8,
  },
  titleLineSkeleton: {
    width: 140,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    marginBottom: 6,
  },
  metaLineSkeleton: {
    width: 120,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCardSkeleton: {
    flex: 1,
    height: 70,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionTitleSkeleton: {
    width: 150,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
  },
  cardSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 20,
    gap: 8,
  },
  clinicCardSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 14,
  },
  textLineSkeleton: {
    width: '100%',
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  dateRowSkeleton: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 14,
  },
  dateChipSkeleton: {
    width: 76,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  btnSkeleton: {
    width: '100%',
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
});

export default DoctorDetailsSkeleton;
