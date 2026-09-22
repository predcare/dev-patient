import { MediaStream, RTCView, useParticipant } from '@videosdk.live/react-native-sdk';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import PatientMeetingScreenStyles from '../../../styled/PatientMeetingScreen.styled';

interface RemoteParticipantViewProps {
  participantId: string;
  displayName?: string;
}

export const RemoteParticipantView: React.FC<RemoteParticipantViewProps> = ({
  participantId,
  displayName = 'Patient',
}) => {
  const { webcamStream, webcamOn, displayName: participantName } = useParticipant(participantId);

  const streamUrl = useMemo(() => {
    if (!webcamOn || !webcamStream?.track) return null;

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
      console.warn('Error creating MediaStream for remote view:', err);
    }
    return null;
  }, [webcamOn, webcamStream, webcamStream?.track, (webcamStream?.track as any)?.id]);

  // Active video stream — show RTCView
  if (streamUrl && typeof streamUrl === 'string') {
    return (
      <RTCView
        streamURL={streamUrl}
        objectFit="cover"
        zOrder={0}
        style={{ flex: 1, width: '100%', height: '100%' }}
      />
    );
  }

  // No stream available (camera off, connecting, or reconnecting).
  // We intentionally use a single stable avatar fallback for ALL non-stream
  // states to prevent the "Connecting remote video stream..." spinner from
  // flickering during SFU track negotiation. The avatar is visually stable
  // regardless of how many times useParticipant re-renders.
  const name = participantName || displayName;
  return (
    <View style={PatientMeetingScreenStyles.stageContainer}>
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: '#0F766E',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 32, fontWeight: '700' }}>
          {name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={PatientMeetingScreenStyles.waitingTitle}>
        {webcamOn ? 'Setting up video stream...' : `${name}'s camera is turned off`}
      </Text>
      <Text style={PatientMeetingScreenStyles.waitingSubtitle}>Audio consultation is active</Text>
    </View>
  );
};

export default RemoteParticipantView;
