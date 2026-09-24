import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import PatientMeetingScreenStyles from '../../../styled/PatientMeetingScreen.styled';
import type { TCallState } from '../../../zustand/stores/useMeetingStore';
import CommonErrorCard from '../../commons/CommonErrorCard/CommonErrorCard';
import { RemoteParticipantView } from './RemoteParticipantView';

interface MeetingStageContainerProps {
  callState: TCallState;
  remoteParticipantId: string | null;
  errorMessage?: string | null;
  waitingTitle?: string;
  waitingSubtitle?: string;
  onGoBack?: () => void;
}

export const MeetingStageContainer: React.FC<MeetingStageContainerProps> = ({
  callState,
  remoteParticipantId,
  errorMessage,
  waitingTitle = 'Your doctor will join shortly.',
  waitingSubtitle = 'Please stay on this screen while you wait.',
  onGoBack,
}) => {
  if (callState === 'ERROR') {
    return (
      <View style={[PatientMeetingScreenStyles.stageContainer, { paddingHorizontal: 16 }]}>
        <CommonErrorCard
          title="Meeting Session Error"
          message={errorMessage || "'token' is empty or invalid or might have expired."}
          onRetry={onGoBack}
          retryText="Return to Appointments"
        />
        <Text
          style={[PatientMeetingScreenStyles.waitingSubtitle, { marginTop: 8, color: '#EF4444' }]}
        >
          Redirecting back in 5 seconds...
        </Text>
      </View>
    );
  }

  if (callState === 'CONNECTED' && remoteParticipantId) {
    return (
      <View style={PatientMeetingScreenStyles.stageContainerFull}>
        <RemoteParticipantView participantId={remoteParticipantId} />
      </View>
    );
  }

  return (
    <View style={PatientMeetingScreenStyles.stageContainer}>
      <ActivityIndicator size="large" color="#2DD4BF" />
      <Text style={PatientMeetingScreenStyles.waitingTitle}>{waitingTitle}</Text>
      <Text style={PatientMeetingScreenStyles.waitingSubtitle}>{waitingSubtitle}</Text>
    </View>
  );
};

export default MeetingStageContainer;
