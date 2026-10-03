import React, { useRef } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export interface FloatingMeetingWidgetProps {
  visible: boolean;
  patientName: string;
  callSeconds: number;
  onExpand: () => void;
  onEndCall: () => void;
}

export const FloatingMeetingWidget: React.FC<FloatingMeetingWidgetProps> = ({
  visible,
  patientName,
  callSeconds,
  onExpand,
  onEndCall,
}) => {
  const pan = useRef(new Animated.ValueXY({ x: 16, y: 100 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  if (!visible) return null;

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Animated.View
      style={[
        styles.widgetContainer,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity style={S.body} onPress={onExpand} activeOpacity={0.9}>
        <View style={S.avatar}>
          <Text style={S.avatarTxt}>{patientName.charAt(0).toUpperCase()}</Text>
        </View>

        <View style={S.infoBox}>
          <View style={S.liveBadge}>
            <View style={S.liveDot} />
            <Text style={S.liveTxt}>LIVE {formatTimer(callSeconds)}</Text>
          </View>
          <Text style={S.patientTxt} numberOfLines={1}>
            {patientName}
          </Text>
        </View>

        <TouchableOpacity style={S.endBtn} onPress={onEndCall} activeOpacity={0.8}>
          <Text style={S.endBtnTxt}>📞</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const S = StyleSheet.create({
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#0F1A17',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#00897B',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00897B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  infoBox: {
    flex: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2DD4BF',
  },
  patientTxt: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 1,
  },
  endBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endBtnTxt: {
    fontSize: 14,
    color: '#FFFFFF',
  },
});

const styles = StyleSheet.create({
  widgetContainer: {
    position: 'absolute',
    top: 60,
    left: 10,
    width: 220,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    zIndex: 9999,
  },
});

export default FloatingMeetingWidget;
