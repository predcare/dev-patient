import React from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { theme } from '../../../styled/theme.styled';

export interface TabItem<T extends string = string> {
  key: T;
  label: string;
  badgeCount?: number;
  icon?: React.ReactNode | ((isActive: boolean) => React.ReactNode);
  content?: React.ReactNode;
}

export interface CustomTabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onTabChange: (key: T) => void;
  containerStyle?: ViewStyle;
  tabBarStyle?: ViewStyle;
  tabStyle?: ViewStyle;
  activeTabStyle?: ViewStyle;
  textStyle?: TextStyle;
  activeTextStyle?: TextStyle;
  activeColor?: string;
  inactiveColor?: string;
  fullWidth?: boolean;
}

export function CustomTabs<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  containerStyle,
  tabBarStyle,
  tabStyle,
  activeTabStyle,
  textStyle,
  activeTextStyle,
  activeColor = theme.colors.primary,
  inactiveColor = theme.colors.textMuted,
  fullWidth = true,
}: CustomTabsProps<T>) {
  const activeItem = tabs.find(item => item.key === activeTab);

  return (
    <View style={containerStyle}>
      <View style={[styles.tabBar, tabBarStyle]}>
        {tabs.map(item => {
          const isActive = activeTab === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.tabBtn,
                fullWidth && styles.flexOne,
                tabStyle,
                isActive && styles.tabBtnActive,
                isActive && { backgroundColor: activeColor },
                isActive && activeTabStyle,
              ]}
              onPress={() => onTabChange(item.key)}
              activeOpacity={0.8}
            >
              {item.icon && (
                <View style={styles.iconWrap}>
                  {typeof item.icon === 'function' ? item.icon(isActive) : item.icon}
                </View>
              )}
              <Text
                style={[
                  styles.tabTxt,
                  { color: inactiveColor },
                  textStyle,
                  isActive && styles.tabTxtActive,
                  isActive && activeTextStyle,
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
              {item.badgeCount !== undefined && item.badgeCount > 0 && (
                <View
                  style={[
                    styles.badge,
                    isActive
                      ? { backgroundColor: theme.colors.surface }
                      : { backgroundColor: activeColor },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeTxt,
                      isActive ? { color: activeColor } : { color: theme.colors.surface },
                    ]}
                  >
                    {item.badgeCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      {activeItem?.content && (
        <View style={styles.contentWrap}>{activeItem.content}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginHorizontal: theme.spacing.lg,
    marginBottom: 10,
  },
  flexOne: {
    flex: 1,
  },
  tabBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabTxt: {
    fontSize: theme.fontSize.xs + 1,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textMuted,
  },
  tabTxtActive: {
    color: theme.colors.surface,
    fontWeight: theme.fontWeight.bold,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  badgeTxt: {
    fontSize: 10,
    fontWeight: theme.fontWeight.bold,
  },
  contentWrap: {
    flex: 1,
  },
});

export default CustomTabs;
