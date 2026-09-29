import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import PatientMeetingScreenStyles from '../../../styled/PatientMeetingScreen.styled';
import { FlipCameraIcon, PipIcon, UploadIcon } from '../../ui/icons';
import CameraOffIcon from '../../ui/icons/CameraOffIcon';
import CameraOnIcon from '../../ui/icons/CameraOnIcon';
import EndPhoneIcon from '../../ui/icons/EndPhoneIcon';
import MicOffIcon from '../../ui/icons/MicOffIcon';
import MicOnIcon from '../../ui/icons/MicOnIcon';
import RxIcon from '../../ui/icons/RxIcon';

interface MeetingControlBarProps {
  isMicOn: boolean;
  isCameraOn: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onSwitchCamera: () => void;
  onEndCall: () => void;
  onRxPress?: () => void;
  onUploadPress?: () => void;
  onPipPress?: () => void;
  inPipMode?: boolean;
}

export const MeetingControlBar: React.FC<MeetingControlBarProps> = ({
  isMicOn,
  isCameraOn,
  onToggleAudio,
  onToggleVideo,
  onSwitchCamera,
  onEndCall,
  onRxPress,
  onUploadPress,
  onPipPress,
  inPipMode = false,
}) => {
  if (inPipMode) {
    return (
      <View style={PatientMeetingScreenStyles.controlBarContainerPip}>
        <View style={PatientMeetingScreenStyles.controlRowPip}>
          <TouchableOpacity
            style={PatientMeetingScreenStyles.controlBtnPip}
            activeOpacity={0.8}
            onPress={onToggleAudio}
          >
            {isMicOn ? (
              <MicOnIcon size={14} color="#2DD4BF" />
            ) : (
              <MicOffIcon size={14} color="#EF4444" />
            )}
            <Text style={PatientMeetingScreenStyles.controlBtnTxtPip}>
              {isMicOn ? 'MUTE' : 'ON'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={PatientMeetingScreenStyles.controlBtnPip}
            activeOpacity={0.8}
            onPress={onToggleVideo}
          >
            {isCameraOn ? (
              <CameraOffIcon size={14} color="#EF4444" />
            ) : (
              <CameraOnIcon size={14} color="#2DD4BF" />
            )}
            <Text style={PatientMeetingScreenStyles.controlBtnTxtPip}>
              {isCameraOn ? 'OFF' : 'ON'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              PatientMeetingScreenStyles.controlBtnPip,
              PatientMeetingScreenStyles.controlBtnEndPip,
            ]}
            activeOpacity={0.8}
            onPress={onEndCall}
          >
            <EndPhoneIcon size={14} color="#FFFFFF" />
            <Text style={PatientMeetingScreenStyles.controlBtnTxtPip}>END</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={PatientMeetingScreenStyles.controlBarContainer}>
      <View
        style={[
          PatientMeetingScreenStyles.controlRow,
          PatientMeetingScreenStyles.controlRowSpacing,
        ]}
      >
        <TouchableOpacity
          style={PatientMeetingScreenStyles.controlBtn}
          activeOpacity={0.8}
          onPress={onToggleAudio}
        >
          {isMicOn ? (
            <MicOnIcon size={22} color="#2DD4BF" />
          ) : (
            <MicOffIcon size={22} color="#EF4444" />
          )}
          <Text style={PatientMeetingScreenStyles.controlBtnTxt}>
            {isMicOn ? 'MUTE' : 'UNMUTE'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={PatientMeetingScreenStyles.controlBtn}
          activeOpacity={0.8}
          onPress={onToggleVideo}
        >
          {isCameraOn ? (
            <CameraOffIcon size={22} color="#EF4444" />
          ) : (
            <CameraOnIcon size={22} color="#2DD4BF" />
          )}
          <Text style={PatientMeetingScreenStyles.controlBtnTxt}>
            {isCameraOn ? 'CAM OFF' : 'CAM ON'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={PatientMeetingScreenStyles.controlBtn}
          activeOpacity={0.8}
          onPress={onSwitchCamera}
        >
          <FlipCameraIcon size={22} color="#94A3B8" />
          <Text
            style={[
              PatientMeetingScreenStyles.controlBtnTxt,
              PatientMeetingScreenStyles.controlBtnTxtMuted,
            ]}
          >
            FLIP
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={PatientMeetingScreenStyles.controlBtn}
          activeOpacity={0.8}
          onPress={onPipPress}
        >
          <PipIcon size={22} color="#94A3B8" />
          <Text style={PatientMeetingScreenStyles.controlBtnTxt}>PIP</Text>
        </TouchableOpacity>
      </View>
      <View style={PatientMeetingScreenStyles.controlRow}>
        <TouchableOpacity
          style={PatientMeetingScreenStyles.controlBtn}
          activeOpacity={0.8}
          onPress={onRxPress}
        >
          <RxIcon size={22} color="#94A3B8" />
          <Text style={PatientMeetingScreenStyles.controlBtnTxt}>RX</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={PatientMeetingScreenStyles.controlBtn}
          activeOpacity={0.8}
          onPress={onUploadPress}
        >
          <UploadIcon size={22} color="#94A3B8" />
          <Text style={PatientMeetingScreenStyles.controlBtnTxt}>UPLOAD</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[PatientMeetingScreenStyles.controlBtn, PatientMeetingScreenStyles.controlBtnEnd]}
          activeOpacity={0.8}
          onPress={onEndCall}
        >
          <EndPhoneIcon size={22} color="#EF4444" />
          <Text
            style={[
              PatientMeetingScreenStyles.controlBtnTxt,
              PatientMeetingScreenStyles.controlBtnTxtEnd,
            ]}
          >
            END
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MeetingControlBar;
