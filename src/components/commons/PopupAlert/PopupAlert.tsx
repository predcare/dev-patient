import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, Pressable, Text, View } from 'react-native';
import { CustomPopUpStyled } from '../../../styled/CustomPopUp.styled';
import { theme } from '../../../styled/theme.styled';
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  HelpCircleIcon,
  InfoCircleIcon,
  XCircleIcon,
} from '../../ui/icons';

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
    icon: CheckCircleIcon,
    color: theme.colors.success,
    softBackground: theme.colors.successSoft,
    ringBackground: theme.colors.successLight,
    defaultTitle: 'Success',
  },
  error: {
    icon: XCircleIcon,
    color: theme.colors.danger,
    softBackground: theme.colors.dangerSoft,
    ringBackground: theme.colors.dangerLight,
    defaultTitle: 'Error',
  },
  warning: {
    icon: AlertTriangleIcon,
    color: theme.colors.warning,
    softBackground: theme.colors.warningSoft,
    ringBackground: theme.colors.warningLight,
    defaultTitle: 'Warning',
  },
  info: {
    icon: InfoCircleIcon,
    color: theme.colors.primary,
    softBackground: theme.colors.primarySoft,
    ringBackground: theme.colors.mintBg,
    defaultTitle: 'Information',
  },
  confirm: {
    icon: HelpCircleIcon,
    color: theme.colors.accent,
    softBackground: theme.colors.accentLight,
    ringBackground: theme.colors.infoLight,
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
      <Pressable style={CustomPopUpStyled.overlay} onPress={handleBackdropPress}>
        <Animated.View
          style={[
            CustomPopUpStyled.container,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Pressable
            style={CustomPopUpStyled.innerContent}
            onPress={event => event.stopPropagation()}
          >
            {/* Top Accent Strip */}
            <View style={[CustomPopUpStyled.topBar, { backgroundColor: config.color }]} />

            {/* Dual Ring Icon Header */}
            <View style={CustomPopUpStyled.iconWrapper}>
              <View
                style={[CustomPopUpStyled.outerRing, { backgroundColor: config.softBackground }]}
              >
                <View
                  style={[CustomPopUpStyled.innerRing, { backgroundColor: config.ringBackground }]}
                >
                  <Icon size={28} color={config.color} strokeWidth={2.4} />
                </View>
              </View>
            </View>

            {/* Title & Message */}
            <Text style={CustomPopUpStyled.title}>{title || config.defaultTitle}</Text>
            {!!message && <Text style={CustomPopUpStyled.message}>{message}</Text>}

            {/* Action Buttons */}
            <View style={CustomPopUpStyled.buttonContainer}>
              {showCancel && (
                <Pressable
                  style={({ pressed }) => [
                    CustomPopUpStyled.cancelButton,
                    pressed && CustomPopUpStyled.buttonPressed,
                  ]}
                  onPress={onCancel}
                >
                  <Text style={CustomPopUpStyled.cancelButtonText}>{cancelText}</Text>
                </Pressable>
              )}

              <Pressable
                style={({ pressed }) => [
                  CustomPopUpStyled.primaryButton,
                  {
                    backgroundColor: config.color,
                    flex: showCancel ? 1 : undefined,
                    shadowColor: config.color,
                  },
                  pressed && CustomPopUpStyled.buttonPressed,
                ]}
                onPress={onPress}
              >
                <Text style={CustomPopUpStyled.primaryButtonText}>{buttonText}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default PopupAlert;
