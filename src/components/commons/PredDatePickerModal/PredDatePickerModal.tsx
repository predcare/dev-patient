import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { theme } from '../../../styled/theme.styled';

export interface PredDatePickerModalProps {
  visible: boolean;
  value?: Date;
  title?: string;
  onConfirm: (selectedDate: Date) => void;
  onCancel: () => void;
  onChange?: (date: Date) => void;
  minYear?: number;
  maxYear?: number;
  confirmText?: string;
  cancelText?: string;
  closeOnTouchOutside?: boolean;
}

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 3;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface WheelColumnProps<T> {
  data: T[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  renderLabel: (item: T) => string;
}

function WheelColumn<T>({ data, selectedIndex, onSelect, renderLabel }: WheelColumnProps<T>) {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (flatListRef.current && selectedIndex >= 0 && selectedIndex < data.length) {
      flatListRef.current.scrollToOffset({
        offset: selectedIndex * ITEM_HEIGHT,
        animated: true,
      });
    }
  }, [selectedIndex, data.length]);

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
    if (clampedIndex !== selectedIndex) {
      onSelect(clampedIndex);
    }
  };

  const handleItemPress = (index: number) => {
    if (index !== selectedIndex) {
      onSelect(index);
      flatListRef.current?.scrollToOffset({
        offset: index * ITEM_HEIGHT,
        animated: true,
      });
    }
  };

  return (
    <View style={PredDatePickerstyles.columnContainer}>
      <FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={(_, i) => i.toString()}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT, // Center single active item in middle row
        }}
        renderItem={({ item, index }) => {
          const isSelected = index === selectedIndex;
          return (
            <TouchableOpacity
              activeOpacity={0.7}
              style={PredDatePickerstyles.wheelItem}
              onPress={() => handleItemPress(index)}
            >
              <Text
                style={[
                  PredDatePickerstyles.wheelText,
                  isSelected
                    ? PredDatePickerstyles.selectedWheelText
                    : PredDatePickerstyles.unselectedWheelText,
                ]}
                numberOfLines={1}
              >
                {renderLabel(item)}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

export const PredDatePickerModal: React.FC<PredDatePickerModalProps> = React.memo(
  ({
    visible,
    value,
    title = 'Select date',
    onConfirm,
    onCancel,
    onChange,
    minYear = 1900,
    maxYear = new Date().getFullYear() + 10,
    confirmText = 'Done',
    cancelText = 'Cancel',
    closeOnTouchOutside = true,
  }) => {
    const initialDate = useMemo(() => {
      if (value && !isNaN(value.getTime())) {
        return value;
      }
      return new Date();
    }, [value]);

    const [selectedYear, setSelectedYear] = useState<number>(initialDate.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(initialDate.getMonth());
    const [selectedDay, setSelectedDay] = useState<number>(initialDate.getDate());

    // Sync state when modal becomes visible or value prop changes
    useEffect(() => {
      if (visible) {
        const d = value && !isNaN(value.getTime()) ? value : new Date();
        setSelectedYear(d.getFullYear());
        setSelectedMonth(d.getMonth());
        setSelectedDay(d.getDate());
      }
    }, [visible, value]);

    // Years list array from minYear to maxYear
    const years = useMemo(() => {
      const list: number[] = [];
      for (let y = minYear; y <= maxYear; y++) {
        list.push(y);
      }
      return list;
    }, [minYear, maxYear]);

    // Total days in the selected month & year
    const daysInMonth = useMemo(() => {
      return new Date(selectedYear, selectedMonth + 1, 0).getDate();
    }, [selectedYear, selectedMonth]);

    // Days list array 1..daysInMonth
    const days = useMemo(() => {
      const list: number[] = [];
      for (let d = 1; d <= daysInMonth; d++) {
        list.push(d);
      }
      return list;
    }, [daysInMonth]);

    // Automatically adjust selectedDay if month change makes day invalid (e.g. Mar 31 -> Feb 28)
    useEffect(() => {
      if (selectedDay > daysInMonth) {
        setSelectedDay(daysInMonth);
      }
    }, [daysInMonth, selectedDay]);

    // Trigger optional real-time onChange callback
    const handleDateChange = useCallback(
      (newDay: number, newMonth: number, newYear: number) => {
        if (onChange) {
          const maxDays = new Date(newYear, newMonth + 1, 0).getDate();
          const validDay = Math.min(newDay, maxDays);
          onChange(new Date(newYear, newMonth, validDay));
        }
      },
      [onChange]
    );

    const handleDaySelect = (index: number) => {
      const newDay = days[index] || 1;
      setSelectedDay(newDay);
      handleDateChange(newDay, selectedMonth, selectedYear);
    };

    const handleMonthSelect = (index: number) => {
      setSelectedMonth(index);
      handleDateChange(selectedDay, index, selectedYear);
    };

    const handleYearSelect = (index: number) => {
      const newYear = years[index] || new Date().getFullYear();
      setSelectedYear(newYear);
      handleDateChange(selectedDay, selectedMonth, newYear);
    };

    const handleConfirmPress = () => {
      const maxDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const validDay = Math.min(selectedDay, maxDays);
      const confirmedDate = new Date(selectedYear, selectedMonth, validDay);
      onConfirm(confirmedDate);
    };

    const yearIndex = Math.max(0, years.indexOf(selectedYear));
    const dayIndex = Math.max(0, days.indexOf(selectedDay));

    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
        <TouchableOpacity
          style={PredDatePickerstyles.overlay}
          activeOpacity={1}
          onPress={closeOnTouchOutside ? onCancel : undefined}
        >
          <TouchableWithoutFeedback>
            <View style={PredDatePickerstyles.cardContainer}>
              <Text style={PredDatePickerstyles.modalTitle}>{title}</Text>
              <View style={PredDatePickerstyles.columnHeaderRow}>
                <Text style={PredDatePickerstyles.columnHeaderText}>Day</Text>
                <Text style={PredDatePickerstyles.columnHeaderText}>Month</Text>
                <Text style={PredDatePickerstyles.columnHeaderText}>Year</Text>
              </View>
              <View style={PredDatePickerstyles.pickerWrapper}>
                <View style={PredDatePickerstyles.selectionHighlightPill} pointerEvents="none" />

                <View style={PredDatePickerstyles.wheelsRow}>
                  <WheelColumn
                    data={days}
                    selectedIndex={dayIndex}
                    onSelect={handleDaySelect}
                    renderLabel={item => item.toString()}
                  />
                  <WheelColumn
                    data={MONTH_NAMES}
                    selectedIndex={selectedMonth}
                    onSelect={handleMonthSelect}
                    renderLabel={item => item}
                  />
                  <WheelColumn
                    data={years}
                    selectedIndex={yearIndex}
                    onSelect={handleYearSelect}
                    renderLabel={item => item.toString()}
                  />
                </View>
              </View>
              <View style={PredDatePickerstyles.footerRow}>
                <TouchableOpacity
                  style={PredDatePickerstyles.actionBtn}
                  onPress={onCancel}
                  activeOpacity={0.7}
                >
                  <Text style={PredDatePickerstyles.cancelBtnText}>{cancelText}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={PredDatePickerstyles.actionBtn}
                  onPress={handleConfirmPress}
                  activeOpacity={0.7}
                >
                  <Text style={PredDatePickerstyles.confirmBtnText}>{confirmText}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    );
  }
);

export const PredDatePickerstyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cardContainer: {
    width: '90%',
    maxWidth: 340,
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    paddingTop: 22,
    paddingBottom: 18,
    paddingHorizontal: 20,
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  columnHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  columnHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  pickerWrapper: {
    height: WHEEL_HEIGHT,
    position: 'relative',
    justifyContent: 'center',
    marginVertical: 4,
  },
  selectionHighlightPill: {
    position: 'absolute',
    left: 4,
    right: 4,
    top: ITEM_HEIGHT,
    height: ITEM_HEIGHT,
    backgroundColor: theme.colors.primarySoft || '#F0FDFA',
    borderRadius: 12,
    zIndex: 0,
  },
  wheelsRow: {
    flexDirection: 'row',
    height: WHEEL_HEIGHT,
    zIndex: 1,
  },
  columnContainer: {
    flex: 1,
    height: WHEEL_HEIGHT,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  wheelText: {
    textAlign: 'center',
  },
  selectedWheelText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  unselectedWheelText: {
    fontSize: 15,
    fontWeight: '400',
    color: theme.colors.textMuted || '#94A3B8',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    paddingHorizontal: 8,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSlate || '#64748B',
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
});

export default PredDatePickerModal;
