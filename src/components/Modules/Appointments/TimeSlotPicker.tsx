import React, { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SlotGroups } from '../../../config/constants';
import { showErrorToast } from '../../../lib/common/toast.utils';
import { bookAppointmentStyles } from '../../../styled/BookAppointmentScreen.styled';
import { theme } from '../../../styled/theme.styled';
import { ITimeSlotsDoc } from '../../../typescripts/interfaces/doctors.interfaces';
import BookingSlotsSkeleton from '../../Skeletons/BookingSlotsSkeleton';

export interface TimeSlotPickerProps {
  availSlots: ITimeSlotsDoc[];
  selectedSlots?: ITimeSlotsDoc[];
  onSelectSlot?: (slot: ITimeSlotsDoc) => void;
  onSelectSlots?: (slots: ITimeSlotsDoc[]) => void;
  isLoading?: boolean;
  multiSelect?: boolean;
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

const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
};

const isSameSlot = (a: ITimeSlotsDoc, b: ITimeSlotsDoc): boolean => {
  return a.from === b.from && a.to === b.to;
};

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  availSlots,
  selectedSlots = [],
  onSelectSlot,
  onSelectSlots,
  isLoading,
  multiSelect = true,
}) => {
  const groupedSlots = useMemo(() => {
    const groups: Record<string, ITimeSlotsDoc[]> = {
      morning: [],
      afternoon: [],
      evening: [],
    };

    availSlots?.forEach(slot => {
      if (!slot.from) return;
      const fromHour = parseInt(slot.from.split(':')[0], 10);
      if (isNaN(fromHour)) return;
      if (fromHour < 12) groups.morning.push(slot);
      else if (fromHour < 17) groups.afternoon.push(slot);
      else groups.evening.push(slot);
    });

    return groups;
  }, [availSlots]);

  const handleSlotPress = (slot: ITimeSlotsDoc) => {
    if (!multiSelect) {
      const isSelected = selectedSlots.some(s => isSameSlot(s, slot));
      if (isSelected) {
        if (onSelectSlots) onSelectSlots([]);
      } else {
        if (onSelectSlots) onSelectSlots([slot]);
        if (onSelectSlot) onSelectSlot(slot);
      }
      return;
    }

    const selectedIndex = selectedSlots.findIndex(s => isSameSlot(s, slot));

    if (selectedIndex !== -1) {
      if (selectedSlots.length === 1) {
        const nextSelected: ITimeSlotsDoc[] = [];
        if (onSelectSlots) onSelectSlots(nextSelected);
      } else if (selectedIndex === 0) {
        const nextSelected = selectedSlots.slice(1);
        if (onSelectSlots) onSelectSlots(nextSelected);
        if (onSelectSlot && nextSelected[0]) onSelectSlot(nextSelected[0]);
      } else if (selectedIndex === selectedSlots.length - 1) {
        const nextSelected = selectedSlots.slice(0, -1);
        if (onSelectSlots) onSelectSlots(nextSelected);
      } else {
        showErrorToast('You can only unselect slots from the start or end of your selection.');
      }
      return;
    }

    if (selectedSlots.length === 0) {
      const nextSelected = [slot];
      if (onSelectSlots) onSelectSlots(nextSelected);
      if (onSelectSlot) onSelectSlot(slot);
      return;
    }
    const sortedSelected = [...selectedSlots].sort(
      (a, b) => timeToMinutes(a.from) - timeToMinutes(b.from)
    );

    const firstSelected = sortedSelected[0];
    const lastSelected = sortedSelected[sortedSelected.length - 1];

    const slotFromMin = timeToMinutes(slot.from);
    const slotToMin = timeToMinutes(slot.to);

    const firstFromMin = timeToMinutes(firstSelected.from);
    const lastToMin = timeToMinutes(lastSelected.to);
    const isPrepended = slotToMin === firstFromMin;
    const isAppended = slotFromMin === lastToMin;

    if (isPrepended || isAppended) {
      const nextSelected = [...selectedSlots, slot].sort(
        (a, b) => timeToMinutes(a.from) - timeToMinutes(b.from)
      );
      if (onSelectSlots) onSelectSlots(nextSelected);
      if (onSelectSlot && nextSelected[0]) onSelectSlot(nextSelected[0]);
    } else {
      showErrorToast('Please select consecutive time slots only.');
    }
  };

  if (isLoading) {
    return <BookingSlotsSkeleton slotsOnly />;
  }

  if (!availSlots || availSlots.length === 0) {
    return (
      <Text
        style={{
          fontSize: 13,
          color: theme.colors.textMuted,
          fontStyle: 'italic',
          marginBottom: 12,
          textAlign: 'center',
        }}
      >
        No slots available for this consultation type on this date.
      </Text>
    );
  }

  return (
    <View>
      {SlotGroups.filter(group => groupedSlots[group.key].length > 0).map(group => (
        <View key={group.key} style={bookAppointmentStyles.slotGroupContainer}>
          <Text style={bookAppointmentStyles.slotGroupTitle}>{group.title}</Text>
          <View style={bookAppointmentStyles.slotsGrid}>
            {groupedSlots[group.key].map((slot, idx) => {
              const isAvailable = slot.status === 'available' || !slot.status;
              const isSelected = selectedSlots.some(s => isSameSlot(s, slot));
              const slotText = `${formatTime12h(slot.from)} - ${formatTime12h(slot.to)}`;

              return (
                <TouchableOpacity
                  key={`${slot.from}-${slot.to}-${idx}`}
                  style={[
                    bookAppointmentStyles.slotBtn,
                    isSelected && bookAppointmentStyles.slotBtnActive,
                    !isAvailable && { opacity: 0.4, backgroundColor: '#F1F5F9' },
                  ]}
                  onPress={() => isAvailable && handleSlotPress(slot)}
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
