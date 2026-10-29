import { useMeeting, useParticipant } from '@videosdk.live/react-native-sdk';
import { useEffect, useMemo } from 'react';
import { MeetingCallState } from '../../../zustand/interfaces/meeting.interfaces';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';
import { logMeetingRecovery } from './meetingRecoveryLog';

const RECONNECT_STATES: MeetingCallState[] = ['RECONNECTING', 'DISCONNECTED'];

export const useMeetingParticipants = () => {
  const { participants, localParticipant } = useMeeting({});
  const setDoctorParticipant = useMeetingStore(state => state.setDoctorParticipant);
  const setCallState = useMeetingStore(state => state.setCallState);
  const currentCallState = useMeetingStore(state => state.callState);
  const bumpRemoteVideoEpoch = useMeetingStore(state => state.bumpRemoteVideoEpoch);

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

  // The SFU can pause the doctor's video on a weak link and resume it with the same track;
  // re-attach the views on resume so they do not stay frozen or black. Registered once here
  // (this hook lives in the controller), not in every useDoctorStream caller.
  useParticipant(doctorId || '', {
    onStreamPaused: ({ kind, reason }) => {
      logMeetingRecovery('doctor stream paused', { kind, reason });
    },
    onStreamResumed: ({ kind, reason }) => {
      logMeetingRecovery('doctor stream resumed', { kind, reason });
      if (kind === 'video') bumpRemoteVideoEpoch();
    },
  });

  // Sync state machine when doctor joins/leaves
  useEffect(() => {
    if (doctorId) {
      setDoctorParticipant({ id: doctorId });
      if (currentCallState === 'WAITING_FOR_DOCTOR' || currentCallState === 'CONNECTING') {
        setCallState('CONNECTED');
      }
    } else if (!RECONNECT_STATES.includes(currentCallState)) {
      // During a reconnect the participant list empties briefly; keep the doctor until it settles.
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

export default useMeetingParticipants;
