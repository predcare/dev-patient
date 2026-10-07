export interface IRescheduleAppointment {
  appointment_id: number | string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  availability_id: string[];
  clinic_id: string;
  appointment_duration: number;
  reason: string;
  appointment_slot_time: {
    start: string;
    end: string;
  }[];
}
