import React, { useCallback, useEffect, useRef } from 'react';
import { BackHandler, View } from 'react-native';
import { useMeetingTimer } from '../../../hooks/commons/useMeetingTimer';
import { useVideoCallControls } from '../../../hooks/commons/useVideoCallControls';
import { SafeAreaWrapper } from '../../../Layout/SafeAreaWrapper';
import { showErrorToast, showInfoToast } from '../../../lib/common/toast.utils';
import { canGoBack, goBack, replace } from '../../../navigation/navigationRef';
import { AppRoute, type MeetingScreenProps } from '../../../route';
import PatientMeetingScreenStyles from '../../../styled/PatientMeetingScreen.styled';
import { useMeetingStore } from '../../../zustand/stores/useMeetingStore';
import { DoctorMeetingHeader } from './DoctorMeetingHeader';
import { LocalParticipantView } from './LocalParticipantView';
import { MeetingControlBar } from './MeetingControlBar';
import { MeetingStageContainer } from './MeetingStageContainer';

export const DoctorMeetingContainer: React.FC<MeetingScreenProps> = () => {
  const {
    callState,
    errorMessage,
    isMicOn,
    isCameraOn,
    facingMode,
    remoteParticipantId,
    patientName,
    appointmentId,
    appointmentGeneratedId,
    startTime,
    endTime,
    patientUserId,
    callDurationSeconds,
    isNativePip,
    setIsInAppPip,
    resetMeetingStore,
  } = useMeetingStore();

  const { elapsedText, remainingText } = useMeetingTimer(
    callState,
    startTime,
    endTime,
    callDurationSeconds
  );

  const { toggleAudio, toggleVideo, switchCamera, endCall, localParticipant } =
    useVideoCallControls(() => {
      replace('Schedule');
    });

  const handleEnterPip = useCallback(() => {
    if (callState === 'CONNECTED' || callState === 'CONNECTING') {
      setIsInAppPip(true);
      if (canGoBack()) {
        goBack();
      } else {
        replace(AppRoute.SCHEDULE);
      }
    } else {
      endCall('patient_left');
    }
  }, [callState, setIsInAppPip, endCall]);

  const handleRxPress = useCallback(() => {
    if (callState === 'CONNECTED' || callState === 'CONNECTING') {
      setIsInAppPip(true);
      replace(AppRoute.PRESCRIPTIONS_LIST);
    } else {
      showInfoToast('Please wait for the call to be connected.');
    }
  }, [callState, setIsInAppPip]);

  const handleUploadPress = useCallback(() => {
    if (callState === 'CONNECTED' || callState === 'CONNECTING') {
      setIsInAppPip(true);
      replace(AppRoute.UPLOAD_HEALTH_RECORD);
    } else {
      showInfoToast('Please wait for the call to be connected.');
    }
  }, [callState, setIsInAppPip]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleEnterPip();
      return true;
    });
    return () => backHandler.remove();
  }, [handleEnterPip]);

  useEffect(() => {
    if (callState === 'ERROR') {
      showErrorToast(errorMessage || "'token' is empty or invalid or might have expired.");
      const timer = setTimeout(() => {
        resetMeetingStore();
        replace('Schedule');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [callState, errorMessage, resetMeetingStore]);

  // If in Native Android PiP mode, show full-screen pure video stream
  if (isNativePip) {
    return (
      <View style={PatientMeetingScreenStyles.container}>
        <MeetingStageContainer
          callState={callState}
          remoteParticipantId={remoteParticipantId}
          errorMessage={errorMessage}
          onGoBack={handleEnterPip}
        />
      </View>
    );
  }

  return (
    <SafeAreaWrapper>
      <View style={PatientMeetingScreenStyles.container}>
        <MeetingStageContainer
          callState={callState}
          remoteParticipantId={remoteParticipantId}
          errorMessage={errorMessage}
          onGoBack={handleEnterPip}
        />
        <DoctorMeetingHeader
          callState={callState}
          patientName={patientName ?? undefined}
          appointmentId={appointmentGeneratedId ?? undefined}
          elapsedText={elapsedText}
          remainingText={remainingText}
        />
        <LocalParticipantView
          participantId={localParticipant?.id}
          isCameraOn={isCameraOn}
          isMicOn={isMicOn}
          facingMode={facingMode}
        />
        <MeetingControlBar
          isMicOn={isMicOn}
          isCameraOn={isCameraOn}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onSwitchCamera={switchCamera}
          onEndCall={() => endCall('patient_left')}
          onPipPress={handleEnterPip}
          onRxPress={handleRxPress}
          onUploadPress={handleUploadPress}
        />
      </View>
    </SafeAreaWrapper>
  );
};

export default DoctorMeetingContainer;
