import { useMutation, useQuery } from '@tanstack/react-query';
import { AuthQueryKey } from '../query.keys';
import {
  fetchAllUsers,
  patientRegister,
  patientVerifyOtp,
  reSendOtp,
  resendEmailOtp,
  sendOtp,
  userLogout,
  verifyEmail,
  verifyOtp,
} from './auth.funcs';

export const useSendOtp = () =>
  useMutation({
    mutationFn: sendOtp,
    mutationKey: [AuthQueryKey.SEND_OTP],
  });

export const usePatientRegister = () =>
  useMutation({
    mutationFn: patientRegister,
    mutationKey: [AuthQueryKey.PATIENT_REGISTER],
  });

export const usePatientVerifyOTP = () =>
  useMutation({
    mutationFn: patientVerifyOtp,
    mutationKey: [AuthQueryKey.PATIENT_VERIFY_OTP],
  });

export const useVerifyEmail = () =>
  useMutation({
    mutationFn: verifyEmail,
    mutationKey: [AuthQueryKey.VERIFY_EMAIL],
  });

export const useResendEmailOtp = () =>
  useMutation({
    mutationFn: resendEmailOtp,
    mutationKey: [AuthQueryKey.RESEND_EMAIL_OTP],
  });

export const useReSendOtp = () =>
  useMutation({
    mutationFn: reSendOtp,
    mutationKey: [AuthQueryKey.RESEND_OTP],
  });

export const useVerifyOTP = () =>
  useMutation({
    mutationFn: verifyOtp,
    mutationKey: [AuthQueryKey.VERIFY_OTP],
  });

export const useGetAllUsers = (doctorId?: string | number, enabled: boolean = true) =>
  useQuery({
    queryKey: [AuthQueryKey.GET_USERS, doctorId],
    queryFn: () => fetchAllUsers(doctorId),
    enabled,
    select: v => v.users,
  });

// User Logout
export const useUserLogout = () =>
  useMutation({
    mutationFn: userLogout,
    mutationKey: [AuthQueryKey.USER_LOGOUT],
  });


