import React from 'react';
import {
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import CustomDropDownPickerStyles from '../../../styled/CustomDropDownPicker.styled';
import { theme } from '../../../styled/theme.styled';
import { CheckIcon } from '../../ui/icons';

export interface DropdownPickerOption {
  label: string;
  value: string;
}

export interface CustomDropDownPickerProps {
  visible: boolean;
  title: string;
  options: DropdownPickerOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export const CustomDropDownPicker: React.FC<CustomDropDownPickerProps> = ({
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
        <View style={CustomDropDownPickerStyles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={CustomDropDownPickerStyles.modalSheet}>
              <View style={CustomDropDownPickerStyles.modalHandle} />
              <Text style={CustomDropDownPickerStyles.modalTitle}>{title}</Text>
              <View style={CustomDropDownPickerStyles.modalDivider} />
              <FlatList
                data={options}
                keyExtractor={item => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      CustomDropDownPickerStyles.modalOption,
                      item.value === selectedValue && CustomDropDownPickerStyles.modalOptionActive,
                    ]}
                    onPress={() => {
                      onSelect(item.value);
                      onClose();
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        CustomDropDownPickerStyles.modalOptionText,
                        item.value === selectedValue &&
                          CustomDropDownPickerStyles.modalOptionTextActive,
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

export default CustomDropDownPicker;
