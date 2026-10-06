import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import {
  CamOffIcon,
  CamOnIcon,
  EndCallIcon,
  FlipCameraIcon,
  MeetingRxIcon,
  MuteIcon,
  PipIcon,
  UploadIcon,
} from '../../../../components/ui/icons';
import useMeetingCamera from '../../../../hooks/commons/meeting/useMeetingCamera';
import useMeetingPip from '../../../../hooks/commons/meeting/useMeetingPip';
import { navigate } from '../../../../navigation/navigationRef';
import { AppRoute } from '../../../../route';
import meetingStyles from '../../../../styled/MeetingScreen.styled';
import theme from '../../../../styled/theme.styled';

interface IMeetingControllerProps {
  handleEndCall: () => void;
}

export const MeetingController: React.FC<IMeetingControllerProps> = ({ handleEndCall }) => {
  const { isMuted, isCamOn, toggleMic, toggleCamera, flipCamera } = useMeetingCamera();
  const { enterInAppPip } = useMeetingPip();

  const handleRxPress = () => {
    enterInAppPip();
    navigate(AppRoute.PRESCRIPTIONS_LIST as never);
  };

  const handleUploadPress = () => {
    enterInAppPip();
    navigate(AppRoute.UPLOAD_HEALTH_RECORD as never);
  };

  const handlePipPress = async () => {
    enterInAppPip();
    navigate(AppRoute.SCHEDULE as never);
  };

  return (
    <View style={meetingStyles.bottomHud}>
      <View style={meetingStyles.controlsRow1}>
        <TouchableOpacity
          style={meetingStyles.btnCol3}
          activeOpacity={0.8}
          onPress={toggleMic}
        >
          <View style={[meetingStyles.ctrlBtnLg, isMuted && { backgroundColor: theme.colors.red }]}>
            <MuteIcon size={22} color={theme.colors.surface} />
            <Text style={meetingStyles.ctrlLabel}>{isMuted ? 'UNMUTE' : 'MUTE'}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={meetingStyles.btnCol3}
          activeOpacity={0.8}
          onPress={toggleCamera}
        >
          <View style={[meetingStyles.ctrlBtnLg, isCamOn && meetingStyles.ctrlBtnLgActiveTeal]}>
            {isCamOn ? (
              <CamOnIcon size={22} color={theme.colors.surface} />
            ) : (
              <CamOffIcon size={22} color={theme.colors.surface} />
            )}
            <Text style={meetingStyles.ctrlLabel}>{isCamOn ? 'CAM ON' : 'CAM OFF'}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={meetingStyles.btnCol3}
          activeOpacity={0.8}
          onPress={flipCamera}
        >
          <View style={meetingStyles.ctrlBtnLg}>
            <FlipCameraIcon size={22} color={theme.colors.surface} />
            <Text style={meetingStyles.ctrlLabel}>FLIP</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={meetingStyles.controlsRow2}>
        <TouchableOpacity
          style={meetingStyles.btnCol4}
          activeOpacity={0.8}
          onPress={handleRxPress}
        >
          <View style={meetingStyles.ctrlBtnSm}>
            <MeetingRxIcon size={20} color={theme.colors.surface} />
            <Text style={meetingStyles.ctrlLabel}>RX</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={meetingStyles.btnCol4}
          activeOpacity={0.8}
          onPress={handleUploadPress}
        >
          <View style={meetingStyles.ctrlBtnSm}>
            <UploadIcon size={20} color={theme.colors.surface} />
            <Text style={meetingStyles.ctrlLabel}>UPLOAD</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={meetingStyles.btnCol4}
          activeOpacity={0.8}
          onPress={handlePipPress}
        >
          <View style={meetingStyles.ctrlBtnSm}>
            <PipIcon size={20} color={theme.colors.surface} />
            <Text style={meetingStyles.ctrlLabel}>PIP</Text>
          </View>
        </TouchableOpacity>

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
  );
};

export default MeetingController;
