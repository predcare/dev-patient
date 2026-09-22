import { MeetingProvider } from '@videosdk.live/react-native-sdk';
import React, { useEffect } from 'react';
import { BackHandler, DeviceEventEmitter, NativeModules, Platform } from 'react-native';
import { navigationRef, replace } from '../../../navigation/navigationRef';
import { AppRoute } from '../../../route';
import { useAuthStore } from '../../../zustand/stores/useAuthStore';
import { useMeetingStore } from '../../../zustand/stores/useMeetingStore';
import MeetingSessionController from './MeetingSessionController';

const { PiPModule } = NativeModules;

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
    if (Platform.OS !== 'android' || !PiPModule) return;

    const isCalling = (callState === 'CONNECTED' || callState === 'CONNECTING') && !!callmeetingId;
    if (PiPModule.setCallActive) {
      PiPModule.setCallActive(isCalling).catch?.(() => {});
    }

    const subscription = DeviceEventEmitter.addListener('onPiPModeChanged', (isInPip: boolean) => {
      setIsNativePip(isInPip);
      if (!isInPip) {
        // Restoring from OS Native Android PiP -> navigate directly to full-screen Meeting screen
        setIsInAppPip(false);
        if (navigationRef.isReady()) {
          (navigationRef as any).navigate(AppRoute.MEETING);
        }
      }
    });

    let backSubscription: any;
    if (isCalling) {
      backSubscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (navigationRef.isReady()) {
          const currentRouteName = navigationRef.getCurrentRoute()?.name;
          const canGoBack = navigationRef.canGoBack();

          if (currentRouteName === AppRoute.MEETING) {
            if (canGoBack) {
              // Standard back navigation will fire MeetingScreen's beforeRemove, enabling In-App PiP
              return false;
            } else {
              // Fallback if Meeting is root: navigate to Schedule in app with In-App PiP
              useMeetingStore.getState().setIsInAppPip(true);
              replace(AppRoute.SCHEDULE);
              return true;
            }
          }

          if (!canGoBack) {
            // Root screen reached while call is active -> enter Native OS PiP mode
            if (PiPModule.enterPiP) {
              PiPModule.enterPiP().catch?.(() => {});
              return true;
            }
          }
        }
        return false;
      });
    }

    return () => {
      subscription.remove();
      backSubscription?.remove();
      if (PiPModule.setCallActive) {
        PiPModule.setCallActive(false).catch?.(() => {});
      }
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
