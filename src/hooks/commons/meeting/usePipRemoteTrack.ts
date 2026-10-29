import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import NativePip from '../../../native/NativePip';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';
import { useDoctorStream } from './useMeetingParticipants';

export const usePipRemoteTrack = () => {
  const doctorParticipantId = useMeetingStore(state => state.doctorParticipantId);
  const doctorInfo = useMeetingStore(state => state.doctorInfo);
  const isAudioOnly = useMeetingStore(state => state.videoTier === 'audio');
  const remoteVideoEpoch = useMeetingStore(state => state.remoteVideoEpoch);
  const { webcamStream, webcamOn } = useDoctorStream(doctorParticipantId);

  // Audio-only detaches the renderer so the iOS PiP window shows its placeholder.
  const trackId = !isAudioOnly && webcamOn && webcamStream?.track ? webcamStream.track.id : null;

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    if (trackId) {
      NativePip.attachRemoteRenderer(trackId);
    } else {
      NativePip.detachRemoteRenderer();
    }
  }, [trackId]);

  // Re-attach after a resume / reconnect that kept the same track (attach alone is a no-op then).
  const attachedEpochRef = useRef(remoteVideoEpoch);
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    if (attachedEpochRef.current === remoteVideoEpoch) return;
    attachedEpochRef.current = remoteVideoEpoch;
    if (!trackId) return;
    NativePip.detachRemoteRenderer();
    NativePip.attachRemoteRenderer(trackId);
    // trackId changes are handled by the effect above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteVideoEpoch]);

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
