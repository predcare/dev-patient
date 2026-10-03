export interface MockAppointmentItem {
  id: number;
  appointment_id: string;
  doctor_name: string;
  doctor_user_id: number;
  specialization: string;
  clinic_name?: string;
  clinic_address?: string;
  clinic_latitude?: number;
  clinic_longitude?: number;
  appointment_date: string;
  appointment_date_label: string;
  appointment_slot_time: string;
  start_time: string;
  end_time: string;
  slot_duration: number;
  consultation_type: 'video' | 'in_person' | string;
  appointment_status: 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'pending' | string;
  payment_status: 'paid' | 'pending' | 'cancelled' | string;
  call_start_time?: string | null;
  call_duration_seconds?: number;
  doctor_image?: string | null;
  patient_name?: string;
}

export const MOCK_UPCOMING_APPOINTMENTS: MockAppointmentItem[] = [
  {
    id: 1001,
    appointment_id: 'APT-99201',
    doctor_name: 'Sarah Jenkins',
    doctor_user_id: 101,
    specialization: 'Cardiologist • MD',
    clinic_name: 'ST. JUDE MEDICAL CENTER',
    clinic_address: '742 Evergreen Terrace, Suite 400, New York',
    appointment_date: '2026-08-24',
    appointment_date_label: '24 Aug',
    appointment_slot_time: JSON.stringify([{ start: '10:30:00', end: '11:00:00' }]),
    start_time: '10:30 AM',
    end_time: '11:00 AM',
    slot_duration: 30,
    consultation_type: 'video',
    appointment_status: 'confirmed',
    payment_status: 'paid',
    doctor_image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500',
  },
  {
    id: 1002,
    appointment_id: 'APT-99202',
    doctor_name: 'Sahil Mallick',
    doctor_user_id: 100,
    specialization: 'Anesthesiology',
    clinic_name: 'PREDCARE MEDICAL CENTER',
    clinic_address: '120 Healthcare Avenue, Downtown, New York',
    clinic_latitude: 40.7128,
    clinic_longitude: -74.006,
    appointment_date: '2026-08-26',
    appointment_date_label: '26 Aug',
    appointment_slot_time: JSON.stringify([{ start: '14:00:00', end: '14:30:00' }]),
    start_time: '02:00 PM',
    end_time: '02:30 PM',
    slot_duration: 30,
    consultation_type: 'in_person',
    appointment_status: 'confirmed',
    payment_status: 'paid',
    doctor_image: null,
  },
  {
    id: 1003,
    appointment_id: 'APT-99203',
    doctor_name: 'Rajesh Kumar',
    doctor_user_id: 102,
    specialization: 'Neurologist • MBBS, DM',
    clinic_name: 'APOLLO HEALTHCARE CLINIC',
    clinic_address: '45 Apollo Park Road, Sector 5, New York',
    appointment_date: '2026-08-29',
    appointment_date_label: '29 Aug',
    appointment_slot_time: JSON.stringify([{ start: '11:15:00', end: '11:45:00' }]),
    start_time: '11:15 AM',
    end_time: '11:45 AM',
    slot_duration: 30,
    consultation_type: 'video',
    appointment_status: 'pending',
    payment_status: 'pending',
  },
];

export const MOCK_COMPLETED_APPOINTMENTS: MockAppointmentItem[] = [
  {
    id: 2001,
    appointment_id: 'APT-88101',
    doctor_name: 'Emily Chen',
    doctor_user_id: 103,
    specialization: 'Pediatrician • MD',
    clinic_name: 'SUNSHINE CHILDREN HOSPITAL',
    clinic_address: '88 Children Way, Midtown, New York',
    appointment_date: '2026-08-10',
    appointment_date_label: '10 Aug',
    appointment_slot_time: JSON.stringify([{ start: '09:00:00', end: '09:30:00' }]),
    start_time: '09:00 AM',
    end_time: '09:30 AM',
    slot_duration: 30,
    consultation_type: 'in_person',
    appointment_status: 'completed',
    payment_status: 'paid',
  },
  {
    id: 2002,
    appointment_id: 'APT-88102',
    doctor_name: 'Sarah Jenkins',
    doctor_user_id: 101,
    specialization: 'Cardiologist • MD',
    clinic_name: 'ST. JUDE MEDICAL CENTER',
    clinic_address: '742 Evergreen Terrace, Suite 400, New York',
    appointment_date: '2026-07-15',
    appointment_date_label: '15 Jul',
    appointment_slot_time: JSON.stringify([{ start: '16:00:00', end: '16:30:00' }]),
    start_time: '04:00 PM',
    end_time: '04:30 PM',
    slot_duration: 30,
    consultation_type: 'video',
    appointment_status: 'completed',
    payment_status: 'paid',
    call_duration_seconds: 1800,
  },
  {
    id: 2003,
    appointment_id: 'APT-88103',
    doctor_name: 'Michael Chang',
    doctor_user_id: 104,
    specialization: 'Orthopedic Surgeon • MS',
    clinic_name: 'CITY ORTHO CLINIC',
    clinic_address: '15 Sports Complex Road, New York',
    appointment_date: '2026-06-20',
    appointment_date_label: '20 Jun',
    appointment_slot_time: JSON.stringify([{ start: '15:30:00', end: '16:00:00' }]),
    start_time: '03:30 PM',
    end_time: '04:00 PM',
    slot_duration: 30,
    consultation_type: 'in_person',
    appointment_status: 'cancelled',
    payment_status: 'cancelled',
  },
];
