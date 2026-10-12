import { useMeeting, useParticipant } from '@videosdk.live/react-native-sdk';
import { useEffect, useMemo } from 'react';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';

export const useMeetingParticipants = () => {
  const { participants, localParticipant } = useMeeting({});
  const setDoctorParticipant = useMeetingStore(state => state.setDoctorParticipant);
  const setCallState = useMeetingStore(state => state.setCallState);
  const currentCallState = useMeetingStore(state => state.callState);

  // Identify remote participant (Doctor)
  const doctorId = useMemo(() => {
    if (!participants) return null;
    for (const [id] of participants) {
      if (id !== localParticipant?.id) {
        return id;
      }
    }
    return null;
  }, [participants, localParticipant?.id]);

  // Sync state machine when doctor joins/leaves
  useEffect(() => {
    if (doctorId) {
      setDoctorParticipant({ id: doctorId });
      if (currentCallState === 'WAITING_FOR_DOCTOR' || currentCallState === 'CONNECTING') {
        setCallState('CONNECTED');
      }
    } else {
      setDoctorParticipant({ id: null, webcamOn: false });
      if (currentCallState === 'CONNECTED') {
        setCallState('WAITING_FOR_DOCTOR');
      }
    }
  }, [doctorId, currentCallState, setDoctorParticipant, setCallState]);

  return {
    localParticipant,
    doctorId,
  };
};

export const useDoctorStream = (doctorId: string | null) => {
  const setDoctorParticipant = useMeetingStore(state => state.setDoctorParticipant);

  const participantData = useParticipant(doctorId || '', {
    onStreamEnabled: stream => {
      if (stream.kind === 'video') {
        setDoctorParticipant({ id: doctorId, webcamOn: true });
      }
    },
    onStreamDisabled: stream => {
      if (stream.kind === 'video') {
        setDoctorParticipant({ id: doctorId, webcamOn: false });
      }
    },
  });

  const webcamStream = doctorId ? participantData?.webcamStream : null;
  const webcamOn = doctorId ? Boolean(participantData?.webcamOn) : false;
  const micOn = doctorId ? Boolean(participantData?.micOn) : true;
  const displayName = doctorId ? participantData?.displayName : '';

  useEffect(() => {
    if (doctorId) {
      setDoctorParticipant({
        id: doctorId,
        webcamOn,
        micOn,
      });
    }
  }, [doctorId, webcamOn, micOn, setDoctorParticipant]);

  return {
    webcamStream,
    webcamOn,
    micOn,
    displayName,
  };
};

export const useDoctorVideoQuality = (doctorId: string | null) => {
  const { webcamOn, webcamStream, setQuality } = useParticipant(doctorId || '');
  const trackId = webcamStream?.track?.id ?? null;

  useEffect(() => {
    if (!doctorId || !webcamOn || !trackId || typeof setQuality !== 'function') {
      return;
    }

    let cancelled = false;
    setQuality('high').catch(error => {
      if (!cancelled) {
        console.warn('[useDoctorVideoQuality] setQuality(high) failed:', error);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [doctorId, webcamOn, trackId, setQuality]);
};

export default useMeetingParticipants;
