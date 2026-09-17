export enum AuthQueryKey {
  SEND_OTP = 'SEND_OTP',
  VERIFY_OTP = 'VERIFY_OTP',
  PATIENT_REGISTER = 'PATIENT_REGISTER',
  PATIENT_VERIFY_OTP = 'PATIENT_VERIFY_OTP',
  VERIFY_EMAIL = 'VERIFY_EMAIL',
  RESEND_EMAIL_OTP = 'RESEND_EMAIL_OTP',
  GET_USERS = 'GET_USERS',
  RESEND_OTP = 'RESEND_OTP',
  USER_LOGOUT = 'USER_LOGOUT',
}

export enum ProfileQueryKeys {
  Profile = 'Profile',
  UpdateProfile = 'UpdateProfile',
  DoctorProfile = 'DoctorProfile',
}

export enum CommonQueryKeys {
  Countries = 'Countries',
  States = 'States',
  Cities = 'Cities',
  GET_ALL_USERS = 'GET_ALL_USERS',
  POLICIES = 'POLICIES',
}
