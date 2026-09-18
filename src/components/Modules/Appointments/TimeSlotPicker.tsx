import React, { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { bookAppointmentStyles } from '../../../styled/BookAppointmentScreen.styled';
import { theme } from '../../../styled/theme.styled';
import { ITimeSlotsDoc } from '../../../typescripts/interfaces/doctors.interfaces';
import BookingSlotsSkeleton from '../../Skeletons/BookingSlotsSkeleton';

export interface TimeSlotPickerProps {
  slots: ITimeSlotsDoc[];
  selectedSlot: ITimeSlotsDoc | null;
  onSelectSlot: (slot: ITimeSlotsDoc) => void;
  isLoading?: boolean;
  selectedDate?: string;
  consultationType?: 'in-person' | 'video';
}

const formatTime12h = (timeStr: string): string => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1] || '00';
  if (isNaN(hours)) return timeStr;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
  return `${formattedHours}:${minutes} ${ampm}`;
};

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading,
  selectedDate,
  consultationType = 'in-person',
}) => {
  if (isLoading) {
    return <BookingSlotsSkeleton slotsOnly />;
  }

  if (!selectedDate) {
    return (
      <Text style={{ fontSize: 13, color: theme.colors.textMuted, fontStyle: 'italic', marginBottom: 12 }}>
        Please select a date to view available time slots.
      </Text>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <Text style={{ fontSize: 13, color: theme.colors.textMuted, fontStyle: 'italic', marginBottom: 12 }}>
        No slots available on this date.
      </Text>
    );
  }

  // Filter slots by consultation type if matching exists
  const filteredSlots = useMemo(() => {
    const matching = slots.filter(slot => {
      if (!slot.consultation_type) return true;
      return slot.consultation_type.toLowerCase() === consultationType.toLowerCase();
    });
    return matching.length > 0 ? matching : slots;
  }, [slots, consultationType]);

  // Group into MORNING, AFTERNOON, EVENING
  const groupedSlots = useMemo(() => {
    const morning: ITimeSlotsDoc[] = [];
    const afternoon: ITimeSlotsDoc[] = [];
    const evening: ITimeSlotsDoc[] = [];

    filteredSlots.forEach(slot => {
      if (!slot.from) return;
      const fromHour = parseInt(slot.from.split(':')[0], 10);
      if (isNaN(fromHour)) return;
      if (fromHour < 12) {
        morning.push(slot);
      } else if (fromHour < 17) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return { morning, afternoon, evening };
  }, [filteredSlots]);

  const renderSlotGroup = (title: string, groupSlots: ITimeSlotsDoc[]) => (
    <View style={{ marginBottom: 14 }}>
      <Text style={bookAppointmentStyles.slotGroupTitle}>{title}</Text>
      {groupSlots.length === 0 ? (
        <Text
          style={{
            fontSize: 13,
            color: theme.colors.textMuted,
            fontStyle: 'italic',
            marginBottom: 8,
          }}
        >
          No slots available for this time period.
        </Text>
      ) : (
        <View style={bookAppointmentStyles.slotsGrid}>
          {groupSlots.map((slot, idx) => {
            const isAvailable = slot.status === 'available' || !slot.status;
            const isSelected =
              selectedSlot?.from === slot.from && selectedSlot?.to === slot.to;
            const slotText = `${formatTime12h(slot.from)} - ${formatTime12h(slot.to)}`;

            return (
              <TouchableOpacity
                key={`${slot.from}-${slot.to}-${idx}`}
                style={[
                  bookAppointmentStyles.slotBtn,
                  isSelected && bookAppointmentStyles.slotBtnActive,
                  !isAvailable && { opacity: 0.4, backgroundColor: '#F1F5F9' },
                ]}
                onPress={() => isAvailable && onSelectSlot(slot)}
                disabled={!isAvailable}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    bookAppointmentStyles.slotText,
                    isSelected && bookAppointmentStyles.slotTextActive,
                    !isAvailable && { color: theme.colors.textMuted },
                  ]}
                >
                  {slotText}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );

  return (
    <View>
      {renderSlotGroup('MORNING', groupedSlots.morning)}
      {renderSlotGroup('AFTERNOON', groupedSlots.afternoon)}
      {renderSlotGroup('EVENING', groupedSlots.evening)}
    </View>
  );
};

export default TimeSlotPicker;
