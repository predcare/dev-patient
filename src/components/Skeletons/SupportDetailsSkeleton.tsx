import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { theme } from '../../styled/theme.styled';

export const SupportDetailsSkeleton: React.FC = () => {
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
      {/* Overview Card Skeleton */}
      <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
        <View style={styles.overviewTop}>
          <View style={styles.avatarSkeleton} />
          <View style={styles.metaSkeleton}>
            <View style={styles.ticketNoSkeleton} />
            <View style={styles.dateSkeleton} />
          </View>
          <View style={styles.statusPillSkeleton} />
        </View>

        <View style={styles.divider} />

        <View style={styles.subjectRow}>
          <View style={styles.labelSkeleton} />
          <View style={styles.valSkeleton} />
        </View>

        <View style={styles.emailRow}>
          <View style={styles.iconSkeleton} />
          <View style={styles.emailSkeleton} />
        </View>
      </Animated.View>

      {/* Description Section Skeleton */}
      <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.iconSkeleton} />
          <View style={styles.sectionTitleSkeleton} />
        </View>
        <View style={styles.messageBoxSkeleton}>
          <View style={styles.textLine1} />
          <View style={styles.textLine2} />
          <View style={styles.textLine3} />
        </View>
      </Animated.View>

      {/* Attachments Section Skeleton */}
      <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleSkeleton} />
        </View>
        <View style={styles.attItemSkeleton}>
          <View style={styles.attThumbSkeleton} />
          <View style={styles.attMetaSkeleton}>
            <View style={styles.valSkeleton} />
            <View style={styles.labelSkeleton} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  card: {
    backgroundColor: theme.colors.surface || '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder || '#F1F5F9',
    marginBottom: 16,
  },
  overviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarSkeleton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
  },
  metaSkeleton: {
    flex: 1,
    gap: 6,
  },
  ticketNoSkeleton: {
    width: 140,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  dateSkeleton: {
    width: 100,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  statusPillSkeleton: {
    width: 68,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.surfaceBorder || '#F1F5F9',
    marginVertical: 14,
  },
  subjectRow: {
    gap: 6,
    marginBottom: 10,
  },
  labelSkeleton: {
    width: 60,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  valSkeleton: {
    width: '70%',
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  iconSkeleton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  emailSkeleton: {
    width: 150,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitleSkeleton: {
    width: 130,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  messageBoxSkeleton: {
    backgroundColor: theme.colors.inputBg || '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  textLine1: {
    width: '95%',
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  textLine2: {
    width: '85%',
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  textLine3: {
    width: '50%',
    height: 14,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  attItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBg || '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    gap: 12,
  },
  attThumbSkeleton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  attMetaSkeleton: {
    flex: 1,
    gap: 6,
  },
});

export default SupportDetailsSkeleton;
