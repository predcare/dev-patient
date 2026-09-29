import React, { useCallback, useEffect } from 'react';
import { BackHandler, Platform, View } from 'react-native';
import { useMeetingTimer } from '../../../hooks/commons/useMeetingTimer';
import { useVideoCallControls } from '../../../hooks/commons/useVideoCallControls';
import { SafeAreaWrapper } from '../../../Layout/SafeAreaWrapper';
import { showErrorToast, showInfoToast } from '../../../lib/common/toast.utils';
import { replace } from '../../../navigation/navigationRef';
import { AppRoute, type MeetingScreenProps } from '../../../route';
import PatientMeetingScreenStyles from '../../../styled/PatientMeetingScreen.styled';
import { useMeetingStore } from '../../../zustand/stores/useMeetingStore';
import { DoctorMeetingHeader } from './DoctorMeetingHeader';
import { LocalParticipantView } from './LocalParticipantView';
import { MeetingControlBar } from './MeetingControlBar';
import { MeetingStageContainer } from './MeetingStageContainer';

interface DoctorMeetingContainerProps extends Partial<MeetingScreenProps> {
  inPipMode?: boolean;
}

export const DoctorMeetingContainer: React.FC<DoctorMeetingContainerProps> = ({
  inPipMode = false,
}) => {
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

  const isPipActive = inPipMode || isNativePip;

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

  const handleInAppPip = useCallback(() => {
    if (callState === 'CONNECTED' || callState === 'CONNECTING') {
      setIsInAppPip(true);
      replace(AppRoute.SCHEDULE);
    } else {
      endCall('patient_left');
      replace(AppRoute.SCHEDULE);
    }
  }, [callState, setIsInAppPip, endCall]);

  const handleNativePipPress = useCallback(() => {
    if (callState === 'CONNECTED' || callState === 'CONNECTING') {
      if (Platform.OS === 'android') {
        handleInAppPip();
      } else {
        handleInAppPip();
      }
    } else {
      endCall('patient_left');
    }
  }, [callState, handleInAppPip, endCall]);

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
      handleInAppPip();
      return true;
    });
    return () => backHandler.remove();
  }, [handleInAppPip]);

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

  // When rendering inside Native PiP floating window, show ONLY dual videos (Doctor + Self camera)
  if (isPipActive) {
    return (
      <View style={[PatientMeetingScreenStyles.container, { backgroundColor: '#000000' }]}>
        <MeetingStageContainer
          callState={callState}
          remoteParticipantId={remoteParticipantId}
          errorMessage={errorMessage}
          onGoBack={() => endCall('patient_left')}
        />
        <LocalParticipantView
          participantId={localParticipant?.id}
          isCameraOn={isCameraOn}
          isMicOn={isMicOn}
          facingMode={facingMode}
          inPipMode={true}
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
          onGoBack={handleInAppPip}
        />
        <DoctorMeetingHeader
          callState={callState}
          patientName={patientName ?? undefined}
          appointmentId={appointmentGeneratedId ?? undefined}
          elapsedText={elapsedText}
          remainingText={remainingText}
          inPipMode={false}
        />
        <LocalParticipantView
          participantId={localParticipant?.id}
          isCameraOn={isCameraOn}
          isMicOn={isMicOn}
          facingMode={facingMode}
          inPipMode={false}
        />
        <MeetingControlBar
          isMicOn={isMicOn}
          isCameraOn={isCameraOn}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onSwitchCamera={switchCamera}
          onEndCall={() => endCall('patient_left')}
          onPipPress={handleNativePipPress}
          onRxPress={handleRxPress}
          onUploadPress={handleUploadPress}
          inPipMode={false}
        />
      </View>
    </SafeAreaWrapper>
  );
};

export default DoctorMeetingContainer;
