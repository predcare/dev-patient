import { MediaStream, RTCView, useMeeting, useParticipant } from '@videosdk.live/react-native-sdk';
import React, { memo, useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { MuteIcon } from '../../../../components/ui/icons';
import meetingStyles from '../../../../styled/MeetingScreen.styled';
import theme from '../../../../styled/theme.styled';
import useMeetingStore from '../../../../zustand/stores/useMeetingStore';

export const LocalPipCard: React.FC = () => {
  const { localParticipant } = useMeeting({});
  const isMuted = useMeetingStore(state => state.isMuted);
  const isCamOn = useMeetingStore(state => state.isCamOn);
  const cameraSessionEpoch = useMeetingStore(state => state.cameraSessionEpoch);

  const localId = localParticipant?.id || '';
  const { webcamStream, webcamOn } = useParticipant(localId);

  const localTrack = isCamOn && webcamOn && webcamStream ? webcamStream.track : null;
  // Build the URL only when the track changes, so RTCView does not re-attach on every render.
  // cameraSessionEpoch: Android capture handoff/restore needs a fresh URL even for the same track.
  const localStreamURL = useMemo(
    () => (localTrack ? new MediaStream([localTrack]).toURL() : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [localTrack, cameraSessionEpoch],
  );

  return (
    <View style={meetingStyles.localContainer}>
      <View style={meetingStyles.localVideoMock}>
        {localStreamURL ? (
          <RTCView
            key={Platform.OS === 'android' ? cameraSessionEpoch : undefined}
            streamURL={localStreamURL}
            objectFit="cover"
            mirror={true}
            style={StyleSheet.absoluteFill}
            zOrder={1}
          />
        ) : (
          <Text style={{ color: theme.colors.surface, fontSize: 16, fontWeight: '700' }}>👤</Text>
        )}

        {isMuted && (
          <View
            style={{
              position: 'absolute',
              bottom: 4,
              right: 4,
              backgroundColor: theme.colors.red,
              borderRadius: 8,
              padding: 2,
              zIndex: 10,
            }}
          >
            <MuteIcon size={10} color="#FFFFFF" />
          </View>
        )}
      </View>
    </View>
  );
};

export default memo(LocalPipCard);
