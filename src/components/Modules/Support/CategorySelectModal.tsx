import React from 'react';
import { Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SupportCategory } from '../../../resources/mockData';
import { supportStyles } from '../../../styled/SupportScreen.styled';
import { theme } from '../../../styled/theme.styled';
import { CheckIcon } from '../../ui/icons';

export interface CategorySelectModalProps {
  visible: boolean;
  categories: SupportCategory[];
  selectedCategory?: SupportCategory | null;
  onSelect: (category: SupportCategory) => void;
  onClose: () => void;
}

export const CategorySelectModal: React.FC<CategorySelectModalProps> = ({
  visible,
  categories,
  selectedCategory,
  onSelect,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={supportStyles.modalSheetOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableWithoutFeedback>
          <View style={supportStyles.modalSheet}>
            <Text style={supportStyles.modalSheetTitle}>Select a category</Text>
            {categories.length === 0 ? (
              <Text style={supportStyles.emptyCats}>No categories available.</Text>
            ) : (
              categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={supportStyles.modalSheetRow}
                  onPress={() => {
                    onSelect(cat);
                    onClose();
                  }}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      supportStyles.modalSheetRowTxt,
                      selectedCategory?.id === cat.id &&
                        supportStyles.modalSheetRowTxtActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                  {selectedCategory?.id === cat.id && (
                    <CheckIcon size={16} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

export default CategorySelectModal;
