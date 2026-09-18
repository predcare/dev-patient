import React from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { bookAppointmentStyles } from '../../../styled/BookAppointmentScreen.styled';
import { theme } from '../../../styled/theme.styled';
import BookingSlotsSkeleton from '../../Skeletons/BookingSlotsSkeleton';
import { CalendarIcon } from '../../ui/icons';

export interface AvailableDatesPickerProps {
  dates: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenCalendar: () => void;
  isLoading?: boolean;
}

const formatDateChip = (dateStr: string) => {
  if (!dateStr) return { labelTop: '', labelBottom: '' };
  const dateObj = new Date(`${dateStr}T00:00:00`);
  if (isNaN(dateObj.getTime())) {
    return { labelTop: '', labelBottom: dateStr };
  }
  const labelTop = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
  const labelBottom = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return { labelTop, labelBottom };
};

export const AvailableDatesPicker: React.FC<AvailableDatesPickerProps> = ({
  dates,
  selectedDate,
  onSelectDate,
  onOpenCalendar,
  isLoading,
}) => {
  if (isLoading) {
    return <BookingSlotsSkeleton datesOnly />;
  }

  if (!dates || dates.length === 0) {
    return (
      <Text style={{ fontSize: 13, color: theme.colors.textMuted, fontStyle: 'italic', marginBottom: 12 }}>
        No available dates found for this doctor.
      </Text>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={bookAppointmentStyles.dateRow}
    >
      {dates.map(dateStr => {
        const active = dateStr === selectedDate;
        const formatted = formatDateChip(dateStr);
        return (
          <TouchableOpacity
            key={dateStr}
            style={[
              bookAppointmentStyles.dateChipCard,
              active && bookAppointmentStyles.dateChipCardActive,
            ]}
            onPress={() => onSelectDate(dateStr)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                bookAppointmentStyles.dateChipTopText,
                active && bookAppointmentStyles.dateChipTopTextActive,
              ]}
            >
              {formatted.labelTop}
            </Text>
            <Text
              style={[
                bookAppointmentStyles.dateChipBottomText,
                active && bookAppointmentStyles.dateChipBottomTextActive,
              ]}
            >
              {formatted.labelBottom}
            </Text>
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity
        style={bookAppointmentStyles.calendarIconBtn}
        onPress={onOpenCalendar}
        activeOpacity={0.8}
      >
        <CalendarIcon size={22} color={theme.colors.primaryDark} />
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AvailableDatesPicker;
