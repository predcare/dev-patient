import { MediaStream, RTCView, useParticipant } from '@videosdk.live/react-native-sdk';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface RemotePipVideoViewProps {
  participantId: string;
  displayName?: string;
}

export const RemotePipVideoView: React.FC<RemotePipVideoViewProps> = ({
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
      console.warn('[RemotePipVideoView]: MediaStream creation error:', err);
    }
    return null;
  }, [webcamOn, webcamStream, webcamStream?.track, (webcamStream?.track as any)?.id]);

  if (streamUrl && typeof streamUrl === 'string') {
    return (
      <RTCView
        streamURL={streamUrl}
        objectFit="cover"
        zOrder={1}
        style={StyleSheet.absoluteFillObject}
      />
    );
  }

  const name = participantName || displayName;
  return (
    <View style={styles.fallbackContainer}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarLetter}>{name.charAt(0).toUpperCase()}</Text>
      </View>
      <Text style={styles.fallbackText} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#0F172A',
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  fallbackText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default RemotePipVideoView;
