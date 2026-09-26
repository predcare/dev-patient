import { create } from 'zustand';

export type TCallState = 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'ENDED' | 'ERROR';

interface IMeetingStoreState {
  // Session details
  token: string | null;
  meetingId: string | null;
  appointmentId: number | string | null;

  // Appointment context (for header display & timer)
  patientName: string | null;
  patientUserId: string | null;
  patientAlphanumericId: string | null;
  appointmentGeneratedId: string | null;
  startTime: string | null;
  endTime: string | null;
  callDurationSeconds: number;

  // Connection & Media States
  callState: TCallState;
  errorMessage: string | null;
  isMicOn: boolean;
  isCameraOn: boolean;
  facingMode: 'front' | 'back';
  remoteParticipantId: string | null;
  // PiP & Camera Interruption States
  isInAppPip: boolean;
  isNativePip: boolean;
  isCameraPausedForCapture: boolean;
  isExternalCameraInterrupted: boolean;

  // in Person consulatation
  apptIdforInPerson?: string | null;
  patientIdforInPerson?: string | null;
  patientNameforInPerson?: string | null;
  statusforInPerson?: string | null;

  // Timer tracking (Wall-clock active connected duration with pause/resume support)
  cumulativeActiveElapsedSeconds: number;
  lastConnectedAt: number | null;

  // Actions
  setMeetingSession: (params: {
    token: string;
    meetingId: string;
    appointmentId?: number | string;
    patientName?: string;
    patientUserId?: string;
    patientAlphanumericId?: string;
    appointmentGeneratedId?: string;
    startTime?: string;
    endTime?: string;
    callDurationSeconds?: number;
  }) => void;
  setCallState: (callState: TCallState) => void;
  setErrorState: (message?: string) => void;
  setMicState: (isMicOn: boolean) => void;
  setCameraState: (isCameraOn: boolean) => void;
  setFacingMode: (mode: 'front' | 'back') => void;
  setRemoteParticipantId: (id: string | null) => void;
  setIsInAppPip: (isInAppPip: boolean) => void;
  setIsNativePip: (isNativePip: boolean) => void;
  setIsCameraPausedForCapture: (paused: boolean) => void;
  setIsExternalCameraInterrupted: (interrupted: boolean) => void;
  resetMeetingStore: () => void;
  clearInPersonAppointment: () => void;
  setInPersonAppointment: (params: {
    apptIdforInPerson?: string | null;
    patientIdforInPerson?: string | null;
    patientNameforInPerson?: string | null;
    statusforInPerson?: string | null;
  }) => void;
}

const initialState = {
  token: null,
  meetingId: null,
  appointmentId: null,
  patientName: null,
  patientUserId: null,
  patientAlphanumericId: null,
  appointmentGeneratedId: null,
  startTime: null,
  endTime: null,
  callDurationSeconds: 0,
  cumulativeActiveElapsedSeconds: 0,
  lastConnectedAt: null as number | null,
  callState: 'IDLE' as TCallState,
  errorMessage: null as string | null,
  isMicOn: true,
  isCameraOn: true,
  facingMode: 'front' as const,
  remoteParticipantId: null,
  isInAppPip: false,
  isNativePip: false,
  isCameraPausedForCapture: false,
  isExternalCameraInterrupted: false,
  apptIdforInPerson: null,
  patientIdforInPerson: null,
  patientNameforInPerson: null,
  statusforInPerson: null,
};

export const useMeetingStore = create<IMeetingStoreState>(set => ({
  ...initialState,

  setMeetingSession: ({
    token,
    meetingId,
    appointmentId,
    patientName,
    patientUserId,
    patientAlphanumericId,
    appointmentGeneratedId,
    startTime,
    endTime,
    callDurationSeconds,
  }) =>
    set({
      token,
      meetingId,
      appointmentId: appointmentId ?? null,
      patientName: patientName ?? null,
      patientUserId: patientUserId ?? null,
      patientAlphanumericId: patientAlphanumericId ?? null,
      appointmentGeneratedId: appointmentGeneratedId ?? null,
      startTime: startTime ?? null,
      endTime: endTime ?? null,
      callDurationSeconds: callDurationSeconds ?? 0,
      cumulativeActiveElapsedSeconds: 0,
      lastConnectedAt: null,
      callState: 'CONNECTING',
      errorMessage: null,
      isInAppPip: false,
      isNativePip: false,
      isCameraPausedForCapture: false,
    }),

  setCallState: callState =>
    set(state => {
      let nextLastConnectedAt = state.lastConnectedAt;
      let nextCumulative = state.cumulativeActiveElapsedSeconds;

      if (callState === 'CONNECTED') {
        if (nextLastConnectedAt === null) {
          nextLastConnectedAt = Date.now();
        }
      } else {
        if (nextLastConnectedAt !== null) {
          nextCumulative += Math.max(0, Math.floor((Date.now() - nextLastConnectedAt) / 1000));
          nextLastConnectedAt = null;
        }
      }

      return {
        callState,
        lastConnectedAt: nextLastConnectedAt,
        cumulativeActiveElapsedSeconds: nextCumulative,
      };
    }),

  setErrorState: message =>
    set(state => {
      let nextCumulative = state.cumulativeActiveElapsedSeconds;
      if (state.lastConnectedAt !== null) {
        nextCumulative += Math.max(0, Math.floor((Date.now() - state.lastConnectedAt) / 1000));
      }
      return {
        callState: 'ERROR',
        errorMessage: message || "'token' is empty or invalid or might have expired.",
        lastConnectedAt: null,
        cumulativeActiveElapsedSeconds: nextCumulative,
      };
    }),

  setMicState: isMicOn => set({ isMicOn }),

  setCameraState: isCameraOn => set({ isCameraOn }),

  setFacingMode: facingMode => set({ facingMode }),

  setRemoteParticipantId: remoteParticipantId =>
    set(state => {
      const isTerminal = state.callState === 'ERROR' || state.callState === 'ENDED';
      const nextCallState: TCallState = isTerminal
        ? state.callState
        : remoteParticipantId
        ? 'CONNECTED'
        : 'CONNECTING';

      let nextLastConnectedAt = state.lastConnectedAt;
      let nextCumulative = state.cumulativeActiveElapsedSeconds;

      if (nextCallState === 'CONNECTED') {
        if (nextLastConnectedAt === null) {
          nextLastConnectedAt = Date.now();
        }
      } else {
        if (nextLastConnectedAt !== null) {
          nextCumulative += Math.max(0, Math.floor((Date.now() - nextLastConnectedAt) / 1000));
          nextLastConnectedAt = null;
        }
      }

      return {
        remoteParticipantId,
        callState: nextCallState,
        lastConnectedAt: nextLastConnectedAt,
        cumulativeActiveElapsedSeconds: nextCumulative,
      };
    }),

  setIsInAppPip: isInAppPip => set({ isInAppPip }),

  setIsNativePip: isNativePip => set({ isNativePip }),

  setIsCameraPausedForCapture: isCameraPausedForCapture => set({ isCameraPausedForCapture }),

  setIsExternalCameraInterrupted: isExternalCameraInterrupted => set({ isExternalCameraInterrupted }),

  resetMeetingStore: () => set({ ...initialState }),

  // In Person
  clearInPersonAppointment: () =>
    set({
      apptIdforInPerson: null,
      patientIdforInPerson: null,
      patientNameforInPerson: null,
      statusforInPerson: null,
    }),

  setInPersonAppointment: ({
    apptIdforInPerson,
    patientIdforInPerson,
    patientNameforInPerson,
    statusforInPerson,
  }) =>
    set({
      apptIdforInPerson: apptIdforInPerson ?? null,
      patientIdforInPerson: patientIdforInPerson ?? null,
      patientNameforInPerson: patientNameforInPerson ?? null,
      statusforInPerson: statusforInPerson ?? null,
    }),
}));
