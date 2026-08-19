export enum UserQueryEnum {
  REGISTER = 'REGISTER',
  VERIFY_OTP = 'VERIFY_OTP',
  RESEND_OTP = 'RESEND_OTP',
  LOGIN_SEND_OTP = 'login-send-otp',
  LOGIN_VERIFY_OTP = 'login-verify-otp',
  LOGOUT = 'logout',
  PROFILE = 'profile',
  UPDATE_PROFILE = 'update-profile',
}

export enum CommonQueryEnum {
  COUNTRIES = 'countries',
  STATES = 'states',
  CITIES = 'cities',
}

export enum SupportQueryEnum {
  CREATE_SUPPORT_TICKET = 'create-support-ticket',
  GET_SUPPORT_TICKETS = 'get-support-tickets',
  GET_SUPPORT_TICKET_DETAILS = 'get-support-ticket-details',
}
