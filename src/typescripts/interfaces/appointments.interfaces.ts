import { IRootResponse } from './common.interfaces';

export type MyAppointmentListRoot = IRootResponse<IMyAppointmentDoc[]>;
export type TGetApptTokenRoot = IRootResponse<IGetApptTokenDoc>;
export type TApptInfoRoot = IRootResponse<IApptInfoDoc>;

export interface IMyAppointmentDoc {
  id: string;
  created_from: string;
  created_by: string;
  appointment_id: string;
  patient_id: string;
  added_by: string;
  consultation_type: string;
  doctor_id: string;
  clinic_id: string;
  specialization: string;
  appointment_date: string;
  appointment_slot_time: AppointmentSlotTime[];
  start_time: string;
  end_time: string;
  appointment_fee: number;
  fee_type: string;
  appointment_type: string;
  appointment_status: string;
  doctor_note: any;
  payment_type: string;
  payment_status: string;
  transaction_id?: string;
  reason: any;
  meeting_id?: string;
  call_duration_seconds?: number;
  is_active: boolean;
  appointment_duration: number;
  created_at: string;
  updated_at: string;
  doctorInfo: DoctorInfo;
  clinicInfo: ClinicInfo;
  patientInfo: IPatientInfo;
}

export interface AppointmentSlotTime {
  start: string;
  end: string;
  booked: boolean;
}

export interface DoctorInfo {
  name: string;
  doctorId: number;
  profileImage: string;
}

export interface ClinicInfo {
  name: string;
  clinicId: number;
  fulladdress: string;
  location: {
    lat: number;
    lng: number;
  };
}

export interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface IGetApptTokenDoc {
  token: string;
  meeting_id: string;
  appointment: ITokenAppt;
  doctor: {
    id: string;
    name: string;
  };
  patient: {
    id: string;
    name: string;
  };
}

export interface ITokenAppt {
  id: string;
  appointment_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  slot_duration: number;
  appointment_duration: number;
  call_elapsed_seconds: number;
  both_connected_at: any;
  expected_end_at: any;
}

export interface IPatientInfo {
  name: string;
  patientId: string;
  displayPatientId: string;
  profileImage: any;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
}

export interface IApptInfoDoc {
  id: string;
  created_from: string;
  created_by: string;
  google_event_id: any;
  appointment_id: string;
  patient_id: string;
  added_by: string;
  consultation_type: string;
  doctor_id: string;
  clinic_id: string;
  specialization: string;
  appointment_date: string;
  appointment_slot_time: {
    end: string;
    start: string;
    booked: boolean;
  }[];
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  appointment_fee: number;
  fee_type: string;
  appointment_type: string;
  appointment_status: string;
  doctor_note: any;
  meeting_id: any;
  token: any;
  call_start_time: any;
  call_timer_started_at: any;
  call_elapsed_seconds: number;
  call_timer_paused: boolean;
  doctor_last_heartbeat: any;
  patient_last_heartbeat: any;
  call_end_time: any;
  call_duration_seconds: any;
  call_end_reason: any;
  max_participants: number;
  participant_join_times: any;
  payment_type: string;
  payment_status: string;
  transaction_id: any;
  reason: any;
  is_active: boolean;
  symptoms: any;
  medications: any;
  reminder_sent_at: any;
  created_at: string;
  updated_at: string;
  appointment_duration: number;
  doctor: IApptInfoDoctor;
  patient: IApptInfoPatient;
  clinic: IApptInfoClinic;
}

export interface IApptInfoDoctor {
  id: string;
  user_id: string;
  doctor_id: string;
  name: string;
  email: string;
  phone_number: string;
  profile_image: any;
  gender: string;
  specialization: string;
  sub_specializations: any;
  qualifications: string;
  experience_years: number;
  bio: string;
  languages_spoken: string[];
  license_number: string;
  rating: any;
  reviews_count: number;
}

export interface IApptInfoPatient {
  id: string;
  user_id: string;
  patient_id: string;
  name: string;
  email: string;
  phone_number: string;
  gender: string;
  date_of_birth: string;
  age: number;
  profile_image: any;
  blood_type: any;
  blood_pressure: any;
  pulse: any;
  temperature: any;
  spo2: any;
  weight: any;
  height: any;
  bmi: any;
  drug_allergies: any;
  medical_history: any;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  is_dependent: boolean;
  relation: string;
}

export interface IApptInfoClinic {
  id: string;
  name: string;
  email: string;
  contact_numbers: string[];
  full_address: string;
  line1: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  location: {
    lat: number;
    lng: number;
  };
  clinic_reg_number: string;
  gst_number: string;
  about: string;
}

export interface ICreateAppointmentPayload {
  doctor_id: string;
  patient_id: string;
  clinic_id: string;
  availability_id?: (string | number)[];
  appointment_date: string;
  start_time: string;
  end_time: string;
  consultation_type: string;
  appointment_type: string;
  reason?: string;
  appointment_slot_time: string;
}

export interface IBookingDoctorInfo {
  doctor_name: string;
  specialization: string;
  profile_image?: string | null;
}

export interface IBookingClinicInfo {
  name: string;
  city?: string;
}

export interface IBookingData {
  apiPayload: ICreateAppointmentPayload;
  date: string;
  dateLabel: string;
  doctor: IBookingDoctorInfo;
  clinic: IBookingClinicInfo;
  patientName: string;
  patientId?: string | number;
  slot: string;
  consultationFee: number;
  platformFee: number;
  isFeeHidden: boolean;
  consultation_type: string;
  appointment_type: string;
  reason?: string;
  totalAmount: number;
  doctorName?: string;
  doctorSpecialization?: string;
  doctorImage?: string;
  clinicName?: string;
  clinicCity?: string;
  appointment_id?: string;
  appointmentId?: string;
  id?: string;
  _id?: string;
  consultationType?: string;
  hideFee?: boolean;
  hide_fee?: boolean;
}
