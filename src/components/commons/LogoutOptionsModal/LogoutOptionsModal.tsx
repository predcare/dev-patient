import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import Svg, { Path } from 'react-native-svg';
import { logoutOptionsModalStyles as styles } from '../../../styled/LogoutOptionsModal.styled';
import { theme } from '../../../styled/theme.styled';
import { PhoneIcon } from '../../ui/icons';
import { CloseIcon } from '../../ui/icons/CloseIcon';

export interface LogoutOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmLogout: (allDevices: boolean) => Promise<void> | void;
  isLoading?: boolean;
}

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

export const LogoutOptionsModal: React.FC<LogoutOptionsModalProps> = ({
  visible,
  onClose,
  onConfirmLogout,
  isLoading = false,
}) => {
  const { t } = useTranslation();
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
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.title}>{t('logoutModal.title')}</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={handleDismiss}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <CloseIcon />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>{t('logoutModal.subtitle')}</Text>
          </View>
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
                <Text style={styles.optionTitle}>{t('logoutModal.currentDeviceTitle')}</Text>
                <Text style={styles.optionSubtitle}>{t('logoutModal.currentDeviceSubtitle')}</Text>
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
                <Text style={[styles.optionTitle, styles.optionTitleDanger]}>
                  {t('logoutModal.allDevicesTitle')}
                </Text>
                <Text style={styles.optionSubtitle}>{t('logoutModal.allDevicesSubtitle')}</Text>
              </View>
              <View
                style={[styles.radioCircle, selectedOption === 'all' && styles.radioCircleDanger]}
              >
                {selectedOption === 'all' && <View style={styles.radioInnerDanger} />}
              </View>
            </TouchableOpacity>
          </View>
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
                {selectedOption === 'all'
                  ? t('logoutModal.signOutAllButton')
                  : t('logoutModal.signOutButton')}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleDismiss}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>{t('logoutModal.cancel')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default LogoutOptionsModal;
