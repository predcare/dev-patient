import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../../styled/theme.styled';
import { AlertIcon } from '../../ui/icons';

export interface AppointmentDeleteModalProps {
  visible: boolean;
  appointment?: any;
  onClose: () => void;
  onConfirmDelete: (appointment: any) => void;
}

export const AppointmentDeleteModal: React.FC<AppointmentDeleteModalProps> = ({
  visible,
  appointment,
  onClose,
  onConfirmDelete,
}) => {
  if (!appointment) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.iconCircle}>
            <AlertIcon size={28} color={theme.colors.danger} />
          </View>
          <Text style={styles.title}>Delete Appointment Record?</Text>
          <Text style={styles.message}>
            Permanently remove record for Dr. {appointment.doctor_name || 'Doctor'}? This action cannot be undone.
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.cancelBtnText}>Keep Record</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => {
                onClose();
                onConfirmDelete(appointment);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  confirmBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: theme.colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.surface,
  },
});

export default AppointmentDeleteModal;
