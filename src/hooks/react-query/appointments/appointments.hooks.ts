import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { AppointmemntQueryKey } from '../query.keys';
import {
  cancelMyAppt,
  createAppointment,
  getApptInfo,
  getBookingPaymentStatus,
  getMyAppointments,
} from './appointments.funcs';

export const useCreateAppointment = () =>
  useMutation({
    mutationFn: createAppointment,
  });

// Check Payment Status
export const useCheckPaymentStatus = (params: {
  razorpay_order_id: string;
  appointment_id: string;
  razorpay_payment_id: string;
  enabled?: boolean;
}) =>
  useQuery({
    queryKey: [AppointmemntQueryKey.CHECK_PAYMENT_STATUS, params],
    queryFn: () => getBookingPaymentStatus(params),
    enabled: params.enabled,
  });

// My All Appointments
export const useMyAppointments = (params: {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}) =>
  useQuery({
    queryKey: [AppointmemntQueryKey.ALL_APPOINTMENTS, params],
    queryFn: () => getMyAppointments(params),
  });

// My All Appointments Infinite
export const useMyAppointmentsInfinite = (params?: {
  status?: string;
  limit?: number;
  search?: string;
}) =>
  useInfiniteQuery({
    queryKey: [AppointmemntQueryKey.ALL_APPOINTMENTS, 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      getMyAppointments({
        ...params,
        page: pageParam as number,
        limit: params?.limit || 10,
      }),
    initialPageParam: 1,
    getNextPageParam: lastPage => {
      const meta = lastPage?.meta;
      if (!meta) return undefined;
      const currentPage = Number(meta.page || 1);
      const totalPages = Number(meta.totalPages || meta.total_pages || 1);
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });

// Cancel Appointment
export const useCancelMyAppt = () => {
  return useMutation({
    mutationFn: cancelMyAppt,
  });
};

// Get Info
export const useGetApptInfo = (appointmentId: number | string, enabled?: boolean) =>
  useQuery({
    queryKey: [AppointmemntQueryKey.INFO, appointmentId],
    queryFn: () => getApptInfo(appointmentId),
    enabled: !!appointmentId,
    select: v => v.data,
  });
