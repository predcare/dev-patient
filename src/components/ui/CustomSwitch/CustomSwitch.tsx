import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import theme from '../../../styled/theme.styled';

export type CustomSwitchSize = 'sm' | 'md' | 'lg';

export interface CustomSwitchProps {
  value: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  size?: CustomSwitchSize;
  activeTrackColor?: string;
  inactiveTrackColor?: string;
  activeThumbColor?: string;
  inactiveThumbColor?: string;
  activeBorderColor?: string;
  inactiveBorderColor?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const SIZES = {
  sm: {
    width: 38,
    height: 22,
    padding: 2.5,
  },
  md: {
    width: 46,
    height: 26,
    padding: 3,
  },
  lg: {
    width: 54,
    height: 30,
    padding: 3.5,
  },
};

export const CustomSwitch: React.FC<CustomSwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  size = 'md',
  activeTrackColor = theme.colors.primary,
  inactiveTrackColor = '#E2E8F0',
  activeThumbColor = '#FFFFFF',
  inactiveThumbColor = '#FFFFFF',
  activeBorderColor,
  inactiveBorderColor = '#CBD5E1',
  style,
  testID,
}) => {
  const config = SIZES[size] || SIZES.md;
  const thumbSize = config.height - config.padding * 2;
  const travelDistance = config.width - thumbSize - config.padding * 2;

  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: true,
    }).start();
  }, [value, animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, travelDistance],
  });

  const handlePress = () => {
    if (disabled || !onValueChange) return;
    onValueChange(!value);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      disabled={disabled}
      testID={testID}
      accessible={true}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[
        styles.container,
        {
          width: config.width,
          height: config.height,
          borderRadius: config.height / 2,
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      {/* Inactive Track Background */}
      <View
        style={[
          styles.track,
          {
            backgroundColor: inactiveTrackColor,
            borderRadius: config.height / 2,
            borderColor: inactiveBorderColor,
          },
        ]}
      />

      {/* Active Track Overlay (Fades in seamlessly on native thread) */}
      <Animated.View
        style={[
          styles.track,
          {
            backgroundColor: activeTrackColor,
            borderRadius: config.height / 2,
            borderColor: activeBorderColor || activeTrackColor,
            opacity: animatedValue,
          },
        ]}
      />

      {/* Animated Sliding Thumb */}
      <Animated.View
        style={[
          styles.thumb,
          {
            width: thumbSize,
            height: thumbSize,
            borderRadius: thumbSize / 2,
            backgroundColor: value ? activeThumbColor : inactiveThumbColor,
            top: config.padding,
            left: config.padding,
            transform: [{ translateX }],
          },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    ...StyleSheet.absoluteFill,
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.5,
  },
  thumb: {
    position: 'absolute',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.22,
    shadowRadius: 2.5,
    elevation: 3,
  },
});

export default CustomSwitch;
