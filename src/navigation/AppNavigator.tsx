import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import useNotificationListeners from '../hooks/commons/useNotificationListeners';
import { DashboardTabParamList, RootStackParamList } from '../route';
import EmailVerifyScreen from '../Screens/Auth/EmailVerifyScreen';
import LoginScreen from '../Screens/Auth/LoginScreen';
import PolicyAcceptanceScreen from '../Screens/Auth/PolicyAcceptanceScreen';
import RegisterScreen from '../Screens/Auth/RegisterScreen';
import AddNewMemberScreen from '../Screens/DashboardScreen/AddNewMemberScreen';
import AppointmentDetailsScreen from '../Screens/DashboardScreen/AppointmentDetailsScreen';
import AppointmentsScreen from '../Screens/DashboardScreen/AppointmentsScreen';
import BookAppointmentScreen from '../Screens/DashboardScreen/BookAppointmentScreen';
import BookingSuccessScreen from '../Screens/DashboardScreen/BookingSuccessScreen';
import ClinicDetailsScreen from '../Screens/DashboardScreen/ClinicDetailsScreen';
import ConsultationCompletedScreen from '../Screens/DashboardScreen/ConsultationCompletedScreen';
import DashboardScreen from '../Screens/DashboardScreen/DashboardScreen';
import DoctorDetailsScreen from '../Screens/DashboardScreen/DoctorDetailsScreen';
import DoctorSearchScreen from '../Screens/DashboardScreen/DoctorSearchScreen';
import HealthRecordFolderScreen from '../Screens/DashboardScreen/HealthRecordFolderScreen';
import HealthRecordsScreen from '../Screens/DashboardScreen/HealthRecordsScreen';
import InvoicesListScreen from '../Screens/DashboardScreen/InvoicesListScreen';
import MeetingScreen from '../Screens/DashboardScreen/MeetingScreen';
import MyDoctorsScreen from '../Screens/DashboardScreen/MyDoctorsScreen';
import PaymentScreen from '../Screens/DashboardScreen/PaymentScreen';
import PrescriptionDetailScreen from '../Screens/DashboardScreen/PrescriptionDetailScreen';
import PrescriptionsListScreen from '../Screens/DashboardScreen/PrescriptionsListScreen';
import ProfileSetupScreen from '../Screens/DashboardScreen/ProfileSetupScreen';
import ReportsScreen from '../Screens/DashboardScreen/ReportsScreen';
import RescheduleAppointmentScreen from '../Screens/DashboardScreen/RescheduleAppointmentScreen';
import SettingScreen from '../Screens/DashboardScreen/SettingScreen';
import UploadHealthRecordScreen from '../Screens/DashboardScreen/UploadHealthRecordScreen';
import SplashScreen from '../Screens/SplashScreen';
import NewSupportTicketScreen from '../Screens/Support/NewSupportTicketScreen';
import SupportScreen from '../Screens/Support/SupportScreen';
import SupportTicketDetailsScreen from '../Screens/Support/SupportTicketDetailsScreen';
import SupportTicketSuccessScreen from '../Screens/Support/SupportTicketSuccessScreen';
import { navigationRef } from './navigationRef';

export type { DashboardTabParamList, RootStackParamList };

const Stack = createNativeStackNavigator<RootStackParamList>();

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
        <Stack.Screen name="AppointmentDetails" component={AppointmentDetailsScreen} />
        <Stack.Screen name="Meeting" component={MeetingScreen} />
        <Stack.Screen name="ConsultationCompleted" component={ConsultationCompletedScreen} />
        <Stack.Screen name="HealthRecords" component={HealthRecordsScreen} />
        <Stack.Screen name="HealthRecordFolder" component={HealthRecordFolderScreen} />
        <Stack.Screen name="UploadHealthRecord" component={UploadHealthRecordScreen} />
        <Stack.Screen name="InvoicesList" component={InvoicesListScreen} />

        {/* Primary Stack Screens with SafeAreaWrapper Bottom Bar */}
        <Stack.Screen name="Home" component={DashboardScreen} />
        <Stack.Screen name="Doctors" component={MyDoctorsScreen} />
        <Stack.Screen name="Schedule" component={AppointmentsScreen} />
        <Stack.Screen name="Reports" component={ReportsScreen} />
        <Stack.Screen name="Account" component={SettingScreen} />
        <Stack.Screen name="MainTabs" component={DashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
