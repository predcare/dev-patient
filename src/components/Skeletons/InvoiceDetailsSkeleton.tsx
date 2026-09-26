import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { theme } from '../../styled/theme.styled';

export const InvoiceDetailsSkeleton: React.FC = () => {
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
      {/* 1. Category / Appointment banner skeleton */}
      <Animated.View style={[styles.card, styles.bannerCard, { opacity: pulseAnim }]}>
        <View style={styles.titleLine} />
        <View style={[styles.subLine, { width: '50%' }]} />
      </Animated.View>

      {/* 2. Clinic / Doctor Info card skeleton */}
      <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
        <View style={[styles.titleLine, { width: '70%', height: 16 }]} />
        <View style={[styles.subLine, { width: '90%', marginTop: 8 }]} />
        <View style={[styles.subLine, { width: '60%', marginTop: 6 }]} />
      </Animated.View>

      {/* 3. Patient & Billing breakdown skeleton */}
      <Animated.View style={[styles.breakdownCard, { opacity: pulseAnim }]}>
        {[1, 2, 3, 4].map(i => (
          <View key={i} style={styles.rowBetween}>
            <View style={[styles.subLine, { width: 90 }]} />
            <View style={[styles.subLine, { width: 110 }]} />
          </View>
        ))}
      </Animated.View>

      {/* 4. Items skeleton */}
      <Animated.View style={[styles.card, { opacity: pulseAnim, marginTop: 14 }]}>
        <View style={[styles.titleLine, { width: 130, marginBottom: 12 }]} />
        <View style={styles.rowBetween}>
          <View>
            <View style={[styles.titleLine, { width: 160 }]} />
            <View style={[styles.subLine, { width: 100, marginTop: 4 }]} />
          </View>
          <View style={[styles.titleLine, { width: 60 }]} />
        </View>
      </Animated.View>

      {/* 5. Total breakdown skeleton */}
      <Animated.View style={[styles.breakdownCard, { opacity: pulseAnim, marginTop: 14 }]}>
        <View style={styles.rowBetween}>
          <View style={[styles.subLine, { width: 70 }]} />
          <View style={[styles.subLine, { width: 60 }]} />
        </View>
        <View style={styles.divider} />
        <View style={styles.rowBetween}>
          <View style={[styles.titleLine, { width: 90, height: 18 }]} />
          <View style={[styles.titleLine, { width: 80, height: 18 }]} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bannerCard: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.tealBdr,
  },
  breakdownCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  titleLine: {
    height: 14,
    width: '60%',
    backgroundColor: '#CBD5E1',
    borderRadius: 6,
  },
  subLine: {
    height: 12,
    width: '40%',
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
});

export default InvoiceDetailsSkeleton;
