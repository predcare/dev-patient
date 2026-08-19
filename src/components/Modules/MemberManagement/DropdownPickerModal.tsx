import React from 'react';
import {
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { memberStyles } from '../../../styled/MemberScreen.styled';
import { theme } from '../../../styled/theme.styled';
import { CheckIcon } from '../../ui/icons';

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
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={memberStyles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={memberStyles.modalSheet}>
              <View style={memberStyles.modalHandle} />
              <Text style={memberStyles.modalTitle}>{title}</Text>
              <View style={memberStyles.modalDivider} />
              <FlatList
                data={options}
                keyExtractor={item => item.value}
                renderItem={({ item }) => {
                  const isSelected =
                    item.value === selectedValue ||
                    (Boolean(selectedValue) &&
                      item.label.toLowerCase() === String(selectedValue).toLowerCase());
                  return (
                    <TouchableOpacity
                      style={[
                        memberStyles.modalOption,
                        isSelected && memberStyles.modalOptionActive,
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
                          isSelected && memberStyles.modalOptionTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {isSelected && <CheckIcon size={16} color={theme.colors.primary} />}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default DropdownPickerModal;
