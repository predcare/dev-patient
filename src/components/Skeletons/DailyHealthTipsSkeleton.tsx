import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.72;

export const DailyHealthTipsSkeleton: React.FC = () => {
  const pulse = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.8, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  return (
    <View style={styles.scrollContent}>
      {[1, 2].map(key => (
        <Animated.View key={key} style={[styles.card, { opacity: pulse }]}>
          <View style={styles.skeletonIcon} />
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonDesc} />
          <View style={[styles.skeletonDesc, { width: '60%' }]} />
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  skeletonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    marginBottom: 12,
  },
  skeletonTitle: {
    height: 16,
    width: '70%',
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginBottom: 8,
  },
  skeletonDesc: {
    height: 12,
    width: '90%',
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginBottom: 6,
  },
});

export default DailyHealthTipsSkeleton;
