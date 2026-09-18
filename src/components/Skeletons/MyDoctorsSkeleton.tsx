import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export const MyDoctorsSkeleton: React.FC = () => {
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
        <Animated.View key={key} style={[styles.cardSkeleton, { opacity: pulseAnim }]}>
          <View style={styles.mainInfo}>
            <View style={styles.avatarSkeleton} />
            <View style={styles.detailsSkeleton}>
              <View style={styles.nameSkeleton} />
              <View style={styles.specSkeleton} />
              <View style={styles.clinicSkeleton} />
            </View>
          </View>
          <View style={styles.actionRow}>
            <View style={styles.btnSkeleton} />
            <View style={styles.btnSkeleton} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  cardSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  mainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarSkeleton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E2E8F0',
  },
  detailsSkeleton: {
    flex: 1,
    gap: 6,
  },
  nameSkeleton: {
    width: '65%',
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  specSkeleton: {
    width: '45%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  clinicSkeleton: {
    width: '55%',
    height: 11,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  btnSkeleton: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
});

export default MyDoctorsSkeleton;
