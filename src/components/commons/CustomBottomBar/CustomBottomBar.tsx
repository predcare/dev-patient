import { CommonActions, useNavigation, useNavigationState } from '@react-navigation/native';
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

const TAB_BY_ROUTE: Record<string, TabKey> = {
  Home: 'Home',
  MainTabs: 'Home',
  Doctors: 'Doctors',
  DoctorSearch: 'Doctors',
  DoctorDetails: 'Doctors',
  ClinicDetails: 'Doctors',
  BookAppointment: 'Doctors',
  Payment: 'Doctors',
  PaymentProcessing: 'Doctors',
  BookingSuccess: 'Doctors',
  Schedule: 'Schedule',
  AppointmentDetails: 'Schedule',
  RescheduleAppointment: 'Schedule',
  Meeting: 'Schedule',
  ConsultationCompleted: 'Schedule',
  Reports: 'Reports',
  PrescriptionsList: 'Reports',
  PrescriptionDetail: 'Reports',
  HealthRecords: 'Reports',
  HealthRecordFolder: 'Reports',
  UploadHealthRecord: 'Reports',
  Account: 'Account',
  ProfileSetup: 'Account',
  AddNewMember: 'Account',
  Support: 'Account',
  NewSupportTicket: 'Account',
  SupportTicketDetails: 'Account',
  SupportTicketSuccess: 'Account',
  InvoicesList: 'Account',
};

export interface CustomBottomBarProps {
  activeTab?: TabKey;
  visibleTabs?: TabKey[];
  onTabPress?: (tabKey: TabKey) => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export const CustomBottomBar: React.FC<CustomBottomBarProps> = ({
  activeTab: controlledActiveTab,
  visibleTabs,
  onTabPress,
  containerStyle,
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

  const focusedRouteName = useNavigationState(navState => {
    if (!navState?.routes?.length) return 'Home';
    return navState.routes[navState.index]?.name ?? 'Home';
  });

  const currentTabKey: TabKey = useMemo(() => {
    if (controlledActiveTab) return controlledActiveTab;
    return TAB_BY_ROUTE[focusedRouteName] ?? 'Home';
  }, [controlledActiveTab, focusedRouteName]);

  const handleTabPress = (tabKey: TabKey) => {
    if (onTabPress) {
      onTabPress(tabKey);
      return;
    }

    if (focusedRouteName === tabKey) {
      return;
    }

    const routes =
      tabKey === 'Home' ? [{ name: 'Home' as const }] : [{ name: 'Home' as const }, { name: tabKey }];
    const resetAction = CommonActions.reset({
      index: routes.length - 1,
      routes,
    });

    if (navigationRef.isReady()) {
      navigationRef.dispatch(resetAction);
    } else {
      rootNavigation.dispatch(resetAction);
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
