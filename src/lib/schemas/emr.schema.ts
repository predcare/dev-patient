import * as yup from 'yup';

export const UploadHealthRecordSchema = yup.object().shape({
  category: yup.string().trim().required('Please select a document category'),
  file: yup.mixed().optional().nullable(),
  title: yup
    .string()
    .trim()
    .required('Document title is required')
    .min(2, 'Document title must be at least 2 characters')
    .max(100, 'Document title cannot exceed 100 characters'),
  notes: yup.string().trim().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
  shareDoctorIds: yup.array().of(yup.number().required()).default([]),
});

export type TUploadHealthRecordFormSchemaType = yup.InferType<typeof UploadHealthRecordSchema>;
