import * as yup from 'yup';

export const profileSchema = yup.object().shape({
  name: yup.string().trim().required('Full name is required'),
  email: yup.string().trim().email('Invalid email address').required('Email address is required'),
  phoneNumber: yup
    .string()
    .trim()
    .required('Phone number is required')
    .matches(/^\d{10}$/, 'Phone number must be 10 digits'),
  gender: yup.string().required('Gender is required'),
  dobDate: yup.date().nullable().required('Date of birth is required'),
  address: yup.string().trim().required('Address is required'),
  country_name: yup.string().required('Country is required'),
  state_name: yup.string().required('State is required'),
  city_name: yup.string().required('City is required'),
  postalCode: yup
    .string()
    .trim()
    .required('Postal code is required')
    .matches(/^\d{6}$/, 'Postal code must be 6 digits'),
  alternatePhone: yup
    .string()
    .trim()
    .transform(value => (value === '' ? undefined : value))
    .optional()
    .test('is-10-digits', 'Alternate phone must be 10 digits', val => !val || /^\d{10}$/.test(val)),
});

export type ProfileSchemaType = yup.InferType<typeof profileSchema>;
