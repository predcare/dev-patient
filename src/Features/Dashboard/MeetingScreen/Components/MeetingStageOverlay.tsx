import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
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
    <View style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 9999, backgroundColor: '#0F172A' }]}>
      <SafeAreaWrapper style={meetingStyles.container} backgroundColor="#0F172A">
        <StatusBar barStyle="light-content" />
        <View style={meetingStyles.videoContainer}>
          {/* Full-screen Remote Doctor Stage */}
          <DoctorStageView />

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

export default MeetingStageOverlay;
