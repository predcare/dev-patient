import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { DoctorQueryKeys } from '../query.keys';
import {
  getAllDoctors,
  getDoctorAvailDates,
  getDoctorClinicSummary,
  getDoctorDetails,
  getDoctorTimingsByDate,
  getMyDoctors,
  IGetDoctorsQueryParams,
} from './doctor.funcs';

export const useGetAllDoctors = (params?: IGetDoctorsQueryParams) =>
  useQuery({
    queryKey: [DoctorQueryKeys.GET_ALL, params],
    queryFn: () => getAllDoctors(params),
    select: v => v.data,
  });

export const useGetAllDoctorsInfinite = (params?: Omit<IGetDoctorsQueryParams, 'page'>) =>
  useInfiniteQuery({
    queryKey: [DoctorQueryKeys.GET_ALL, 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      getAllDoctors({
        ...params,
        limit: params?.limit || 10,
        page: pageParam as number,
      }),
    initialPageParam: 1,
    getNextPageParam: lastPage => {
      const meta = lastPage?.meta;
      if (!meta) return undefined;
      const currentPage = meta.page || 1;
      const totalPages = meta.totalPages || meta.total_pages || 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });

// Doctor Details
export const useDoctorDetails = (doctorId: string | number) =>
  useQuery({
    queryKey: [DoctorQueryKeys.GET_DETAILS, doctorId],
    queryFn: () => getDoctorDetails(doctorId),
    select: v => v.data,
  });

// Doctor & Clinic Summary
export const useDoctorClinicSummary = (params: {
  doctorId: string | number;
  clinicId: string | number;
}) =>
  useQuery({
    queryKey: [DoctorQueryKeys.GET_CLINIC_SUMMARY, params],
    queryFn: () => getDoctorClinicSummary(params.doctorId, params.clinicId),
    select: v => v.data,
    enabled: Boolean(params?.doctorId && params?.clinicId),
  });

// Doctor Available Dates
export const useDoctorAvailDates = (params: {
  doctorId: number;
  consultation_type: string;
  clinicId: number;
}) =>
  useQuery({
    queryKey: [DoctorQueryKeys.GET_AVAIL_DATES, params],
    queryFn: () =>
      getDoctorAvailDates({
        doctor_id: params?.doctorId,
        consultation_type: params?.consultation_type,
        clinic_id: params?.clinicId,
      }),
    select: v => v.data,
    enabled: Boolean(params?.doctorId),
  });

// Doctor Avail Time Slots
export const useDoctorTimingsByDate = (params: {
  doctorId: number;
  date: string;
  consultation_type: string;
  clinicId?: number;
}) =>
  useQuery({
    queryKey: [DoctorQueryKeys.GET_SLOTS_BY_DATE, params],
    queryFn: () =>
      getDoctorTimingsByDate({
        doctor_id: params?.doctorId,
        date: params?.date,
        consultation_type: params?.consultation_type,
        clinic_id: params?.clinicId,
      }),
    select: v => {
      return v.data;
    },
    enabled: Boolean(params?.doctorId && params?.date),
  });

// My Doctors
export const useGetMyDoctors = () =>
  useQuery({
    queryKey: [DoctorQueryKeys.MY_DOCS],
    queryFn: () => getMyDoctors(),
    select: v => v,
  });
