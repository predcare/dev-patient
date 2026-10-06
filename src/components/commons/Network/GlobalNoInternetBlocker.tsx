import NetInfo from '@react-native-community/netinfo';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { navigate } from '../../../navigation/navigationRef';
import { AppRoute } from '../../../route';
import { noInternetBlockerStyles as styles } from '../../../styled/NoInternetBlocker.styled';
import { useMeetingStore } from '../../../zustand/stores/useMeetingStore';
import { useNetworkStore } from '../../../zustand/stores/useNetworkStore';

const WifiOffLargeIcon = () => (
  <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 1L23 23M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"
      stroke="#FFFFFF"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const GlobalNoInternetBlocker: React.FC = () => {
  const insets = useSafeAreaInsets();
  const isOffline = useNetworkStore(state => state.isOffline);
  const setNetworkState = useNetworkStore(state => state.setNetworkState);
  const meetingCallState = useMeetingStore(state => state.callState);
  const resetMeetingStore = useMeetingStore(state => state.resetMeetingStore);

  const [isRetrying, setIsRetrying] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;

  const handleManualRetry = async () => {
    if (isRetrying) return;
    setIsRetrying(true);
    try {
      const state = await NetInfo.fetch();
      setNetworkState(state);
    } catch (error) {
      console.warn('[GlobalNoInternetBlocker] Retry failed:', error);
    } finally {
      setTimeout(() => {
        setIsRetrying(false);
      }, 500);
    }
  };

  const isInsideMeeting = meetingCallState !== 'IDLE' && meetingCallState !== 'ENDED';

  const handleEmergencyLeaveMeeting = () => {
    resetMeetingStore();
    navigate(AppRoute.HOME);
  };

  // Intercept Android hardware back button so user cannot escape broken screens while offline
  useEffect(() => {
    if (!isOffline) return;

    const backSubscription = BackHandler.addEventListener('hardwareBackPress', () => {
      // Consume the event to prevent back-navigation
      return true;
    });

    return () => {
      backSubscription.remove();
    };
  }, [isOffline]);

  // Smooth fade animation
  useEffect(() => {
    if (isOffline) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isOffline, opacity]);

  if (!isOffline) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom, 16),
          opacity,
        },
      ]}
      pointerEvents="auto"
    >
      <View style={styles.content}>
        <View style={styles.iconOuterCircle}>
          <View style={styles.iconInnerCircle}>
            <WifiOffLargeIcon />
          </View>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>Offline Mode</Text>
        </View>

        <Text style={styles.title}>No Internet Connection</Text>

        <Text style={styles.description}>
          PredCare requires an active connection to synchronize health records, consult with
          doctors, and manage appointments securely.
        </Text>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Troubleshooting Tips</Text>
          <View style={styles.tipRow}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>Check Wi-Fi or Cellular data connection</Text>
          </View>
          <View style={styles.tipRow}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>Ensure Airplane Mode is turned off</Text>
          </View>
          <View style={styles.tipRow}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>Try restarting your router or network switch</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.retryButton, isRetrying && styles.retryButtonDisabled]}
          activeOpacity={0.8}
          onPress={handleManualRetry}
          disabled={isRetrying}
        >
          {isRetrying ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.retryButtonText}>Retry Connection</Text>
          )}
        </TouchableOpacity>

        {isInsideMeeting && (
          <TouchableOpacity
            style={styles.leaveMeetingButton}
            activeOpacity={0.8}
            onPress={handleEmergencyLeaveMeeting}
          >
            <Text style={styles.leaveMeetingButtonText}>Exit Ongoing Consultation</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

export default GlobalNoInternetBlocker;
