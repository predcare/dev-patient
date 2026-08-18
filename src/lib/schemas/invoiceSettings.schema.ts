import * as yup from 'yup';

export const InvoiceSettingsSchema = yup.object().shape({
  clinic_name: yup.string().optional().nullable(),
  clinic_address: yup.string().optional().nullable(),
  clinic_phone: yup.string().optional().nullable(),
  clinic_email: yup.string().optional().nullable(),
  reg_no: yup.string().optional().nullable(),
  clinic_gstin: yup.string().optional().nullable(),
  header_note: yup.string().optional().nullable(),
  invoice_prefix: yup.string().default('INV').optional().nullable(),
  gst_type: yup.string().default('none').optional().nullable(),
  footer_note: yup.string().optional().nullable(),
  terms_conditions: yup.string().optional().nullable(),
  sig_mode: yup.string().oneOf(['upload', 'generated']).default('upload'),
  typed_name: yup.string().optional().nullable(),
});

export type TInvoiceSettingsSchemaType = yup.InferType<
  typeof InvoiceSettingsSchema
>;
