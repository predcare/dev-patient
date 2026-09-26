import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

/**
 * Navigation Route Names Constants
 */
export const AppRoute = {
  SPLASH: 'Splash',
  LOGIN: 'Login',
  REGISTER: 'Register',
  EMAIL_VERIFY: 'EmailVerify',
  POLICY_ACCEPTANCE: 'PolicyAcceptance',
  SUPPORT: 'Support',
  SUPPORT_TICKET_DETAILS: 'SupportTicketDetails',
  NEW_SUPPORT_TICKET: 'NewSupportTicket',
  SUPPORT_TICKET_SUCCESS: 'SupportTicketSuccess',
  ADD_NEW_MEMBER: 'AddNewMember',
  PROFILE_SETUP: 'ProfileSetup',
  DOCTOR_SEARCH: 'DoctorSearch',
  DOCTOR_DETAILS: 'DoctorDetails',
  BOOK_APPOINTMENT: 'BookAppointment',
  PAYMENT: 'Payment',
  BOOKING_SUCCESS: 'BookingSuccess',
  PRESCRIPTIONS_LIST: 'PrescriptionsList',
  PRESCRIPTION_DETAIL: 'PrescriptionDetail',
  RESCHEDULE_APPOINTMENT: 'RescheduleAppointment',
  MEETING: 'Meeting',
  CONSULTATION_COMPLETED: 'ConsultationCompleted',
  CLINIC_DETAILS: 'ClinicDetails',
  DOCTOR_PROFILE: 'DoctorProfile',
  HEALTH_RECORDS: 'HealthRecords',
  HEALTH_RECORD_FOLDER: 'HealthRecordFolder',
  UPLOAD_HEALTH_RECORD: 'UploadHealthRecord',
  HOME: 'Home',
  DOCTORS: 'Doctors',
  SCHEDULE: 'Schedule',
  REPORTS: 'Reports',
  APPOINTMENT_DETAILS: 'AppointmentDetails',
  INVOICES_LIST: 'InvoicesList',
  ACCOUNT: 'Account',
} as const;

export type RouteNames = (typeof AppRoute)[keyof typeof AppRoute];

/**
 * Root Stack Navigator Parameter List
 */
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  EmailVerify: { email?: string; phone?: string } | undefined;
  PolicyAcceptance: { userId?: string } | undefined;
  Support: undefined;
  SupportTicketDetails: { ticketId?: string; initialTicket?: any } | undefined;
  NewSupportTicket: undefined;
  SupportTicketSuccess: { ticketId?: string; category?: string; createdAt?: string } | undefined;
  AddNewMember: { memberId: number | string; memberToEdit?: any } | undefined;
  ProfileSetup: undefined;
  DoctorSearch: { query?: string; specialty?: string } | undefined;
  DoctorDetails: { doctorId?: number; doctor?: any } | undefined;
  ClinicDetails: { clinicId?: number; clinic?: any } | undefined;
  BookAppointment:
    | { doctorId?: number; doctor?: any; clinicId?: number; clinicName?: string }
    | undefined;
  Payment: { bookingData?: any; totalAmount?: number } | undefined;
  BookingSuccess: { bookingData?: any } | undefined;
  PrescriptionsList: undefined;
  PrescriptionDetail: { prescriptionId?: number; prescription?: any } | undefined;
  RescheduleAppointment: { appointmentId?: number | string; appointment?: any } | undefined;
  Meeting: { appointmentId?: number | string; appointment?: any } | undefined;
  ConsultationCompleted:
    | {
        appointmentId?: number | string;
        doctorName?: string;
        doctorSpecialization?: string;
        patientName?: string;
        appointmentDate?: string;
        durationSeconds?: number;
        durationLabel?: string;
        consultationType?: string;
      }
    | undefined;
  MainTabs?: { screen?: string } | undefined;
  HealthRecords: undefined;
  HealthRecordFolder: { patinentId?: string; folderName?: string } | undefined;
  UploadHealthRecord: { initialCategory?: string } | undefined;
  Home: undefined;
  Doctors: undefined;
  Schedule: { refresh?: boolean } | undefined;
  Reports: undefined;
  Account: undefined;
  AppointmentDetails: { appointmentId?: number, isComingFromNotification?: boolean } | undefined;
  InvoicesList: undefined;
};

/**
 * Dashboard Bottom Tab Navigator Parameter List
 */
export type DashboardTabParamList = {
  Home: undefined;
  Doctors: undefined;
  Schedule: { refresh?: boolean } | undefined;
  Reports: undefined;
  Account: undefined;
};

// Global type augmentation for React Navigation hooks across the app
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

/**
 * Screen Props & Navigation/Route Props for Root Stack Screens
 */
export type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;
export type SplashScreenRouteProp = RouteProp<RootStackParamList, 'Splash'>;
export interface SplashScreenProps {
  navigation?: SplashScreenNavigationProp;
  route?: SplashScreenRouteProp;
}

export type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;
export type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Login'>;
export interface LoginScreenProps {
  navigation?: LoginScreenNavigationProp;
  route?: LoginScreenRouteProp;
}

export type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Register'
>;
export type RegisterScreenRouteProp = RouteProp<RootStackParamList, 'Register'>;
export interface RegisterScreenProps {
  navigation?: RegisterScreenNavigationProp;
  route?: RegisterScreenRouteProp;
}

export type EmailVerifyScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EmailVerify'
>;
export type EmailVerifyScreenRouteProp = RouteProp<RootStackParamList, 'EmailVerify'>;
export interface EmailVerifyScreenProps {
  navigation?: EmailVerifyScreenNavigationProp;
  route?: EmailVerifyScreenRouteProp;
}

export type PolicyAcceptanceScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PolicyAcceptance'
>;
export type PolicyAcceptanceScreenRouteProp = RouteProp<RootStackParamList, 'PolicyAcceptance'>;
export interface PolicyAcceptanceScreenProps {
  navigation?: PolicyAcceptanceScreenNavigationProp;
  route?: PolicyAcceptanceScreenRouteProp;
}

export type MainTabsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MainTabs'
>;
export type MainTabsScreenRouteProp = RouteProp<RootStackParamList, 'MainTabs'>;
export interface MainTabsScreenProps {
  navigation?: MainTabsScreenNavigationProp;
  route?: MainTabsScreenRouteProp;
}

export type SupportScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Support'>;
export type SupportScreenRouteProp = RouteProp<RootStackParamList, 'Support'>;
export interface SupportScreenProps {
  navigation?: SupportScreenNavigationProp;
  route?: SupportScreenRouteProp;
}

export type SupportTicketDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SupportTicketDetails'
>;
export type SupportTicketDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  'SupportTicketDetails'
>;
export interface SupportTicketDetailsScreenProps {
  navigation?: SupportTicketDetailsScreenNavigationProp;
  route?: SupportTicketDetailsScreenRouteProp;
}

export type NewSupportTicketScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'NewSupportTicket'
>;
export type NewSupportTicketScreenRouteProp = RouteProp<RootStackParamList, 'NewSupportTicket'>;
export interface NewSupportTicketScreenProps {
  navigation?: NewSupportTicketScreenNavigationProp;
  route?: NewSupportTicketScreenRouteProp;
}

export type SupportTicketSuccessScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SupportTicketSuccess'
>;
export type SupportTicketSuccessScreenRouteProp = RouteProp<
  RootStackParamList,
  'SupportTicketSuccess'
>;
export interface SupportTicketSuccessScreenProps {
  navigation?: SupportTicketSuccessScreenNavigationProp;
  route?: SupportTicketSuccessScreenRouteProp;
}

export type AddNewMemberScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddNewMember'
>;
export type AddNewMemberScreenRouteProp = RouteProp<RootStackParamList, 'AddNewMember'>;
export interface AddNewMemberScreenProps {
  navigation?: AddNewMemberScreenNavigationProp;
  route?: AddNewMemberScreenRouteProp;
}

export type ProfileSetupScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ProfileSetup'
>;
export type ProfileSetupScreenRouteProp = RouteProp<RootStackParamList, 'ProfileSetup'>;
export interface ProfileSetupScreenProps {
  navigation?: ProfileSetupScreenNavigationProp;
  route?: ProfileSetupScreenRouteProp;
}

export type DoctorSearchScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DoctorSearch'
>;
export type DoctorSearchScreenRouteProp = RouteProp<RootStackParamList, 'DoctorSearch'>;
export interface DoctorSearchScreenProps {
  navigation?: DoctorSearchScreenNavigationProp;
  route?: DoctorSearchScreenRouteProp;
}

export type DoctorDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DoctorDetails'
>;
export type DoctorDetailsScreenRouteProp = RouteProp<RootStackParamList, 'DoctorDetails'>;
export interface DoctorDetailsScreenProps {
  navigation?: DoctorDetailsScreenNavigationProp;
  route?: DoctorDetailsScreenRouteProp;
}

/**
 * Screen Props & Navigation/Route Props for Main Stack Screens
 */
export type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
export type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;
export interface HomeScreenProps {
  navigation?: HomeScreenNavigationProp;
  route?: HomeScreenRouteProp;
}

export type DoctorsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Doctors'>;
export type DoctorsScreenRouteProp = RouteProp<RootStackParamList, 'Doctors'>;
export interface DoctorsScreenProps {
  navigation?: DoctorsScreenNavigationProp;
  route?: DoctorsScreenRouteProp;
}

export type ScheduleScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Schedule'
>;
export type ScheduleScreenRouteProp = RouteProp<RootStackParamList, 'Schedule'>;
export interface ScheduleScreenProps {
  navigation?: ScheduleScreenNavigationProp;
  route?: ScheduleScreenRouteProp;
}

export type MeetingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Meeting'>;
export type MeetingScreenRouteProp = RouteProp<RootStackParamList, 'Meeting'>;
export interface MeetingScreenProps {
  navigation?: MeetingScreenNavigationProp;
  route?: MeetingScreenRouteProp;
}

export type ReportsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Reports'>;
export type ReportsScreenRouteProp = RouteProp<RootStackParamList, 'Reports'>;
export interface ReportsScreenProps {
  navigation?: ReportsScreenNavigationProp;
  route?: ReportsScreenRouteProp;
}

export type AccountScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Account'>;
export type AccountScreenRouteProp = RouteProp<RootStackParamList, 'Account'>;
export interface AccountScreenProps {
  navigation?: AccountScreenNavigationProp;
  route?: AccountScreenRouteProp;
}

export type ProfileScreenNavigationProp = AccountScreenNavigationProp;
export type ProfileScreenRouteProp = AccountScreenRouteProp;
export type ProfileScreenProps = AccountScreenProps;

export type UploadHealthRecordScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'UploadHealthRecord'
>;
export type UploadHealthRecordScreenRouteProp = RouteProp<RootStackParamList, 'UploadHealthRecord'>;
export type UploadHealthRecordScreenProps = {
  navigation?: UploadHealthRecordScreenNavigationProp;
  route?: UploadHealthRecordScreenRouteProp;
};

export type InvoicesListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'InvoicesList'
>;
export type InvoicesListScreenRouteProp = RouteProp<RootStackParamList, 'InvoicesList'>;
export interface InvoicesListScreenProps {
  navigation?: InvoicesListScreenNavigationProp;
  route?: InvoicesListScreenRouteProp;
}
