export const baseUrl = 'https://api-dev.predcare.in';
export const localBaseUrl = ' https://chant-abrasion-sustainer.ngrok-free.dev';
export const baseUrlApi = `${localBaseUrl}/api/v1`;

export const mediaPaths = (fileName?: string) => {
  if (!fileName) return '';
  const rawImg = String(fileName);
  if (rawImg.startsWith('http://') || rawImg.startsWith('https://')) {
    return rawImg;
  }
  if (rawImg.startsWith('/')) {
    return `${localBaseUrl}${rawImg}`;
  }
  if (rawImg.startsWith('storage/')) {
    return `${localBaseUrl}/${rawImg}`;
  }
  return `${localBaseUrl}/storage/${rawImg}`;
};

export const endpoints = {
  auth: {
    sendOtp: '/auth/request-login-otp',
    verifyOtp: '/auth/verify-login-otp',
    patientRegister: '/auth/patient/register',
    patientVerifyOtp: '/auth/patient/verify-otp',
    resendOtp: '/auth/resend-otp',
    verifyEmail: '/users/verify-email',
    resendEmailOtp: '/users/resend-email-otp',
    users: '/doctor/auth/users',
    logout: '/auth/logout',
  },
  profile: {
    get: '/users/profile',
    update: '/users/profile-update',
    addFamilyMembers: '/users/patient/add-family-member',
  },
  doctors: {
    getAll: '/patients/doctors',
    getDetails: (doctorId: string | number) => `/patients/doctors/${doctorId}`,
    getDoctorClinicSummary: (doctorId: string | number, clinicId: string | number) =>
      `/patients/doctors/${doctorId}/clinics/${clinicId}`,
    doctorAvailDates: '/doctor-availabilities/available-dates',
    getSlotsByDate: '/doctor-availabilities/slots-by-date',
    myDocs: '/patients/my-doctors',
  },
  commons: {
    country: '/common/countries',
    states: (countryId: string | number) => `/common/countries/${countryId}/states`,
    cities: (stateId: string | number) => `/common/states/${stateId}/cities`,
    users: '/doctor/auth/users',
    policies: '/cms/policies',
    policyAccept: '/users/user-policy-acceptances',
    specializations: '/common/specializations',
  },
};

export const successEndpoints = [
  endpoints.auth.sendOtp,
  endpoints.auth.verifyOtp,
  endpoints.auth.patientRegister,
  endpoints.auth.patientVerifyOtp,
  endpoints.auth.verifyEmail,
  endpoints.auth.resendEmailOtp,
];

export const exclude401Routes = [
  endpoints.auth.verifyOtp,
  endpoints.auth.sendOtp,
  endpoints.auth.patientRegister,
  endpoints.auth.patientVerifyOtp,
  endpoints.auth.verifyEmail,
  endpoints.auth.resendEmailOtp,
];
