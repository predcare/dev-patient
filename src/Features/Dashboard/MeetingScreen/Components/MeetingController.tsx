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
import meetingStyles from '../../../../styled/MeetingScreen.styled';
import theme from '../../../../styled/theme.styled';

interface IMeetingController {
    isMuted: boolean;
    isCamOn: boolean;
    handleEndCall: () => void;
    setIsMuted: (isMuted: boolean) => void;
    setIsCamOn: (isCamOn: boolean) => void;
}

const MeetingController = ({
    isMuted,
    isCamOn,
    setIsMuted,
    setIsCamOn,
    handleEndCall,
}: IMeetingController) => {
    return (
        <View style={meetingStyles.bottomHud}>
            <View style={meetingStyles.controlsRow1}>
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
                <TouchableOpacity
                    style={meetingStyles.btnCol3}
                    activeOpacity={0.8}
                    onPress={() => setIsCamOn(!isCamOn)}
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
                <TouchableOpacity style={meetingStyles.btnCol3} activeOpacity={0.8}>
                    <View style={meetingStyles.ctrlBtnLg}>
                        <FlipCameraIcon size={22} color={theme.colors.surface} />
                        <Text style={meetingStyles.ctrlLabel}>FLIP</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={meetingStyles.controlsRow2}>
                <TouchableOpacity style={meetingStyles.btnCol4} activeOpacity={0.8}>
                    <View style={meetingStyles.ctrlBtnSm}>
                        <MeetingRxIcon size={20} color={theme.colors.surface} />
                        <Text style={meetingStyles.ctrlLabel}>RX</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={meetingStyles.btnCol4} activeOpacity={0.8}>
                    <View style={meetingStyles.ctrlBtnSm}>
                        <UploadIcon size={20} color={theme.colors.surface} />
                        <Text style={meetingStyles.ctrlLabel}>UPLOAD</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={meetingStyles.btnCol4} activeOpacity={0.8}>
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
