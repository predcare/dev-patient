export interface MockPatient {
  id: string;
  user_id?: string;
  name: string;
  patientId: string;
  gender: string;
  age: string;
  phone: string;
  bloodGroup: string;
  avatarBgColor?: string;
}

export interface MockAvailableDate {
  date: string;
  formattedDate: string;
  consultation_type: 'video' | 'in-person' | 'both';
  clinic_id: string;
  availability_id: string;
  in_person_fee: number;
  video_fee: number;
}

export interface MockTimeSlot {
  start: string;
  end: string;
  period: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
  booked?: boolean;
}

export interface MockAppointment {
  id: number;
  appointment_id: string;
  patient_id: number;
  patient_record_id: string;
  patient_name: string;
  patient_gender: string;
  patient_age: string;
  patient_phone: string;
  consultation_type: 'video' | 'in-person' | string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  appointment_fee: number;
  appointment_status: 'confirmed' | 'completed' | 'cancelled' | 'pending' | string;
  payment_status: string;
  reason?: string;
  symptoms?: string;
}

export const MOCK_PATIENTS: MockPatient[] = [
  {
    id: 'p1',
    user_id: 'u1',
    name: 'Eleanor Vance',
    patientId: 'PAT-1092',
    gender: 'Female',
    age: '34 yrs',
    phone: '+1 (555) 019-2834',
    bloodGroup: 'O+',
    avatarBgColor: '#0F766E',
  },
  {
    id: 'p2',
    user_id: 'u2',
    name: 'Marcus Aurelius',
    patientId: 'PAT-1093',
    gender: 'Male',
    age: '42 yrs',
    phone: '+1 (555) 341-9982',
    bloodGroup: 'A+',
    avatarBgColor: '#0284C7',
  },
  {
    id: 'p3',
    user_id: 'u3',
    name: 'Sophia Loren',
    patientId: 'PAT-1094',
    gender: 'Female',
    age: '29 yrs',
    phone: '+1 (555) 872-1049',
    bloodGroup: 'B+',
    avatarBgColor: '#8B5CF6',
  },
  {
    id: 'p4',
    user_id: 'u4',
    name: 'David Beckham',
    patientId: 'PAT-1095',
    gender: 'Male',
    age: '48 yrs',
    phone: '+1 (555) 612-4410',
    bloodGroup: 'AB+',
    avatarBgColor: '#F59E0B',
  },
];

export const MOCK_AVAILABLE_DATES: MockAvailableDate[] = [
  {
    date: '2026-08-18',
    formattedDate: 'Tue, Aug 18, 2026',
    consultation_type: 'both',
    clinic_id: 'c1',
    availability_id: 'av1',
    in_person_fee: 500,
    video_fee: 300,
  },
  {
    date: '2026-08-19',
    formattedDate: 'Wed, Aug 19, 2026',
    consultation_type: 'both',
    clinic_id: 'c1',
    availability_id: 'av2',
    in_person_fee: 500,
    video_fee: 300,
  },
  {
    date: '2026-08-20',
    formattedDate: 'Thu, Aug 20, 2026',
    consultation_type: 'both',
    clinic_id: 'c1',
    availability_id: 'av3',
    in_person_fee: 500,
    video_fee: 300,
  },
  {
    date: '2026-08-21',
    formattedDate: 'Fri, Aug 21, 2026',
    consultation_type: 'both',
    clinic_id: 'c1',
    availability_id: 'av4',
    in_person_fee: 500,
    video_fee: 300,
  },
  {
    date: '2026-08-22',
    formattedDate: 'Sat, Aug 22, 2026',
    consultation_type: 'both',
    clinic_id: 'c1',
    availability_id: 'av5',
    in_person_fee: 600,
    video_fee: 400,
  },
];

export const MOCK_SLOTS_BY_PERIOD: Record<string, MockTimeSlot[]> = {
  MORNING: [
    { start: '09:00', end: '09:30', period: 'MORNING', booked: false },
    { start: '09:30', end: '10:00', period: 'MORNING', booked: false },
    { start: '10:00', end: '10:30', period: 'MORNING', booked: true },
    { start: '10:30', end: '11:00', period: 'MORNING', booked: false },
    { start: '11:00', end: '11:30', period: 'MORNING', booked: false },
  ],
  AFTERNOON: [
    { start: '14:00', end: '14:30', period: 'AFTERNOON', booked: false },
    { start: '14:30', end: '15:00', period: 'AFTERNOON', booked: false },
    { start: '15:00', end: '15:30', period: 'AFTERNOON', booked: true },
    { start: '15:30', end: '16:00', period: 'AFTERNOON', booked: false },
  ],
  EVENING: [
    { start: '17:00', end: '17:30', period: 'EVENING', booked: false },
    { start: '17:30', end: '18:00', period: 'EVENING', booked: false },
    { start: '18:00', end: '18:30', period: 'EVENING', booked: false },
    { start: '18:30', end: '19:00', period: 'EVENING', booked: true },
  ],
  NIGHT: [
    { start: '20:00', end: '20:30', period: 'NIGHT', booked: false },
    { start: '20:30', end: '21:00', period: 'NIGHT', booked: false },
  ],
};

export const MOCK_APPOINTMENTS: MockAppointment[] = [
  {
    id: 101,
    appointment_id: 'APT-8821',
    patient_id: 1,
    patient_record_id: 'PAT-1092',
    patient_name: 'Eleanor Vance',
    patient_gender: 'Female',
    patient_age: '34 yrs',
    patient_phone: '+1 (555) 019-2834',
    consultation_type: 'video',
    appointment_date: '2026-08-18',
    start_time: '10:30',
    end_time: '11:00',
    appointment_fee: 300,
    appointment_status: 'confirmed',
    payment_status: 'paid',
    reason: 'Follow-up consultation for Chest Tightness',
    symptoms: 'Chest tightness & fatigue',
  },
  {
    id: 102,
    appointment_id: 'APT-8822',
    patient_id: 2,
    patient_record_id: 'PAT-1093',
    patient_name: 'Marcus Aurelius',
    patient_gender: 'Male',
    patient_age: '42 yrs',
    patient_phone: '+1 (555) 341-9982',
    consultation_type: 'in-person',
    appointment_date: '2026-08-18',
    start_time: '14:00',
    end_time: '14:30',
    appointment_fee: 500,
    appointment_status: 'confirmed',
    payment_status: 'paid',
    reason: 'Routine Hypertension Checkup',
    symptoms: 'High BP & Headaches',
  },
  {
    id: 103,
    appointment_id: 'APT-8823',
    patient_id: 3,
    patient_record_id: 'PAT-1094',
    patient_name: 'Sophia Loren',
    patient_gender: 'Female',
    patient_age: '29 yrs',
    patient_phone: '+1 (555) 872-1049',
    consultation_type: 'video',
    appointment_date: '2026-08-17',
    start_time: '17:00',
    end_time: '17:30',
    appointment_fee: 300,
    appointment_status: 'completed',
    payment_status: 'paid',
    reason: 'Cardiology Report Discussion',
    symptoms: 'Mild Palpitations',
  },
  {
    id: 104,
    appointment_id: 'APT-8824',
    patient_id: 4,
    patient_record_id: 'PAT-1095',
    patient_name: 'David Beckham',
    patient_gender: 'Male',
    patient_age: '48 yrs',
    patient_phone: '+1 (555) 612-4410',
    consultation_type: 'in-person',
    appointment_date: '2026-08-16',
    start_time: '11:00',
    end_time: '11:30',
    appointment_fee: 500,
    appointment_status: 'completed',
    payment_status: 'paid',
    reason: 'ECG & Lipid Profile Review',
    symptoms: 'Shortness of breath on exertion',
  },
];

export interface MockFamilyMember {
  id: string;
  name: string;
  relation?: string;
  gender?: string;
  isCurrentUser?: boolean;
  initials: string;
  profile_picture?: string | null;
}

export const MOCK_FAMILY_MEMBERS: MockFamilyMember[] = [
  {
    id: 'self',
    name: 'John Doe',
    relation: 'Self',
    isCurrentUser: true,
    initials: 'JD',
  },
  {
    id: '2',
    name: 'Jane Doe',
    relation: 'Spouse',
    isCurrentUser: false,
    initials: 'JD',
  },
  {
    id: '3',
    name: 'Tommy Doe',
    relation: 'Child',
    isCurrentUser: false,
    initials: 'TD',
  },
];

export const MOCK_USER_PROFILE = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+91 9876543210',
  address: '123 Healthcare Ave, MG Road',
  city: 'Bangalore',
  state: 'Karnataka',
  postalCode: '560001',
  country: 'India',
  initials: 'JD',
};

export const MOCK_RELATION_OPTIONS = [
  { label: 'Father', value: 'father' },
  { label: 'Mother', value: 'mother' },
  { label: 'Spouse', value: 'spouse' },
  { label: 'Son', value: 'son' },
  { label: 'Daughter', value: 'daughter' },
  { label: 'Sibling', value: 'sibling' },
  { label: 'Other', value: 'other' },
];

export const MOCK_GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Others', value: 'others' },
];

export const MOCK_STATES = [
  { id: 1, name: 'Karnataka' },
  { id: 2, name: 'Maharashtra' },
  { id: 3, name: 'Tamil Nadu' },
  { id: 4, name: 'Delhi' },
  { id: 5, name: 'Telangana' },
];

export const MOCK_CITIES = [
  { id: 101, name: 'Bangalore', stateId: 1 },
  { id: 102, name: 'Mysore', stateId: 1 },
  { id: 103, name: 'Hubli', stateId: 1 },
  { id: 201, name: 'Mumbai', stateId: 2 },
  { id: 202, name: 'Pune', stateId: 2 },
  { id: 301, name: 'Chennai', stateId: 3 },
  { id: 401, name: 'New Delhi', stateId: 4 },
  { id: 501, name: 'Hyderabad', stateId: 5 },
];

export * from './supportMockData';
export * from './doctorsMockData';
export * from './dashboardMockData';
export * from './prescriptionsMockData';
export * from './appointmentsMockData';
export * from './clinicsMockData';

