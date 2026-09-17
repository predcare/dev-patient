export interface IMyProfileRoot {
  success: boolean;
  doctor: IMyProfileDoc;
}

export interface IPatientEMRRoot {
  success: boolean;
  count: number;
  documents: IPatientEMRDoc[];
}

export interface IMyProfileDoc {
  doctor_id: number;
  email: string;
  id: number;
  name: string;
  phone_number: string;
  alternate_number: string;
  whatsapp_number: string;
  role: string;
  status: string;
  user_id: number;
  specialization: string;
  qualifications: string;
  experience_years: number;
  license_number: string;
  bio: string;
  google_calendar_connected: boolean;
  clinic_id: number;
  clinic_name: string;
  clinic_association_status: string;
  clinic_address: string;
  clinic_phone: string;
  clinic_email: string;
  clinic_gstin: string;
  sub_specializations: any;
  address: any;
  city: any;
  state: any;
  country: any;
  postal_code: any;
  profile_image: any;
  languages_spoken: string[];
  license_valid_until: any;
  gender: string;
  clinic_reg_number: string;
  clinic_location: IClinicLocation;
  location: ILocation;
  has_accepted_policies?: boolean;
  parent_user_id: any;
  relation: any;
  is_dependent: boolean;
  can_login: boolean;
  salutation: string;
  country_code: number;
  date_of_birth: string;
  email_verified_at: any;
  phone_verified_at: string;
  user_type: string;
  max_active_devices: number;
  is_superadmin: boolean;
  last_login_at: string;
  created_at: string;
  updated_at: string;
  doctor_status: string;
  doctor_gender: any;
  license_state: any;
  verification_status: string;
  doctor_verified_at: string;
  doctor_verified_by: string;
  rating: any;
  reviews_count: number;
  accepts_new_patients: boolean;
  approval_required: boolean;
  booking_type: string;
  current_clinic: any;
  doctor_profile_image: any;
  certificates: any;
  clinic: IMyClinic;
}

export interface IPatientEMRDoc {
  id: number;
  patient_id: number;
  doctor_id: number;
  document_type: string;
  title: string;
  document_path: string;
  description: string;
  visible_to_patient: number;
  document_url: string;
  appointment_id?: number;
  uploaded_during_call: number;
  created_at: string;
  updated_at: string;
  specialization: string;
  doctor_name: string;
  appointment_date?: string;
  patient_record_id: number;
  patient_user_id: number;
  notes: string;
  shared_doctor_ids: number[];
  uuid: string;
  clinic_id: any;
  file_size: string;
  owner_type: string;
  owner_id: string;
  meeting_id: any;
  created_from: string;
  created_by: string;
}

export interface ILocation {
  lat: number;
  lng: number;
}

export interface IClinicLocation {
  lat: number;
  lng: number;
}

export interface IMyClinic {
  id: string | number;
  name: string;
  clinic_reg_number: string;
  owner_id?: number | string;
  about?: string;
  line1?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  location?: IClinicLocation;
  specialities?: string[];
  contact_numbers?: string[];
  status?: string;
  qr_code?: string;
  created_at?: string;
  updated_at?: string;
  email?: string;
}
