import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import { CalendarIcon } from '../../ui/icons';
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

const ITEM_HEIGHT = 46;
const VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS; // 230px
const PADDING_VERTICAL = ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2); // 92px

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
  renderLabel?: (item: T) => string;
  visible?: boolean;
  style?: ViewStyle;
}

function WheelColumn<T>({
  data,
  selectedIndex,
  onSelect,
  renderLabel,
  visible,
  style,
}: WheelColumnProps<T>) {
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const isUserScrolling = useRef(false);
  const lastReportedIndex = useRef(selectedIndex);

  // Sync scroll position when selectedIndex changes externally (not during user drag/momentum)
  useEffect(() => {
    if (isUserScrolling.current) return;
    if (selectedIndex >= 0 && selectedIndex < data.length) {
      if (lastReportedIndex.current !== selectedIndex) {
        lastReportedIndex.current = selectedIndex;
        scrollRef.current?.scrollTo({
          y: selectedIndex * ITEM_HEIGHT,
          animated: true,
        });
      }
    }
  }, [selectedIndex, data.length]);

  // When modal becomes visible, ensure exact alignment without jump
  useEffect(() => {
    if (visible) {
      lastReportedIndex.current = selectedIndex;
      const timer = setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: Math.max(0, selectedIndex * ITEM_HEIGHT),
          animated: false,
        });
      }, 40);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const commitIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(data.length - 1, index));
    if (clamped !== lastReportedIndex.current) {
      lastReportedIndex.current = clamped;
      onSelect(clamped);
    }
  };

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    isUserScrolling.current = false;
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    commitIndex(index);
  };

  const handleScrollEndDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const velocityY = e.nativeEvent.velocity?.y ?? 0;
    // If released gently with low momentum, handle snapping immediately
    if (Math.abs(velocityY) < 0.1) {
      isUserScrolling.current = false;
      const offsetY = e.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(data.length - 1, index));
      scrollRef.current?.scrollTo({
        y: clamped * ITEM_HEIGHT,
        animated: true,
      });
      commitIndex(clamped);
    }
  };

  const handleItemPress = (index: number) => {
    isUserScrolling.current = false;
    commitIndex(index);
    scrollRef.current?.scrollTo({
      y: index * ITEM_HEIGHT,
      animated: true,
    });
  };

  return (
    <View style={[PredDatePickerstyles.columnContainer, style]}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="center"
        decelerationRate="fast"
        nestedScrollEnabled={true}
        overScrollMode="never"
        scrollEventThrottle={16}
        contentOffset={{ x: 0, y: Math.max(0, selectedIndex * ITEM_HEIGHT) }}
        onScrollBeginDrag={() => {
          isUserScrolling.current = true;
        }}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollEndDrag={handleScrollEndDrag}
        contentContainerStyle={{
          paddingVertical: PADDING_VERTICAL,
        }}
      >
        {data.map((item, index) => {
          const distance = Math.abs(index - selectedIndex);
          const isSelected = distance === 0;

          return (
            <TouchableOpacity
              key={`${item}-${index}`}
              activeOpacity={0.7}
              style={PredDatePickerstyles.wheelItem}
              onPress={() => handleItemPress(index)}
            >
              <Text
                style={[
                  PredDatePickerstyles.wheelText,
                  isSelected
                    ? PredDatePickerstyles.selectedWheelText
                    : distance === 1
                    ? PredDatePickerstyles.nearWheelText
                    : PredDatePickerstyles.farWheelText,
                ]}
                numberOfLines={1}
              >
                {renderLabel ? renderLabel(item) : String(item)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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

    // Live formatted display date for preview header
    const formattedDisplayDate = useMemo(() => {
      const maxDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const validDay = Math.min(selectedDay, maxDays);
      return dayjs(new Date(selectedYear, selectedMonth, validDay)).format('DD MMMM YYYY');
    }, [selectedYear, selectedMonth, selectedDay]);

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

              {/* Formatted live preview badge */}
              <View style={PredDatePickerstyles.dateBadge}>
                <CalendarIcon size={14} color={theme.colors.primary} />
                <Text style={PredDatePickerstyles.dateBadgeText}>{formattedDisplayDate}</Text>
              </View>

              {/* Column headers */}
              <View style={PredDatePickerstyles.columnHeaderRow}>
                <Text style={[PredDatePickerstyles.columnHeaderText, { flex: 1 }]}>Day</Text>
                <Text style={[PredDatePickerstyles.columnHeaderText, { flex: 1.8 }]}>Month</Text>
                <Text style={[PredDatePickerstyles.columnHeaderText, { flex: 1.2 }]}>Year</Text>
              </View>

              {/* Wheels */}
              <View style={PredDatePickerstyles.pickerWrapper}>
                <View style={PredDatePickerstyles.selectionHighlightPill} pointerEvents="none" />

                <View style={PredDatePickerstyles.wheelsRow}>
                  <WheelColumn
                    style={PredDatePickerstyles.dayColumn}
                    data={days}
                    selectedIndex={dayIndex}
                    onSelect={handleDaySelect}
                    renderLabel={item => String(item).padStart(2, '0')}
                    visible={visible}
                  />
                  <WheelColumn
                    style={PredDatePickerstyles.monthColumn}
                    data={MONTH_NAMES}
                    selectedIndex={selectedMonth}
                    onSelect={handleMonthSelect}
                    renderLabel={item => item}
                    visible={visible}
                  />
                  <WheelColumn
                    style={PredDatePickerstyles.yearColumn}
                    data={years}
                    selectedIndex={yearIndex}
                    onSelect={handleYearSelect}
                    renderLabel={item => String(item)}
                    visible={visible}
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={PredDatePickerstyles.footerRow}>
                <TouchableOpacity
                  style={PredDatePickerstyles.cancelBtn}
                  onPress={onCancel}
                  activeOpacity={0.7}
                >
                  <Text style={PredDatePickerstyles.cancelBtnText}>{cancelText}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={PredDatePickerstyles.confirmBtn}
                  onPress={handleConfirmPress}
                  activeOpacity={0.85}
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
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  cardContainer: {
    width: '92%',
    maxWidth: 360,
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    paddingTop: 22,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: theme.colors.cardShadow || '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 6,
    backgroundColor: theme.colors.primarySoft || '#F0FDFA',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.18)',
  },
  dateBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primaryDark || '#0F766E',
  },
  columnHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  columnHeaderText: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textMuted || '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pickerWrapper: {
    height: WHEEL_HEIGHT,
    position: 'relative',
    justifyContent: 'center',
    marginVertical: 4,
    overflow: 'hidden',
  },
  selectionHighlightPill: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: ITEM_HEIGHT * 2,
    height: ITEM_HEIGHT,
    backgroundColor: theme.colors.primarySoft || '#F0FDFA',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(13, 148, 136, 0.22)',
    zIndex: 0,
  },
  wheelsRow: {
    flexDirection: 'row',
    height: WHEEL_HEIGHT,
    zIndex: 1,
  },
  columnContainer: {
    height: WHEEL_HEIGHT,
  },
  dayColumn: {
    flex: 1,
  },
  monthColumn: {
    flex: 1.8,
  },
  yearColumn: {
    flex: 1.2,
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
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primaryDark || '#0D9488',
  },
  nearWheelText: {
    fontSize: 14.5,
    fontWeight: '500',
    color: theme.colors.textPrimary || '#1E293B',
    opacity: 0.55,
  },
  farWheelText: {
    fontSize: 13.5,
    fontWeight: '400',
    color: theme.colors.textMuted || '#94A3B8',
    opacity: 0.28,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceSecondary || '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textSecondary || '#475569',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryDark || '#0D9488',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.surface || '#FFFFFF',
  },
});

export default PredDatePickerModal;
