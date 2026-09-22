import React, { useCallback, useEffect } from 'react';
import { DeviceEventEmitter, Platform, StyleSheet, View } from 'react-native';
import { useDevicePermissions } from '../../../hooks/commons/useDevicePermissions';
import { useMeetingHeartbeat } from '../../../hooks/commons/useMeetingHeartbeat';
import { useVideoCallControls } from '../../../hooks/commons/useVideoCallControls';
import { showErrorToast } from '../../../lib/common/toast.utils';
import { navigationRef, replace } from '../../../navigation/navigationRef';
import { AppRoute } from '../../../route';
import { useMeetingStore } from '../../../zustand/stores/useMeetingStore';
import { DoctorMeetingContainer } from './DoctorMeetingContainer';
import { InAppPipOverlay } from './InAppPipOverlay';
import { MeetingStageContainer } from './MeetingStageContainer';

const MeetingSessionController: React.FC = () => {
  const {
    isInAppPip,
    setIsInAppPip,
    isNativePip,
    callState,
    remoteParticipantId,
    errorMessage,
    resetMeetingStore,
  } = useMeetingStore();

  const { joinCall, endCall } = useVideoCallControls(() => {
    if (navigationRef.isReady()) {
      replace('Schedule');
    }
  });

  const { requestAudioVideoPermissions } = useDevicePermissions();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const granted = await requestAudioVideoPermissions();
      if (!granted) {
        showErrorToast('Camera and Microphone permissions are required for the consultation.');
        resetMeetingStore();
        if (navigationRef.isReady()) {
          replace('Schedule');
        }
        return;
      }
      if (isMounted) {
        joinCall();
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [joinCall, requestAudioVideoPermissions, resetMeetingStore]);

  const handleExpandFromPip = useCallback(() => {
    setIsInAppPip(false);
    if (navigationRef.isReady()) {
      (navigationRef as any).navigate(AppRoute.MEETING);
    }
  }, [setIsInAppPip]);

  const handleEndCall = useCallback(() => {
    endCall('patient_left');
  }, [endCall]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = DeviceEventEmitter.addListener('onPiPClosed', () => {
      endCall('patient_left');
    });

    return () => {
      subscription.remove();
    };
  }, [endCall]);

  useMeetingHeartbeat(handleEndCall);

  if (isNativePip) {
    return (
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#000000', zIndex: 999999 }]}>
        <MeetingStageContainer
          callState={callState}
          remoteParticipantId={remoteParticipantId}
          errorMessage={errorMessage}
          onGoBack={handleEndCall}
        />
      </View>
    );
  }

  if (isInAppPip) {
    return <InAppPipOverlay onExpand={handleExpandFromPip} onEndCall={handleEndCall} />;
  }

  return (
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#000000', zIndex: 9999 }]}>
      <DoctorMeetingContainer navigation={navigationRef as any} />
    </View>
  );
};

export default MeetingSessionController;
