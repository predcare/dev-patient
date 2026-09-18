import * as yup from 'yup';

export const ProfileEditSchema = yup.object().shape({
  email: yup.string().trim().email('Enter a valid email address').optional(),
  phone_number: yup.string().trim().optional(),
  user_type: yup.string().default('patient'),
});

export type TProfileEditSchemaType = yup.InferType<typeof ProfileEditSchema>;
