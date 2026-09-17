import axiosInstance from '../../../api/apiClient';
import { endpoints } from '../../../api/endpoints';
import {
  TPatientRegisterSchemaType,
  TPatientResendOtpSchemaType,
  TPatientVerifyOtpSchemaType,
} from '../../../lib/schemas/auth.schema';
import { ICommonRoot, IRootResponse } from '../../../typescripts/interfaces/common.interfaces';
import { IMyProfileDoc } from '../../../typescripts/interfaces/profile.interfaces';

export const sendOtp = async (body: { email?: string; phone?: string; user_type?: string }) => {
  const res = await axiosInstance.post<ICommonRoot>(endpoints.auth.sendOtp, body);
  return res.data;
};

export const reSendOtp = async (
  body:
    | TPatientResendOtpSchemaType
    | { email?: string; phone_number?: string; phone?: string; user_type?: string }
) => {
  const res = await axiosInstance.post<ICommonRoot>(endpoints.auth.resendOtp, body);
  return res.data;
};

export const patientRegister = async (body: TPatientRegisterSchemaType) => {
  const res = await axiosInstance.post<ICommonRoot>(endpoints.auth.patientRegister, body);
  return res.data;
};

export const patientVerifyOtp = async (body: TPatientVerifyOtpSchemaType) => {
  const res = await axiosInstance.post<ICommonRoot>(endpoints.auth.patientVerifyOtp, body);
  return res.data;
};

export const verifyOtp = async (body: any) => {
  const res = await axiosInstance.post<IRootResponse<IMyProfileDoc>>(
    endpoints.auth.verifyOtp,
    body
  );
  return res.data;
};

export const fetchAllUsers = async (doctorId?: string | number) => {
  const res = await axiosInstance.get<any>(endpoints.auth.users, {
    params: doctorId ? { doctor_id: doctorId } : undefined,
  });
  return res.data;
};

export const userLogout = async (body: { all_devices: boolean; device_id?: string }) => {
  const res = await axiosInstance.post<ICommonRoot>(endpoints.auth.logout, body);
  return res.data;
};

export const verifyEmail = async (body: { email: string; otp: string }) => {
  const res = await axiosInstance.post<ICommonRoot>(endpoints.auth.verifyEmail, body);
  return res.data;
};

export const resendEmailOtp = async (body: { email: string }) => {
  const res = await axiosInstance.post<ICommonRoot>(endpoints.auth.resendEmailOtp, body);
  return res.data;
};

