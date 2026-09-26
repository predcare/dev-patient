import { IRootResponse } from './common.interfaces';

export type TStatsRoot = IRootResponse<IStatsDoc>;

export interface IStatsDoc {
  total_prescriptions: number;
  total_video_consultations: number;
  total_appointments_booked: number;
  total_amount_paid: number;
  currency: string;
  summary: IStatsSummary;
}

export interface IStatsSummary {
  in_person_consultations: number;
  completed_appointments: number;
  cancelled_appointments: number;
  upcoming_appointments: number;
}
