import { MeetingConsumer, MeetingProvider } from '@videosdk.live/react-native-sdk';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import MeetingStageOverlay from '../../Features/Dashboard/MeetingScreen/Components/MeetingStageOverlay';
import useAndroidCallForegroundService from '../../hooks/commons/meeting/useAndroidCallForegroundService';
import useAndroidPipLifecycle from '../../hooks/commons/meeting/useAndroidPipLifecycle';
import useMeetingAppState from '../../hooks/commons/meeting/useMeetingAppState';
import { useMeetingCountdownTicker } from '../../hooks/commons/meeting/useMeetingCountdown';
import useMeetingParticipants from '../../hooks/commons/meeting/useMeetingParticipants';
import usePipRemoteTrack from '../../hooks/commons/meeting/usePipRemoteTrack';
import NativePip from '../../native/NativePip';
import useMeetingStore from '../../zustand/stores/useMeetingStore';
import AndroidPipStage from './AndroidPipStage';
import InAppPipWindow from './InAppPipWindow';

const MeetingSessionController: React.FC = () => {
  useMeetingAppState();
  useMeetingParticipants();
  usePipRemoteTrack();
  useMeetingCountdownTicker();
  useAndroidPipLifecycle();
  useAndroidCallForegroundService();
  const pipMode = useMeetingStore(state => state.pipMode);

  if (pipMode === 'IN_APP_PIP') {
    return <InAppPipWindow />;
  }

  // NATIVE_PIP draws nothing on iOS: the system window is the video. Android's PiP window
  // shrinks the activity itself, so it gets a dedicated compact layout. This component stays
  // mounted either way so the meeting hooks above keep running.
  if (pipMode === 'NATIVE_PIP' && Platform.OS === 'android') {
    return <AndroidPipStage />;
  }

  if (pipMode === 'NORMAL') {
    return <MeetingStageOverlay />;
  }

  return null;
};

export const MeetingSessionHost: React.FC = () => {
  const callInfo = useMeetingStore(state => state.callInfo);
  const isMuted = useMeetingStore(state => state.isMuted);
  const isCamOn = useMeetingStore(state => state.isCamOn);
  const setCallState = useMeetingStore(state => state.setCallState);
  const resetCallInfo = useMeetingStore(state => state.resetCallInfo);

  const token = callInfo?.token;
  const meetingId = callInfo?.meetingId;

  useEffect(() => {
    if (meetingId) {
      NativePip.setMeetingScreenState(true);
    } else {
      NativePip.setMeetingScreenState(false);
    }
    return () => {
      NativePip.setMeetingScreenState(false);
    };
  }, [meetingId]);

  if (!token || !meetingId) {
    return null;
  }

  return (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: !isMuted,
        webcamEnabled: isCamOn,
        name: 'Patient',
        defaultCamera: 'front',
        maxResolution: 'hd',
        mode: 'SEND_AND_RECV',
        debugMode: false,
        notification: {
          title: 'PredCare Consultation',
          message: 'Video consultation in progress',
        },
      }}
      token={token}
      joinWithoutUserInteraction={true}
    >
      <MeetingConsumer
        onMeetingJoined={() => {
          setCallState('WAITING_FOR_DOCTOR');
        }}
        onMeetingLeft={() => {
          resetCallInfo();
        }}
        onError={({ code, message }) => {
          console.warn(`[VideoSDK] Meeting error (${code}): ${message}`);
        }}
        onMeetingStateChanged={({ state }) => {
          if (state === 'CONNECTING') {
            setCallState('CONNECTING');
          } else if (state === 'CONNECTED') {
            setCallState('CONNECTED');
          } else if (state === 'FAILED' || state === 'CLOSED' || state === 'DISCONNECTED') {
            setCallState('ENDED');
          }
        }}
      >
        {() => <MeetingSessionController />}
      </MeetingConsumer>
    </MeetingProvider>
  );
};

export default MeetingSessionHost;
