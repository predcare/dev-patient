import { StyleSheet } from 'react-native';
import { theme } from './theme.styled';

export const CustomDropDownPickerStyles = StyleSheet.create({
  // Modal picker
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    maxHeight: '60%',
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.surfaceBorder,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  modalDivider: {
    height: 1,
    backgroundColor: theme.colors.surfaceBorder,
    marginBottom: 4,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  modalOptionActive: {
    backgroundColor: theme.colors.primarySoft,
  },
  modalOptionText: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  modalOptionTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default CustomDropDownPickerStyles;
