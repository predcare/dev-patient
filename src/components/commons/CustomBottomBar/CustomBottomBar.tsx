import { StackActions, useNavigation, useNavigationState } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { navigationRef } from '../../../navigation/navigationRef';
import { DashboardTabParamList, RootStackParamList } from '../../../route';
import { navigationStyles } from '../../../styled/Navigation.styled';
import { theme } from '../../../styled/theme.styled';
import { HomeIcon, PatientsIcon, ReportsIcon, ScheduleIcon, SettingsIcon } from '../../ui/icons';

export type TabKey = keyof DashboardTabParamList;

export interface TabConfig {
  key: TabKey;
  label: string;
  icon: (props: { color: string; size: number }) => React.ReactNode;
}

export const BASE_TAB_BAR_HEIGHT = 60;

export const getBottomBarHeight = (bottomInset: number = 0): number => {
  const extraBottom = bottomInset > 0 ? bottomInset : 8;
  return BASE_TAB_BAR_HEIGHT + extraBottom;
};

export const BOTTOM_BAR_TABS: TabConfig[] = [
  {
    key: 'Home',
    label: 'Home',
    icon: ({ color, size }) => <HomeIcon size={size} color={color} />,
  },
  {
    key: 'Doctors',
    label: 'Doctors',
    icon: ({ color, size }) => <PatientsIcon size={size} color={color} />,
  },
  {
    key: 'Schedule',
    label: 'Schedule',
    icon: ({ color, size }) => <ScheduleIcon size={size} color={color} />,
  },
  {
    key: 'Reports',
    label: 'Reports',
    icon: ({ color, size }) => <ReportsIcon size={size} color={color} />,
  },
  {
    key: 'Account',
    label: 'Account',
    icon: ({ color, size }) => <SettingsIcon size={size} color={color} />,
  },
];

export interface CustomBottomBarProps {
  activeTab?: TabKey;
  visibleTabs?: TabKey[];
  onTabPress?: (tabKey: TabKey) => void;
  containerStyle?: StyleProp<ViewStyle>;
  isPathClear?: boolean;
}

export const CustomBottomBar: React.FC<CustomBottomBarProps> = ({
  activeTab: controlledActiveTab,
  visibleTabs,
  onTabPress,
  containerStyle,
  isPathClear = false,
}) => {
  const insets = useSafeAreaInsets();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const renderedTabs = useMemo(() => {
    if (!visibleTabs || visibleTabs.length === 0) {
      return BOTTOM_BAR_TABS;
    }
    return visibleTabs
      .map(tabKey => BOTTOM_BAR_TABS.find(t => t.key === tabKey))
      .filter((tab): tab is TabConfig => Boolean(tab));
  }, [visibleTabs]);

  // Determine current active tab from React Navigation state or fallback
  const activeTabFromNavigationState = useNavigationState(navState => {
    if (!navState || !navState.routes) return 'Home';
    const currentRoute = navState.routes[navState.index];
    if (!currentRoute) return 'Home';

    if (currentRoute.name === 'MainTabs' && currentRoute.state) {
      const tabState = currentRoute.state as {
        index?: number;
        routes?: Array<{ name?: string }>;
      };
      const focusedRouteName =
        typeof tabState.index === 'number' && tabState.routes
          ? tabState.routes[tabState.index]?.name
          : undefined;
      return (focusedRouteName as TabKey) || 'Home';
    }

    const routeName = currentRoute.name;
    if (routeName === 'Home' || routeName === 'MainTabs') return 'Home';
    if (
      routeName === 'Patients' ||
      routeName === 'PatientDetails' ||
      routeName === 'AddPatient' ||
      routeName === 'EditPatient'
    ) {
      return 'Patients';
    }
    if (
      routeName === 'Schedule' ||
      routeName === 'DoctorAppointments' ||
      routeName === 'BookAppointment' ||
      routeName === 'RescheduleAppointment'
    ) {
      return 'Schedule';
    }
    if (routeName === 'Reports' || routeName === 'InvoiceList') return 'Reports';
    if (
      routeName === 'Account' ||
      routeName === 'DoctorProfile' ||
      routeName === 'Availability' ||
      routeName === 'InvoiceSettings' ||
      routeName === 'PrescriptionSettings'
    ) {
      return 'Account';
    }

    return (routeName as TabKey) || 'Home';
  });

  const currentTabKey: TabKey = useMemo(() => {
    if (controlledActiveTab) return controlledActiveTab;
    return (activeTabFromNavigationState as TabKey) || 'Home';
  }, [controlledActiveTab, activeTabFromNavigationState]);

  const handleTabPress = (tabKey: TabKey) => {
    if (onTabPress) {
      onTabPress(tabKey);
      return;
    }

    // Already on the current tab
    if (currentTabKey === tabKey) {
      return;
    }

    const params = tabKey === 'Schedule' ? { refresh: true } : undefined;

    if (isPathClear) {
      if (navigationRef.isReady()) {
        try {
          navigationRef.dispatch(StackActions.replace(tabKey, params));
          return;
        } catch {
          // fallback
        }
      }
      if (rootNavigation && typeof rootNavigation.replace === 'function') {
        try {
          rootNavigation.replace(tabKey as any, params);
          return;
        } catch {
          // fallback
        }
      }
    }

    if (navigationRef.isReady()) {
      (navigationRef as any).navigate(tabKey, params);
    } else if (rootNavigation) {
      rootNavigation.navigate(tabKey as any, params);
    }
  };

  const bottomInset = insets.bottom > 0 ? insets.bottom : 8;
  const tabBarHeight = getBottomBarHeight(insets.bottom);
  const tabBarPaddingBottom = bottomInset;

  return (
    <View
      style={[
        navigationStyles.tabBar,
        customBarStyles.barContainer,
        {
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
        },
        containerStyle,
      ]}
      accessibilityRole="tablist"
    >
      <View style={customBarStyles.tabsRow}>
        {renderedTabs.map(tab => {
          const isFocused = currentTabKey === tab.key;
          const color = isFocused ? theme.colors.primary : theme.colors.textSlate;

          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.7}
              onPress={() => handleTabPress(tab.key)}
              style={navigationStyles.tabItem}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={tab.label}
            >
              <View style={customBarStyles.tabContent}>
                <View
                  style={
                    isFocused
                      ? navigationStyles.activeIndicatorDot
                      : navigationStyles.inactiveIndicatorDot
                  }
                />
                <View
                  style={
                    isFocused
                      ? navigationStyles.activeIconContainer
                      : navigationStyles.inactiveIconContainer
                  }
                >
                  {tab.icon({ color, size: 20 })}
                </View>
                <Text
                  style={[
                    navigationStyles.tabLabel,
                    {
                      color,
                      fontWeight: isFocused ? '700' : '500',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const customBarStyles = StyleSheet.create({
  barContainer: {
    borderTopWidth: StyleSheet.hairlineWidth || 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  tabContent: {
    alignItems: 'center',
  },
});

export default CustomBottomBar;
