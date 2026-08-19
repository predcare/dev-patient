import { IRootResponse } from './common.interfaces';

export type TMyProfileRoot = IRootResponse<IMyProfileDoc>;

export interface ILoginResponse {
  success: boolean;
  status?: number;
  statusCode?: number;
  message: string;
  data: IMyProfileDoc;
  token: string;
}

export interface IMyProfileDoc {
  id: string;
  parent_user_id: any;
  relation: any;
  is_dependent: boolean;
  can_login: boolean;
  salutation: any;
  country_code: number;
  phone_number: string;
  gender: any;
  date_of_birth: any;
  alternate_number: any;
  whatsapp_number: any;
  name: string;
  email: string;
  email_verified_at: string;
  status: string;
  user_type: string;
  max_active_devices: number;
  device_limit_override: any;
  is_superadmin: boolean;
  created_from: string;
  last_login_at: string;
  created_at: string;
  updated_at: string;
  patient_record_id: string;
  patient_id: string;
  patient_status: string;
  address: any;
  city: any;
  state: any;
  postal_code: any;
  country: any;
  profile_image: any;
  medical_history: any;
  blood_type: any;
  blood_pressure: any;
  pulse: any;
  temperature: any;
  spo2: any;
  weight: any;
  height: any;
  bmi: any;
  drug_allergies: any;
  patient_verified_at: string;
}
