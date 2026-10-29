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

export type TNetworkQuality = 'GOOD' | 'FAIR' | 'WEAK' | 'OFFLINE';

export type TVideoTier = 'hd' | 'sd' | 'low' | 'audio';

export type TQualityLimitation = 'congestion' | 'bandwidth' | 'cpu' | null;

export type TQualityLimitationType = Exclude<TQualityLimitation, null>;

/** Each SDK limitation type is detected and resolved on its own. */
export type TQualityLimitations = Record<TQualityLimitationType, boolean>;

/** What the patient's camera sends. Audio-only still sends the smallest layer. */
export type TSendTier = Exclude<TVideoTier, 'audio'>;

export interface IMeetingTokenRefresh {
  token: string;
  meetingId: string;
  callElapsedSeconds?: number;
}

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
  isCameraPausedForCapture: boolean;
  cameraSessionEpoch: number;
  /** Worse of uplinkQuality and downlinkQuality; drives the header bars. */
  networkQuality: TNetworkQuality;
  /** Patient's upload (local stats). */
  uplinkQuality: TNetworkQuality;
  /** Doctor's video and audio reaching the patient (remote stats). */
  downlinkQuality: TNetworkQuality;
  /** First active of bandwidth / congestion / cpu, derived from qualityLimitations. */
  qualityLimitation: TQualityLimitation;
  qualityLimitations: TQualityLimitations;
  /** When the last limitation was detected; used to drop stale ones. */
  qualityLimitationAt: number | null;
  /** Receive tier: what is requested from the doctor. 'audio' stops the doctor's video. */
  videoTier: TVideoTier;
  /** Send tier: what the patient's camera sends. Driven by upload signals only. */
  sendTier: TSendTier;
  /** Bumped to make the remote video views re-attach (stream resumed, reconnect, audio exit). */
  remoteVideoEpoch: number;
  /** Bumped on every rejoin so MeetingProvider remounts with the fresh token. */
  sessionKey: number;
  rejoinAttempt: number;
  /** Set by endMeetingCall() so a network drop can be told apart from an intentional end. */
  isEndRequested: boolean;
  setIsCameraPausedForCapture: (paused: boolean) => void;
  bumpCameraSessionEpoch: () => void;
  setCallQualities: (uplinkQuality: TNetworkQuality, downlinkQuality: TNetworkQuality) => void;
  setQualityLimitationEvent: (type: TQualityLimitationType, detected: boolean) => void;
  clearQualityLimitations: () => void;
  /** Back to a clean slate after a (re)join: GOOD quality, no limitations. */
  resetCallQuality: () => void;
  setVideoTier: (videoTier: TVideoTier) => void;
  setSendTier: (sendTier: TSendTier) => void;
  bumpRemoteVideoEpoch: () => void;
  setRejoinAttempt: (rejoinAttempt: number) => void;
  setEndRequested: (isEndRequested: boolean) => void;
  rejoinCallInfo: (params: IMeetingTokenRefresh) => void;

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
