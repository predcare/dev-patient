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
}

export const LocalParticipantView: React.FC<LocalParticipantViewProps> = ({
  participantId,
  isCameraOn,
  isMicOn,
  facingMode,
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
    <View style={PatientMeetingScreenStyles.selfPipCard}>
      {streamUrl && typeof streamUrl === 'string' ? (
        <RTCView
          streamURL={streamUrl}
          objectFit="cover"
          zOrder={1}
          style={{ width: '100%', height: '100%', borderRadius: 16 }}
          mirror={facingMode === 'front'}
        />
      ) : (
        <Text style={PatientMeetingScreenStyles.pipAvatarTxt}>P</Text>
      )}

      {!isMicOn && (
        <View style={PatientMeetingScreenStyles.pipMuteBadge}>
          <TinyMicOffIcon />
        </View>
      )}

      <View style={PatientMeetingScreenStyles.pipYouBadge}>
        <Text style={PatientMeetingScreenStyles.pipYouTxt}>YOU</Text>
      </View>
    </View>
  );
};

export default LocalParticipantView;
