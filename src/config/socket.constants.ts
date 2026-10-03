export enum SocketEvents {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  CONNECT_ERROR = 'connect_error',
  HEARTBEAT = 'HEARTBEAT',
  NOTIFICATION = 'NOTIFICATION',
  INCOMING_CALL_CANCELLED = 'incoming_call_cancelled',
  INCOMING_CALL = 'incoming_call',
  CALL_CONNECTED = 'call_connected',
  TIME_UP_VIDEO_CALL_ENDED = 'time_up_video_call_ended',
}
