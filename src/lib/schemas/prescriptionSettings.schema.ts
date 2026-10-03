import * as yup from 'yup';

export const PrescriptionSettingsSchema = yup.object().shape({
  clinic_name: yup.string().optional().nullable(),
  clinic_address: yup.string().optional().nullable(),
  clinic_phone: yup.string().optional().nullable(),
  clinic_email: yup.string().optional().nullable(),
  reg_no: yup.string().optional().nullable(),
  header_text: yup.string().optional().nullable(),
  footer_text: yup.string().optional().nullable(),
  sig_mode: yup.string().oneOf(['upload', 'generated']).default('upload'),
  typed_name: yup.string().optional().nullable(),
});

export type TPrescriptionSettingsSchemaType = yup.InferType<
  typeof PrescriptionSettingsSchema
>;
