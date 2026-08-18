import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const CheckCircle2: React.FC<IconProps> = ({ size = 28, color = '#059669', strokeWidth = 2.4 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Circle cx="12" cy="12" r="10" />
    <Path d="m9 12 2 2 4-4" />
  </Svg>
);

const XCircle: React.FC<IconProps> = ({ size = 28, color = '#DC2626', strokeWidth = 2.4 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Circle cx="12" cy="12" r="10" />
    <Path d="m15 9-6 6" />
    <Path d="m9 9 6 6" />
  </Svg>
);

const AlertTriangle: React.FC<IconProps> = ({
  size = 28,
  color = '#D97706',
  strokeWidth = 2.4,
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <Path d="M12 9v4" />
    <Path d="M12 17h.01" />
  </Svg>
);

const Info: React.FC<IconProps> = ({ size = 28, color = '#00897B', strokeWidth = 2.4 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Circle cx="12" cy="12" r="10" />
    <Path d="M12 16v-4" />
    <Path d="M12 8h.01" />
  </Svg>
);

const HelpCircle: React.FC<IconProps> = ({ size = 28, color = '#6366F1', strokeWidth = 2.4 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Circle cx="12" cy="12" r="10" />
    <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <Path d="M12 17h.01" />
  </Svg>
);

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface PopupAlertProps {
  visible: boolean;
  type?: AlertType;
  title?: string;
  message?: string;
  buttonText?: string;
  cancelText?: string;
  onPress?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  closeOnBackdrop?: boolean;
}

const ALERT_CONFIG = {
  success: {
    icon: CheckCircle2,
    color: '#059669',
    softBackground: '#ECFDF5',
    ringBackground: '#D1FAE5',
    defaultTitle: 'Success',
  },
  error: {
    icon: XCircle,
    color: '#DC2626',
    softBackground: '#FEF2F2',
    ringBackground: '#FEE2E2',
    defaultTitle: 'Error',
  },
  warning: {
    icon: AlertTriangle,
    color: '#D97706',
    softBackground: '#FFFBEB',
    ringBackground: '#FEF3C7',
    defaultTitle: 'Warning',
  },
  info: {
    icon: Info,
    color: '#00897B',
    softBackground: '#F0FDFA',
    ringBackground: '#CCFBF1',
    defaultTitle: 'Information',
  },
  confirm: {
    icon: HelpCircle,
    color: '#6366F1',
    softBackground: '#EEF2FF',
    ringBackground: '#E0E7FF',
    defaultTitle: 'Confirmation',
  },
};

const PopupAlert: React.FC<PopupAlertProps> = ({
  visible,
  type = 'info',
  title,
  message,
  buttonText = 'OK',
  cancelText = 'Cancel',
  onPress,
  onCancel,
  showCancel = false,
  closeOnBackdrop = false,
}) => {
  if (!visible) return null;
  const config = ALERT_CONFIG[type] || ALERT_CONFIG.info;
  const Icon = config.icon;

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  const handleBackdropPress = () => {
    if (closeOnBackdrop) {
      onCancel?.();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={handleBackdropPress}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Pressable style={styles.innerContent} onPress={event => event.stopPropagation()}>
            {/* Top Accent Strip */}
            <View style={[styles.topBar, { backgroundColor: config.color }]} />

            {/* Dual Ring Icon Header */}
            <View style={styles.iconWrapper}>
              <View style={[styles.outerRing, { backgroundColor: config.softBackground }]}>
                <View style={[styles.innerRing, { backgroundColor: config.ringBackground }]}>
                  <Icon size={28} color={config.color} strokeWidth={2.4} />
                </View>
              </View>
            </View>

            {/* Title & Message */}
            <Text style={styles.title}>{title || config.defaultTitle}</Text>
            {!!message && <Text style={styles.message}>{message}</Text>}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {showCancel && (
                <Pressable
                  style={({ pressed }) => [styles.cancelButton, pressed && styles.buttonPressed]}
                  onPress={onCancel}
                >
                  <Text style={styles.cancelButtonText}>{cancelText}</Text>
                </Pressable>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  {
                    backgroundColor: config.color,
                    flex: showCancel ? 1 : undefined,
                    shadowColor: config.color,
                  },
                  pressed && styles.buttonPressed,
                ]}
                onPress={onPress}
              >
                <Text style={styles.primaryButtonText}>{buttonText}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default PopupAlert;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 16,
  },

  innerContent: {
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 24,
    alignItems: 'center',
  },

  topBar: {
    width: '120%',
    height: 4,
    marginBottom: 20,
  },

  iconWrapper: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  outerRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  innerRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 8,
  },

  message: {
    fontSize: 14.5,
    lineHeight: 22,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },

  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },

  primaryButton: {
    width: '100%',
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: -0.1,
  },

  cancelButton: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
  },

  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
});
