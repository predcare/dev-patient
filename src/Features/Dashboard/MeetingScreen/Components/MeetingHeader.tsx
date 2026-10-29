import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ChevronLeftIcon } from '../../../../components/ui/icons';
import useMeetingPip from '../../../../hooks/commons/meeting/useMeetingPip';
import { navigate } from '../../../../navigation/navigationRef';
import { AppRoute } from '../../../../route';
import meetingStyles from '../../../../styled/MeetingScreen.styled';
import theme from '../../../../styled/theme.styled';
import useMeetingStore from '../../../../zustand/stores/useMeetingStore';
import MeetingSignalBadge from './MeetingSignalBadge';
import MeetingTimerBadge from './MeetingTimerBadge';

export const MeetingHeader: React.FC = () => {
  const doctorInfo = useMeetingStore(state => state.doctorInfo);
  const callState = useMeetingStore(state => state.callState);
  const { enterInAppPip } = useMeetingPip();

  const doctorName = doctorInfo?.name || 'Doctor';
  const isConnected = callState === 'CONNECTED';
  const isReconnecting = callState === 'RECONNECTING' || callState === 'DISCONNECTED';

  const handleMinimize = () => {
    enterInAppPip();
    navigate(AppRoute.SCHEDULE);
  };

  return (
    <View style={meetingStyles.headerBar}>
      <TouchableOpacity
        style={meetingStyles.minimizeBtn}
        activeOpacity={0.8}
        onPress={handleMinimize}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <ChevronLeftIcon size={24} color={theme.colors.surface} />
      </TouchableOpacity>

      <View style={meetingStyles.doctorInfoCol}>
        <Text style={meetingStyles.doctorName}>{doctorName}</Text>
        <Text style={[meetingStyles.statusText, isConnected && { color: theme.colors.green }]}>
          {isReconnecting ? 'RECONNECTING…' : isConnected ? 'CONNECTED' : 'WAITING FOR DOCTOR...'}
        </Text>
      </View>

      <View style={meetingStyles.timersCol}>
        <MeetingTimerBadge />
        <MeetingSignalBadge />
      </View>
    </View>
  );
};

export default memo(MeetingHeader);
