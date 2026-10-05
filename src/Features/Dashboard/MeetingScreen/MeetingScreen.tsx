import React, { useState } from 'react';
import { Text, View } from 'react-native';
import SafeAreaWrapper from '../../../Layout/SafeAreaWrapper';
import { resetRoot } from '../../../navigation/navigationRef';
import { AppRoute } from '../../../route';
import meetingStyles from '../../../styled/MeetingScreen.styled';
import theme from '../../../styled/theme.styled';
import MeetingController from './Components/MeetingController';

export const MeetingScreen: React.FC = () => {
    const [isMuted, setIsMuted] = useState(false);
    const [isCamOn, setIsCamOn] = useState(true);

    const handleEndCall = () => {
        resetRoot(AppRoute.CONSULTATION_COMPLETED);
    };

    return (
        <SafeAreaWrapper style={meetingStyles.container}>
            <View style={meetingStyles.videoContainer}>
                <View style={meetingStyles.videoPlaceholder}>
                    <View style={meetingStyles.doctorAvatarCircle}>
                        <Text style={meetingStyles.doctorAvatarTxt}>S</Text>
                    </View>
                </View>

                <View style={meetingStyles.headerBar}>
                    <View style={meetingStyles.doctorInfoCol}>
                        <Text style={meetingStyles.doctorName}>Sahil Mallick</Text>
                        <Text style={meetingStyles.statusText}>WAITING FOR DOCTOR...</Text>
                    </View>

                    <View style={meetingStyles.timersCol}>
                        <View style={meetingStyles.leftBadgeRow}>
                            <Text style={meetingStyles.leftLbl}>LEFT</Text>
                            <Text style={meetingStyles.leftValue}>30:00</Text>
                        </View>
                    </View>
                </View>
                <View style={meetingStyles.localContainer}>
                    <View style={meetingStyles.localVideoMock}>
                        <Text style={{ color: theme.colors.surface, fontSize: 16, fontWeight: '700' }}>👤</Text>
                    </View>
                </View>

                <MeetingController
                    isMuted={isMuted}
                    isCamOn={isCamOn}
                    handleEndCall={handleEndCall}
                    setIsMuted={setIsMuted}
                    setIsCamOn={setIsCamOn}
                />
            </View>
        </SafeAreaWrapper>
    );
};

export default MeetingScreen;
