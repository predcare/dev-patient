import { StackActions } from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import { BackHandler, Platform, ToastAndroid } from 'react-native';
import { navigationRef } from '../../navigation/navigationRef';
import { AppRoute } from '../../route';
import { useMeetingStore } from '../../zustand/stores/useMeetingStore';

/**
 * Bottom tab routes that should redirect to Home when back is pressed.
 */
const TAB_ROUTES = new Set<string>([
  AppRoute.DOCTORS,
  AppRoute.SCHEDULE,
  AppRoute.REPORTS,
  AppRoute.ACCOUNT,
  'MainTabs',
]);

export const useGlobalAndroidBackHandler = () => {
  const lastBackPressTimeRef = useRef<number>(0);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onHardwareBackPress = (): boolean => {
      if (!navigationRef.isReady()) {
        return false;
      }

      const currentRoute = navigationRef.getCurrentRoute();
      const currentRouteName = currentRoute?.name;

      if (!currentRouteName) {
        return false;
      }

      console.log('[BackHandler] onHardwareBackPress triggered! route:', currentRouteName, 'canGoBack:', navigationRef.canGoBack());

      // 1. Splash screen -> Exit naturally if still initializing
      if (currentRouteName === AppRoute.SPLASH) {
        return false;
      }

      // 2. Home screen (or Root Login screen) -> Double back-to-exit protection (ALWAYS prioritize Home as root, never loop)
      if (currentRouteName === AppRoute.HOME || currentRouteName === AppRoute.LOGIN) {
        const now = Date.now();
        if (now - lastBackPressTimeRef.current < 2000) {
          BackHandler.exitApp();
          return true;
        }

        lastBackPressTimeRef.current = now;
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        return true;
      }

      // 3. Meeting screen -> Always switch to In-App PiP if active and navigate to Schedule
      if (currentRouteName === AppRoute.MEETING) {
        const meetingState = useMeetingStore.getState();
        const isCallActive =
          (meetingState.callState === 'CONNECTED' || meetingState.callState === 'CONNECTING') &&
          Boolean(meetingState.token && meetingState.meetingId);

        if (isCallActive) {
          meetingState.setIsInAppPip(true);
        }

        try {
          (navigationRef as any).dispatch(StackActions.replace(AppRoute.SCHEDULE));
        } catch {
          (navigationRef as any).navigate(AppRoute.SCHEDULE);
        }
        return true;
      }

      // 4. Tab screens (Schedule, Doctors, Reports, Account) -> Cleanly jump back to Home (clearing tab loops)
      if (TAB_ROUTES.has(currentRouteName)) {
        try {
          navigationRef.reset({
            index: 0,
            routes: [{ name: AppRoute.HOME }],
          });
        } catch {
          (navigationRef as any).navigate(AppRoute.HOME);
        }
        return true;
      }

      // 5. Sub-screens / Stack screens -> Go back if history exists
      if (navigationRef.canGoBack()) {
        navigationRef.goBack();
        return true;
      }

      // 6. Fallback: Any other detached screen -> Reset to Home cleanly
      try {
        navigationRef.reset({
          index: 0,
          routes: [{ name: AppRoute.HOME }],
        });
      } catch {
        (navigationRef as any).navigate(AppRoute.HOME);
      }
      return true;
    };

    const backHandlerSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onHardwareBackPress
    );

    return () => {
      backHandlerSubscription.remove();
    };
  }, []);
};

export default useGlobalAndroidBackHandler;
