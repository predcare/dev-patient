import React from 'react';
import {
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckIcon } from '../../../../components/ui/icons';
import memberStyles from '../../../../styled/MemberScreen.styled';
import theme from '../../../../styled/theme.styled';

export interface DropdownPickerOption {
  label: string;
  value: string;
}

export interface DropdownPickerModalProps {
  visible: boolean;
  title: string;
  options: DropdownPickerOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export const DropdownPickerModal: React.FC<DropdownPickerModalProps> = ({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={memberStyles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                memberStyles.modalSheet,
                { paddingBottom: Math.max(insets.bottom + 16, 28) },
              ]}
            >
              <View style={memberStyles.modalHandle} />
              <Text style={memberStyles.modalTitle}>{title}</Text>
              <View style={memberStyles.modalDivider} />
              <FlatList
                data={options}
                keyExtractor={item => item.value}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      memberStyles.modalOption,
                      item.value === selectedValue && memberStyles.modalOptionActive,
                    ]}
                    onPress={() => {
                      onSelect(item.value);
                      onClose();
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        memberStyles.modalOptionText,
                        item.value === selectedValue && memberStyles.modalOptionTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.value === selectedValue && (
                      <CheckIcon size={16} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default DropdownPickerModal;
