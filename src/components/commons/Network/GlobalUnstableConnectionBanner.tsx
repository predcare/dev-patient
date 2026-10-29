import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { offlineBannerStyles as styles } from '../../../styled/OfflineBanner.styled';
import { useNetworkStore } from '../../../zustand/stores/useNetworkStore';

const WeakSignalIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12.55a11 11 0 0 1 14.08 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"
      stroke="#FFFFFF"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/** Shown on every screen (including the meeting) while the connection is online but too weak. */
export const GlobalUnstableConnectionBanner: React.FC = () => {
  const insets = useSafeAreaInsets();
  const isUnstable = useNetworkStore(state => state.isUnstable);
  const isOffline = useNetworkStore(state => state.isOffline);
  const wasOffline = useNetworkStore(state => state.wasOffline);

  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Offline and "Back Online" have their own banner and blocker.
  const isVisible = isUnstable && !isOffline && !wasOffline;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 6,
          speed: 12,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, opacity, translateY]);

  const topOffset = Math.max(insets.top, 12) + 6;

  return (
    <View style={[styles.wrapper, { top: topOffset }]} pointerEvents="none">
      <Animated.View
        style={[
          styles.bannerContainer,
          styles.bannerUnstable,
          {
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        <View style={styles.contentRow}>
          <View style={styles.iconBadge}>
            <WeakSignalIcon />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>Unstable Connection</Text>
            <Text style={styles.subtitleText} numberOfLines={1}>
              Your internet is weak. Things may load slowly.
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default GlobalUnstableConnectionBanner;
