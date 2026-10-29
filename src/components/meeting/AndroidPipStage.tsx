import { MediaStream, RTCView, useMeeting, useParticipant } from '@videosdk.live/react-native-sdk';
import React, { memo, useCallback, useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useDoctorStream } from '../../hooks/commons/meeting/useMeetingParticipants';
import NativePip from '../../native/NativePip';
import androidPipStyles, { PIP_NAME_PILL_MIN_WIDTH } from '../../styled/AndroidPip.styled';
import useMeetingStore from '../../zustand/stores/useMeetingStore';
import { MuteIcon, ProfileIcon } from '../ui/icons';

const LocalPipTile: React.FC = () => {
  const { localParticipant } = useMeeting({});
  const isMuted = useMeetingStore(state => state.isMuted);
  const isCamOn = useMeetingStore(state => state.isCamOn);
  const cameraSessionEpoch = useMeetingStore(state => state.cameraSessionEpoch);
  const { webcamStream, webcamOn } = useParticipant(localParticipant?.id || '');

  const localTrack = isCamOn && webcamOn && webcamStream ? webcamStream.track : null;
  // cameraSessionEpoch: Android capture handoff/restore needs a fresh URL even for the same track.
  const localStreamURL = useMemo(
    () => (localTrack ? new MediaStream([localTrack]).toURL() : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [localTrack, cameraSessionEpoch],
  );

  return (
    <View style={androidPipStyles.selfTile}>
      {localStreamURL ? (
        <RTCView
          key={cameraSessionEpoch}
          streamURL={localStreamURL}
          objectFit="cover"
          mirror={true}
          style={StyleSheet.absoluteFill}
          zOrder={1}
        />
      ) : (
        <ProfileIcon size={16} color="#E2E8F0" />
      )}
      {isMuted && (
        <View style={androidPipStyles.muteBadge}>
          <MuteIcon size={8} color="#FFFFFF" />
        </View>
      )}
    </View>
  );
};

/** Content of the Android system PiP window: meeting video only, no header or controls. */
export const AndroidPipStage: React.FC = () => {
  const { width } = useWindowDimensions();
  const doctorParticipantId = useMeetingStore(state => state.doctorParticipantId);
  const doctorInfo = useMeetingStore(state => state.doctorInfo);
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

  const handleLayout = useCallback(() => {
    NativePip.notifyAndroidPipContentReady();
  }, []);

  return (
    <View style={androidPipStyles.container} pointerEvents="none" onLayout={handleLayout}>
      {remoteStreamURL ? (
        <RTCView
          key={remoteVideoEpoch}
          streamURL={remoteStreamURL}
          objectFit="cover"
          style={StyleSheet.absoluteFill}
          zOrder={0}
        />
      ) : (
        <View style={androidPipStyles.placeholder}>
          <View style={androidPipStyles.avatarCircle}>
            <Text style={androidPipStyles.avatarTxt}>{initial}</Text>
          </View>
          <Text style={androidPipStyles.placeholderTxt} numberOfLines={1}>
            {doctorParticipantId ? 'Camera off' : 'Waiting for doctor'}
          </Text>
        </View>
      )}

      {width >= PIP_NAME_PILL_MIN_WIDTH && (
        <View style={androidPipStyles.namePill}>
          <Text style={androidPipStyles.nameTxt} numberOfLines={1}>
            {doctorName}
          </Text>
        </View>
      )}

      <LocalPipTile />
    </View>
  );
};

export default memo(AndroidPipStage);
