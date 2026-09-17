import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { logoutOptionsModalStyles as styles } from '../../../styled/LogoutOptionsModal.styled';
import { theme } from '../../../styled/theme.styled';

export interface LogoutOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmLogout: (allDevices: boolean) => Promise<void> | void;
  isLoading?: boolean;
}

const PhoneIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Rect
      x="5"
      y="2"
      width="14"
      height="20"
      rx="3"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 18h.01"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const DevicesShieldIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 12l2 2 4-4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CloseIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke={theme.colors.textMuted}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const LogoutOptionsModal: React.FC<LogoutOptionsModalProps> = ({
  visible,
  onClose,
  onConfirmLogout,
  isLoading = false,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedOption, setSelectedOption] = useState<'current' | 'all'>('current');
  const slideAnim = useRef(new Animated.Value(350)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setSelectedOption('current');
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.back(0.4)),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 350,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  const handleDismiss = () => {
    if (isLoading) return;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 350,
        duration: 180,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleConfirm = () => {
    onConfirmLogout(selectedOption === 'all');
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleDismiss}>
      <View style={styles.modalContainer}>
        <TouchableWithoutFeedback onPress={handleDismiss}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.bottomSheet,
            {
              paddingBottom: Math.max(insets.bottom + 16, 24),
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Drag Handle Bar */}
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.title}>Sign Out</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={handleDismiss}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <CloseIcon />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>
              Choose how you want to log out of your doctor account.
            </Text>
          </View>

          {/* Option 1: Current Device Only */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[styles.optionCard, selectedOption === 'current' && styles.optionCardSelected]}
              onPress={() => setSelectedOption('current')}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              <View style={styles.iconBox}>
                <PhoneIcon color={theme.colors.primary} />
              </View>
              <View style={styles.optionTextContent}>
                <Text style={styles.optionTitle}>Current Device Only</Text>
                <Text style={styles.optionSubtitle}>
                  Log out of this session on your current device only.
                </Text>
              </View>
              <View
                style={[
                  styles.radioCircle,
                  selectedOption === 'current' && styles.radioCircleSelected,
                ]}
              >
                {selectedOption === 'current' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>

            {/* Option 2: All Devices */}
            <TouchableOpacity
              style={[styles.optionCard, selectedOption === 'all' && styles.optionCardDanger]}
              onPress={() => setSelectedOption('all')}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              <View style={[styles.iconBox, styles.iconBoxDanger]}>
                <DevicesShieldIcon color={theme.colors.danger} />
              </View>
              <View style={styles.optionTextContent}>
                <Text style={[styles.optionTitle, styles.optionTitleDanger]}>All Devices</Text>
                <Text style={styles.optionSubtitle}>
                  Sign out from all active sessions on phones, tablets & web portals.
                </Text>
              </View>
              <View
                style={[styles.radioCircle, selectedOption === 'all' && styles.radioCircleDanger]}
              >
                {selectedOption === 'all' && <View style={styles.radioInnerDanger} />}
              </View>
            </TouchableOpacity>
          </View>

          {/* Actions */}
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.textInverted} size="small" />
            ) : (
              <Text style={styles.confirmButtonText}>
                {selectedOption === 'all' ? 'Sign Out of All Devices' : 'Sign Out'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleDismiss}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default LogoutOptionsModal;
