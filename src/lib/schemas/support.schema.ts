import * as yup from 'yup';

// 10MB limit in bytes
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const attachmentItemSchema = yup
  .object()
  .shape({
    id: yup.string().optional(),
    uri: yup.string().required('Attachment URI is required'),
    name: yup.string().optional(),
    type: yup.string().optional(),
    size: yup
      .number()
      .optional()
      .test('max-file-size', 'File size must not exceed 10MB', size => {
        if (size === undefined || size === null) return true;
        return size <= MAX_FILE_SIZE_BYTES;
      }),
  })
  .test(
    'valid-file-type',
    'Only image files (JPG, PNG, WEBP) or PDFs up to 10MB are allowed',
    file => {
      if (!file || !file.uri) return true;

      const mimeType = (file.type || '').toLowerCase();
      const identifier = (file.name || file.uri || '').toLowerCase();

      // Check Mime-type if available
      if (mimeType) {
        if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
          return true;
        }
      }

      // Check Uri or Name extension / structure
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf', 'unsplash.com'];
      return allowedExtensions.some(ext => identifier.includes(ext));
    }
  );

export const supportTicketSchema = yup.object().shape({
  subject: yup.string().required('Category / Subject is required'),
  category: yup.string().optional(),
  message: yup
    .string()
    .trim()
    .required('Message is required')
    .min(5, 'Message must be at least 5 characters'),
  attachments: yup
    .array()
    .of(attachmentItemSchema)
    .max(5, 'You can attach up to 5 files only')
    .optional()
    .default([]),
});

export type SupportTicketSchemaType = yup.InferType<typeof supportTicketSchema>;
