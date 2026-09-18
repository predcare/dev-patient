import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import {
  CamOffIcon,
  CamOnIcon,
  EndCallIcon,
  FlipCameraIcon,
  MeetingRxIcon,
  MuteIcon,
  PipIcon,
  UploadIcon,
} from '../../components/ui/icons';
import { meetingStyles } from '../../styled/MeetingScreen.styled';
import { theme } from '../../styled/theme.styled';

export const MeetingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const appointment = route.params?.appointment || {
    id: 1001,
    doctor_name: 'Dr. Sahil Mallick',
    specialization: 'Anesthesiology',
  };

  const [isMuted, setIsMuted] = useState(false);
  const [isCamOn, setIsCamOn] = useState(true);

  const docName = appointment.doctor_name?.startsWith('Dr.')
    ? appointment.doctor_name
    : `Dr. ${appointment.doctor_name || 'Sahil Mallick'}`;

  const handleEndCall = () => {
    navigation.navigate('ConsultationCompleted', {
      appointmentId: appointment.id,
      doctorName: docName,
      doctorSpecialization: appointment.specialization || 'Anesthesiology',
      patientName: 'Patient',
      appointmentDate: '2026-08-26',
      durationSeconds: 1800,
      durationLabel: '30m 00s',
      consultationType: 'Video',
    });
  };

  return (
    <SafeAreaWrapper
      style={meetingStyles.container}
      backgroundColor="#0F172A"
      barStyle="light-content"
    >

      {/* Video Stream Container */}
      <View style={meetingStyles.videoContainer}>
        {/* Dark Video Stream Placeholder */}
        <View style={meetingStyles.videoPlaceholder}>
          <View style={meetingStyles.doctorAvatarCircle}>
            <Text style={meetingStyles.doctorAvatarTxt}>
              {docName.replace('Dr. ', '')[0] || 'S'}
            </Text>
          </View>
        </View>

        {/* Top Header Bar */}
        <View style={meetingStyles.headerBar}>
          {/* Doctor Name & Waiting Status */}
          <View style={meetingStyles.doctorInfoCol}>
            <Text style={meetingStyles.doctorName}>{docName}</Text>
            <Text style={meetingStyles.statusText}>WAITING FOR DOCTOR...</Text>
          </View>

          {/* Top Right Timer Column */}
          <View style={meetingStyles.timersCol}>
            {/* LIVE Badge */}
            <View style={meetingStyles.liveBadgeRow}>
              <View style={meetingStyles.liveDot} />
              <Text style={meetingStyles.liveTxt}>LIVE</Text>
              <Text style={meetingStyles.timerValue}>0:00</Text>
            </View>

            {/* LEFT Badge */}
            <View style={meetingStyles.leftBadgeRow}>
              <Text style={meetingStyles.leftLbl}>LEFT</Text>
              <Text style={meetingStyles.leftValue}>30:00</Text>
            </View>
          </View>
        </View>

        {/* Top Right Floating PiP Preview */}
        <View style={meetingStyles.pipContainer}>
          <View style={meetingStyles.pipVideoMock}>
            <Text style={{ color: theme.colors.surface, fontSize: 16, fontWeight: '700' }}>
              👤
            </Text>
          </View>
        </View>

        {/* Bottom HUD Control Panel */}
        <View style={meetingStyles.bottomHud}>
          {/* Row 1: MUTE, CAM ON, FLIP */}
          <View style={meetingStyles.controlsRow1}>
            {/* MUTE */}
            <TouchableOpacity
              style={meetingStyles.btnCol3}
              activeOpacity={0.8}
              onPress={() => setIsMuted(!isMuted)}
            >
              <View style={meetingStyles.ctrlBtnLg}>
                <MuteIcon size={22} color={theme.colors.surface} />
                <Text style={meetingStyles.ctrlLabel}>{isMuted ? 'UNMUTE' : 'MUTE'}</Text>
              </View>
            </TouchableOpacity>

            {/* CAM ON */}
            <TouchableOpacity
              style={meetingStyles.btnCol3}
              activeOpacity={0.8}
              onPress={() => setIsCamOn(!isCamOn)}
            >
              <View
                style={[
                  meetingStyles.ctrlBtnLg,
                  isCamOn && meetingStyles.ctrlBtnLgActiveTeal,
                ]}
              >
                {isCamOn ? (
                  <CamOnIcon size={22} color={theme.colors.surface} />
                ) : (
                  <CamOffIcon size={22} color={theme.colors.surface} />
                )}
                <Text style={meetingStyles.ctrlLabel}>{isCamOn ? 'CAM ON' : 'CAM OFF'}</Text>
              </View>
            </TouchableOpacity>

            {/* FLIP */}
            <TouchableOpacity style={meetingStyles.btnCol3} activeOpacity={0.8}>
              <View style={meetingStyles.ctrlBtnLg}>
                <FlipCameraIcon size={22} color={theme.colors.surface} />
                <Text style={meetingStyles.ctrlLabel}>FLIP</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Row 2: RX, UPLOAD, PIP, END */}
          <View style={meetingStyles.controlsRow2}>
            {/* RX */}
            <TouchableOpacity style={meetingStyles.btnCol4} activeOpacity={0.8}>
              <View style={meetingStyles.ctrlBtnSm}>
                <MeetingRxIcon size={20} color={theme.colors.surface} />
                <Text style={meetingStyles.ctrlLabel}>RX</Text>
              </View>
            </TouchableOpacity>

            {/* UPLOAD */}
            <TouchableOpacity style={meetingStyles.btnCol4} activeOpacity={0.8}>
              <View style={meetingStyles.ctrlBtnSm}>
                <UploadIcon size={20} color={theme.colors.surface} />
                <Text style={meetingStyles.ctrlLabel}>UPLOAD</Text>
              </View>
            </TouchableOpacity>

            {/* PIP */}
            <TouchableOpacity style={meetingStyles.btnCol4} activeOpacity={0.8}>
              <View style={meetingStyles.ctrlBtnSm}>
                <PipIcon size={20} color={theme.colors.surface} />
                <Text style={meetingStyles.ctrlLabel}>PIP</Text>
              </View>
            </TouchableOpacity>

            {/* END */}
            <TouchableOpacity
              style={meetingStyles.btnCol4}
              activeOpacity={0.85}
              onPress={handleEndCall}
            >
              <View style={[meetingStyles.ctrlBtnSm, meetingStyles.ctrlBtnSmActiveRed]}>
                <EndCallIcon size={20} color={theme.colors.surface} />
                <Text style={meetingStyles.ctrlLabel}>END</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaWrapper>
  );
};

export default MeetingScreen;
