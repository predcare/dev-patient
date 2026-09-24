import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Sound from 'react-native-sound';
import { incomingCallStyles } from '../../../styled/IncomingCallBanner.styled';
import { theme } from '../../../styled/theme.styled';
import useIncomingCallStore from '../../../zustand/stores/useIncomingCallStore';
import { VideoIcon } from '../../ui/icons';
import CrossIcon from '../../ui/icons/CrossIcon';

export interface IncomingCallBannerProps {
  visible?: boolean;
  doctorName?: string;
  callType?: string;
  onJoin?: () => void;
}

const CALL_VIBRATION_PATTERN = [0, 1000, 800, 1000, 800];

export const IncomingCallBanner: React.FC<IncomingCallBannerProps> = ({
  visible = true,
  doctorName = 'Dr. Sahil Mallick',
  callType = 'Incoming Video Call...',
  onJoin,
}) => {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 8) + 4;
  const slideAnim = useRef(new Animated.Value(-160)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { hideCallBanner } = useIncomingCallStore(state => state);

  const handleJoinPress = () => {
    Vibration.cancel();
    onJoin?.();
    hideCallBanner();
  };

  const handleClose = () => {
    Vibration.cancel();
    hideCallBanner();
  };

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -160,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  useEffect(() => {
    if (!visible) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    return () => {
      pulse.stop();
    };
  }, [visible, pulseAnim]);

  useEffect(() => {
    let sound: Sound | null = null;

    if (visible) {
      Vibration.vibrate(CALL_VIBRATION_PATTERN, true);

      Sound.setCategory('Playback');
      // @ts-ignore
      sound = new Sound('ringtone.mp3', Sound.MAIN_BUNDLE, (error: any) => {
        if (error) {
          console.log('failed to load the sound', error);
          return;
        }
        sound?.setNumberOfLoops(-1);
        sound?.setVolume(1.0);
        sound?.play();
      });
    } else {
      Vibration.cancel();
    }

    return () => {
      Vibration.cancel();
      if (sound) {
        sound.stop();
        sound.release();
      }
    };
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <View
      style={[incomingCallStyles.overlayWrapper, { paddingTop: topInset }]}
      pointerEvents="box-none"
    >
      <Animated.View
        style={[
          incomingCallStyles.card,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={incomingCallStyles.leftSection}>
          <Animated.View
            style={[
              incomingCallStyles.pulseIndicatorContainer,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <VideoIcon size={16} strokeWidth={2} />
          </Animated.View>

          <View style={incomingCallStyles.infoContainer}>
            <Text style={incomingCallStyles.doctorName} numberOfLines={1} ellipsizeMode="tail">
              {doctorName}
            </Text>
            <View style={incomingCallStyles.callStatusRow}>
              <View style={incomingCallStyles.liveDot} />
              <Text style={incomingCallStyles.callStatusText} numberOfLines={1}>
                {callType}
              </Text>
            </View>
          </View>
        </View>

        <View style={incomingCallStyles.rightSection}>
          <TouchableOpacity
            style={incomingCallStyles.joinButton}
            onPress={handleJoinPress}
            activeOpacity={0.85}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <View style={incomingCallStyles.joinButtonIconWrap}>
              <VideoIcon size={14} color={theme.colors.textInverted} strokeWidth={2} />
            </View>
            <Text style={incomingCallStyles.joinButtonText}>Join Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={incomingCallStyles.crossIcon}
            onPress={handleClose}
            activeOpacity={0.85}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <CrossIcon size={14} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default IncomingCallBanner;
