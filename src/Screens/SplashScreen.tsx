import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { fetchProfileQuery } from '../hooks/react-query/profile/profile.hooks';
import { SafeAreaWrapper } from '../Layout/SafeAreaWrapper';
import { getItem, STORAGE_KEYS } from '../lib/common/asyncStorage';
import { resetAndNavigate, resetToLogin, resetToMainTabs } from '../lib/common/navigation.utils';
import type { SplashScreenNavigationProp, SplashScreenRouteProp } from '../route';
import { AppRoute } from '../route';
import { theme } from '../styled/theme.styled';
import { useAuthStore } from '../zustand/stores/useAuthStore';

export interface SplashScreenProps {
  navigation?: SplashScreenNavigationProp;
  route?: SplashScreenRouteProp;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const setUserData = useAuthStore(state => state.setUserData);
  const logout = useAuthStore(state => state.logout);

  useEffect(() => {
    // Fade in and scale animation
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

    // Pulse animation loop
    const pulseLoop = Animated.loop(
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
    );
    pulseLoop.start();

    let isMounted = true;

    const authenticateAndLoad = async () => {
      try {
        const token = await getItem(STORAGE_KEYS.AUTH_TOKEN);

        if (!token) {
          await logout();
          if (isMounted) {
            resetToLogin(navigation);
          }
          return;
        }

        const res = await fetchProfileQuery();

        if (!isMounted) return;

        if (res?.data) {
          setUserData(res.data);
          const userData = res.data;

          if (!userData.email_verified_at) {
            resetAndNavigate(navigation, AppRoute.EMAIL_VERIFY);
          } else if (userData.email_verified_at && !userData.has_accepted_policies) {
            resetAndNavigate(navigation, AppRoute.POLICY_ACCEPTANCE);
          } else {
            resetToMainTabs(navigation);
          }
        } else {
          await logout();
          resetToLogin(navigation);
        }
      } catch (error) {
        console.error('[SplashScreen] Profile auto-login error:', error);
        await logout();
        if (isMounted) {
          resetToLogin(navigation);
        }
      }
    };

    authenticateAndLoad();

    return () => {
      isMounted = false;
      pulseLoop.stop();
      fadeAnim.stopAnimation();
      scaleAnim.stopAnimation();
      pulseAnim.stopAnimation();
    };
  }, [navigation, fadeAnim, scaleAnim, pulseAnim, setUserData, logout]);

  return (
    <SafeAreaWrapper backgroundColor={theme.colors.primaryDark} barStyle="light-content">
      <View style={styles.container}>
        <View style={styles.circleContainer}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
        </View>
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/logo2.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.tagline}>Your Health, Secured & Protected</Text>
        </Animated.View>
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
