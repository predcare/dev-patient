import { IRootResponse } from './common.interfaces';

export type TInvoiceListRoot = IRootResponse<IInvoiceListDoc[]>;
export type TGetInvoiceDetailsRoot = IRootResponse<IInvoiceListDoc>;

export interface IInvoiceListDoc {
  id: string;
  invoice_number: string;
  appointment_id: string;
  doctor_id: string;
  clinic_id: string;
  patient_id: string;
  items: IInvoiceListItem[];
  gst_type: string;
  payment_mode: string;
  payment_status: string;
  category: string;
  notes: string;
  subtotal: number;
  total_discount: number;
  cgst: number;
  sgst: number;
  igst: number;
  grand_total: number;
  created_at: string;
  updated_at: string;
  pdf_path?: string;
  pdf_url?: string;
  doctorInfo?: IInvDoctorInfo;
  patientInfo?: IInvPatientInfo;
  clinicInfo?: IInvClinicInfo;
}

export interface IInvoiceListItem {
  qty: number;
  amount: number;
  hsn_sac: string;
  discount: number;
  item_name: string;
  unit_price: number;
}

export interface IInvDoctorInfo {
  id: string;
  doctorId: string;
  displayDoctorId: string;
  name: string;
  profileImage: any;
  qualifications: any;
  specialization: string;
  experienceYears: number;
  licenseNumber: string;
  phoneNumber: string;
  email: string;
}

export interface IInvPatientInfo {
  id: string;
  patientId: string;
  displayPatientId: string;
  name: string;
  profileImage: any;
  gender: string;
  dateOfBirth: string;
  age: number;
  phoneNumber: string;
  email: string;
  address: string;
}

export interface IInvClinicInfo {
  id: string;
  clinicId: string;
  name: string;
  email: string;
  phoneNumber: any;
  fulladdress: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  gstin: string;
  clinicRegNumber: string;
}
