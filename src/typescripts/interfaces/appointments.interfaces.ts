import { IRootResponse } from './common.interfaces';

export type MyAppointmentListRoot = IRootResponse<IMyAppointmentDoc[]>;
export type TGetApptTokenRoot = IRootResponse<IGetApptTokenDoc>;

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
}

export interface ITokenAppt {
  id: string;
  appointment_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  slot_duration: number;
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
