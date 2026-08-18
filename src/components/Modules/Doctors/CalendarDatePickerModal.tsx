import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { theme } from '../../../styled/theme.styled';
import { ChevronLeftIcon, ChevronRightIcon, CircleXIcon } from '../../ui/icons';

const MONTHS = [
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

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface CalendarDatePickerModalProps {
  visible: boolean;
  initialDate?: Date;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
}

export const CalendarDatePickerModal: React.FC<CalendarDatePickerModalProps> = ({
  visible,
  initialDate,
  onSelectDate,
  onClose,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(
    initialDate || new Date(2026, 7, 24)
  );
  const [selectedDay, setSelectedDay] = useState<number>(
    (initialDate || new Date(2026, 7, 24)).getDate()
  );

  const year = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();

  const firstDayOfWeek = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, monthIndex - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, monthIndex + 1, 1));
  };

  const handleDayPress = (day: number) => {
    setSelectedDay(day);
    const chosenDate = new Date(year, monthIndex, day);
    onSelectDate(chosenDate);
    onClose();
  };

  // Build grid days array including empty padding slots
  const daysGrid: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    daysGrid.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysGrid.push(d);
  }

  const today = new Date();
  const isCurrentMonthToday =
    today.getFullYear() === year && today.getMonth() === monthIndex;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Modal Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Select Date</Text>
                <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                  <CircleXIcon size={22} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Month Navigation */}
              <View style={styles.monthNav}>
                <TouchableOpacity
                  onPress={handlePrevMonth}
                  style={styles.arrowBtn}
                  activeOpacity={0.7}
                >
                  <ChevronLeftIcon size={20} color={theme.colors.primaryDark} />
                </TouchableOpacity>

                <Text style={styles.monthYearText}>
                  {MONTHS[monthIndex]} {year}
                </Text>

                <TouchableOpacity
                  onPress={handleNextMonth}
                  style={styles.arrowBtn}
                  activeOpacity={0.7}
                >
                  <ChevronRightIcon size={20} color={theme.colors.primaryDark} />
                </TouchableOpacity>
              </View>

              {/* Weekday Labels Header */}
              <View style={styles.weekdaysRow}>
                {WEEKDAYS.map(day => (
                  <Text key={day} style={styles.weekdayText}>
                    {day}
                  </Text>
                ))}
              </View>

              {/* Calendar Days Grid */}
              <View style={styles.grid}>
                {daysGrid.map((day, idx) => {
                  if (day === null) {
                    return <View key={`empty-${idx}`} style={styles.dayCellEmpty} />;
                  }

                  const isSelected = day === selectedDay;
                  const isToday = isCurrentMonthToday && today.getDate() === day;

                  return (
                    <TouchableOpacity
                      key={`day-${day}`}
                      style={[
                        styles.dayCell,
                        isToday && styles.dayCellToday,
                        isSelected && styles.dayCellSelected,
                      ]}
                      onPress={() => handleDayPress(day)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isToday && styles.dayTextToday,
                          isSelected && styles.dayTextSelected,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  arrowBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: theme.colors.primarySoft,
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellEmpty: {
    width: '14.28%',
    aspectRatio: 1,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderRadius: 20,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: theme.colors.primaryDark,
  },
  dayCellSelected: {
    backgroundColor: theme.colors.primaryDark,
  },
  dayText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  dayTextToday: {
    color: theme.colors.primaryDark,
    fontWeight: '700',
  },
  dayTextSelected: {
    color: theme.colors.surface,
    fontWeight: '700',
  },
});

export default CalendarDatePickerModal;
