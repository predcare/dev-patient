import * as yup from 'yup';

export const ProfileEditSchema = yup.object().shape({
  email: yup.string().trim().email('Enter a valid email address').optional(),
  phone_number: yup.string().trim().optional(),
  user_type: yup.string().default('patient'),
});

export type TProfileEditSchemaType = yup.InferType<typeof ProfileEditSchema>;

export const ProfileSetupSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: yup.string().trim().email('Invalid email address').optional(),
  phoneNumber: yup.string().trim().optional(),
  gender: yup.string().trim().required('Gender is required'),
  dob: yup.date().nullable().required('Date of birth is required'),
  address: yup.string().trim().required('Street address is required'),
  country: yup.string().trim().required('Country is required'),
  state: yup.string().trim().required('State is required'),
  city: yup.string().trim().required('City is required'),
  postalCode: yup
    .string()
    .trim()
    .matches(/^\d{6}$/, 'Postal code must be 6 digits')
    .required('Postal code is required'),
  alternatePhone: yup
    .string()
    .trim()
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .matches(/^\d{10}$/, 'Alternate phone must be 10 digits')
    .optional()
    .nullable(),
  profilePic: yup.mixed().optional().nullable(),
});

export type TProfileSetupSchemaType = yup.InferType<typeof ProfileSetupSchema>;
