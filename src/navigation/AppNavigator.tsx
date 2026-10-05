import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import EmailVerifyScreen from '../Features/Auth/EmailVerifyScreen';
import LoginScreen from '../Features/Auth/LoginScreen';
import PolicyAcceptanceScreen from '../Features/Auth/PolicyAcceptanceScreen';
import RegisterScreen from '../Features/Auth/RegisterScreen';
import AppointmentDetailsScreen from '../Features/Dashboard/AppointmentScreen/AppointmentDetailsScreen';
import AppointmentsScreen from '../Features/Dashboard/AppointmentScreen/AppointmentsScreen';
import BookAppointmentScreen from '../Features/Dashboard/AppointmentScreen/BookAppointmentScreen';
import BookingSuccessScreen from '../Features/Dashboard/AppointmentScreen/BookingSuccessScreen';
import ClinicDetailsScreen from '../Features/Dashboard/DoctorScreen/ClinicDetailsScreen';
import DoctorProfileScreen from '../Features/Dashboard/DoctorScreen/DoctorProfileScreen';
import DoctorScreen from '../Features/Dashboard/DoctorScreen/DoctorScreen';
import DoctorSearchScreen from '../Features/Dashboard/DoctorScreen/DoctorSearchScreen';
import HealthRecordFolderScreen from '../Features/Dashboard/HealthRecordsScreen/HealthRecordFolderScreen';
import HealthRecordsScreen from '../Features/Dashboard/HealthRecordsScreen/HealthRecordsScreen';
import UploadHealthRecordScreen from '../Features/Dashboard/HealthRecordsScreen/UploadHealthRecordScreen';
import HomeScreen from '../Features/Dashboard/HomeScreen/HomeScreen';
import { InvoicesScreen } from '../Features/Dashboard/Invoices/InvoicesScreen';
import MeetingScreen from '../Features/Dashboard/MeetingScreen/MeetingScreen';
import ConsultationCompletedScreen from '../Features/Dashboard/MeetingScreen/MeetingStatusScreen';
import PaymentProcessingScreen from '../Features/Dashboard/PaymentScreen/PaymentProcessingScreen';
import PaymentScreen from '../Features/Dashboard/PaymentScreen/PaymentScreen';
import PrescriptionDetailScreen from '../Features/Dashboard/PrescriptionScreen/PrescriptionDetailScreen';
import { PrescriptionsScreen } from '../Features/Dashboard/PrescriptionScreen/PrescriptionScreen';
import AddFamilyMemberScreen from '../Features/Dashboard/ProfileSceen/AddFamilyMemberScreen';
import ProfileSetupScreen from '../Features/Dashboard/ProfileSceen/ProfileSetupScreen';
import ReportsScreen from '../Features/Dashboard/ReportsScreen/ReportsScreen';
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
        <Stack.Screen name="DoctorSearch" component={DoctorSearchScreen} />
        <Stack.Screen name="DoctorDetails" component={DoctorProfileScreen} />
        <Stack.Screen name="ClinicDetails" component={ClinicDetailsScreen} />
        <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="PaymentProcessing" component={PaymentProcessingScreen} />
        <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} />
        <Stack.Screen name="Schedule" component={AppointmentsScreen} />
        <Stack.Screen name="AppointmentDetails" component={AppointmentDetailsScreen} />
        <Stack.Screen name="Reports" component={ReportsScreen} />
        <Stack.Screen name="PrescriptionsList" component={PrescriptionsScreen} />
        <Stack.Screen name="PrescriptionDetail" component={PrescriptionDetailScreen} />
        <Stack.Screen name="HealthRecords" component={HealthRecordsScreen} />
        <Stack.Screen name="HealthRecordFolder" component={HealthRecordFolderScreen} />
        <Stack.Screen name="UploadHealthRecord" component={UploadHealthRecordScreen} />
        <Stack.Screen name="InvoicesList" component={InvoicesScreen} />
        <Stack.Screen name="Meeting" component={MeetingScreen} />
        <Stack.Screen name="ConsultationCompleted" component={ConsultationCompletedScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
