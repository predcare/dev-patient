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
            val => !!val && /^\d{10}$/.test(val.replace(/[\s\-()]/g, '')),
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

export const RegisterFormSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required('Full Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: yup
    .string()
    .trim()
    .required('Email address is required')
    .email('Enter a valid email address'),
  phone: yup
    .string()
    .trim()
    .required('Mobile number is required')
    .test(
      'is-valid-phone',
      'Phone number must be 10 digits',
      val => !!val && /^\d{10}$/.test(val.replace(/[\s\-()]/g, '')),
    ),
  otp: yup
    .string()
    .optional()
    .test('is-valid-otp', 'OTP must be 6 digits', val => !val || /^\d{6}$/.test(val)),
});

export type TRegisterFormSchemaType = yup.InferType<typeof RegisterFormSchema>;

