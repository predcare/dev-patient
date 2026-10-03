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
import { theme } from '../../../styled/theme.styled';

export interface DatePickerProps {
  visible: boolean;
  value: Date;
  onChange: (d: Date) => void;
  onClose: () => void;
  title?: string;
}

export const DatePickerModal: React.FC<DatePickerProps> = React.memo(
  ({
    visible,
    value,
    onChange,
    onClose,
    title = 'Date of Birth',
  }) => {
    const years = Array.from(
      { length: 100 },
      (_, i) => new Date().getFullYear() - i
    );
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    const validDate = value && !isNaN(value.getTime()) ? value : new Date(2000, 0, 1);

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.sheetHead}>
                <Text style={styles.sheetTitle}>{title}</Text>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.sheetX}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', height: 260 }}>
                {/* Days Column */}
                <FlatList
                  data={days}
                  keyExtractor={item => item.toString()}
                  style={{ flex: 1 }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => {
                    const sel = validDate.getDate() === item;
                    return (
                      <TouchableOpacity
                        style={[styles.dateOpt, sel && styles.dateOptSel]}
                        onPress={() => {
                          const nd = new Date(validDate);
                          nd.setDate(item);
                          onChange(nd);
                        }}
                      >
                        <Text
                          style={[
                            styles.dateOptTxt,
                            sel && styles.dateOptSelTxt,
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />

                {/* Months Column */}
                <FlatList
                  data={months}
                  keyExtractor={item => item}
                  style={{ flex: 1 }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item, index }) => {
                    const sel = validDate.getMonth() === index;
                    return (
                      <TouchableOpacity
                        style={[styles.dateOpt, sel && styles.dateOptSel]}
                        onPress={() => {
                          const nd = new Date(validDate);
                          nd.setMonth(index);
                          onChange(nd);
                        }}
                      >
                        <Text
                          style={[
                            styles.dateOptTxt,
                            sel && styles.dateOptSelTxt,
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />

                {/* Years Column */}
                <FlatList
                  data={years}
                  keyExtractor={item => item.toString()}
                  style={{ flex: 1 }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => {
                    const sel = validDate.getFullYear() === item;
                    return (
                      <TouchableOpacity
                        style={[styles.dateOpt, sel && styles.dateOptSel]}
                        onPress={() => {
                          const nd = new Date(validDate);
                          nd.setFullYear(item);
                          onChange(nd);
                        }}
                      >
                        <Text
                          style={[
                            styles.dateOptTxt,
                            sel && styles.dateOptSelTxt,
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
              <TouchableOpacity
                style={styles.doneBtn}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.doneTxt}>Done</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
  },
  sheetHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.dark,
  },
  sheetX: {
    fontSize: 20,
    color: theme.colors.textMuted,
    fontWeight: 'bold',
  },
  dateOpt: {
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.bg,
  },
  dateOptSel: {
    backgroundColor: theme.colors.primarySoft,
  },
  dateOptTxt: {
    fontSize: 15,
    fontWeight: '400',
    color: theme.colors.dark,
  },
  dateOptSelTxt: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold,
  },
  doneBtn: {
    backgroundColor: theme.colors.primary,
    margin: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneTxt: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 0.3,
  },
});

export default DatePickerModal;
