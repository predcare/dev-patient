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
    resendOtp: '/auth/resend-otp',
    users: '/doctor/auth/users',
    logout: '/auth/logout',
  },
  profile: {
    get: '/users/profile',
    update: '/doctors/user/',
  },
  patients: {
    get: '/doctors/my-patients',
    delete: '/doctor/patients/',
    details: (id: number) => `/doctors/my-patients/${id}`,
    linkExisting: '/users/link-existing-patient',
    newCreate: '/users/add-patient',
    sendCred: '/doctor/patients/send-credentials',
    emrRecords: (uid: string | number) => `/emr/doc-patient/${uid}`,
    emrShare: (emrId: string | number) => `/emr/visibility/${emrId}`,
    prescriptions: (uid: string | number) => `/prescriptions/patient/${uid}`,
    prescriptionsShare: (presId: string | number) => `/doctor/prescriptions/${presId}/share`,
    emrUpload: '/emr/upload',
    consults: (uid: string | number) => `/doctor/appointments/doctor/patient-consult/${uid}`,
    familyMembers: (uid: string | number) => `/doctors/patient-family-members/${uid}`,
    patientUpdate: `/doctors/my-patients-update`,
  },
  appointments: {
    get: '/doctor/appointments/doctor',
    getToken: (appointmentId: number | string) =>
      `/doctor/appointments/${appointmentId}/video-token`,
    heartbeat: '/doctor/appointments/heartbeat',
    statusChange: (appointmentId: number | string) =>
      `/doctor/appointments/${appointmentId}/status`,
    bookByDoc: '/doctor/appointments/book',
    getdetails: (id: string | number) => `/doctor/appointments/${id}`,
    reschedule: (id: string | number) => `/doctor/appointments/${id}/reschedule`,
    heartBeat: '/doctor/appointments/heartbeat',
    saveCall: '/doctor/appointments/save-call',
  },
  availablity: {
    get: '/doctor-availabilities',
    delete: '/doctor-availabilities/',
    create: '/doctor-availabilities',
    update: '/doctor-availabilities',
    docAvailabilities: '/doctor/doctor-availability/doctor/',
    fullAvailability: '/doctor/availability/full-overview',
  },
  commons: {
    country: '/common/countries',
    states: (countryId: string | number) => `/common/countries/${countryId}/states`,
    cities: (stateId: string | number) => `/common/states/${stateId}/cities`,
    users: '/doctor/auth/users',
    policies: '/cms/policies',
    policyAccept: '/users/user-policy-acceptances',
  },
  invoices: {
    getAll: (uid: string | number) => `/doctor/invoices/doctor/${uid}`,
    patientInvoices: '/doctor/invoices/doctor/',
    downloadPdf: (invoiceId: number | string) => `/doctor/invoices/${invoiceId}/pdf`,
    invoiceSettings: '/doctor/invoices/settings/',
    create: '/doctor/invoices',
  },
  prescritions: {
    create: '/prescriptions',
    getAll: `/prescriptions/doc-my-prescriptions`,
    update: (id: string | number) => `/prescriptions/${id}`,
    upsertDraft: (id?: string | number) =>
      id ? `/doctor/prescriptions/upsert-draft/${id}` : '/doctor/prescriptions/upsert-draft',
    get: (id: string | number) => `/prescriptions/${id}`,
    sendAgain: (id: string | number) => `/prescriptions/${id}/send-prescription`,
    downloadPrescription: (id: string | number) => `/prescriptions/${id}/pdf`,
  },
  notifications: {
    getAll: '/notifications',
    delete: '/notifications/',
    counts: `/notifications/count`,
    clearNotify: `/notifications/clear-all`,
  },
  homes: {
    stats: (doctorId: string | number) => `/doctor/appointments/doctor/${doctorId}/stats`,
    upcomingAppts: (doctorId: string | number) => `/doctor/appointments/doctor/${doctorId}/today`,
  },
};

export const successEndpoints = [
  endpoints.auth.sendOtp,
  endpoints.auth.verifyOtp,
  endpoints?.patients?.emrUpload,
  endpoints?.patients?.patientUpdate,
];

export const exclude401Routes = [endpoints.auth.verifyOtp, endpoints.auth.sendOtp];
