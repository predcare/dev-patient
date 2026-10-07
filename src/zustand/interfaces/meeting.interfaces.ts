export type MeetingCallState =
  | 'IDLE'
  | 'INITIALIZING'
  | 'CONNECTING'
  | 'WAITING_FOR_DOCTOR'
  | 'CONNECTED'
  | 'RECONNECTING'
  | 'DISCONNECTED'
  | 'FAILED'
  | 'ENDED';

export type MeetingPipMode = 'NORMAL' | 'IN_APP_PIP' | 'NATIVE_PIP';

export interface IMeetingDoctorInfo {
  name?: string;
  doctorId?: string;
}

export interface ICallAppointmentInfo {
  id: string | null;
  appointmentId: string | null;
  appointmentDate: string | null;
  startTime: string | null;
  endTime: string | null;
  slotDuration: number | null;
  appointmentDuration: number | null;
  callElapsedSeconds: number | null;
}

export interface ICallInfo {
  token: string | null;
  meetingId: string | null;
  appointment: ICallAppointmentInfo | null;
}

export interface IMeetingStoreState {
  callInfo: ICallInfo;
  appointmentId: string | number | null;
  callState: MeetingCallState;
  pipMode: MeetingPipMode;
  isMuted: boolean;
  isCamOn: boolean;
  isFrontCamera: boolean;
  doctorInfo: IMeetingDoctorInfo | null;
  remainingSeconds: number;
  doctorParticipantId: string | null;
  doctorWebcamOn: boolean;
  doctorMicOn: boolean;
  isCameraPausedForCapture?: boolean;
  setIsCameraPausedForCapture: (paused: boolean) => void;

  setCallInfo: (data: {
    token: string;
    meeting_id: string;
    appointment: {
      id: string;
      appointment_id: string;
      appointment_date: string;
      start_time: string;
      end_time: string;
      slot_duration?: number;
      appointment_duration?: number;
      call_elapsed_seconds?: number;
    };
    doctorInfo?: IMeetingDoctorInfo;
  }) => void;
  setCallState: (callState: MeetingCallState) => void;
  setPipMode: (pipMode: MeetingPipMode) => void;
  setIsMuted: (isMuted: boolean) => void;
  setIsCamOn: (isCamOn: boolean) => void;
  setIsFrontCamera: (isFrontCamera: boolean) => void;
  setRemainingSeconds: (seconds: number | ((prev: number) => number)) => void;
  setDoctorParticipant: (data: {
    id: string | null;
    webcamOn?: boolean;
    micOn?: boolean;
  }) => void;
  resetCallInfo: () => void;
  resetMeetingStore: () => void;
}
