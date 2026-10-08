import { MediaStream, RTCView, useMeeting, useParticipant } from '@videosdk.live/react-native-sdk';
import React from 'react';
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

  const shouldRenderVideo = isCamOn && webcamOn && webcamStream;

  return (
    <View style={meetingStyles.localContainer}>
      <View style={meetingStyles.localVideoMock}>
        {shouldRenderVideo ? (
          <RTCView
            key={Platform.OS === 'android' ? cameraSessionEpoch : undefined}
            streamURL={new MediaStream([webcamStream.track]).toURL()}
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

export default LocalPipCard;
