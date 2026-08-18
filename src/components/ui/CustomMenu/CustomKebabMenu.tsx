import React, { useState } from 'react';
import {
  Modal,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { ThreeDotsIcon } from '../icons';

export interface CustomKebabMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  onPress: () => void;
}

export interface CustomKebabMenuProps {
  items: CustomKebabMenuItem[];
  triggerStyle?: StyleProp<ViewStyle>;
  iconColor?: string;
}

export const CustomKebabMenu: React.FC<CustomKebabMenuProps> = ({
  items,
  triggerStyle,
  iconColor = '#64748B',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleItemPress = (item: CustomKebabMenuItem) => {
    setIsOpen(false);
    item.onPress();
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.triggerBtn, triggerStyle]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.75}
      >
        <ThreeDotsIcon size={18} color={iconColor} />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.menuContainer}>
            {items.map((item, idx) => {
              const itemColor = item.color || '#64748B';
              const isLast = idx === items.length - 1;

              return (
                <React.Fragment key={item.id}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleItemPress(item)}
                    activeOpacity={0.8}
                  >
                    {item.icon && <View style={styles.iconContainer}>{item.icon}</View>}
                    <Text style={[styles.menuItemText, { color: itemColor }]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                  {!isLast && <View style={styles.divider} />}
                </React.Fragment>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  triggerBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  menuContainer: {
    width: '85%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 6,
    elevation: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  iconContainer: {
    marginRight: 14,
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
  },
});

export default CustomKebabMenu;
