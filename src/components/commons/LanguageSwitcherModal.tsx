import React from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { theme } from '../../styled/theme.styled';
import { CheckIcon, CircleXIcon } from '../ui/icons';

export interface LanguageItem {
  code: string;
  name: string;
  nativeName: string;
}

export const LANGUAGES: LanguageItem[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
];

export interface LanguageSwitcherModalProps {
  visible: boolean;
  onClose: () => void;
  selectedLanguageCode?: string;
  onSelectLanguage?: (code: string) => void;
}

export const LanguageSwitcherModal: React.FC<LanguageSwitcherModalProps> = ({
  visible,
  onClose,
  selectedLanguageCode = 'en',
  onSelectLanguage,
}) => {
  const handleSelect = (code: string) => {
    onSelectLanguage?.(code);
    onClose();
  };

  const renderLanguageItem = ({ item }: { item: LanguageItem }) => {
    const isSelected = item.code === selectedLanguageCode;

    return (
      <TouchableOpacity
        style={[styles.languageItem, isSelected && styles.languageItemSelected]}
        onPress={() => handleSelect(item.code)}
        activeOpacity={0.7}
      >
        <View style={styles.languageTextContainer}>
          <Text style={[styles.languageName, isSelected && styles.languageNameSelected]}>
            {item.name}
          </Text>
          <Text
            style={[styles.languageNativeName, isSelected && styles.languageNativeNameSelected]}
          >
            {item.nativeName}
          </Text>
        </View>
        {isSelected && <CheckIcon size={20} color={theme.colors.primary} />}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Language</Text>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                >
                  <CircleXIcon size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Language List */}
              <FlatList
                data={LANGUAGES}
                renderItem={renderLanguageItem}
                keyExtractor={item => item.code}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.languageList}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default LanguageSwitcherModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingBottom: 24,
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  languageList: {
    paddingVertical: 8,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  languageItemSelected: {
    backgroundColor: theme.colors.primarySoft,
  },
  languageTextContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  languageNameSelected: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  languageNativeName: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  languageNativeNameSelected: {
    color: theme.colors.primary,
  },
});
