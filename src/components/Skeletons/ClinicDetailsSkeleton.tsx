import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import { theme } from '../../styled/theme.styled';

export interface ClinicDetailsSkeletonProps {
  cardOnly?: boolean;
}

export const ClinicDetailsSkeleton: React.FC<ClinicDetailsSkeletonProps> = ({ cardOnly }) => {
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
    <View style={styles.container}>
      {/* Header Profile Skeleton */}
      <View style={styles.headerSection}>
        <View style={styles.headerGradient}>
          <Animated.View style={[styles.profileContainer, { opacity: pulseAnim }]}>
            <View style={styles.iconWrapperSkeleton} />
            <View style={styles.nameSkeleton} />
            <View style={styles.addressBadgeSkeleton} />
          </Animated.View>
        </View>
      </View>

      {/* Cards Content Skeleton */}
      <View style={styles.contentContainer}>
        {/* About Card Skeleton */}
        <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircleSkeleton} />
            <View style={styles.titleSkeleton} />
          </View>
          <View style={styles.lineSkeleton} />
          <View style={[styles.lineSkeleton, { width: '85%' }]} />
          <View style={[styles.lineSkeleton, { width: '60%' }]} />
        </Animated.View>

        {/* Contact Information Card Skeleton */}
        <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircleSkeleton} />
            <View style={styles.titleSkeleton} />
          </View>
          <View style={styles.contactRowSkeleton} />
          <View style={styles.contactRowSkeleton} />
          <View style={styles.contactRowSkeleton} />
        </Animated.View>

        {/* Specialities Card Skeleton */}
        <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircleSkeleton} />
            <View style={styles.titleSkeleton} />
          </View>
          <View style={styles.chipsRowSkeleton}>
            <View style={styles.chipSkeleton} />
            <View style={styles.chipSkeleton} />
            <View style={styles.chipSkeleton} />
          </View>
        </Animated.View>

        {/* Available Doctors Skeleton */}
        <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircleSkeleton} />
            <View style={styles.titleSkeleton} />
          </View>
          <View style={styles.doctorCardSkeleton}>
            <View style={styles.doctorAvatarSkeleton} />
            <View style={styles.doctorInfoSkeleton}>
              <View style={[styles.lineSkeleton, { width: '65%' }]} />
              <View style={[styles.lineSkeleton, { width: '45%' }]} />
            </View>
          </View>
        </Animated.View>
      </View>
    </View>
  );

  if (cardOnly) {
    return content;
  }

  return <SafeAreaWrapper style={styles.screen}>{content}</SafeAreaWrapper>;
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerSection: {
    backgroundColor: theme.colors.primary,
  },
  headerGradient: {
    paddingTop: 24,
    paddingBottom: 32,
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconWrapperSkeleton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: theme.colors.surface,
  },
  nameSkeleton: {
    width: 180,
    height: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 12,
  },
  addressBadgeSkeleton: {
    width: 220,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  contentContainer: {
    padding: 16,
    marginTop: -10,
    gap: 16,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircleSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceBorder,
    marginRight: 12,
  },
  titleSkeleton: {
    width: 140,
    height: 20,
    borderRadius: 6,
    backgroundColor: theme.colors.surfaceBorder,
  },
  lineSkeleton: {
    width: '100%',
    height: 14,
    borderRadius: 4,
    backgroundColor: theme.colors.surfaceBorder,
    marginBottom: 8,
  },
  contactRowSkeleton: {
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  chipsRowSkeleton: {
    flexDirection: 'row',
    gap: 10,
  },
  chipSkeleton: {
    width: 80,
    height: 32,
    borderRadius: 12,
    backgroundColor: theme.colors.primarySoft,
  },
  doctorCardSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  doctorAvatarSkeleton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceBorder,
    marginRight: 12,
  },
  doctorInfoSkeleton: {
    flex: 1,
    gap: 6,
  },
});

export default ClinicDetailsSkeleton;
