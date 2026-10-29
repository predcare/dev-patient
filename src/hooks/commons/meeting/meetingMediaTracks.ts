import {
  createCameraVideoTrack,
  createMicrophoneAudioTrack,
  MediaStream,
} from '@videosdk.live/react-native-sdk';
import { VIDEO_TIER_PRESETS } from '../../../config/meeting.constants';
import { TVideoTier } from '../../../zustand/interfaces/meeting.interfaces';
import useMeetingStore from '../../../zustand/stores/useMeetingStore';

type TPendingTracks = { camera?: MediaStream; mic?: MediaStream };

let pendingTracks: TPendingTracks | null = null;

/** Audio-only still sends the smallest camera layer, so the CAM button stays truthful. */
export const getSendTier = (tier: TVideoTier): Exclude<TVideoTier, 'audio'> =>
  tier === 'audio' ? 'low' : tier;

/** Camera track for a tier, facing the camera the patient currently uses. */
export const createCameraTrack = (tier: TVideoTier) => {
  const { isFrontCamera } = useMeetingStore.getState();
  return createCameraVideoTrack({
    facingMode: isFrontCamera ? 'user' : 'environment',
    optimizationMode: 'motion',
    multiStream: true,
    ...VIDEO_TIER_PRESETS[getSendTier(tier)],
  });
};

export const createMicTrack = () =>
  createMicrophoneAudioTrack({
    encoderConfig: 'speech_standard',
    noiseConfig: { noiseSuppression: true, echoCancellation: true, autoGainControl: true },
  });

export const stopStream = (stream?: MediaStream) => {
  stream?.getTracks().forEach(track => track.stop());
};

/** Tracks opened before the provider mounts (join / rejoin), handed to it once. */
export const setPendingTracks = (tracks: TPendingTracks) => {
  releasePendingTracks();
  pendingTracks = tracks;
};

export const takePendingTracks = (): TPendingTracks => {
  const tracks = pendingTracks || {};
  pendingTracks = null;
  return tracks;
};

export const releasePendingTracks = () => {
  stopStream(pendingTracks?.camera);
  stopStream(pendingTracks?.mic);
  pendingTracks = null;
};
