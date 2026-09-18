import axiosInstance from '../../../api/apiClient';
import { endpoints } from '../../../api/endpoints';
import { IRootResponse } from '../../../typescripts/interfaces/common.interfaces';
import {
  AllDoctorsRoot,
  DoctorAvailTimeSlotsRoot,
  DoctorClinicSummaryRoot,
  DoctorDetailsRoot,
  MyDoctorsRoot,
} from '../../../typescripts/interfaces/doctors.interfaces';

export interface IGetDoctorsQueryParams {
  search?: string;
  gender?: string;
  specialization?: string;
  sub_specialization?: string;
  city?: string;
  state?: string;
  country?: string;
  experience?: string;
  consultation_type?: string;
  availability?: string;
  min_fee?: number;
  max_fee?: number;
  page?: number;
  limit?: number;
}

export const getAllDoctors = async (params?: IGetDoctorsQueryParams) => {
  const res = await axiosInstance.get<AllDoctorsRoot>(`${endpoints.doctors.getAll}`, {
    params,
  });
  return res.data;
};

export const getDoctorDetails = async (doctorId: string | number) => {
  const res = await axiosInstance.get<DoctorDetailsRoot>(
    `${endpoints.doctors.getDetails(doctorId)}`
  );
  return res.data;
};

export const getDoctorClinicSummary = async (
  doctorId: string | number,
  clinicId: string | number
) => {
  const res = await axiosInstance.get<DoctorClinicSummaryRoot>(
    `${endpoints.doctors.getDoctorClinicSummary(doctorId, clinicId)}`
  );
  return res.data;
};

export const getDoctorAvailDates = async (params?: { doctor_id: number; clinic_id?: number }) => {
  const res = await axiosInstance.get<IRootResponse<String[]>>(
    `${endpoints.doctors.doctorAvailDates}`,
    {
      params,
    }
  );
  return res.data;
};

export const getDoctorTimingsByDate = async (params?: {
  doctor_id: number;
  date: string;
  clinic_id?: number;
}) => {
  const res = await axiosInstance.get<DoctorAvailTimeSlotsRoot>(
    `${endpoints.doctors.getSlotsByDate}`,
    {
      params,
    }
  );
  return res.data;
};

export const getMyDoctors = async () => {
  const res = await axiosInstance.get<MyDoctorsRoot>(endpoints.doctors.myDocs);
  return res.data;
};
