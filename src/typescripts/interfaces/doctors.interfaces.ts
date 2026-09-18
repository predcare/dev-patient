import { IRootResponse } from './common.interfaces';

export type AllDoctorsRoot = IRootResponse<IAllDoctorData>;
export type DoctorDetailsRoot = IRootResponse<IDoctorDetailsDoc>;
export type DoctorClinicSummaryRoot = IRootResponse<IDoctorClinicSummaryData>;
export type DoctorAvailTimeSlotsRoot = IRootResponse<IDoctorAvailTimeSlots>;
export type MyDoctorsRoot = IRootResponse<MyDoctorsDoc[]>;

export interface IDoctorClinicSummaryData {
  doctor: {
    id: string;
    user_id: string;
    doctor_id: string;
    name: string;
    specialization: string;
    sub_specializations: string[];
    experience_years: number;
    profile_image: string | null;
    rating: number | null;
    reviews_count: number;
  };
  clinic: {
    id: string;
    name: string;
    line1: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    status: string;
  };
}

export interface IAllDoctorData {
  doctors: IDoctorDoc[];
  clinics: IClinicDoc[];
}

export interface IDoctorDoc {
  id: string;
  user_id: string;
  doctor_id: string;
  name: string;
  profile_image: any;
  specialization: string;
  experience_years: number;
  city: string;
  rating: any;
  reviews_count: number;
  clinic: {
    id: string;
    name: string;
  };
  next_available_date: string;
  offers_video: boolean;
  offers_in_person: boolean;
  status: string;
}

export interface IClinicDoc {
  id: string;
  name: string;
  location: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  specialities: string[];
  available_doctors_count: number;
  status: string;
}

export interface IDoctorDetailsDoc {
  id: string;
  user_id: string;
  doctor_id: string;
  name: string;
  email: string;
  phone_number: string;
  profile_image: any;
  gender: any;
  specialization: string;
  sub_specializations: any[];
  qualifications: string;
  experience_years: number;
  bio: string;
  languages_spoken: string[];
  license_number: string;
  license_state: any;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  rating: any;
  reviews_count: number;
  status: string;
  clinics: IDocInfoClinic[];
}

export interface IDocInfoClinic {
  id: string;
  name: string;
  address: string;
  available_dates: string[];
  status: string;
}

export interface IDoctorAvailTimeSlots {
  doctor_id: string;
  date: string;
  slots: ITimeSlotsDoc[];
}

export interface ITimeSlotsDoc {
  availability_id: string;
  clinic_id: string;
  clinic: {
    id: string;
    name: string;
    city: string;
  };
  from: string;
  to: string;
  status: string;
  consultation_type: string;
  in_person_fee: string;
  video_fee: string;
  hide_fee: boolean;
  require_payment: boolean;
  slot_duration: number;
}

export interface MyDoctorsDoc {
  id: string;
  user_id: string;
  doctor_id: string;
  name: string;
  profile_image: any;
  specialization: string;
  sub_specializations: string[];
  clinic: {
    id: string;
    name: string;
  };
}
