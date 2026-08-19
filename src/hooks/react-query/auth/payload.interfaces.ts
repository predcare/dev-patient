export interface IPatientRegisterPayload {
  name: string;
  email: string;
  phone_number: string;
  source: 'app';
  created_from: 'app';
}
export interface IPatientVerifyOtpPayload {
  email: string;
  phone_number: string;
  otp: string;
  device_id: string;
  device_name: string;
  platform: 'android' | 'ios';
  os_version: string;
  app_version: string;
  fcm_token: string;
}

export interface IResendOtpPayload {
  user_type: 'patient';
  email?: string;
  phone_number?: string;
}

export interface ILoginSendOtpPayload {
  email?: string;
  phone_number?: string;
  user_type: 'patient' | 'doctor';
}

export interface ILoginVerifyOtpPayload {
  email?: string;
  phone_number?: string;
  otp: string;
  user_type: 'patient' | 'doctor';
  device_id: string;
  device_name: string;
  platform: 'android' | 'ios';
  os_version: string;
  app_version: string;
  fcm_token: string;
}

export interface ILogoutPayload {
  device_id: string;
  all_devices: boolean;
}
