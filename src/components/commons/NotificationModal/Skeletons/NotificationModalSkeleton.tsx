import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import notificationModalSkeletonStyles from '../../../../styled/NotificationModalSkeleton.styled';

const PLACEHOLDERS = [0, 1, 2, 3];

export const NotificationModalSkeleton: React.FC = () => {
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
    <View style={notificationModalSkeletonStyles.list}>
      {PLACEHOLDERS.map(item => (
        <Animated.View
          key={item}
          style={[notificationModalSkeletonStyles.card, { opacity: pulseAnim }]}
        >
          <View style={notificationModalSkeletonStyles.icon} />
          <View style={notificationModalSkeletonStyles.body}>
            <View style={notificationModalSkeletonStyles.title} />
            <View style={notificationModalSkeletonStyles.line} />
            <View
              style={[
                notificationModalSkeletonStyles.line,
                notificationModalSkeletonStyles.shortLine,
              ]}
            />
            <View style={notificationModalSkeletonStyles.time} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
};

export default NotificationModalSkeleton;
