export interface ISupportTicketAttachment {
  id: string;
  support_ticket_id: string;
  file_path: string;
  file_url: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  created_at: string;
}

export interface ISupportTicket {
  id: string;
  ticket_no: string;
  patient_id: string;
  doctor_id: string | null;
  created_by: string;
  created_by_type: 'patient' | 'agent' | 'admin' | string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'closed' | string;
  admin_description: string | null;
  created_at: string;
  updated_at: string;
  attachments: ISupportTicketAttachment[];
}

export interface IGetSupportTicketsParams {
  page?: number;
  limit?: number;
  status?: 'open' | 'closed' | string;
  search?: string;
}

export interface ICreateSupportTicketPayload {
  subject: string;
  message: string;
  attachments?: any[];
}

export interface ISupportTicketPaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ISupportTicketListApiResponse {
  success: boolean;
  message: string;
  status: number;
  data: ISupportTicket[];
  meta: ISupportTicketPaginationMeta;
}

export interface ISupportTicketSingleApiResponse {
  success: boolean;
  message: string;
  status: number;
  data: ISupportTicket;
}
