import { IRootResponse } from './common.interfaces';

export type IFamilyMemberList = IRootResponse<IFamillyMemberDoc[]>;
export type IFamilyMemberInfoRoot = IRootResponse<IFamilyMemberInfo>;

export interface IMyProfileDoc {
  id: string;
  parent_user_id: any;
  relation: any;
  is_dependent: boolean;
  can_login: boolean;
  salutation: string;
  country_code: number;
  phone_number: string;
  gender: string;
  date_of_birth: any;
  alternate_number: any;
  whatsapp_number: any;
  name: string;
  email: string;
  email_verified_at: any;
  phone_verified_at: string;
  status: string;
  user_type: string;
  max_active_devices: number;
  is_superadmin: boolean;
  last_login_at: string;
  has_accepted_policies: boolean;
  created_at: string;
  updated_at: string;
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
  verified_at: string;
}

export interface IFamillyMemberDoc {
  user_id: string;
  name: string;
  gender: string;
  date_of_birth: string;
  relation: string;
  profile_image: string;
}

export interface IFamilyMemberInfo {
  user_id: string;
  patient_id: string;
  patient_table_id: string;
  name: string;
  gender: string;
  date_of_birth: string;
  relation: string;
  salutation: any;
  phone_number: string;
  email: string;
  alternate_number: any;
  whatsapp_number: any;
  profile_image: any;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  blood_type: any;
  blood_pressure: any;
  pulse: any;
  temperature: any;
  spo2: any;
  weight: any;
  height: any;
  bmi: any;
  medical_history: any;
  drug_allergies: any;
  status: string;
  is_dependent: boolean;
  created_at: string;
  updated_at: string;
}
