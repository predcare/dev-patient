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
      <Text
        style={{
          fontSize: 13,
          color: theme.colors.textMuted,
          fontStyle: 'italic',
          marginBottom: 12,
        }}
      >
        Please select a date to view available time slots.
      </Text>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <Text
        style={{
          fontSize: 13,
          color: theme.colors.textMuted,
          fontStyle: 'italic',
          marginBottom: 12,
        }}
      >
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

  const SLOT_GROUPS = [
    { title: 'MORNING', key: 'morning' },
    { title: 'AFTERNOON', key: 'afternoon' },
    { title: 'EVENING', key: 'evening' },
  ] as const;

  // Group filtered slots into MORNING, AFTERNOON, EVENING
  const groupedSlots = useMemo(() => {
    const groups: Record<string, ITimeSlotsDoc[]> = {
      morning: [],
      afternoon: [],
      evening: [],
    };

    filteredSlots.forEach(slot => {
      if (!slot.from) return;
      const fromHour = parseInt(slot.from.split(':')[0], 10);
      if (isNaN(fromHour)) return;
      if (fromHour < 12) groups.morning.push(slot);
      else if (fromHour < 17) groups.afternoon.push(slot);
      else groups.evening.push(slot);
    });

    return groups;
  }, [filteredSlots]);

  return (
    <View>
      {SLOT_GROUPS.filter(group => groupedSlots[group.key].length > 0).map(group => (
        <View key={group.key} style={bookAppointmentStyles.slotGroupContainer}>
          <Text style={bookAppointmentStyles.slotGroupTitle}>{group.title}</Text>
          <View style={bookAppointmentStyles.slotsGrid}>
            {groupedSlots[group.key].map((slot, idx) => {
              const isAvailable = slot.status === 'available' || !slot.status;
              const isSelected = selectedSlot?.from === slot.from && selectedSlot?.to === slot.to;
              const slotText = `${formatTime12h(slot.from)} - ${formatTime12h(slot.to)}`;

              return (
                <TouchableOpacity
                  key={slot.availability_id || `${slot.from}-${slot.to}-${idx}`}
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
        </View>
      ))}
    </View>
  );
};

export default TimeSlotPicker;
