import NetInfo from '@react-native-community/netinfo';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { offlineBannerStyles as styles } from '../../../styled/OfflineBanner.styled';
import { useNetworkStore } from '../../../zustand/stores/useNetworkStore';

const WifiOffIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 1L23 23M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"
      stroke="#FFFFFF"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CheckIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17L4 12"
      stroke="#FFFFFF"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const GlobalOfflineBanner: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { isOffline, wasOffline, setNetworkState, dismissWasOffline } = useNetworkStore();

  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<any | null>(null);

  const isVisible = wasOffline && !isOffline;

  // Animate banner show/hide
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

  // When connection is restored, auto-dismiss the "Back Online" message after 2.5s
  useEffect(() => {
    if (wasOffline && !isOffline) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        dismissWasOffline();
      }, 2500);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [wasOffline, isOffline, dismissWasOffline]);

  const handleManualRetry = async () => {
    try {
      const state = await NetInfo.fetch();
      setNetworkState(state);
    } catch (e) {
      console.warn('[GlobalOfflineBanner] Network retry error:', e);
    }
  };

  const topOffset = Math.max(insets.top, 12) + 6;

  return (
    <View
      style={[styles.wrapper, { top: topOffset }]}
      pointerEvents={isVisible ? 'box-none' : 'none'}
    >
      <Animated.View
        style={[
          styles.bannerContainer,
          isOffline ? styles.bannerOffline : styles.bannerOnline,
          {
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        <View style={styles.contentRow}>
          <View style={styles.iconBadge}>
            {isOffline ? <WifiOffIcon /> : <CheckIcon />}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>
              {isOffline ? 'No Internet Connection' : 'Back Online'}
            </Text>
            <Text style={styles.subtitleText} numberOfLines={1}>
              {isOffline
                ? 'Some features may be temporarily unavailable.'
                : 'Connection restored. Resyncing data...'}
            </Text>
          </View>
        </View>

        {isOffline && (
          <TouchableOpacity
            style={styles.retryButton}
            activeOpacity={0.75}
            onPress={handleManualRetry}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

export default GlobalOfflineBanner;
