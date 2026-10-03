export interface ClinicDoctor {
  doctor_id: number;
  doctor_name: string;
  specialization?: string;
  experience_years?: number;
  doctor_image?: string;
}

export interface MockClinicItem {
  clinic_id: number;
  clinic_name: string;
  email?: string;
  about?: string;
  line1?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  specialities?: string[];
  contact_numbers?: string[];
  doctors?: ClinicDoctor[];
}

export const MOCK_CLINICS: MockClinicItem[] = [
  {
    clinic_id: 1,
    clinic_name: 'ST. JUDE MEDICAL CENTER',
    email: 'contact@stjudehealth.com',
    about:
      'St. Jude Medical Center is a premier multi-specialty healthcare facility dedicated to providing world-class compassionate medical care, advanced diagnostic testing, and specialized treatments.',
    line1: '742 Evergreen Terrace, Suite 400',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    pincode: '10001',
    specialities: ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Anesthesiology'],
    contact_numbers: ['+1 (555) 234-5678', '+1 (555) 876-5432'],
    doctors: [
      {
        doctor_id: 101,
        doctor_name: 'Sarah Jenkins',
        specialization: 'Cardiologist • MD',
        experience_years: 12,
      },
      {
        doctor_id: 100,
        doctor_name: 'Sahil Mallick',
        specialization: 'Anesthesiology',
        experience_years: 8,
      },
      {
        doctor_id: 102,
        doctor_name: 'Rajesh Kumar',
        specialization: 'Neurologist • MBBS, DM',
        experience_years: 15,
      },
    ],
  },
];
