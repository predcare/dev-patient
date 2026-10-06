import { MediaStream, RTCView } from '@videosdk.live/react-native-sdk';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMeetingConnection } from '../../hooks/commons/meeting/useMeetingConnection';
import { useDoctorStream } from '../../hooks/commons/meeting/useMeetingParticipants';
import { useMeetingPip } from '../../hooks/commons/meeting/useMeetingPip';
import inAppPipStyles, {
  PIP_CARD_HEIGHT,
  PIP_CARD_MARGIN,
  PIP_CARD_WIDTH,
} from '../../styled/InAppPip.styled';
import useMeetingStore from '../../zustand/stores/useMeetingStore';
import { EndCallIcon, PipIcon } from '../ui/icons';

const DRAG_THRESHOLD = 5;

export const InAppPipWindow: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pipMode = useMeetingStore(state => state.pipMode);
  const callInfo = useMeetingStore(state => state.callInfo);
  const doctorParticipantId = useMeetingStore(state => state.doctorParticipantId);
  const doctorInfo = useMeetingStore(state => state.doctorInfo);
  const { restoreToMeeting } = useMeetingPip();
  const { endCall } = useMeetingConnection();
  const { webcamStream, webcamOn } = useDoctorStream(doctorParticipantId);

  const doctorName = doctorInfo?.name || 'Doctor';
  const initial = doctorName.replace(/^Dr\.\s*/i, '').charAt(0) || 'D';

  const bounds = useMemo(() => {
    const minX = PIP_CARD_MARGIN;
    const minY = insets.top + PIP_CARD_MARGIN;
    return {
      minX,
      minY,
      maxX: Math.max(minX, width - PIP_CARD_WIDTH - PIP_CARD_MARGIN),
      maxY: Math.max(minY, height - PIP_CARD_HEIGHT - insets.bottom - PIP_CARD_MARGIN),
    };
  }, [width, height, insets.top, insets.bottom]);

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const positionRef = useRef({ x: 0, y: 0 });
  const placedRef = useRef(false);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          Math.abs(gesture.dx) > DRAG_THRESHOLD || Math.abs(gesture.dy) > DRAG_THRESHOLD,
        onPanResponderGrant: () => {
          pan.setOffset(positionRef.current);
          pan.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: () => {
          pan.flattenOffset();
          const { x, y } = positionRef.current;
          const clamped = {
            x: Math.min(Math.max(x, bounds.minX), bounds.maxX),
            y: Math.min(Math.max(y, bounds.minY), bounds.maxY),
          };
          if (clamped.x !== x || clamped.y !== y) {
            Animated.spring(pan, {
              toValue: clamped,
              useNativeDriver: false,
              friction: 7,
            }).start();
          }
        },
        onPanResponderTerminate: () => {
          pan.flattenOffset();
        },
      }),
    [pan, bounds]
  );

  useEffect(() => {
    const id = pan.addListener(value => {
      positionRef.current = value;
    });
    return () => pan.removeListener(id);
  }, [pan]);

  useEffect(() => {
    if (placedRef.current) return;
    placedRef.current = true;
    const start = { x: bounds.maxX, y: bounds.minY };
    pan.setValue(start);
    positionRef.current = start;
  }, [bounds, pan]);

  if (pipMode !== 'IN_APP_PIP' || !callInfo?.meetingId) {
    return null;
  }

  return (
    <View style={inAppPipStyles.dragLayer} pointerEvents="box-none">
      <Animated.View
        style={[
          inAppPipStyles.floatingCard,
          { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={0.9}
          onPress={restoreToMeeting}
        >
          <View style={inAppPipStyles.videoContainer}>
            {webcamOn && webcamStream ? (
              <RTCView
                streamURL={new MediaStream([webcamStream.track]).toURL()}
                objectFit="cover"
                style={StyleSheet.absoluteFill}
                zOrder={1}
              />
            ) : (
              <View style={inAppPipStyles.avatarPlaceholder}>
                <View style={inAppPipStyles.avatarCircle}>
                  <Text style={inAppPipStyles.avatarTxt}>{initial}</Text>
                </View>
              </View>
            )}
          </View>

          <View style={inAppPipStyles.badgeRow}>
            <View style={inAppPipStyles.doctorPill}>
              <Text style={inAppPipStyles.doctorName} numberOfLines={1}>
                {doctorName}
              </Text>
            </View>
            <View style={inAppPipStyles.expandIconBadge}>
              <PipIcon size={12} color="#FFFFFF" />
            </View>
          </View>

          <View style={inAppPipStyles.bottomHud}>
            <Text style={inAppPipStyles.tapToExpandTxt}>EXPAND</Text>
            <TouchableOpacity
              style={inAppPipStyles.endCallBtn}
              activeOpacity={0.8}
              onPress={endCall}
            >
              <EndCallIcon size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default InAppPipWindow;
