import axiosInstance from '../../../api/apiClient';
import { endpoints } from '../../../api/endpoints';
import { ICommonRoot } from '../../../typescripts/interfaces/common.interfaces';
import { ILoginResponse } from '../../../typescripts/interfaces/myProfile.interfaces';
import {
  ILoginSendOtpPayload,
  ILoginVerifyOtpPayload,
  ILogoutPayload,
  IPatientRegisterPayload,
  IPatientVerifyOtpPayload,
  IResendOtpPayload,
} from './payload.interfaces';

export const registerPatient = async (body: IPatientRegisterPayload) => {
  const res = await axiosInstance.post<ILoginResponse>(endpoints.auth.patientRegister, body);

  return res.data;
};

export const verifyPatientOtp = async (body: IPatientVerifyOtpPayload) => {
  const res = await axiosInstance.post<ILoginResponse>(endpoints.auth.patientVerifyOtp, body);
  return res.data;
};

export const resendOtp = async (body: IResendOtpPayload) => {
  const res = await axiosInstance.post<ICommonRoot>(endpoints.auth.resendOtp, body);
  return res.data;
};

export const loginSendOtp = async (body: ILoginSendOtpPayload) => {
  const res = await axiosInstance.post<ICommonRoot>(endpoints.auth.loginSendOtp, body);

  return res.data;
};

export const loginVerifyOtp = async (body: ILoginVerifyOtpPayload) => {
  const res = await axiosInstance.post<ILoginResponse>(endpoints.auth.loginVerifyOtp, body);

  return res.data;
};

export const logoutUser = async (body: ILogoutPayload) => {
  const res = await axiosInstance.post<ICommonRoot>(endpoints.auth.logout, body);

  return res.data;
};
