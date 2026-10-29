import React, { memo } from 'react';
import { StatusBar, View } from 'react-native';
import SafeAreaWrapper from '../../../../Layout/SafeAreaWrapper';
import useMeetingConnection from '../../../../hooks/commons/meeting/useMeetingConnection';
import meetingStyles from '../../../../styled/MeetingScreen.styled';
import DoctorStageView from './DoctorStageView';
import LocalPipCard from './LocalPipCard';
import MeetingController from './MeetingController';
import MeetingHeader from './MeetingHeader';

export const MeetingStageOverlay: React.FC = () => {
  const { endCall } = useMeetingConnection();

  return (
    <View style={meetingStyles.stageOverlay}>
      <StatusBar barStyle="light-content" />

      {/* Full-screen remote doctor video, edge to edge behind the system bars */}
      <View style={meetingStyles.fullScreenStage}>
        <DoctorStageView />
      </View>

      <SafeAreaWrapper style={meetingStyles.stageContent} backgroundColor="transparent">
        <View style={meetingStyles.stageControls} pointerEvents="box-none">
          {/* Top Header with Doctor Info & Real-Time Countdown */}
          <MeetingHeader />

          {/* Corner Local Self-Camera Box */}
          <LocalPipCard />

          {/* Bottom HUD Controls */}
          <MeetingController handleEndCall={endCall} />
        </View>
      </SafeAreaWrapper>
    </View>
  );
};

export default memo(MeetingStageOverlay);
