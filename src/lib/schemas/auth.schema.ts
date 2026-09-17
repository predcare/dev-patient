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
