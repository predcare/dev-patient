import React from 'react';
import { Image, Modal, TouchableOpacity, View } from 'react-native';
import { supportStyles } from '../../../styled/SupportScreen.styled';
import { theme } from '../../../styled/theme.styled';
import { CircleXIcon } from '../../ui/icons';

export interface AttachmentPreviewModalProps {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
}

export const AttachmentPreviewModal: React.FC<AttachmentPreviewModalProps> = ({
  visible,
  imageUri,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={supportStyles.modalBg}>
        <TouchableOpacity
          style={supportStyles.modalCloseBtn}
          onPress={onClose}
        >
          <CircleXIcon size={28} color={theme.colors.surface} />
        </TouchableOpacity>
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={supportStyles.modalImg}
            resizeMode="contain"
          />
        )}
      </View>
    </Modal>
  );
};

export default AttachmentPreviewModal;
