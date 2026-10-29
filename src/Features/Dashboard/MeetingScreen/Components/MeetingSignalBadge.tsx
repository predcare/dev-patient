import React, { memo } from 'react';
import { Text, View } from 'react-native';
import {
  getLinkSignalCap,
  getSignalLevel,
} from '../../../../hooks/commons/meeting/callQuality.utils';
import meetingStyles from '../../../../styled/MeetingScreen.styled';
import theme from '../../../../styled/theme.styled';
import useMeetingStore from '../../../../zustand/stores/useMeetingStore';
import useNetworkStore from '../../../../zustand/stores/useNetworkStore';

const SIGNAL_LABELS = ['Offline', 'Weak', 'Fair', 'Good', 'Strong'] as const;

const signalColor = (level: number) => {
  if (level <= 1) return '#EF4444';
  if (level === 2) return '#F59E0B';
  return theme.colors.green;
};

/** Signal bars from live call stats, capped by the device link (wifi strength, 2G-5G). */
const MeetingSignalBadge: React.FC = () => {
  const networkQuality = useMeetingStore(state => state.networkQuality);
  const qualityLimitation = useMeetingStore(state => state.qualityLimitation);
  const callState = useMeetingStore(state => state.callState);
  const isOffline = useNetworkStore(state => state.isOffline);
  const connectionType = useNetworkStore(state => state.connectionType);
  const wifiStrength = useNetworkStore(state => state.wifiStrength);
  const cellularGeneration = useNetworkStore(state => state.cellularGeneration);

  const isReconnecting = callState === 'RECONNECTING' || callState === 'DISCONNECTED';
  const linkCap = getLinkSignalCap(
    isOffline,
    String(connectionType),
    wifiStrength,
    cellularGeneration,
  );
  const level = isReconnecting ? 0 : getSignalLevel(linkCap, networkQuality, qualityLimitation);
  const label = isReconnecting && !isOffline ? 'Reconnecting' : SIGNAL_LABELS[level];
  const barsColor = signalColor(level);

  return (
    <View style={meetingStyles.networkRow}>
      <View style={meetingStyles.signalBars}>
        {[1, 2, 3, 4].map(bar => (
          <View
            key={bar}
            style={[
              meetingStyles.signalBar,
              { height: 4 + bar * 2 },
              { backgroundColor: bar <= level ? barsColor : 'rgba(255, 255, 255, 0.25)' },
            ]}
          />
        ))}
      </View>
      <Text style={[meetingStyles.networkLabel, { color: barsColor }]}>{label}</Text>
    </View>
  );
};

export default memo(MeetingSignalBadge);
