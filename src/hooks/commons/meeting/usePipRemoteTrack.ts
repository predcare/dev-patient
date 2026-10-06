import { useEffect } from 'react';
import { Platform } from 'react-native';
import NativePip from '../../../native/NativePip';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';
import { useDoctorStream } from './useMeetingParticipants';

export const usePipRemoteTrack = () => {
  const doctorParticipantId = useMeetingStore(state => state.doctorParticipantId);
  const doctorInfo = useMeetingStore(state => state.doctorInfo);
  const { webcamStream, webcamOn } = useDoctorStream(doctorParticipantId);

  const trackId = webcamOn && webcamStream?.track ? webcamStream.track.id : null;

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    if (trackId) {
      NativePip.attachRemoteRenderer(trackId);
    } else {
      NativePip.detachRemoteRenderer();
    }
  }, [trackId]);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const doctorName = doctorInfo?.name || 'Doctor';
    NativePip.setPlaceholderText(
      doctorParticipantId ? `${doctorName}\ncamera off` : 'Waiting for doctor...'
    );
  }, [doctorParticipantId, doctorInfo?.name]);

  useEffect(() => {
    return () => {
      if (Platform.OS === 'ios') {
        NativePip.detachRemoteRenderer();
      }
    };
  }, []);
};

export default usePipRemoteTrack;
