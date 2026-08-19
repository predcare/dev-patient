import { useMutation } from '@tanstack/react-query';

import { UserQueryEnum } from '../query.keys';

import {
  loginSendOtp,
  loginVerifyOtp,
  logoutUser,
  registerPatient,
  resendOtp,
  verifyPatientOtp,
} from './auth.funcs';

export const useRegisterPatient = () =>
  useMutation({
    mutationKey: [UserQueryEnum.REGISTER],
    mutationFn: registerPatient,
  });

export const useVerifyPatientOtp = () =>
  useMutation({
    mutationKey: [UserQueryEnum.VERIFY_OTP],
    mutationFn: verifyPatientOtp,
  });

export const useResendOtp = () =>
  useMutation({
    mutationKey: [UserQueryEnum.RESEND_OTP],
    mutationFn: resendOtp,
  });

export const useLoginSendOtp = () =>
  useMutation({
    mutationKey: [UserQueryEnum.LOGIN_SEND_OTP],
    mutationFn: loginSendOtp,
  });

export const useLoginVerifyOtp = () =>
  useMutation({
    mutationKey: [UserQueryEnum.LOGIN_VERIFY_OTP],
    mutationFn: loginVerifyOtp,
  });

export const useLogout = () =>
  useMutation({
    mutationKey: [UserQueryEnum.LOGOUT],
    mutationFn: logoutUser,
  });


