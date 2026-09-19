import React, { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SlotGroups } from '../../../config/constants';
import { bookAppointmentStyles } from '../../../styled/BookAppointmentScreen.styled';
import { theme } from '../../../styled/theme.styled';
import { ITimeSlotsDoc } from '../../../typescripts/interfaces/doctors.interfaces';
import BookingSlotsSkeleton from '../../Skeletons/BookingSlotsSkeleton';

export interface TimeSlotPickerProps {
  slots: ITimeSlotsDoc[];
  selectedSlot?: ITimeSlotsDoc | null;
  selectedSlots?: ITimeSlotsDoc[];
  onSelectSlot?: (slot: ITimeSlotsDoc) => void;
  onSelectSlots?: (slots: ITimeSlotsDoc[]) => void;
  isLoading?: boolean;
  consultationType?: 'in-person' | 'video';
  multiSelect?: boolean;
  errorMessage?: string | null;
  onErrorChange?: (error: string | null) => void;
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
  slots,
  selectedSlot,
  selectedSlots: propSelectedSlots,
  onSelectSlot,
  onSelectSlots,
  isLoading,
  consultationType = 'in-person',
  multiSelect = true,
  errorMessage,
  onErrorChange,
}) => {
  const [internalError, setInternalError] = useState<string | null>(null);

  const errorMsg = errorMessage !== undefined ? errorMessage : internalError;
  const setError = (msg: string | null) => {
    setInternalError(msg);
    if (onErrorChange) {
      onErrorChange(msg);
    }
  };

  const activeSelectedSlots = useMemo(() => {
    if (propSelectedSlots !== undefined) {
      return propSelectedSlots;
    }
    if (selectedSlot) {
      return [selectedSlot];
    }
    return [];
  }, [propSelectedSlots, selectedSlot]);

  const filteredSlots = useMemo(() => {
    const matching = slots.filter(slot => {
      if (!slot.consultation_type) return true;
      return slot.consultation_type.toLowerCase() === consultationType.toLowerCase();
    });
    return matching.length > 0 ? matching : slots;
  }, [slots, consultationType]);

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

  const handleSlotPress = (slot: ITimeSlotsDoc) => {
    if (!multiSelect) {
      const isSelected = activeSelectedSlots.some(s => isSameSlot(s, slot));
      if (isSelected) {
        if (onSelectSlots) onSelectSlots([]);
        setError(null);
      } else {
        if (onSelectSlots) onSelectSlots([slot]);
        if (onSelectSlot) onSelectSlot(slot);
        setError(null);
      }
      return;
    }

    const selectedIndex = activeSelectedSlots.findIndex(s => isSameSlot(s, slot));

    // Case 1: Slot is already selected -> user is trying to UNSELECT
    if (selectedIndex !== -1) {
      if (activeSelectedSlots.length === 1) {
        // Unselect the only selected slot
        const nextSelected: ITimeSlotsDoc[] = [];
        if (onSelectSlots) onSelectSlots(nextSelected);
        setError(null);
      } else if (selectedIndex === 0) {
        // Unselect the first boundary slot
        const nextSelected = activeSelectedSlots.slice(1);
        if (onSelectSlots) onSelectSlots(nextSelected);
        if (onSelectSlot && nextSelected[0]) onSelectSlot(nextSelected[0]);
        setError(null);
      } else if (selectedIndex === activeSelectedSlots.length - 1) {
        // Unselect the last boundary slot
        const nextSelected = activeSelectedSlots.slice(0, -1);
        if (onSelectSlots) onSelectSlots(nextSelected);
        setError(null);
      } else {
        // Interior slot tapped -> unselecting would break consecutive range
        setError('You can only unselect slots from the start or end of your selection.');
      }
      return;
    }

    // Case 2: Slot is not selected -> user is trying to SELECT
    if (activeSelectedSlots.length === 0) {
      const nextSelected = [slot];
      if (onSelectSlots) onSelectSlots(nextSelected);
      if (onSelectSlot) onSelectSlot(slot);
      setError(null);
      return;
    }

    // Sort current selected slots chronologically
    const sortedSelected = [...activeSelectedSlots].sort(
      (a, b) => timeToMinutes(a.from) - timeToMinutes(b.from)
    );

    const firstSelected = sortedSelected[0];
    const lastSelected = sortedSelected[sortedSelected.length - 1];

    const slotFromMin = timeToMinutes(slot.from);
    const slotToMin = timeToMinutes(slot.to);

    const firstFromMin = timeToMinutes(firstSelected.from);
    const lastToMin = timeToMinutes(lastSelected.to);

    // Check if new slot is consecutive (either directly before first selected or directly after last selected)
    const isPrepended = slotToMin === firstFromMin;
    const isAppended = slotFromMin === lastToMin;

    if (isPrepended || isAppended) {
      const nextSelected = [...activeSelectedSlots, slot].sort(
        (a, b) => timeToMinutes(a.from) - timeToMinutes(b.from)
      );
      if (onSelectSlots) onSelectSlots(nextSelected);
      if (onSelectSlot && nextSelected[0]) onSelectSlot(nextSelected[0]);
      setError(null);
    } else {
      setError('Please select consecutive time slots only.');
    }
  };

  if (isLoading) {
    return <BookingSlotsSkeleton slotsOnly />;
  }

  if (!slots || slots?.length === 0) {
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
        No slots available on this date.
      </Text>
    );
  }

  return (
    <View>
      {errorMsg ? (
        <View
          style={{
            backgroundColor: '#FEF2F2',
            borderWidth: 1,
            borderColor: '#FCA5A5',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: '#DC2626', fontSize: 13, fontWeight: '500', textAlign: 'center' }}>
            {errorMsg}
          </Text>
        </View>
      ) : null}

      {SlotGroups.filter(group => groupedSlots[group.key].length > 0).map(group => (
        <View key={group.key} style={bookAppointmentStyles.slotGroupContainer}>
          <Text style={bookAppointmentStyles.slotGroupTitle}>{group.title}</Text>
          <View style={bookAppointmentStyles.slotsGrid}>
            {groupedSlots[group.key].map((slot, idx) => {
              const isAvailable = slot.status === 'available' || !slot.status;
              const isSelected = activeSelectedSlots.some(s => isSameSlot(s, slot));
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

