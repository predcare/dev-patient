import { RootStackParamList } from '../../route';

export interface GenericNavigation {
  reset?: (state: any) => void;
  navigate?: (name: string, params?: any) => void;
  [key: string]: any;
}

/**
 * Safely resets the navigation stack to a target route, falling back to navigate() if reset is unavailable.
 */
export const resetAndNavigate = <K extends keyof RootStackParamList>(
  navigation?: GenericNavigation,
  routeName: K = 'MainTabs' as K,
  params?: RootStackParamList[K]
): void => {
  if (!navigation) return;

  if (typeof navigation.reset === 'function') {
    navigation.reset({
      index: 0,
      routes: [{ name: routeName as string, params }],
    });
  } else if (typeof navigation.navigate === 'function') {
    navigation.navigate(routeName as string, params);
  }
};

/**
 * Helper to reset navigation stack specifically to MainTabs.
 */
export const resetToMainTabs = (navigation?: GenericNavigation): void => {
  resetAndNavigate(navigation, 'MainTabs');
};

/**
 * Helper to reset navigation stack specifically to Login.
 */
export const resetToLogin = (navigation?: GenericNavigation): void => {
  resetAndNavigate(navigation, 'Login');
};
