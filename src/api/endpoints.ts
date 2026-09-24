export const baseUrl = 'https://api-dev.predcare.in';
export const localBaseUrl = 'https://chant-abrasion-sustainer.ngrok-free.dev';
export const baseUrlApi = `${baseUrl}/api/v1`;

export const mediaPaths = (fileName?: string) => {
  if (!fileName) return '';
  const rawImg = String(fileName);
  if (rawImg.startsWith('http://') || rawImg.startsWith('https://')) {
    return rawImg;
  }
  if (rawImg.startsWith('/')) {
    return `${baseUrl}${rawImg}`;
  }
  if (rawImg.startsWith('storage/')) {
    return `${baseUrl}/${rawImg}`;
  }
  return `${baseUrl}/storage/${rawImg}`;
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
    getFamilyMembers: '/users/patient/family-members',
    getFamilyMemberInfo: (id: number) => `/users/patient/family-members/${id}`,
    familyMemberDelete: (id: number) => `/users/patient/family-members/${id}`,
    familyMemberEdit: (id: number) => `/users/patient/family-members/${id}`,
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
  clinics: {
    getInfo: (clinicId: string | number) => `/clinics/${clinicId}`,
    getDoctors: (clinicId: string | number) => `/clinics/${clinicId}/doctors`,
  },
  appointments: {
    bookPatient: '/appointments/book',
    checkPaymentStatus: '/appointments/payment-status',
    myAppointments: '/appointments/my-appointments',
    getToken: (appointmentId: number | string) => `/appointments/${appointmentId}/video-token`,
    cancelAppt: (appointmentId: number | string) => `/appointments/${appointmentId}/cancel`,
  },
  prescriptions: {
    getAll: '/prescriptions/patient-my-prescriptions',
    getInfo: (id: number) => `/prescriptions/${id}`,
    downloadPrescription: (id: string | number) => `/prescriptions/${id}/pdf`,
  },
  emr: {
    emrCat: '/emr/patient/categories',
    catWiseEmrs: '/emr/patient/documents',
    uploadEMr: '/emr/upload',
    delete: (id: number) => `/emr/patient/documents/${id}`,
  },
  payments: {
    verifyPayment: '/payments/verify-payment',
  },
  supportTickets: {
    create: '/support-tickets',
    myTickets: '/support-tickets/my-tickets',
    categories: '/support-tickets/categories',
    details: (id: string | number) => `/support-tickets/${id}`,
    delete: (id: string | number) => `/support-tickets/${id}`,
  },
  commons: {
    country: '/common/countries',
    states: (countryId: string | number) => `/common/countries/${countryId}/states`,
    cities: (stateId: string | number) => `/common/states/${stateId}/cities`,
    users: '/doctor/auth/users',
    policies: '/cms/policies',
    policyAccept: '/users/user-policy-acceptances',
    specializations: '/common/specializations',
    getCommisionSlabs: '/commission-slabs',
    getEmrCategories: '/common/emr-categories',
    healthCareTips: '/common/daily-health-tips',
  },
  notifications: {
    getAll: '/notifications',
    delete: '/notifications/',
    counts: `/notifications/count`,
    clearNotify: `/notifications/clear-all`,
  },
};

export const successEndpoints = [
  endpoints.auth.sendOtp,
  endpoints.auth.verifyOtp,
  endpoints.auth.patientRegister,
  endpoints.auth.patientVerifyOtp,
  endpoints.auth.verifyEmail,
  endpoints.auth.resendEmailOtp,
  endpoints.emr.uploadEMr,
  endpoints.supportTickets.create,
];

export const exclude401Routes = [
  endpoints.auth.verifyOtp,
  endpoints.auth.sendOtp,
  endpoints.auth.patientRegister,
  endpoints.auth.patientVerifyOtp,
  endpoints.auth.verifyEmail,
  endpoints.auth.resendEmailOtp,
];
