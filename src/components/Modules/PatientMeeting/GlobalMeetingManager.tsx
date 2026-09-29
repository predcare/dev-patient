import PipHandler from '@videosdk.live/react-native-pip-android';
import { MeetingProvider } from '@videosdk.live/react-native-sdk';
import React, { useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';
import { goBack, navigationRef, replace } from '../../../navigation/navigationRef';
import { AppRoute } from '../../../route';
import { useAuthStore } from '../../../zustand/stores/useAuthStore';
import { useMeetingStore } from '../../../zustand/stores/useMeetingStore';
import MeetingSessionController from './MeetingSessionController';

export const GlobalMeetingManager: React.FC = () => {
  const { userData } = useAuthStore();
  const {
    token: callToken,
    meetingId: callmeetingId,
    callState,
    setIsNativePip,
    setIsInAppPip,
  } = useMeetingStore();

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const isCalling = (callState === 'CONNECTED' || callState === 'CONNECTING') && Boolean(callmeetingId);

    if (isCalling) {
      PipHandler.setDefaultPipDimensions(9, 16);
      PipHandler.setMeetingScreenState(true);
    } else {
      PipHandler.setMeetingScreenState(false);
    }

    const handlePiPStateChange = (isEnabled: boolean) => {
      const state = useMeetingStore.getState();
      const wasNativePip = state.isNativePip;
      if (wasNativePip === isEnabled) return;

      setIsNativePip(isEnabled);

      if (!isEnabled && wasNativePip) {
        setIsInAppPip(false);
        if (navigationRef.isReady()) {
          const currentRoute = navigationRef.getCurrentRoute()?.name;
          if (currentRoute !== AppRoute.MEETING) {
            (navigationRef as any).navigate(AppRoute.MEETING);
          }
        }
      }
    };

    const pipSub = PipHandler.onPipModeChanged((isInPip: Boolean) => {
      handlePiPStateChange(Boolean(isInPip));
    });

    let backSubscription: any;
    if (isCalling) {
      backSubscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (navigationRef.isReady()) {
          const currentRouteName = navigationRef.getCurrentRoute()?.name;
          const canGoBack = navigationRef.canGoBack();

          if (currentRouteName === AppRoute.MEETING) {
            useMeetingStore.getState().setIsInAppPip(true);
            replace(AppRoute.SCHEDULE);
            return true;
          }

          if (!canGoBack) {
            try {
              PipHandler.enterPipMode(9, 16);
              return true;
            } catch {
              return true;
            }
          }
        }
        return false;
      });
    }

    return () => {
      pipSub?.remove();
      backSubscription?.remove();
      PipHandler.setMeetingScreenState(false);
    };
  }, [callState, callmeetingId, setIsNativePip, setIsInAppPip]);

  const hasActiveMeeting = Boolean(
    callToken && callmeetingId && callState !== 'ENDED' && callState !== 'IDLE'
  );

  if (!hasActiveMeeting) {
    return null;
  }

  const patientParticipantId = userData?.patient_id
    ? `patient_${userData.patient_id}`
    : userData?.id
    ? `patient_${userData.id}`
    : 'patient_guest';
  const patientDisplayName = userData?.name || 'Patient';
  const sessionKey = `${callmeetingId}_${patientParticipantId}`;

  return (
    <MeetingProvider
      key={sessionKey}
      config={{
        meetingId: callmeetingId!,
        participantId: patientParticipantId,
        micEnabled: true,
        webcamEnabled: true,
        name: patientDisplayName,
        maxResolution: 'hd',
        multiStream: true,
        codecSwitchEnabled: true,
        mode: 'SEND_AND_RECV',
        debugMode: false,
        defaultCamera: 'front',
      }}
      token={callToken!}
      reinitialiseMeetingOnConfigChange={false}
    >
      <MeetingSessionController />
    </MeetingProvider>
  );
};

export default GlobalMeetingManager;
