import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import EmailVerifyScreen from '../Features/Auth/EmailVerifyScreen';
import LoginScreen from '../Features/Auth/LoginScreen';
import PolicyAcceptanceScreen from '../Features/Auth/PolicyAcceptanceScreen';
import RegisterScreen from '../Features/Auth/RegisterScreen';
import DoctorScreen from '../Features/Dashboard/DoctorScreen/DoctorScreen';
import HomeScreen from '../Features/Dashboard/HomeScreen/HomeScreen';
import AddFamilyMemberScreen from '../Features/Dashboard/ProfileSceen/AddFamilyMemberScreen';
import ProfileSetupScreen from '../Features/Dashboard/ProfileSceen/ProfileSetupScreen';
import SettingScreen from '../Features/Dashboard/SettingScreen/SettingScreen';
import NewSupportTicketScreen from '../Features/Dashboard/SupportScreen/NewSupportTicketScreen';
import SupportScreen from '../Features/Dashboard/SupportScreen/SupportScreen';
import SupportTicketDetailsScreen from '../Features/Dashboard/SupportScreen/SupportTicketDetailsScreen';
import SplashScreen from '../Features/SplashScreen/SplashScreen';
import { DashboardTabParamList, RootStackParamList } from '../route';
import { navigationRef } from './navigationRef';

export type { DashboardTabParamList, RootStackParamList };

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="EmailVerify" component={EmailVerifyScreen} />
        <Stack.Screen name="PolicyAcceptance" component={PolicyAcceptanceScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Doctors" component={DoctorScreen} />
        <Stack.Screen name="Account" component={SettingScreen} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <Stack.Screen name="AddNewMember" component={AddFamilyMemberScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
        <Stack.Screen name="NewSupportTicket" component={NewSupportTicketScreen} />
        <Stack.Screen name="SupportTicketDetails" component={SupportTicketDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
