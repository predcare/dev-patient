import { ICommonRoot, IRootResponse } from './common.interfaces';

export type TSupportTicketsListRoot = IRootResponse<ISupportTicket[]>;
export type TSupportTicketDetailsResponse = IRootResponse<ISupportTicket>;
export type TSupportCategoriesRoot = IRootResponse<ISupportTicketCategory[]>;
export type TSupportTicketCreateResponse = IRootResponse<ISupportTicket>;
export type TSupportTicketDeleteResponse = ICommonRoot;

export interface ISupportTicketCategory {
  id: string;
  name: string;
  audience: string;
  description: any;
  status: string;
  sort_order: number;
}

export interface ISupportTicketAttachment {
  id: string | number;
  file_name: string;
  file_url: string;
  file_size: number | string;
  mime_type: string;
  created_at?: string;
}

export interface ISupportTicket {
  id: string | number;
  ticket_no: string;
  subject: string;
  message: string;
  status: 'open' | 'closed' | 'in_progress' | string;
  email?: string;
  category_id?: string | number;
  category?: ISupportTicketCategory | string;
  admin_description?: string | null;
  attachments_count?: number;
  attachments?: ISupportTicketAttachment[];
  created_at: string;
  updated_at: string;
}

export interface ICreateSupportTicketPayload {
  subject: string;
  message: string;
  email?: string;
  category_id?: string | number;
  attachments?: any[];
}

export interface IGetMyTicketsParams {
  status?: 'all' | 'open' | 'closed' | 'in_progress' | string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IGetSupportCategoriesParams {
  audience?: 'patient' | 'doctor' | 'staff' | string;
}
