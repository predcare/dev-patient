import React from 'react';
import { Text, View } from 'react-native';
import PatientMeetingScreenStyles from '../../../styled/PatientMeetingScreen.styled';
import type { TCallState } from '../../../zustand/stores/useMeetingStore';

interface DoctorMeetingHeaderProps {
  callState: TCallState;
  patientName?: string;
  appointmentId?: string;
  elapsedText?: string;
  remainingText?: string;
  inPipMode?: boolean;
}

export const DoctorMeetingHeader: React.FC<DoctorMeetingHeaderProps> = React.memo(
  ({
    callState,
    patientName = 'Doctor',
    appointmentId,
    elapsedText = '0:00',
    remainingText = '--:--',
    inPipMode = false,
  }) => {
    const isConnected = callState === 'CONNECTED';

    if (inPipMode) {
      return (
        <View style={PatientMeetingScreenStyles.headerBarPip}>
          <Text style={PatientMeetingScreenStyles.doctorNamePip} numberOfLines={1}>
            {patientName}
          </Text>
          <View style={PatientMeetingScreenStyles.headerTopRightRow}>
            <View style={PatientMeetingScreenStyles.connectingPillPip}>
              <View style={PatientMeetingScreenStyles.connectingDotPip} />
              <Text style={PatientMeetingScreenStyles.connectingTextPip}>
                {isConnected ? 'LIVE' : 'CONN...'}
              </Text>
            </View>
            <Text style={PatientMeetingScreenStyles.timerTextPip}>{remainingText}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={PatientMeetingScreenStyles.headerBar}>
        <View style={PatientMeetingScreenStyles.headerLeft}>
          <Text style={PatientMeetingScreenStyles.doctorName} numberOfLines={1}>
            {patientName}
          </Text>
          <Text style={PatientMeetingScreenStyles.doctorStatus}>
            {appointmentId
              ? `${appointmentId} · ${isConnected ? '' : 'CONNECTING TO DOCTOR...'}`
              : isConnected
              ? ''
              : 'CONNECTING TO DOCTOR...'}
          </Text>
        </View>

        <View style={PatientMeetingScreenStyles.headerRight}>
          <View style={PatientMeetingScreenStyles.headerTopRightRow}>
            <View style={PatientMeetingScreenStyles.connectingPill}>
              <View style={PatientMeetingScreenStyles.connectingDot} />
              <Text style={PatientMeetingScreenStyles.connectingText}>
                {isConnected ? 'CONNECTED' : 'CONNECTING...'}
              </Text>
            </View>
            <Text style={PatientMeetingScreenStyles.timerText}>{remainingText}</Text>
          </View>
        </View>
      </View>
    );
  }
);

export default DoctorMeetingHeader;
