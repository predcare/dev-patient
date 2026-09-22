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
}

export const DoctorMeetingHeader: React.FC<DoctorMeetingHeaderProps> = React.memo(
  ({
    callState,
    patientName = 'Doctor',
    appointmentId,
    elapsedText = '0:00',
    remainingText = '--:--',
  }) => {
    const isConnected = callState === 'CONNECTED';
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
            <Text style={PatientMeetingScreenStyles.timerText}>{elapsedText}</Text>
          </View>
          <View style={PatientMeetingScreenStyles.headerBottomRightRow}>
            <View style={PatientMeetingScreenStyles.leftPill}>
              <Text style={PatientMeetingScreenStyles.leftPillText}>LEFT</Text>
            </View>
            <Text style={PatientMeetingScreenStyles.leftTimeText}>{remainingText}</Text>
          </View>
        </View>
      </View>
    );
  }
);

export default DoctorMeetingHeader;
