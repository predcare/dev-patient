import type { CallCancel, IncomingCall, PushData } from './call.types';

export const INCOMING_CALL_TYPE = 'INCOMING_CALL';
export const CALL_CANCELLED_TYPE = 'CALL_CANCELLED';
const DEFAULT_TIMEOUT_S = 30;

// Reads the backend push data (all values are strings). Also reads back the data saved on the
// Android ring notification, which uses the same field names.
export const callFromPush = (data: PushData): IncomingCall | null => {
  if (data?.type !== INCOMING_CALL_TYPE || !data.uuid || !data.appointment_id) return null;
  // The patient app only takes calls from doctors.
  if (data.caller_role && data.caller_role !== 'doctor') return null;

  const startedAt = Number(data.timestamp) || Date.now();
  const timeoutMs = (Number(data.timeout_seconds) || DEFAULT_TIMEOUT_S) * 1000;
  return {
    callId: String(data.uuid).toLowerCase(),
    appointmentId: String(data.appointment_id),
    meetingId: String(data.meeting_id ?? ''),
    callerName: String(data.caller_name || 'Your doctor'),
    callerImage: String(data.caller_image ?? ''),
    expiresAtMs: startedAt + timeoutMs,
  };
};

export const cancelFromPush = (data: PushData): CallCancel | null => {
  if (data?.type !== CALL_CANCELLED_TYPE) return null;
  return {
    callId: String(data.uuid || '').toLowerCase() || undefined,
    appointmentId: String(data.appointment_id || '') || undefined,
  };
};

// Notifee data values must be strings. The push's `token` is left out on purpose: join always
// fetches a fresh one.
export const callToData = (call: IncomingCall): Record<string, string> => ({
  type: INCOMING_CALL_TYPE,
  uuid: call.callId,
  appointment_id: call.appointmentId,
  meeting_id: call.meetingId,
  caller_name: call.callerName,
  caller_role: 'doctor',
  caller_image: call.callerImage,
  timestamp: String(call.expiresAtMs - DEFAULT_TIMEOUT_S * 1000),
  timeout_seconds: String(DEFAULT_TIMEOUT_S),
});
