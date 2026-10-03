import { IRootResponse } from './common.interfaces';

export type TEMRCatsRoot = IRootResponse<IEMRCatsDoc>;
export type TEmrListRoot = IRootResponse<IEmrListDoc[]>;

export interface IEMRCatsDoc {
  total_documents: number;
  total_file_size: string;
  categories: IEMRCatsList[];
}

export interface IEMRCatsList {
  id: string;
  name: string;
  documentType: string;
  filesCount: number;
  updatedAtText: string;
  lastUpdatedAt: string;
}

export interface IEmrListDoc {
  id: string;
  uuid: string;
  doctor_id: any;
  patient_id: string;
  appointment_id: any;
  clinic_id: any;
  title: string;
  description: string;
  document_type: string;
  document_path: string;
  document_url: string;
  file_size: string;
  owner_type: string;
  owner_id: string;
  uploaded_during_call: boolean;
  visible_to_patient: boolean;
  meeting_id: any;
  created_from: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  updatedAtText: string;
  doctor: any;
  clinic: any;
  shared_doctors?: SharedDoctor[];
}

export interface SharedDoctor {
  id: string;
  user_id: string;
  doctor_id: any;
  name: any;
  specialization: any;
  access_type: string;
}
