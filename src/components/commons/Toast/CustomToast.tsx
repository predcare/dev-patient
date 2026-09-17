import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { getToastVariantStyles, toastStyles as styles } from '../../../styled/Toast.styled';
import { ToastConfig, useToastStore } from '../../../zustand/stores/useToastStore';

interface CustomToastProps {
  toast: ToastConfig;
}

const ToastIcon: React.FC<{ type: ToastConfig['type']; color: string }> = ({ type, color }) => {
  switch (type) {
    case 'success':
      return (
        <Svg
          width={18}
          height={18}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path d="M20 6L9 17l-5-5" />
        </Svg>
      );
    case 'error':
      return (
        <Svg
          width={18}
          height={18}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Circle cx={12} cy={12} r={10} />
          <Path d="M15 9l-6 6M9 9l6 6" />
        </Svg>
      );
    case 'warning':
      return (
        <Svg
          width={18}
          height={18}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <Path d="M12 9v4M12 17h.01" />
        </Svg>
      );
    case 'info':
    default:
      return (
        <Svg
          width={18}
          height={18}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Circle cx={12} cy={12} r={10} />
          <Path d="M12 16v-4M12 8h.01" />
        </Svg>
      );
  }
};

const CloseIcon: React.FC<{ color?: string }> = ({ color = '#64748B' }) => (
  <Svg
    width={14}
    height={14}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M18 6L6 18M6 6l12 12" />
  </Svg>
);

export const CustomToast: React.FC<CustomToastProps> = ({ toast }) => {
  const hideToast = useToastStore(state => state.hideToast);
  const translateY = useRef(new Animated.Value(-40)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const dismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -40,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      hideToast();
    });
  };

  useEffect(() => {
    // Slide and fade in
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss timer
    const duration = toast.duration || 3500;
    timerRef.current = setTimeout(() => {
      dismiss();
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id]);

  const variant = getToastVariantStyles(toast.type);

  return (
    <Animated.View
      style={[
        styles.toastCard,
        { borderColor: variant.borderColor },
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={[styles.accentBar, { backgroundColor: variant.accentColor }]} />
      <View style={[styles.iconBadge, { backgroundColor: variant.iconBg }]}>
        <ToastIcon type={toast.type} color={variant.iconColor} />
      </View>
      <View style={styles.contentBox}>
        {!!toast.title && <Text style={styles.title}>{toast.title}</Text>}
        <Text style={styles.message}>{toast.message}</Text>
      </View>
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={dismiss}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <CloseIcon />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default CustomToast;
