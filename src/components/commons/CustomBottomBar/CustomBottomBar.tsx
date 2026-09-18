import React from 'react';
import { Platform, StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { customBottomBarStyles } from '../../../styled/CustomBottomBar.styled';
import { theme } from '../../../styled/theme.styled';
import { HomeIcon, ReportsIcon, ScheduleIcon, SettingsIcon, StethoscopeIcon } from '../../ui/icons';

export interface CustomBottomBarItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  active?: boolean;
  badgeCount?: number;
  onPress: () => void;
}

export interface CustomBottomBarProps {
  activeKey?: string;
  style?: StyleProp<ViewStyle>;
}
const items: CustomBottomBarItem[] = [
  {
    key: 'Home',
    label: 'Home',
    icon: HomeIcon,
    onPress: () => {},
  },
  {
    key: 'Doctors',
    label: 'Doctors',
    icon: StethoscopeIcon,
    onPress: () => {},
  },
  {
    key: 'Schedule',
    label: 'Schedule',
    icon: ScheduleIcon,
    onPress: () => {},
  },
  {
    key: 'Reports',
    label: 'Rx',
    icon: ReportsIcon,
    onPress: () => {},
  },
  {
    key: 'Account',
    label: 'Account',
    icon: SettingsIcon,
    onPress: () => {},
  },
];

export const CustomBottomBar: React.FC<CustomBottomBarProps> = ({ activeKey, style }) => {
  const insets = useSafeAreaInsets();
  const bottomOffset =
    Platform.OS === 'ios' ? Math.max(insets.bottom, 8) : Math.max(insets.bottom, 10);

  return (
    <View style={[customBottomBarStyles.container, { bottom: bottomOffset }, style]}>
      {items.map(item => {
        const isFocused = item.active !== undefined ? item.active : activeKey === item.key;
        const Icon = item.icon;

        return (
          <TouchableOpacity
            key={item.key}
            style={customBottomBarStyles.item}
            onPress={item.onPress}
            activeOpacity={0.75}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
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
              <Icon size={19} color={isFocused ? theme.colors.primary : theme.colors.textSlate} />
              {!!item.badgeCount && item.badgeCount > 0 && (
                <View style={customBottomBarStyles.badge}>
                  <Text style={customBottomBarStyles.badgeText}>
                    {item.badgeCount > 99 ? '99+' : item.badgeCount}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[customBottomBarStyles.label, isFocused && customBottomBarStyles.activeLabel]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default CustomBottomBar;
