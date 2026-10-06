import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ChevronLeftIcon } from '../../../../components/ui/icons';
import useMeetingCountdown from '../../../../hooks/commons/meeting/useMeetingCountdown';
import useMeetingPip from '../../../../hooks/commons/meeting/useMeetingPip';
import { canGoBack, goBack } from '../../../../navigation/navigationRef';
import meetingStyles from '../../../../styled/MeetingScreen.styled';
import theme from '../../../../styled/theme.styled';
import useMeetingStore from '../../../../zustand/stores/useMeetingStore';

export const MeetingHeader: React.FC = () => {
  const doctorInfo = useMeetingStore(state => state.doctorInfo);
  const callState = useMeetingStore(state => state.callState);
  const { enterInAppPip } = useMeetingPip();
  const { formattedTime, isWarning, isUrgent } = useMeetingCountdown();

  const doctorName = doctorInfo?.name || 'Dr. Sahil Mallick';
  const isConnected = callState === 'CONNECTED';

  const handleMinimize = () => {
    enterInAppPip();
    if (canGoBack()) {
      goBack();
    }
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
          {isConnected ? 'CONNECTED' : 'WAITING FOR DOCTOR...'}
        </Text>
      </View>

      <View style={meetingStyles.timersCol}>
        <View
          style={[
            meetingStyles.leftBadgeRow,
            isWarning && { backgroundColor: 'rgba(245, 158, 11, 0.25)', borderColor: '#F59E0B' },
            isUrgent && { backgroundColor: 'rgba(239, 68, 68, 0.3)', borderColor: '#EF4444' },
          ]}
        >
          <Text
            style={[
              meetingStyles.leftLbl,
              isWarning && { color: '#F59E0B' },
              isUrgent && { color: '#EF4444' },
            ]}
          >
            LEFT
          </Text>
          <Text
            style={[
              meetingStyles.leftValue,
              isWarning && { color: '#F59E0B' },
              isUrgent && { color: '#EF4444' },
            ]}
          >
            {formattedTime}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default MeetingHeader;
