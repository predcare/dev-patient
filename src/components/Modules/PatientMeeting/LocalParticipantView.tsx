import { MediaStream, RTCView, useParticipant } from '@videosdk.live/react-native-sdk';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import PatientMeetingScreenStyles from '../../../styled/PatientMeetingScreen.styled';
import TinyMicOffIcon from '../../ui/icons/TinyMicOffIcon';

interface LocalParticipantViewProps {
  participantId?: string;
  isCameraOn: boolean;
  isMicOn: boolean;
  facingMode: 'front' | 'back';
  inPipMode?: boolean;
}

export const LocalParticipantView: React.FC<LocalParticipantViewProps> = ({
  participantId,
  isCameraOn,
  isMicOn,
  facingMode,
  inPipMode = false,
}) => {
  const { webcamStream, webcamOn } = useParticipant(participantId || '');

  const streamUrl = useMemo(() => {
    if (!isCameraOn || !webcamOn || !webcamStream?.track) return null;

    if (typeof (webcamStream as any).toURL === 'function') {
      return (webcamStream as any).toURL();
    }
    if (typeof (webcamStream.track as any).toURL === 'function') {
      return (webcamStream.track as any).toURL();
    }
    try {
      const mediaStream = new MediaStream([webcamStream.track]);
      if (typeof mediaStream.toURL === 'function') {
        return mediaStream.toURL();
      }
    } catch (err) {
      console.warn('Error creating MediaStream for local view:', err);
    }
    return null;
  }, [isCameraOn, webcamOn, webcamStream, webcamStream?.track, (webcamStream?.track as any)?.id]);

  return (
    <View
      style={
        inPipMode
          ? PatientMeetingScreenStyles.selfPipCardPip
          : PatientMeetingScreenStyles.selfPipCard
      }
    >
      {streamUrl && typeof streamUrl === 'string' ? (
        <RTCView
          streamURL={streamUrl}
          objectFit="cover"
          zOrder={1}
          style={{ width: '100%', height: '100%', borderRadius: inPipMode ? 8 : 16 }}
          mirror={facingMode === 'front'}
        />
      ) : (
        <Text
          style={[
            PatientMeetingScreenStyles.pipAvatarTxt,
            inPipMode && { fontSize: 16 },
          ]}
        >
          P
        </Text>
      )}

      {!isMicOn && (
        <View
          style={
            inPipMode
              ? PatientMeetingScreenStyles.pipMuteBadgePip
              : PatientMeetingScreenStyles.pipMuteBadge
          }
        >
          <TinyMicOffIcon />
        </View>
      )}

      <View
        style={
          inPipMode
            ? PatientMeetingScreenStyles.pipYouBadgePip
            : PatientMeetingScreenStyles.pipYouBadge
        }
      >
        <Text
          style={
            inPipMode
              ? PatientMeetingScreenStyles.pipYouTxtPip
              : PatientMeetingScreenStyles.pipYouTxt
          }
        >
          YOU
        </Text>
      </View>
    </View>
  );
};

export default LocalParticipantView;
