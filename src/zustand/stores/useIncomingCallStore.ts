import { create } from 'zustand';

export interface IncomingCallData {
  doctorName?: string;
  callType?: string;
  appointmentId?: number | string;
  meetingId?: string;
  onJoin?: () => void;
}

interface IncomingCallStoreState {
  visible: boolean;
  doctorName: string;
  callType: string;
  appointmentId?: number | string;
  meetingId?: string;
  onJoin?: () => void;

  showCallBanner: (params?: IncomingCallData) => void;
  hideCallBanner: () => void;
  toggleCallBanner: () => void;
}

const DEFAULT_DOCTOR_NAME = 'Dr. Sahil Mallick';
const DEFAULT_CALL_TYPE = 'Incoming Video Call...';

export const useIncomingCallStore = create<IncomingCallStoreState>(set => ({
  visible: false,
  doctorName: DEFAULT_DOCTOR_NAME,
  callType: DEFAULT_CALL_TYPE,
  appointmentId: undefined,
  meetingId: undefined,
  onJoin: undefined,

  showCallBanner: (params?: IncomingCallData) =>
    set({
      visible: true,
      doctorName: params?.doctorName || DEFAULT_DOCTOR_NAME,
      callType: params?.callType || DEFAULT_CALL_TYPE,
      appointmentId: params?.appointmentId,
      meetingId: params?.meetingId,
      onJoin: params?.onJoin,
    }),

  hideCallBanner: () =>
    set({
      visible: false,
      doctorName: '',
      callType: '',
      appointmentId: undefined,
      meetingId: undefined,
      onJoin: undefined,
    }),

  toggleCallBanner: () =>
    set(state => ({
      visible: !state.visible,
    })),
}));

export default useIncomingCallStore;
