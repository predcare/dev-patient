export type GstMode = 'none' | 'intra' | 'inter';
export type PaymentMode = 'Cash' | 'Card' | 'UPI' | 'Online' | 'Bank Transfer';
export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue' | 'Cancelled';

export interface InvoiceLineItem {
  id: string;
  name: string;
  qty: string;
  price: string;
  discount: string;
  discount_type: '%' | 'flat';
  tax_percent: string;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  appointmentId?: string | null;
  appointmentDate: string;
  createdDate: string;
  dueDate?: string;
  items: InvoiceLineItem[];
  subtotal: number;
  totalDiscount: number;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
  paymentMode: PaymentMode;
  status: InvoiceStatus;
  notes?: string;
  clinicName?: string;
  clinicAddress?: string;
}

export interface PatientInvoiceTabProps {
  patientId: string;
  patientName: string;
  navigation: any;
}

export interface PatientProfileTabPanelProps {
  patientId: string;
  patientName?: string;
  navigation: any;
}
