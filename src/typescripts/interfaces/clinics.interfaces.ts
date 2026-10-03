import { IRootResponse } from './common.interfaces';

export type IClinicDetailsRoot = IRootResponse<IClinicDetailsDoc>;
export type IClinicDoctorsRoot = IRootResponse<IClinicDoctorDoc[]>;


export type IClinicDetailsDoc = {
  id: string;
  name: string;
  email: string;
  gst_number: string;
  clinic_reg_number: string;
  subscription_id: string;
  owner_id: string;
  about: string;
  line1: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  location: IClinicLoc;
  specialities: string[];
  contact_numbers: string[];
  status: string;
  fullAddress: string;
  qr_code: string;
  created_at: string;
  updated_at: string;
  owner: IClinicOwner;
  _count: IClinicCount;
};

export interface IClinicLoc {
  lat: number;
  lng: number;
}

export interface IClinicOwner {
  id: string;
  name: string;
  email: string;
  phone_number: string;
}

export interface IClinicCount {
  doctors: number;
  appointments: number;
  patient_clinics: number;
}

export type SubSpecializationType = Record<string, string[]> | string | null;

export interface IClinicDoctorDoc {
  user_id: number;
  doctor_name: string;
  year_of_experience: number | null;
  profile_image: string | null;
  specialization: string | null;
  subspecialization: SubSpecializationType;
}
