import { create } from 'zustand';
import {
  ICallInfo,
  IMeetingStoreState,
  MeetingCallState,
  MeetingPipMode,
  TNetworkQuality,
  TQualityLimitation,
  TQualityLimitations,
  TSendTier,
  TVideoTier,
} from '../interfaces/meeting.interfaces';

const NO_LIMITATIONS: TQualityLimitations = { bandwidth: false, congestion: false, cpu: false };

const QUALITY_RANK: Record<TNetworkQuality, number> = { GOOD: 3, FAIR: 2, WEAK: 1, OFFLINE: 0 };

const worseQuality = (a: TNetworkQuality, b: TNetworkQuality): TNetworkQuality =>
  QUALITY_RANK[a] <= QUALITY_RANK[b] ? a : b;

const deriveLimitation = (limitations: TQualityLimitations): TQualityLimitation => {
  if (limitations.bandwidth) return 'bandwidth';
  if (limitations.congestion) return 'congestion';
  if (limitations.cpu) return 'cpu';
  return null;
};

const cleanCallQuality = {
  networkQuality: 'GOOD' as TNetworkQuality,
  uplinkQuality: 'GOOD' as TNetworkQuality,
  downlinkQuality: 'GOOD' as TNetworkQuality,
  qualityLimitation: null as TQualityLimitation,
  qualityLimitations: NO_LIMITATIONS,
  qualityLimitationAt: null as number | null,
};

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
  isCameraPausedForCapture: false,
  cameraSessionEpoch: 0,
  ...cleanCallQuality,
  videoTier: 'hd' as TVideoTier,
  sendTier: 'hd' as TSendTier,
  remoteVideoEpoch: 0,
  sessionKey: 0,
  rejoinAttempt: 0,
  isEndRequested: false,
};

export const useMeetingStore = create<IMeetingStoreState>((set, get) => ({
  ...initialState,

  setCallInfo: ({ token, meeting_id, appointment, doctorInfo }) => {
    const durationMinutes = Number(
      appointment.appointment_duration || appointment.slot_duration || 0
    );
    const elapsedSeconds = Math.max(0, Number(appointment.call_elapsed_seconds || 0));
    const totalSeconds = durationMinutes > 0 ? Math.floor(durationMinutes * 60) : 0;
    const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);

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
          slotDuration: appointment.slot_duration ?? null,
          appointmentDuration: durationMinutes || null,
          callElapsedSeconds: elapsedSeconds,
        },
      },
      appointmentId: appointment.id,
      doctorInfo: doctorInfo || get().doctorInfo,
      remainingSeconds,
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
    set(state => {
      const nextWebcamOn = webcamOn !== undefined ? webcamOn : state.doctorWebcamOn;
      const nextMicOn = micOn !== undefined ? micOn : state.doctorMicOn;
      // Several hooks report the same doctor values; skip no-op writes to avoid extra renders.
      if (
        state.doctorParticipantId === id &&
        state.doctorWebcamOn === nextWebcamOn &&
        state.doctorMicOn === nextMicOn
      ) {
        return state;
      }
      return { doctorParticipantId: id, doctorWebcamOn: nextWebcamOn, doctorMicOn: nextMicOn };
    }),

  setIsCameraPausedForCapture: paused => set({ isCameraPausedForCapture: paused }),

  bumpCameraSessionEpoch: () =>
    set(state => ({ cameraSessionEpoch: state.cameraSessionEpoch + 1 })),

  setCallQualities: (uplinkQuality, downlinkQuality) =>
    set(state => {
      const networkQuality = worseQuality(uplinkQuality, downlinkQuality);
      if (
        state.uplinkQuality === uplinkQuality &&
        state.downlinkQuality === downlinkQuality &&
        state.networkQuality === networkQuality
      ) {
        return state;
      }
      return { uplinkQuality, downlinkQuality, networkQuality };
    }),

  setQualityLimitationEvent: (type, detected) =>
    set(state => {
      if (state.qualityLimitations[type] === detected) {
        return detected ? { qualityLimitationAt: Date.now() } : state;
      }
      const qualityLimitations = { ...state.qualityLimitations, [type]: detected };
      return {
        qualityLimitations,
        qualityLimitation: deriveLimitation(qualityLimitations),
        qualityLimitationAt: detected ? Date.now() : state.qualityLimitationAt,
      };
    }),

  clearQualityLimitations: () =>
    set(state =>
      state.qualityLimitation === null
        ? state
        : { qualityLimitations: NO_LIMITATIONS, qualityLimitation: null, qualityLimitationAt: null },
    ),

  resetCallQuality: () => set({ ...cleanCallQuality }),

  setVideoTier: videoTier => set(state => (state.videoTier === videoTier ? state : { videoTier })),

  setSendTier: sendTier => set(state => (state.sendTier === sendTier ? state : { sendTier })),

  bumpRemoteVideoEpoch: () =>
    set(state => ({ remoteVideoEpoch: state.remoteVideoEpoch + 1 })),

  setRejoinAttempt: rejoinAttempt => set({ rejoinAttempt }),

  setEndRequested: isEndRequested => set({ isEndRequested }),

  rejoinCallInfo: ({ token, meetingId, callElapsedSeconds }) =>
    set(state => {
      const durationMinutes = Number(state.callInfo.appointment?.appointmentDuration || 0);
      const totalSeconds = Math.floor(durationMinutes * 60);
      const serverRemaining =
        callElapsedSeconds != null && totalSeconds > 0
          ? Math.max(0, totalSeconds - Number(callElapsedSeconds))
          : null;
      // Keeps pipMode, mute/camera state, doctorInfo and the tiers: only the session changes.
      // The old session never sends "resolved", so its quality readings are dropped here.
      return {
        ...cleanCallQuality,
        remoteVideoEpoch: state.remoteVideoEpoch + 1,
        callInfo: { ...state.callInfo, token, meetingId },
        sessionKey: state.sessionKey + 1,
        callState: 'RECONNECTING' as MeetingCallState,
        doctorParticipantId: null,
        // The server can only shorten the remaining time, never extend it.
        remainingSeconds:
          serverRemaining != null
            ? Math.min(state.remainingSeconds, serverRemaining)
            : state.remainingSeconds,
      };
    }),

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
