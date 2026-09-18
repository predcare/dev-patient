import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { theme } from '../../../styled/theme.styled';

export interface UploadOptionsModalProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  type?: 'logo' | 'signature';
  onSelectCamera: () => void;
  onSelectGallery: () => void;
  onClose: () => void;
}

const CameraBadgeIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
      stroke={theme.colors.primary}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="13" r="4" stroke={theme.colors.primary} strokeWidth="2" />
  </Svg>
);

const GalleryBadgeIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="18" height="18" rx="3" stroke="#6366F1" strokeWidth="2" />
    <Circle cx="8.5" cy="8.5" r="1.5" fill="#6366F1" />
    <Path
      d="M21 15l-5-5L5 21"
      stroke="#6366F1"
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

export const UploadOptionsModal: React.FC<UploadOptionsModalProps> = ({
  visible,
  title,
  subtitle,
  type = 'signature',
  onSelectCamera,
  onSelectGallery,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.back(0.5)),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  if (!visible) return null;

  const displayTitle = title || `Upload ${type === 'logo' ? 'Clinic Logo' : 'Doctor Signature'}`;
  const displaySubtitle =
    subtitle || `Choose a source to add your ${type === 'logo' ? 'logo image' : 'signature'}`;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.sheetCard,
                {
                  paddingBottom: Math.max(28, insets.bottom + 16),
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Drag Handle */}
              <View style={styles.handle} />

              {/* Header */}
              <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sheetTitle}>{displayTitle}</Text>
                  <Text style={styles.sheetSubtitle}>{displaySubtitle}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                  <CloseIcon />
                </TouchableOpacity>
              </View>

              {/* Options */}
              <View style={styles.optionsContainer}>
                {/* Camera Option */}
                <TouchableOpacity
                  style={styles.optionCard}
                  onPress={() => {
                    onClose();
                    setTimeout(() => {
                      onSelectCamera();
                    }, 100);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconCircle, { backgroundColor: theme.colors.primarySoft }]}>
                    <CameraBadgeIcon />
                  </View>
                  <View style={styles.optionTextWrap}>
                    <Text style={styles.optionTitle}>Take Photo</Text>
                    <Text style={styles.optionDesc}>
                      {type === 'signature'
                        ? 'Snap a clear photo of your signature on white paper'
                        : 'Take a photo of your clinic logo'}
                    </Text>
                  </View>
                  <Text style={styles.arrowIcon}>›</Text>
                </TouchableOpacity>

                {/* Gallery Option */}
                <TouchableOpacity
                  style={styles.optionCard}
                  onPress={() => {
                    onClose();
                    setTimeout(() => {
                      onSelectGallery();
                    }, 100);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#EEF2FF' }]}>
                    <GalleryBadgeIcon />
                  </View>
                  <View style={styles.optionTextWrap}>
                    <Text style={styles.optionTitle}>Choose from Gallery</Text>
                    <Text style={styles.optionDesc}>
                      Select a PNG or JPG file stored on your device
                    </Text>
                  </View>
                  <Text style={styles.arrowIcon}>›</Text>
                </TouchableOpacity>
              </View>

              {/* Cancel Button */}
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default UploadOptionsModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  handle: {
    width: 38,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: theme.colors.surfaceBorder,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.dark,
    letterSpacing: -0.2,
  },
  sheetSubtitle: {
    fontSize: 13,
    color: theme.colors.textSlate,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: 16,
    padding: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionTextWrap: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.dark,
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 12,
    color: theme.colors.textSlate,
    lineHeight: 16,
  },
  arrowIcon: {
    fontSize: 22,
    color: '#CBD5E1',
    fontWeight: '400',
    marginLeft: 8,
  },
  cancelBtn: {
    backgroundColor: theme.colors.bg,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: theme.fontWeight.semibold,
    color: '#475569',
  },
});
