import { useMeeting } from '@videosdk.live/react-native-sdk';
import React, { useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMeetingStore } from '../../../zustand/stores/useMeetingStore';
import EndPhoneIcon from '../../ui/icons/EndPhoneIcon';
import { RemotePipVideoView } from './RemotePipVideoView';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PIP_WIDTH = 136;
const PIP_HEIGHT = 196;
const PADDING = 16;

interface InAppPipOverlayProps {
  onExpand: () => void;
  onEndCall: () => void;
}

export const InAppPipOverlay: React.FC<InAppPipOverlayProps> = ({ onExpand, onEndCall }) => {
  const { remoteParticipantId, patientName, isInAppPip } = useMeetingStore();
  const { participants } = useMeeting();

  const effectiveRemoteId = useMemo(() => {
    if (remoteParticipantId) return remoteParticipantId;
    if (participants && participants.size > 0) {
      const remote = Array.from(participants.values()).find((p: any) => !p.local);
      if (remote && remote.id) return remote.id;
    }
    return null;
  }, [remoteParticipantId, participants]);

  // Initial position: Top right corner
  const pan = useRef(
    new Animated.ValueXY({
      x: SCREEN_WIDTH - PIP_WIDTH - PADDING,
      y: Platform.OS === 'ios' ? 70 : 50,
    })
  ).current;

  const currentPosRef = useRef({
    x: SCREEN_WIDTH - PIP_WIDTH - PADDING,
    y: Platform.OS === 'ios' ? 70 : 50,
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: currentPosRef.current.x,
          y: currentPosRef.current.y,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        const finalX = currentPosRef.current.x + gestureState.dx;
        const finalY = currentPosRef.current.y + gestureState.dy;

        // If tap (negligible movement), expand back to full screen
        if (Math.abs(gestureState.dx) < 6 && Math.abs(gestureState.dy) < 6) {
          onExpand();
          return;
        }

        // Clamp to screen boundaries with smooth spring
        const minX = PADDING;
        const maxX = SCREEN_WIDTH - PIP_WIDTH - PADDING;
        const minY = Platform.OS === 'ios' ? 50 : 30;
        const maxY = SCREEN_HEIGHT - PIP_HEIGHT - (Platform.OS === 'ios' ? 90 : 70);

        // Snap to nearest left or right edge
        const clampedX = finalX < SCREEN_WIDTH / 2 ? minX : maxX;
        const clampedY = Math.min(Math.max(finalY, minY), maxY);

        currentPosRef.current = { x: clampedX, y: clampedY };

        Animated.spring(pan, {
          toValue: { x: clampedX, y: clampedY },
          useNativeDriver: false,
          friction: 7,
          tension: 40,
        }).start();
      },
    })
  ).current;

  if (!isInAppPip) return null;

  return (
    <Animated.View
      style={[
        styles.pipContainer,
        {
          transform: pan.getTranslateTransform(),
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Remote Video Stream or Fallback */}
      <View style={styles.videoStage}>
        {effectiveRemoteId ? (
          <RemotePipVideoView
            participantId={effectiveRemoteId}
            displayName={patientName ?? 'Doctor'}
          />
        ) : (
          <View style={styles.fallbackContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>
                {(patientName ?? 'D').charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.fallbackText} numberOfLines={1}>
              Connecting...
            </Text>
          </View>
        )}
      </View>

      {/* Top action header: Status pill & End Call button */}
      <View style={styles.headerBar}>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>CALL</Text>
        </View>

        <TouchableOpacity
          style={styles.endCallBtn}
          activeOpacity={0.7}
          onPress={e => {
            e.stopPropagation();
            onEndCall();
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <EndPhoneIcon size={12} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Bottom overlay: Doctor name badge */}
      <View style={styles.bottomBar}>
        <Text style={styles.patientName} numberOfLines={1}>
          {patientName || 'Doctor Consultation'}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  pipContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: PIP_WIDTH,
    height: PIP_HEIGHT,
    borderRadius: 18,
    backgroundColor: '#0F172A',
    overflow: 'hidden',
    zIndex: 99999,
    elevation: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  videoStage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#090D16',
  },
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#0F172A',
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  fallbackText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerBar: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.3,
  },
  endCallBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 5,
    paddingHorizontal: 8,
    zIndex: 10,
  },
  patientName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default InAppPipOverlay;
