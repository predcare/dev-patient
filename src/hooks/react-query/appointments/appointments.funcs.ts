import axiosInstance from '../../../api/apiClient';
import { endpoints } from '../../../api/endpoints';
import {
  MyAppointmentListRoot,
  TGetApptTokenRoot,
} from '../../../typescripts/interfaces/appointments.interfaces';
import { ICommonRoot } from '../../../typescripts/interfaces/common.interfaces';

export const createAppointment = async (body: any) => {
  const res = await axiosInstance.post<ICommonRoot>(endpoints.appointments.bookPatient, body);
  return res.data;
};

export const getBookingPaymentStatus = async (params: {
  razorpay_order_id: string;
  appointment_id: string;
  razorpay_payment_id: string;
}) => {
  const res = await axiosInstance.get<ICommonRoot>(`${endpoints.appointments.checkPaymentStatus}`, {
    params,
  });
  return res.data;
};

export const getMyAppointments = async (params: {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const res = await axiosInstance.get<MyAppointmentListRoot>(
    endpoints.appointments.myAppointments,
    {
      params,
    }
  );
  return res.data;
};

export const getApptToken = async (appointmentId: number | string) => {
  const res = await axiosInstance.get<TGetApptTokenRoot>(
    `${endpoints.appointments.getToken(appointmentId)}`
  );
  return res.data;
};
