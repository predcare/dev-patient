import { MediaStream, RTCView } from '@videosdk.live/react-native-sdk';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDoctorStream } from '../../../../hooks/commons/meeting/useMeetingParticipants';
import meetingStyles from '../../../../styled/MeetingScreen.styled';
import useMeetingStore from '../../../../zustand/stores/useMeetingStore';

export const DoctorStageView: React.FC = () => {
  const doctorParticipantId = useMeetingStore(state => state.doctorParticipantId);
  const doctorInfo = useMeetingStore(state => state.doctorInfo);
  const callState = useMeetingStore(state => state.callState);

  const { webcamStream, webcamOn } = useDoctorStream(doctorParticipantId);

  const doctorName = doctorInfo?.name || 'Dr. Sahil Mallick';
  const initial = doctorName.replace(/^Dr\.\s*/i, '').charAt(0) || 'D';
  const isConnected = callState === 'CONNECTED';

  if (webcamOn && webcamStream) {
    return (
      <View style={StyleSheet.absoluteFill}>
        <RTCView
          streamURL={new MediaStream([webcamStream.track]).toURL()}
          objectFit="contain"
          style={StyleSheet.absoluteFill}
          zOrder={0}
        />
      </View>
    );
  }

  return (
    <View style={meetingStyles.videoPlaceholder}>
      <View style={meetingStyles.doctorAvatarCircle}>
        <Text style={meetingStyles.doctorAvatarTxt}>{initial}</Text>
      </View>
      <Text style={meetingStyles.statusText}>
        {isConnected ? 'DOCTOR CAMERA OFF' : 'WAITING FOR DOCTOR...'}
      </Text>
    </View>
  );
};

export default DoctorStageView;
