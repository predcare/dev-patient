import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export const FamilyMembersSkeleton: React.FC = () => {
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
    <View style={styles.card}>
      {[1, 2, 3].map((item, index) => (
        <Animated.View
          key={item}
          style={[styles.memberRow, index < 2 && styles.memberRowBorder, { opacity: pulseAnim }]}
        >
          <View style={styles.avatarSkeleton} />
          <View style={styles.infoSkeleton}>
            <View style={styles.nameSkeleton} />
            <View style={styles.relationSkeleton} />
          </View>
          <View style={index === 0 ? styles.badgeSkeleton : styles.actionSkeleton} />
        </Animated.View>
      ))}

      <Animated.View style={[styles.addRow, { opacity: pulseAnim }]}>
        <View style={styles.addCircleSkeleton} />
        <View style={styles.addTextSkeleton} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  memberRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  avatarSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    marginRight: 12,
  },
  infoSkeleton: {
    flex: 1,
    gap: 6,
  },
  nameSkeleton: {
    width: '50%',
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  relationSkeleton: {
    width: '28%',
    height: 10,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  badgeSkeleton: {
    width: 46,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    marginRight: 4,
  },
  actionSkeleton: {
    width: 60,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    marginRight: 4,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  addCircleSkeleton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    marginRight: 12,
  },
  addTextSkeleton: {
    width: '40%',
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
});

export default FamilyMembersSkeleton;
