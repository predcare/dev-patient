import { IRootResponse } from './common.interfaces';

export type TRxListRoot = IRootResponse<IRxListDoc[]>;
export type TRxInfoRoot = IRootResponse<IRxInfoDoc>;

export interface IRxListDoc {
  id: string;
  prescription_id: string;
  created_at: string;
  consultation_date: string;
  email_sent_at: string;
  status: string;
  type: string;
  pdf_url: string;
  diagnosis: string;
  symptoms: string;
  follow_up: string;
  follow_up_date: string;
  appointment_id: string;
  doctor_info: IRxDoctorInfo;
  clinic_info: IRxClinicInfo;
  patient_info: IRxPatientInfo;
}

export interface IRxDoctorInfo {
  id: string;
  name: string;
  specialization: string;
  qualifications: string;
  profile_image: any;
}

export interface IRxClinicInfo {
  id: string;
  name: string;
  address: string;
  phone: any;
}

export interface IRxPatientInfo {
  id: string;
  name: string;
  display_id: string;
}

export interface IRxInfoDoc {
  id: string;
  prescription_id: string;
  created_from: string;
  created_by: string;
  doctor_id: string;
  patient_id: string;
  appointment_id: string;
  clinic_id: string;
  type: string;
  status: string;
  pdf_path: string;
  pdf_url: string;
  doctor_name: string;
  doctor_qualifications: string;
  doctor_specialization: string;
  doctor_experience_years: string;
  doctor_license_number: string;
  doctor_teleconsult_available: boolean;
  clinic_name: string;
  clinic_address: string;
  clinic_phone: any;
  clinic_email: string;
  clinic_gstin: any;
  clinic_reg_no: any;
  patient_name: string;
  patient_display_id: string;
  patient_age: string;
  patient_gender: string;
  patient_phone: string;
  consultation_date: string;
  consultation_mode: string;
  blood_pressure: string;
  pulse: string;
  temperature: string;
  spo2: string;
  weight: number;
  height: number;
  bmi: number;
  custom_vitals: IRxCustomVital[];
  drug_allergies: string;
  chronic_conditions: string;
  chief_complaints: string;
  examination_notes: string;
  diagnosis: string;
  treatment_plan: string;
  symptoms: string;
  medications: IRxMedication[];
  lab_tests: RxLabTest[];
  general_advice: string;
  follow_up: string;
  follow_up_date: string;
  referral_specialist: string;
  referral_doctor_hospital: string;
  referral_reason: string;
  notes: any;
  digital_signature: any;
  visit_no: number;
  email_sent_at: string;
  created_at: string;
  updated_at: string;
  doctor_prescription_id: string;
  version_no: number;
  version_name: string;
  version_status: string;
  published_at: string;
  superseded_at: any;
  superseded_by_version_id: any;
  prescription_version_code: string;
  verify_token: string;
  send_channel: string;
  amendment_note: any;
  current_version_id: any;
  published_version_count: any;
  last_published_at: any;
  referral_doctor_name: string;
}

export interface IRxCustomVital {
  name: string;
  value: string;
}

export interface IRxMedication {
  name: string;
  dosage: string;
  timing: string;
  strength: string;
  durationNum: string;
  durationUnit: string;
  instructions: string;
  strengthUnit: string;
}

export interface RxLabTest {
  name: string;
  instructions: string;
}
