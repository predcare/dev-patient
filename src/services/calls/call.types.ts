// One incoming doctor call, read from the backend's INCOMING_CALL push.
export type IncomingCall = {
  callId: string; // backend uuid, lower case
  appointmentId: string;
  meetingId: string;
  callerName: string;
  callerImage: string;
  expiresAtMs: number;
};

// From the CALL_CANCELLED push. The backend sends an empty uuid when the doctor leaves the room,
// so a cancel can match on the appointment instead.
export type CallCancel = { callId?: string; appointmentId?: string };

export type PushData = Record<string, unknown> | undefined;
