export const baseUrl = 'https://api-dev.predcare.in';
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
    patientRegister: '/auth/patient/register',
    patientVerifyOtp: '/auth/patient/verify-otp',
    resendOtp: '/auth/resend-otp',
    loginSendOtp: '/auth/login-send-otp',
    loginVerifyOtp: '/auth/login-verify-otp',
    logout: '/auth/logout',
  },
  profile: {
    get: '/users/profile',
    update: '/users/profile-update',
  },
  common: {
    countries: '/common/countries',
    states: '/common/states',
    cities: '/common/cities',
  },
  supports: {
    create: '/support-tickets',
    getAll: '/support-tickets',
    getSingle: (id: string | number) => `/support-tickets/${id}`,
  },
};

export const successEndpoints = [endpoints.auth.patientRegister, endpoints.supports.create];

export const exclude401Routes = [endpoints.auth.loginSendOtp];
