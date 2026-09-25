import { StackActions, useNavigation, useNavigationState } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { navigationRef } from '../../../navigation/navigationRef';
import { RootStackParamList } from '../../../route';
import { customBottomBarStyles } from '../../../styled/CustomBottomBar.styled';
import { theme } from '../../../styled/theme.styled';
import { HomeIcon, ReportsIcon, ScheduleIcon, SettingsIcon, StethoscopeIcon } from '../../ui/icons';

export type TabKey = 'Home' | 'Doctors' | 'Schedule' | 'Reports' | 'Account';

export interface TabConfig {
  key: TabKey;
  label: string;
  icon: (props: { color: string; size: number }) => React.ReactNode;
  badgeCount?: number;
}

export const BASE_TAB_BAR_HEIGHT = 60;

export const getBottomBarHeight = (bottomInset: number = 0): number => {
  return BASE_TAB_BAR_HEIGHT + bottomInset;
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
    icon: ({ color, size }) => <StethoscopeIcon size={size} color={color} />,
  },
  {
    key: 'Schedule',
    label: 'Schedule',
    icon: ({ color, size }) => <ScheduleIcon size={size} color={color} />,
  },
  {
    key: 'Reports',
    label: 'Rx',
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
  isPathClear = true,
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
    if (!navState) return 'Home';
    const currentRoute = navState.routes[navState.index];
    return (currentRoute?.name as TabKey) || 'Home';
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

    if (currentTabKey === tabKey) {
      return;
    }

    if (tabKey === 'Schedule') {
      const params = { refresh: true };
      if (isPathClear) {
        if (navigationRef.isReady()) {
          try {
            navigationRef.dispatch(StackActions.replace('Schedule', params));
            return;
          } catch {
            navigationRef.navigate('Schedule', params);
            return;
          }
        }
        if (rootNavigation && typeof rootNavigation.replace === 'function') {
          rootNavigation.replace('Schedule', params);
          return;
        }
      }

      if (navigationRef.isReady()) {
        navigationRef.navigate('Schedule', params);
      } else if (rootNavigation) {
        rootNavigation.navigate('Schedule', params);
      }
      return;
    }

    // For Home, Doctors, Reports, Account
    if (isPathClear) {
      if (navigationRef.isReady()) {
        try {
          navigationRef.dispatch(StackActions.replace(tabKey));
          return;
        } catch {
          navigationRef.navigate(tabKey);
          return;
        }
      }
      if (rootNavigation && typeof rootNavigation.replace === 'function') {
        rootNavigation.replace(tabKey);
        return;
      }
    }

    if (navigationRef.isReady()) {
      navigationRef.navigate(tabKey);
    } else if (rootNavigation) {
      rootNavigation.navigate(tabKey);
    }
  };

  const tabBarHeight = BASE_TAB_BAR_HEIGHT + insets.bottom;
  const tabBarPaddingBottom = Math.max(insets.bottom, 6);

  return (
    <View
      style={[
        customBottomBarStyles.container,
        {
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
        },
        containerStyle,
      ]}
      accessibilityRole="tablist"
    >
      {renderedTabs.map(tab => {
        const isFocused = currentTabKey === tab.key;
        const color = isFocused ? theme.colors.primary : theme.colors.textSlate;

        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={1}
            onPress={() => handleTabPress(tab.key)}
            style={customBottomBarStyles.item}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={tab.label}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <View style={{ alignItems: 'center' }}>
              <View
                style={
                  isFocused
                    ? customBottomBarStyles.activeIndicatorDot
                    : customBottomBarStyles.inactiveIndicatorDot
                }
              />
              <View
                style={
                  isFocused
                    ? customBottomBarStyles.activeIconContainer
                    : customBottomBarStyles.inactiveIconContainer
                }
              >
                {tab.icon({ color, size: 19 })}
                {!!tab.badgeCount && tab.badgeCount > 0 && (
                  <View style={customBottomBarStyles.badge}>
                    <Text style={customBottomBarStyles.badgeText}>
                      {tab.badgeCount > 99 ? '99+' : tab.badgeCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  customBottomBarStyles.label,
                  isFocused && customBottomBarStyles.activeLabel,
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
  );
};

export default CustomBottomBar;
