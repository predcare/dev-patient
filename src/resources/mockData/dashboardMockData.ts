import { MyDoctorData, UpcomingAppointmentData } from './doctorsMockData';
import { MockFamilyMember } from './index';

export interface DashboardProfile {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone_number: string;
  gender: string;
  date_of_birth: string;
  profile_picture: string | null;
  isFamilyMember?: boolean;
  relation?: string;
}

export interface DashboardNotificationItem {
  id: number;
  user_id: number;
  user_type: string;
  event_category: 'appointment' | 'payment' | 'emr' | 'prescription' | string;
  event_action: string;
  description: string;
  created_at: string;
}

export interface DailyHealthTip {
  id: string;
  title: string;
  description: string;
  category: string;
  iconName: string;
  readTime: string;
  bannerColor: string;
}

export interface QuickAccessGridItem {
  key: string;
  label: string;
  icon: 'appointments' | 'doctors' | 'prescriptions' | 'records' | 'insurance' | 'reports' | 'invoices' | 'support';
  route?: string;
}

export interface DashboardVitalReading {
  id: string;
  title: string;
  value: string;
  unit: string;
  status: 'Normal' | 'Good' | 'Attention';
  statusColor: string;
  iconName: string;
  lastUpdated: string;
}

export const MOCK_DASHBOARD_PROFILE: DashboardProfile = {
  id: 1,
  user_id: 1001,
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone_number: '+91 98765 43210',
  gender: 'Male',
  date_of_birth: '1992-05-15',
  profile_picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
  isFamilyMember: false,
};

export const MOCK_DASHBOARD_VITALS: DashboardVitalReading[] = [
  {
    id: 'v1',
    title: 'Heart Rate',
    value: '72',
    unit: 'bpm',
    status: 'Normal',
    statusColor: '#22C55E',
    iconName: 'heart',
    lastUpdated: '10 mins ago',
  },
  {
    id: 'v2',
    title: 'Blood Pressure',
    value: '120/80',
    unit: 'mmHg',
    status: 'Normal',
    statusColor: '#22C55E',
    iconName: 'pulse',
    lastUpdated: 'Today, 8:30 AM',
  },
  {
    id: 'v3',
    title: 'Blood Sugar',
    value: '95',
    unit: 'mg/dL',
    status: 'Good',
    statusColor: '#0284C7',
    iconName: 'pill',
    lastUpdated: 'Yesterday',
  },
  {
    id: 'v4',
    title: 'Oxygen Level',
    value: '98',
    unit: '% SpO2',
    status: 'Normal',
    statusColor: '#22C55E',
    iconName: 'shield',
    lastUpdated: 'Today, 9:00 AM',
  },
];

export const MOCK_NOTIFICATIONS: DashboardNotificationItem[] = [
  {
    id: 1,
    user_id: 1001,
    user_type: 'patient',
    event_category: 'appointment',
    event_action: 'appointment_confirmed',
    description: 'Your Video Consultation with Dr. Sarah Jenkins is confirmed for Mon, 24 Aug at 10:30 AM.',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
  },
  {
    id: 2,
    user_id: 1001,
    user_type: 'patient',
    event_category: 'prescription',
    event_action: 'prescription_added',
    description: 'Dr. Rajesh Kumar uploaded a new digital prescription for your follow-up.',
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hrs ago
  },
  {
    id: 3,
    user_id: 1001,
    user_type: 'patient',
    event_category: 'payment',
    event_action: 'payment_received',
    description: 'Payment of ₹500 for Cardiology Consultation was completed successfully.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
];

export const MOCK_DAILY_HEALTH_TIPS: DailyHealthTip[] = [
  {
    id: 't1',
    title: 'Stay Hydrated Throughout the Day',
    description: 'Drinking 8-10 glasses of water daily boosts circulation, supports kidney health, and maintains optimal energy levels.',
    category: 'HYDRATION',
    iconName: 'droplet',
    readTime: '2 min read',
    bannerColor: '#E0F2FE',
  },
  {
    id: 't2',
    title: '30 Minutes of Daily Walking',
    description: 'Brisk walking reduces cardiovascular risks, regulates blood pressure, and promotes positive mental health.',
    category: 'FITNESS',
    iconName: 'activity',
    readTime: '3 min read',
    bannerColor: '#DCFCE7',
  },
  {
    id: 't3',
    title: 'Prioritize 7-8 Hours of Restful Sleep',
    description: 'Quality sleep enhances immune defense, cognitive memory retention, and cellular recovery.',
    category: 'WELLNESS',
    iconName: 'moon',
    readTime: '2 min read',
    bannerColor: '#F3E8FF',
  },
];
