import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  HomeIcon,
  ReportsIcon,
  ScheduleIcon,
  SettingsIcon,
  StethoscopeIcon,
} from '../components/ui/icons';
import useNotificationListeners from '../hooks/commons/useNotificationListeners';
import { DashboardTabParamList, RootStackParamList } from '../route';
import EmailVerifyScreen from '../Screens/Auth/EmailVerifyScreen';
import LoginScreen from '../Screens/Auth/LoginScreen';
import PolicyAcceptanceScreen from '../Screens/Auth/PolicyAcceptanceScreen';
import RegisterScreen from '../Screens/Auth/RegisterScreen';
import AddNewMemberScreen from '../Screens/DashboardScreen/AddNewMemberScreen';
import AppointmentsScreen from '../Screens/DashboardScreen/AppointmentsScreen';
import BookAppointmentScreen from '../Screens/DashboardScreen/BookAppointmentScreen';
import BookingSuccessScreen from '../Screens/DashboardScreen/BookingSuccessScreen';
import ClinicDetailsScreen from '../Screens/DashboardScreen/ClinicDetailsScreen';
import ConsultationCompletedScreen from '../Screens/DashboardScreen/ConsultationCompletedScreen';
import DashboardScreen from '../Screens/DashboardScreen/DashboardScreen';
import DoctorDetailsScreen from '../Screens/DashboardScreen/DoctorDetailsScreen';
import DoctorSearchScreen from '../Screens/DashboardScreen/DoctorSearchScreen';
import MeetingScreen from '../Screens/DashboardScreen/MeetingScreen';
import MyDoctorsScreen from '../Screens/DashboardScreen/MyDoctorsScreen';
import PaymentScreen from '../Screens/DashboardScreen/PaymentScreen';
import PrescriptionDetailScreen from '../Screens/DashboardScreen/PrescriptionDetailScreen';
import PrescriptionsListScreen from '../Screens/DashboardScreen/PrescriptionsListScreen';
import ProfileSetupScreen from '../Screens/DashboardScreen/ProfileSetupScreen';
import RescheduleAppointmentScreen from '../Screens/DashboardScreen/RescheduleAppointmentScreen';
import SettingScreen from '../Screens/DashboardScreen/SettingScreen';
import SplashScreen from '../Screens/SplashScreen';
import NewSupportTicketScreen from '../Screens/Support/NewSupportTicketScreen';
import SupportScreen from '../Screens/Support/SupportScreen';
import SupportTicketDetailsScreen from '../Screens/Support/SupportTicketDetailsScreen';
import SupportTicketSuccessScreen from '../Screens/Support/SupportTicketSuccessScreen';
import { navigationStyles } from '../styled/Navigation.styled';
import { theme } from '../styled/theme.styled';
import { navigationRef } from './navigationRef';
export type { DashboardTabParamList, RootStackParamList };

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<DashboardTabParamList>();

interface TabIconProps {
  focused: boolean;
  Icon: React.ComponentType<{ size: number; color: string }>;
}

const TabIconItem: React.FC<TabIconProps> = ({ focused, Icon }) => (
  <View style={{ alignItems: 'center' }}>
    <View
      style={focused ? navigationStyles.activeIndicatorDot : navigationStyles.inactiveIndicatorDot}
    />
    <View
      style={
        focused ? navigationStyles.activeIconContainer : navigationStyles.inactiveIconContainer
      }
    >
      <Icon size={19} color={focused ? theme.colors.primary : theme.colors.textSlate} />
    </View>
  </View>
);

const DashboardTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 62 + insets.bottom;
  const tabBarPaddingBottom = Math.max(insets.bottom, 6);
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          ...navigationStyles.tabBar,
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
        },
        tabBarItemStyle: navigationStyles.tabItem,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSlate,
        tabBarLabelStyle: {
          ...navigationStyles.tabLabel,
        },
      }}
      screenListeners={{
        focus: e => {
          const routeName = e.target?.split('-')[0];
          console.log(`[AppNavigator] Stack screen focused: ${routeName}`);
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          headerShown: false,
          title: 'Home',
          tabBarLabelStyle: {
            ...navigationStyles.tabLabel,
          },
          tabBarIcon: ({ focused }) => <TabIconItem focused={focused} Icon={HomeIcon} />,
        }}
      />
      <Tab.Screen
        name="Doctors"
        component={MyDoctorsScreen}
        options={{
          headerShown: false,
          title: 'Doctors',
          tabBarLabelStyle: {
            ...navigationStyles.tabLabel,
          },
          tabBarIcon: ({ focused }) => <TabIconItem focused={focused} Icon={StethoscopeIcon} />,
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={AppointmentsScreen}
        options={{
          headerShown: false,
          title: 'Schedule',
          tabBarLabelStyle: {
            ...navigationStyles.tabLabel,
          },
          tabBarIcon: ({ focused }) => <TabIconItem focused={focused} Icon={ScheduleIcon} />,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={PrescriptionsListScreen}
        options={{
          headerShown: false,
          title: 'Rx',
          tabBarLabelStyle: {
            ...navigationStyles.tabLabel,
          },
          tabBarIcon: ({ focused }) => <TabIconItem focused={focused} Icon={ReportsIcon} />,
        }}
      />
      <Tab.Screen
        name="Account"
        component={SettingScreen}
        options={{
          headerShown: false,
          title: 'Account',
          tabBarLabelStyle: {
            ...navigationStyles.tabLabel,
          },
          tabBarIcon: ({ focused }) => <TabIconItem focused={focused} Icon={SettingsIcon} />,
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  useNotificationListeners(navigationRef);
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
        screenListeners={{
          focus: e => {
            const routeName = e.target?.split('-')[0];
            console.log(`[AppNavigator] Stack screen focused: ${routeName}`);
          },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="EmailVerify" component={EmailVerifyScreen} />
        <Stack.Screen name="PolicyAcceptance" component={PolicyAcceptanceScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
        <Stack.Screen name="SupportTicketDetails" component={SupportTicketDetailsScreen} />
        <Stack.Screen name="NewSupportTicket" component={NewSupportTicketScreen} />
        <Stack.Screen name="SupportTicketSuccess" component={SupportTicketSuccessScreen} />
        <Stack.Screen name="AddNewMember" component={AddNewMemberScreen} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <Stack.Screen name="DoctorSearch" component={DoctorSearchScreen} />
        <Stack.Screen name="DoctorDetails" component={DoctorDetailsScreen} />
        <Stack.Screen name="ClinicDetails" component={ClinicDetailsScreen} />
        <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} />
        <Stack.Screen name="PrescriptionsList" component={PrescriptionsListScreen} />
        <Stack.Screen name="PrescriptionDetail" component={PrescriptionDetailScreen} />
        <Stack.Screen name="RescheduleAppointment" component={RescheduleAppointmentScreen} />
        <Stack.Screen name="Meeting" component={MeetingScreen} />
        <Stack.Screen name="ConsultationCompleted" component={ConsultationCompletedScreen} />
        <Stack.Screen name="MainTabs" component={DashboardTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
