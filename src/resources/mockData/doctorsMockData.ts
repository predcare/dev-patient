export interface UpcomingAppointmentData {
  id: number;
  appointment_date: string;
  appointment_date_label: string;
  start_time: string;
  start_time_label: string;
  consultation_type: string;
}

export interface PastAppointmentData {
  id: number;
  appointment_date: string;
  appointment_date_label: string;
  is_last_visit?: boolean;
}

export interface MyDoctorData {
  doctor_user_id: number;
  doctor_name: string;
  specialization: string;
  clinic_name: string;
  profile_image?: string | null;
  initials: string;
  can_rebook: boolean;
  book_label: string;
  upcoming_appointments: UpcomingAppointmentData[];
  past_appointments: PastAppointmentData[];
}

export interface ClinicLocationData {
  clinic_id: number;
  clinic_name: string;
  address: string;
  city: string;
  upcomingDates: string[];
}

export interface SearchDoctorData {
  doctor_id: number;
  doctor_name: string;
  specialization: string;
  qualifications: string;
  years_of_experience: number;
  rating: number;
  review_count: number;
  patients_treated: string;
  profile_image?: string | null;
  initials: string;
  city: string;
  languages: string[];
  bio: string;
  min_video_fee?: number | null;
  min_in_person_fee?: number | null;
  next_available_dates: string[];
  clinics: ClinicLocationData[];
  gender: 'male' | 'female' | 'other';
}

export const MOCK_MY_DOCTORS: MyDoctorData[] = [
  {
    doctor_user_id: 100,
    doctor_name: 'Dr. Sahil Mallick',
    specialization: 'Anesthesiology',
    clinic_name: 'PREDCARE MEDICAL CENTER',
    profile_image: null,
    initials: 'SM',
    can_rebook: true,
    book_label: 'Consult',
    upcoming_appointments: [],
    past_appointments: [],
  },
  {
    doctor_user_id: 101,
    doctor_name: 'Dr. Sarah Jenkins',
    specialization: 'Cardiologist • MD',
    clinic_name: 'ST. JUDE MEDICAL CENTER',
    profile_image:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500',
    initials: 'SJ',
    can_rebook: true,
    book_label: 'Book Appointment',
    upcoming_appointments: [
      {
        id: 501,
        appointment_date: '2026-08-24',
        appointment_date_label: 'Mon, 24 Aug 2026',
        start_time: '10:30:00',
        start_time_label: '10:30 AM',
        consultation_type: 'VIDEO CONSULTATION',
      },
    ],
    past_appointments: [
      {
        id: 401,
        appointment_date: '2026-07-12',
        appointment_date_label: '12 Jul 2026',
        is_last_visit: true,
      },
      {
        id: 402,
        appointment_date: '2026-05-18',
        appointment_date_label: '18 May 2026',
      },
    ],
  },
  {
    doctor_user_id: 102,
    doctor_name: 'Dr. Rajesh Kumar',
    specialization: 'Neurologist • MBBS, DM',
    clinic_name: 'APOLLO HEALTHCARE CLINIC',
    profile_image:
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500',
    initials: 'RK',
    can_rebook: true,
    book_label: 'Rebook',
    upcoming_appointments: [],
    past_appointments: [
      {
        id: 403,
        appointment_date: '2026-06-30',
        appointment_date_label: '30 Jun 2026',
        is_last_visit: true,
      },
    ],
  },
  {
    doctor_user_id: 103,
    doctor_name: 'Dr. Emily Chen',
    specialization: 'Pediatrician • MD',
    clinic_name: 'SUNSHINE CHILDREN HOSPITAL',
    profile_image: null,
    initials: 'EC',
    can_rebook: true,
    book_label: 'Book Appointment',
    upcoming_appointments: [
      {
        id: 502,
        appointment_date: '2026-09-02',
        appointment_date_label: 'Wed, 02 Sep 2026',
        start_time: '02:15:00',
        start_time_label: '02:15 PM',
        consultation_type: 'IN-PERSON VISIT',
      },
    ],
    past_appointments: [],
  },
];

export const MOCK_SEARCH_DOCTORS: SearchDoctorData[] = [
  {
    doctor_id: 101,
    doctor_name: 'Dr. Sarah Jenkins',
    specialization: 'Cardiologist',
    qualifications: 'MD, FACC • Cardiology',
    years_of_experience: 12,
    rating: 4.9,
    review_count: 142,
    patients_treated: '1.2k+',
    profile_image:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500',
    initials: 'SJ',
    city: 'Bangalore',
    languages: ['English', 'Hindi', 'Kannada'],
    bio: 'Dr. Sarah Jenkins is a leading Consultant Cardiologist with over 12 years of clinical experience in preventive cardiology, heart failure management, and non-invasive cardiac imaging.',
    min_video_fee: 800,
    min_in_person_fee: 1000,
    next_available_dates: ['2026-08-19', '2026-08-20', '2026-08-21'],
    gender: 'female',
    clinics: [
      {
        clinic_id: 201,
        clinic_name: 'St. Jude Medical Center',
        address: '123 Healthcare Ave, MG Road, Bangalore, Karnataka 560001',
        city: 'Bangalore',
        upcomingDates: ['2026-08-19', '2026-08-20', '2026-08-21'],
      },
      {
        clinic_id: 202,
        clinic_name: 'PredCare Heart Specialty Clinic',
        address: '45 Indiranagar Double Road, Bangalore 560038',
        city: 'Bangalore',
        upcomingDates: ['2026-08-22', '2026-08-23'],
      },
    ],
  },
  {
    doctor_id: 102,
    doctor_name: 'Dr. Rajesh Kumar',
    specialization: 'Neurologist',
    qualifications: 'MBBS, DM (Neurology)',
    years_of_experience: 15,
    rating: 4.8,
    review_count: 98,
    patients_treated: '2.5k+',
    profile_image:
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500',
    initials: 'RK',
    city: 'Bangalore',
    languages: ['English', 'Hindi', 'Tamil'],
    bio: 'Dr. Rajesh Kumar is a senior Neurologist specializing in headache management, stroke rehabilitation, and movement disorders.',
    min_video_fee: 900,
    min_in_person_fee: 1200,
    next_available_dates: ['2026-08-20', '2026-08-22'],
    gender: 'male',
    clinics: [
      {
        clinic_id: 203,
        clinic_name: 'Apollo Neuro Center',
        address: '88 Koramangala 8th Block, Bangalore 560095',
        city: 'Bangalore',
        upcomingDates: ['2026-08-20', '2026-08-22'],
      },
    ],
  },
  {
    doctor_id: 103,
    doctor_name: 'Dr. Emily Chen',
    specialization: 'Pediatrician',
    qualifications: 'MD (Pediatrics), DCH',
    years_of_experience: 8,
    rating: 4.95,
    review_count: 210,
    patients_treated: '3.1k+',
    profile_image: null,
    initials: 'EC',
    city: 'Mumbai',
    languages: ['English', 'Marathi'],
    bio: 'Dr. Emily Chen is a compassionate Pediatrician focusing on child nutrition, growth monitoring, and pediatric immunization.',
    min_video_fee: 600,
    min_in_person_fee: 800,
    next_available_dates: ['2026-08-19', '2026-08-21', '2026-08-23'],
    gender: 'female',
    clinics: [
      {
        clinic_id: 204,
        clinic_name: 'Sunshine Children Hospital',
        address: '12 Marine Drive, Bandra West, Mumbai 400050',
        city: 'Mumbai',
        upcomingDates: ['2026-08-19', '2026-08-21'],
      },
    ],
  },
  {
    doctor_id: 104,
    doctor_name: 'Dr. Vikram Patel',
    specialization: 'Orthopedic',
    qualifications: 'MS (Ortho), DNB',
    years_of_experience: 16,
    rating: 4.7,
    review_count: 115,
    patients_treated: '1.8k+',
    profile_image:
      'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500',
    initials: 'VP',
    city: 'Delhi',
    languages: ['English', 'Hindi', 'Punjabi'],
    bio: 'Dr. Vikram Patel is an expert Orthopedic Surgeon specializing in joint replacement, sports injury care, and spine health.',
    min_video_fee: 1000,
    min_in_person_fee: 1500,
    next_available_dates: ['2026-08-21', '2026-08-24'],
    gender: 'male',
    clinics: [
      {
        clinic_id: 205,
        clinic_name: 'Fortis Bone & Joint Clinic',
        address: 'Sector 4, RK Puram, New Delhi 110022',
        city: 'Delhi',
        upcomingDates: ['2026-08-21', '2026-08-24'],
      },
    ],
  },
];

export const MOCK_SPECIALTIES = [
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Dermatology',
  'Orthopedics',
  'General Physician',
];

export const MOCK_CITIES_LIST = [
  'Bangalore',
  'Mumbai',
  'Delhi',
  'Chennai',
  'Hyderabad',
];
