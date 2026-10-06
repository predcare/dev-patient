import { create } from 'zustand';
import {
  ICallInfo,
  IMeetingStoreState,
  MeetingCallState,
  MeetingPipMode,
} from '../interfaces/meeting.interfaces';

const initialCallInfo: ICallInfo = {
  token: null,
  meetingId: null,
  appointment: null,
};

const initialState = {
  callInfo: initialCallInfo,
  appointmentId: null,
  callState: 'IDLE' as MeetingCallState,
  pipMode: 'NORMAL' as MeetingPipMode,
  isMuted: false,
  isCamOn: true,
  isFrontCamera: true,
  doctorInfo: null,
  remainingSeconds: 0,
  doctorParticipantId: null,
  doctorWebcamOn: false,
  doctorMicOn: true,
};

export const useMeetingStore = create<IMeetingStoreState>((set, get) => ({
  ...initialState,

  setCallInfo: ({ token, meeting_id, appointment, doctorInfo }) => {
    // Compute default duration if provided
    const slotSeconds = appointment.slot_duration ? appointment.slot_duration * 60 : 600;
    set({
      callInfo: {
        token,
        meetingId: meeting_id,
        appointment: {
          id: appointment.id,
          appointmentId: appointment.appointment_id,
          appointmentDate: appointment.appointment_date,
          startTime: appointment.start_time,
          endTime: appointment.end_time,
          slotDuration: appointment.slot_duration,
        },
      },
      appointmentId: appointment.id,
      doctorInfo: doctorInfo || get().doctorInfo,
      remainingSeconds: slotSeconds,
      callState: 'INITIALIZING',
      pipMode: 'NORMAL',
    });
  },

  setCallState: (callState: MeetingCallState) => set({ callState }),

  setPipMode: (pipMode: MeetingPipMode) => set({ pipMode }),

  setIsMuted: (isMuted: boolean) => set({ isMuted }),

  setIsCamOn: (isCamOn: boolean) => set({ isCamOn }),

  setIsFrontCamera: (isFrontCamera: boolean) => set({ isFrontCamera }),

  setRemainingSeconds: update =>
    set(state => ({
      remainingSeconds: typeof update === 'function' ? update(state.remainingSeconds) : update,
    })),

  setDoctorParticipant: ({ id, webcamOn, micOn }) =>
    set(state => ({
      doctorParticipantId: id,
      doctorWebcamOn: webcamOn !== undefined ? webcamOn : state.doctorWebcamOn,
      doctorMicOn: micOn !== undefined ? micOn : state.doctorMicOn,
    })),

  setIsCameraPausedForCapture: paused => set({ isCameraPausedForCapture: paused }),

  resetCallInfo: () =>
    set({
      ...initialState,
    }),

  resetMeetingStore: () =>
    set({
      ...initialState,
    }),
}));

export default useMeetingStore;
