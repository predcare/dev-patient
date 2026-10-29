import { MediaStream, RTCView } from '@videosdk.live/react-native-sdk';
import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDoctorStream } from '../../../../hooks/commons/meeting/useMeetingParticipants';
import meetingStyles from '../../../../styled/MeetingScreen.styled';
import useMeetingStore from '../../../../zustand/stores/useMeetingStore';

export const DoctorStageView: React.FC = () => {
  const doctorParticipantId = useMeetingStore(state => state.doctorParticipantId);
  const doctorInfo = useMeetingStore(state => state.doctorInfo);
  const callState = useMeetingStore(state => state.callState);
  // Audio-only (weak network): show the camera-off view instead of a frozen frame.
  const isAudioOnly = useMeetingStore(state => state.videoTier === 'audio');
  const remoteVideoEpoch = useMeetingStore(state => state.remoteVideoEpoch);

  const { webcamStream, webcamOn } = useDoctorStream(doctorParticipantId);
  const remoteTrack = !isAudioOnly && webcamOn && webcamStream ? webcamStream.track : null;
  // remoteVideoEpoch: a resumed stream or a reconnect can keep the same track object,
  // so the view needs a fresh URL / remount to show frames again.
  const remoteStreamURL = useMemo(
    () => (remoteTrack ? new MediaStream([remoteTrack]).toURL() : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [remoteTrack, remoteVideoEpoch],
  );

  const doctorName = doctorInfo?.name || 'Doctor';
  const initial = doctorName.replace(/^Dr\.\s*/i, '').charAt(0) || 'D';
  const isConnected = callState === 'CONNECTED';

  if (remoteStreamURL) {
    return (
      <View style={StyleSheet.absoluteFill}>
        <RTCView
          key={remoteVideoEpoch}
          streamURL={remoteStreamURL}
          objectFit="cover"
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

export default memo(DoctorStageView);
