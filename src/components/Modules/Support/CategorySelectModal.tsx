import React from 'react';
import { Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { supportStyles } from '../../../styled/SupportScreen.styled';
import { theme } from '../../../styled/theme.styled';
import { ISupportTicketCategory } from '../../../typescripts/interfaces/support-tickets.interfaces';
import { CheckIcon } from '../../ui/icons';

export interface CategorySelectModalProps {
  visible: boolean;
  categories: ISupportTicketCategory[];
  selectedCategory?: ISupportTicketCategory | null;
  selectedCategoryName?: string;
  onSelect: (category: ISupportTicketCategory) => void;
  onClose: () => void;
}

export const CategorySelectModal: React.FC<CategorySelectModalProps> = ({
  visible,
  categories,
  selectedCategory,
  selectedCategoryName,
  onSelect,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={supportStyles.modalSheetOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableWithoutFeedback>
          <View style={supportStyles.modalSheet}>
            <Text style={supportStyles.modalSheetTitle}>Select a category</Text>
            {categories.length === 0 ? (
              <Text style={supportStyles.emptyCats}>No categories available.</Text>
            ) : (
              categories.map(cat => {
                const isSelected =
                  selectedCategory?.id === cat.id ||
                  selectedCategoryName?.toLowerCase() === cat.name?.toLowerCase();
                return (
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
                        isSelected && supportStyles.modalSheetRowTxtActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                    {isSelected && <CheckIcon size={16} color={theme.colors.primary} />}
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

export default CategorySelectModal;
