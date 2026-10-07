import React, { useEffect, useRef } from 'react';
import { Animated, Image, Text, View } from 'react-native';
import { queryClient } from '../../components/providers/ReactQueryProvider';
import { APP_BUILD, APP_VERSION } from '../../config/constants';
import { getProfile } from '../../hooks/react-query/profile/profile.funcs';
import { ProfileQueryKeys } from '../../hooks/react-query/query.keys';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import { getItem, STORAGE_KEYS } from '../../lib/common/asyncStorage';
import { consumeTargetRoute, resetAndNavigate, resetToLogin, resetToMainTabs } from '../../lib/common/navigation.utils';
import { AppRoute, SplashScreenNavigationProp, SplashScreenRouteProp } from '../../route';
import { Splashstyles } from '../../styled/SplashScreen.styled';
import { useAuthStore } from '../../zustand/stores/useAuthStore';

export interface SplashScreenProps {
  navigation?: SplashScreenNavigationProp;
  route?: SplashScreenRouteProp;
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation, onFinish }) => {
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
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation
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
          logout();
          return null;
        }

        const res = await queryClient.fetchQuery({
          queryKey: [ProfileQueryKeys.Profile],
          queryFn: getProfile,
        });

        if (res?.data) {
          setUserData(res.data);
          return res.data;
        } else {
          logout();
          return null;
        }
      } catch (error) {
        console.error('[SplashScreen] Profile auto-login error:', error);
        logout();
        return null;
      }
    };

    const startAuthentication = async () => {
      if (!isMounted) return;
      const patientData = await authenticateAndLoad();
      if (onFinish) {
        onFinish();
      } else if (navigation) {
        if (patientData) {
          if (!patientData?.email_verified_at) {
            resetAndNavigate(navigation, AppRoute.EMAIL_VERIFY);
          } else if (patientData?.email_verified_at && !patientData.has_accepted_policies) {
            resetAndNavigate(navigation, AppRoute.POLICY_ACCEPTANCE);
          } else {
            const target = consumeTargetRoute();
            if (target && target.name !== AppRoute.HOME) {
              navigation?.reset({ index: 0, routes: [target as any] });
            } else {
              resetToMainTabs(navigation);
            }
          }
        } else {
          resetToLogin(navigation);
        }
      }
    };

    startAuthentication();

    return () => {
      isMounted = false;
      pulseLoop.stop();
      fadeAnim.stopAnimation();
      scaleAnim.stopAnimation();
      pulseAnim.stopAnimation();
    };
  }, [fadeAnim, scaleAnim, pulseAnim, navigation, onFinish, setUserData, logout]);

  return (
    <SafeAreaWrapper backgroundColor="#FFFFFF" fullBleed={true}>
      <View style={Splashstyles.container}>
        <View style={Splashstyles.circleContainer}>
          <View style={[Splashstyles.circle, Splashstyles.circle1]} />
          <View style={[Splashstyles.circle, Splashstyles.circle2]} />
          <View style={[Splashstyles.circle, Splashstyles.circle3]} />
        </View>

        <Animated.View
          style={[
            Splashstyles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={Splashstyles.logoContainer}>
            <Image
              source={require('../../assets/logo2.png')}
              style={Splashstyles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={Splashstyles.tagline}>Your Health, Secured & Protected</Text>
        </Animated.View>

        <Animated.View
          style={[
            Splashstyles.loaderContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <View style={Splashstyles.loadingDots}>
            <View style={[Splashstyles.dot, Splashstyles.dot1]} />
            <View style={[Splashstyles.dot, Splashstyles.dot2]} />
            <View style={[Splashstyles.dot, Splashstyles.dot3]} />
          </View>
        </Animated.View>

        <View style={Splashstyles.footer}>
          <Text style={Splashstyles.footerText}>Powered by PRED Care</Text>
          <Text style={Splashstyles.versionText}>v{APP_VERSION} (Build {APP_BUILD})</Text>
        </View>
      </View>
    </SafeAreaWrapper>
  );
};

export default SplashScreen;
