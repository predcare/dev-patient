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
  FAMILY_MEMBER_LIST = 'FAMILY_MEMBER_LIST',
}

export enum ClinicQueryKeys {
  CLINIC_INFO = 'CLINIC_INFO',
  CLINIC_DOCTORS = 'CLINIC_DOCTORS',
}

export enum CommonQueryKeys {
  Countries = 'Countries',
  States = 'States',
  Cities = 'Cities',
  GET_ALL_USERS = 'GET_ALL_USERS',
  POLICIES = 'POLICIES',
  Specializations = 'Specializations',
  GET_EMR_CATEGORIES = 'GET_EMR_CATEGORIES',
  GET_COMMISION_SLABS = 'GET_COMMISION_SLABS',
}

export enum DoctorQueryKeys {
  GET_ALL = 'GET_ALL',
  GET_DETAILS = 'GET_DETAILS',
  GET_CLINIC_SUMMARY = 'GET_CLINIC_SUMMARY',
  GET_AVAIL_DATES = 'GET_AVAIL_DATES',
  GET_SLOTS_BY_DATE = 'GET_SLOTS_BY_DATE',
  MY_DOCS = 'MY_DOCS',
}
export enum AppointmemntQueryKey {
  CHECK_PAYMENT_STATUS = 'CHECK_PAYMENT_STATUS',
  ALL_APPOINTMENTS = 'ALL_APPOINTMENTS',
}

export enum PrescriptionQueryKeys {
  GET_ALL = 'GET_ALL',
  GET_INFO = 'GET_INFO',
  Pdf = 'Pdf',
}

export enum EMRQuerykeys {
  EMR_CATS = 'EMR_CATS',
  CAT_WISE_EMRS = 'CAT_WISE_EMRS',
  UPLOAD_EMR = 'UPLOAD_EMR',
  DELETE_EMR = 'DELETE_EMR',
}
