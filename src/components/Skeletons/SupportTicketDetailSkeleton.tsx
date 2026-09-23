import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export const SupportTicketDetailSkeleton: React.FC = () => {
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
        <View style={styles.topRow}>
          <View style={styles.avatarSkeleton} />
          <View style={styles.metaCol}>
            <View style={styles.ticketNoSkeleton} />
            <View style={styles.dateSkeleton} />
          </View>
          <View style={styles.statusPillSkeleton} />
        </View>
        <View style={styles.divider} />
        <View style={styles.subjectSkeleton} />
        <View style={styles.emailSkeleton} />
      </Animated.View>

      {/* Description Card Skeleton */}
      <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
        <View style={styles.sectionHeaderSkeleton} />
        <View style={styles.messageBoxSkeleton} />
      </Animated.View>

      {/* Attachments Card Skeleton */}
      <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
        <View style={styles.sectionHeaderSkeleton} />
        <View style={styles.attachmentRow}>
          <View style={styles.attachmentItemSkeleton} />
          <View style={styles.attachmentItemSkeleton} />
        </View>
      </Animated.View>

      {/* Updates Card Skeleton */}
      <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
        <View style={styles.sectionHeaderSkeleton} />
        <View style={styles.replyCardSkeleton} />
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  topRow: {
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
  metaCol: {
    flex: 1,
    gap: 6,
  },
  ticketNoSkeleton: {
    width: '50%',
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  dateSkeleton: {
    width: '65%',
    height: 11,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
  },
  statusPillSkeleton: {
    width: 64,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  subjectSkeleton: {
    width: '80%',
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginBottom: 10,
  },
  emailSkeleton: {
    width: '45%',
    height: 13,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  sectionHeaderSkeleton: {
    width: '40%',
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginBottom: 14,
  },
  messageBoxSkeleton: {
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 4,
    borderLeftColor: '#CBD5E1',
  },
  attachmentRow: {
    gap: 10,
  },
  attachmentItemSkeleton: {
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  replyCardSkeleton: {
    height: 70,
    borderRadius: 12,
    backgroundColor: '#F0FDFA',
  },
});

export default SupportTicketDetailSkeleton;
