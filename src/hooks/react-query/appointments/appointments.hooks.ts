import { useMutation, useQuery } from '@tanstack/react-query';
import { AppointmemntQueryKey } from '../query.keys';
import { createAppointment, getBookingPaymentStatus } from './appointments.funcs';

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
