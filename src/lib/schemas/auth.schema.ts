import * as yup from 'yup';

export const LoginFormSchema = yup.object().shape({
  mode: yup
    .string()
    .oneOf(['mobile', 'email'])
    .default('mobile')
    .required('Login mode is required'),
  identifier: yup
    .string()
    .trim()
    .when('mode', {
      is: 'mobile',
      then: schema =>
        schema
          .required('Mobile number is required')
          .test(
            'is-valid-phone',
            'Phone number must be 10 digits',
            val => !!val && /^\d{10}$/.test(val.replace(/[\s\-()]/g, ''))
          ),
      otherwise: schema =>
        schema.required('Email is required').email('Enter a valid email address'),
    }),
  otp: yup
    .string()
    .optional()
    .test('is-valid-otp', 'OTP must be 6 digits', val => !val || /^\d{6}$/.test(val)),
});

export type TLoginFormSchemaType = yup.InferType<typeof LoginFormSchema>;

export const PatientRegisterSchema = yup.object().shape({
  name: yup.string().trim().required('Full name is required'),
  email: yup
    .string()
    .trim()
    .email('Enter a valid email address')
    .required('Email address is required'),
  phone_number: yup
    .string()
    .trim()
    .required('Mobile number is required')
    .test(
      'is-10-digits',
      'Phone number must be 10 digits',
      val => !!val && /^\d{10}$/.test(val.replace(/[\s\-()]/g, ''))
    ),
  country_code: yup.number().default(91),
  gender: yup.string().optional().default(''),
  salutation: yup.string().optional().default(''),
  source: yup.string().default('app'),
  created_from: yup.string().default('app'),
  otp: yup
    .string()
    .optional()
    .test('is-valid-otp', 'OTP must be 6 digits', val => !val || /^\d{6}$/.test(val)),
});

export type TPatientRegisterSchemaType = yup.InferType<typeof PatientRegisterSchema>;

export const PatientVerifyOtpSchema = yup.object().shape({
  email: yup.string().trim().email('Enter a valid email address').required('Email is required'),
  phone_number: yup.string().trim().required('Phone number is required'),
  otp: yup.string().trim().required('OTP is required').length(6, 'OTP must be 6 digits'),
  device_id: yup.string().optional(),
  device_name: yup.string().optional(),
  platform: yup.string().optional(),
  fcm_token: yup.string().optional(),
  os_version: yup.string().optional(),
  app_version: yup.string().optional().default('1.0.0'),
});

export type TPatientVerifyOtpSchemaType = yup.InferType<typeof PatientVerifyOtpSchema>;

export const PatientResendOtpSchema = yup.object().shape({
  email: yup.string().trim().email('Enter a valid email address').optional(),
  phone_number: yup.string().trim().optional(),
  user_type: yup.string().default('patient'),
});

export type TPatientResendOtpSchemaType = yup.InferType<typeof PatientResendOtpSchema>;

export const VerifyEmailSchema = yup.object().shape({
  email: yup.string().trim().email('Enter a valid email address').required('Email is required'),
  otp: yup.string().trim().required('OTP is required').length(6, 'OTP must be 6 digits'),
});

export type TVerifyEmailSchemaType = yup.InferType<typeof VerifyEmailSchema>;

