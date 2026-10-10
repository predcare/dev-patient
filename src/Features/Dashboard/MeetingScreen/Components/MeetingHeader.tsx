import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ChevronLeftIcon } from '../../../../components/ui/icons';
import useMeetingCountdown from '../../../../hooks/commons/meeting/useMeetingCountdown';
import useMeetingPip from '../../../../hooks/commons/meeting/useMeetingPip';
import useNetworkStatus from '../../../../hooks/commons/useNetworkStatus';
import { navigate } from '../../../../navigation/navigationRef';
import { AppRoute } from '../../../../route';
import meetingStyles from '../../../../styled/MeetingScreen.styled';
import theme from '../../../../styled/theme.styled';
import useMeetingStore from '../../../../zustand/stores/useMeetingStore';

const SIGNAL_LABELS = ['Offline', 'Weak', 'Fair', 'Good', 'Strong'] as const;

const getSignalLevel = (isOffline: boolean, connectionType: string): number => {
  if (isOffline || connectionType === 'none') return 0;
  if (connectionType === 'wifi' || connectionType === 'ethernet') return 4;
  if (connectionType === 'cellular') return 3;
  if (connectionType === 'unknown') return 2;
  return 3;
};

const signalColor = (level: number) => {
  if (level <= 1) return '#EF4444';
  if (level === 2) return '#F59E0B';
  return theme.colors.green;
};

export const MeetingHeader: React.FC = () => {
  const doctorInfo = useMeetingStore(state => state.doctorInfo);
  const callState = useMeetingStore(state => state.callState);
  const { enterInAppPip } = useMeetingPip();
  const { formattedTime, isWarning, isUrgent } = useMeetingCountdown();
  const { isOffline, connectionType } = useNetworkStatus();
  const signalLevel = getSignalLevel(isOffline, connectionType);

  const doctorName = doctorInfo?.name || 'Dr. Sahil Mallick';
  const isConnected = callState === 'CONNECTED';
  const barsColor = signalColor(signalLevel);

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
        <View style={meetingStyles.networkRow}>
          <View style={meetingStyles.signalBars}>
            {[1, 2, 3, 4].map(bar => (
              <View
                key={bar}
                style={[
                  meetingStyles.signalBar,
                  { height: 4 + bar * 2 },
                  {
                    backgroundColor: bar <= signalLevel ? barsColor : 'rgba(255, 255, 255, 0.25)',
                  },
                ]}
              />
            ))}
          </View>
          <Text style={[meetingStyles.networkLabel, { color: barsColor }]}>
            {SIGNAL_LABELS[signalLevel]}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default MeetingHeader;
