import React, { memo } from 'react';
import { Text, View } from 'react-native';
import useMeetingCountdown from '../../../../hooks/commons/meeting/useMeetingCountdown';
import meetingStyles from '../../../../styled/MeetingScreen.styled';

/** The LEFT badge on its own, so only this re-renders every second. */
const MeetingTimerBadge: React.FC = () => {
  const { formattedTime, isWarning, isUrgent } = useMeetingCountdown();

  return (
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
  );
};

export default memo(MeetingTimerBadge);
