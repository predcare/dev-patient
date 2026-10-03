export interface IMetadata {
  start_time?: string;
  appointment_id?: string | number;
  appointment_date?: string;
  appointment_db_id?: number;
  meeting_id?: string;
  patient_id?: number;
  patient_name?: string;
  appointment_ref?: string;
  is_continuation?: boolean;
  is_paid?: boolean;
  appointment_slot_time?: string;
  to_time?: string;
  date_mode?: string;
  from_time?: string;
  clinic_name?: string;
  doctor_name?: string;
  consultation_type?: string;
  new_date?: string;
  medications_count?: number;
  document_type?: string;
  title?: string;
  prescription_id?: number | string;
  prescriptionId?: number | string;
  [key: string]: any;
}

export interface INotificationDoc {
  id: number;
  notification_id: number;
  user_id: number;
  user_type: string;
  event_category: string;
  event_action: string;
  type?: string;
  description: string;
  message?: string;
  metadata?: IMetadata | string;
  associate_appointment_id?: number;
  associate_patient_id?: number;
  created_at: string;
  is_read?: boolean;
  clinic_id: string;
  associate_staff_id: any;
  created_by: string;
  created_by_type: string;
  show: boolean;
  updated_at: string;
}

export interface INotificationClearResponse {
  success: boolean;
  message: string;
  affected_rows: number;
}
