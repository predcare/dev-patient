import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { queryClient } from '../components/providers/ReactQueryProvider';
import { _projectToken } from '../config/keys.constants';
import { getUserProfile } from '../hooks/react-query/profile/profile.funcs';
import { UserQueryEnum } from '../hooks/react-query/query.keys';
import { SafeAreaWrapper } from '../Layout/SafeAreaWrapper';
import type { SplashScreenNavigationProp, SplashScreenRouteProp } from '../route';
import { resetToLogin, resetToMainTabs } from '../lib/common/navigation.utils';
import { theme } from '../styled/theme.styled';
import { useAuthStore } from '../zustand/stores/useAuthStore';

export interface SplashScreenProps {
  navigation?: SplashScreenNavigationProp;
  route?: SplashScreenRouteProp;
  onFinish?: (isAuthenticated: boolean) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation, onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const setUserData = useAuthStore(state => state.setUserData);
  const logout = useAuthStore(state => state.logout);

  useEffect(() => {
    // 1. Fade in and scale animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Pulse animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    let isAuthenticated = false;

    // 3. Authenticate and load profile
    const authenticateAndLoad = async () => {
      try {
        const token = await AsyncStorage.getItem(_projectToken);
        if (token) {
          const res = await queryClient.fetchQuery({
            queryKey: [UserQueryEnum.PROFILE],
            queryFn: getUserProfile,
          });

          if (res?.data && (res?.success || res?.status === 200)) {
            setUserData(res.data);
            isAuthenticated = true;
          } else {
            logout();
          }
        } else {
          logout();
        }
      } catch (error) {
        console.error('[SplashScreen] Profile auto-login error:', error);
        logout();
      }
    };

    const minTimer = new Promise(resolve => setTimeout(resolve, 2200));

    Promise.all([authenticateAndLoad(), minTimer]).then(() => {
      if (onFinish) {
        onFinish(isAuthenticated);
      } else if (navigation) {
        if (isAuthenticated) {
          resetToMainTabs(navigation);
        } else {
          resetToLogin(navigation);
        }
      }
    });
  }, [fadeAnim, scaleAnim, pulseAnim, navigation, onFinish, setUserData, logout]);

  return (
    <SafeAreaWrapper backgroundColor={theme.colors.primaryDark} barStyle="light-content">
      <View style={styles.container}>
        {/* Background Gradient Circles */}
        <View style={styles.circleContainer}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
        </View>

        {/* Logo and Title Container */}
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Logo/Icon */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/logo2.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* App Title */}
          <Text style={styles.tagline}>Your Health, Secured & Protected</Text>
        </Animated.View>

        {/* Animated Loading Indicator */}
        <Animated.View
          style={[
            styles.loaderContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <View style={styles.loadingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by PredCare</Text>
        </View>
      </View>
    </SafeAreaWrapper>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },

  // Background Circles
  circleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.08,
  },
  circle1: {
    width: 300,
    height: 300,
    backgroundColor: '#007AFF',
    top: -100,
    right: -100,
  },
  circle2: {
    width: 250,
    height: 250,
    backgroundColor: '#007AFF',
    bottom: -50,
    left: -80,
  },
  circle3: {
    width: 200,
    height: 200,
    backgroundColor: '#007AFF',
    top: '40%',
    left: '50%',
    marginLeft: -100,
    marginTop: -100,
    opacity: 0.05,
  },

  // Content
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E6F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    width: 110,
    height: 110,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#007AFF',
    letterSpacing: 1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: '#8E8E93',
    letterSpacing: 0.5,
  },

  // Loader
  loaderContainer: {
    position: 'absolute',
    bottom: 120,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 50,
  },
  footerText: {
    fontSize: 13,
    color: '#C7C7CC',
    letterSpacing: 0.5,
  },
});
