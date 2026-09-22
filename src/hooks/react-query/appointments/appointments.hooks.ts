import { useMutation, useQuery } from '@tanstack/react-query';
import { AppointmemntQueryKey } from '../query.keys';
import {
  cancelMyAppt,
  createAppointment,
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

// Cancel Appointment
export const useCancelMyAppt = () => {
  return useMutation({
    mutationFn: cancelMyAppt,
  });
};
