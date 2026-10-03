import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export const SupportTicketsSkeleton: React.FC = () => {
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
      {[1, 2, 3, 4, 5].map(key => (
        <Animated.View key={key} style={[styles.card, { opacity: pulseAnim }]}>
          <View style={styles.avatarSkeleton} />
          <View style={styles.cardBody}>
            <View style={styles.ticketIdSkeleton} />
            <View style={styles.subjectSkeleton} />
            <View style={styles.dateSkeleton} />
          </View>
          <View style={styles.statusPillSkeleton} />
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  avatarSkeleton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
  },
  cardBody: {
    flex: 1,
    gap: 6,
  },
  ticketIdSkeleton: {
    width: '40%',
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  subjectSkeleton: {
    width: '75%',
    height: 13,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  dateSkeleton: {
    width: '50%',
    height: 10,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
    marginTop: 2,
  },
  statusPillSkeleton: {
    width: 64,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },
});

export default SupportTicketsSkeleton;
