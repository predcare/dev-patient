import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  BackIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  MapPinIcon,
  MoonIcon,
  SunIcon,
} from '../../components/ui/icons';
import { rescheduleStyles } from '../../styled/RescheduleAppointmentScreen.styled';
import { theme } from '../../styled/theme.styled';

interface DateOption {
  dateStr: string;
  dayName: string;
  dayNum: string;
  monthName: string;
  longFormat: string;
}

interface TimeSlotOption {
  id: string;
  label: string;
  period: 'morning' | 'afternoon' | 'evening';
  booked?: boolean;
}

const MOCK_DATE_OPTIONS: DateOption[] = [
  { dateStr: '2026-08-25', dayName: 'TUE', dayNum: '25', monthName: 'August 2026', longFormat: 'Tuesday, Aug 25, 2026' },
  { dateStr: '2026-08-26', dayName: 'WED', dayNum: '26', monthName: 'August 2026', longFormat: 'Wednesday, Aug 26, 2026' },
  { dateStr: '2026-08-27', dayName: 'THU', dayNum: '27', monthName: 'August 2026', longFormat: 'Thursday, Aug 27, 2026' },
  { dateStr: '2026-08-28', dayName: 'FRI', dayNum: '28', monthName: 'August 2026', longFormat: 'Friday, Aug 28, 2026' },
  { dateStr: '2026-08-29', dayName: 'SAT', dayNum: '29', monthName: 'August 2026', longFormat: 'Saturday, Aug 29, 2026' },
  { dateStr: '2026-08-31', dayName: 'MON', dayNum: '31', monthName: 'August 2026', longFormat: 'Monday, Aug 31, 2026' },
];

const MOCK_TIME_SLOTS: TimeSlotOption[] = [
  { id: 't1', label: '09:30 AM', period: 'morning' },
  { id: 't2', label: '10:00 AM', period: 'morning' },
  { id: 't3', label: '10:30 AM', period: 'morning', booked: true },
  { id: 't4', label: '11:15 AM', period: 'morning' },
  { id: 't5', label: '02:00 PM', period: 'afternoon' },
  { id: 't6', label: '02:30 PM', period: 'afternoon' },
  { id: 't7', label: '03:15 PM', period: 'afternoon' },
  { id: 't8', label: '05:00 PM', period: 'evening' },
  { id: 't9', label: '05:30 PM', period: 'evening' },
];

export const RescheduleAppointmentScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const appointment = route.params?.appointment || {
    id: 1001,
    appointment_id: 'APT-99201',
    doctor_name: 'Dr. Sarah Jenkins',
    specialization: 'Cardiologist • MD',
    clinic_name: 'ST. JUDE MEDICAL CENTER',
    appointment_date_label: 'Monday, Aug 24, 2026',
    start_time: '10:30 AM',
    end_time: '11:00 AM',
    consultation_type: 'video',
  };

  const [selectedDate, setSelectedDate] = useState<string>('2026-08-26');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('t5');
  const [reason, setReason] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [rescheduling, setRescheduling] = useState<boolean>(false);

  const selectedDateObj = MOCK_DATE_OPTIONS.find(d => d.dateStr === selectedDate) || MOCK_DATE_OPTIONS[1];
  const selectedSlotObj = MOCK_TIME_SLOTS.find(t => t.id === selectedSlotId) || MOCK_TIME_SLOTS[4];

  const handleConfirmReschedule = () => {
    setRescheduling(true);
    setTimeout(() => {
      setRescheduling(false);
      setIsSuccess(true);
    }, 600);
  };

  const goAppointments = () => {
    navigation.navigate('MainTabs', { screen: 'Schedule' });
  };

  const getInitials = (name: string) => {
    if (!name) return 'D';
    const cleaned = name.replace(/^Dr\.?\s*/i, '').trim();
    const parts = cleaned.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return cleaned[0].toUpperCase();
  };

  const morningSlots = MOCK_TIME_SLOTS.filter(s => s.period === 'morning');
  const afternoonSlots = MOCK_TIME_SLOTS.filter(s => s.period === 'afternoon');
  const eveningSlots = MOCK_TIME_SLOTS.filter(s => s.period === 'evening');

  // Success Confirmation Screen
  if (isSuccess) {
    return (
      <SafeAreaView style={rescheduleStyles.screen}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 14,
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.surfaceBorder,
          }}
        >
          <TouchableOpacity onPress={goAppointments} activeOpacity={0.7} style={{ padding: 4 }}>
            <BackIcon size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary }}>
            Confirmation
          </Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          contentContainerStyle={rescheduleStyles.successScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={rescheduleStyles.successHero}>
            <View style={rescheduleStyles.checkHaloOuter}>
              <View style={rescheduleStyles.checkHaloInner}>
                <View style={rescheduleStyles.checkCircle}>
                  <CheckIcon size={36} color={theme.colors.surface} />
                </View>
              </View>
            </View>
            <Text style={rescheduleStyles.successTitle}>Reschedule Successful!</Text>
            <Text style={rescheduleStyles.successSub}>
              Your appointment has been successfully updated with new date & time.
            </Text>
          </View>

          {/* Success Card Details */}
          <View style={rescheduleStyles.successCard}>
            <View style={rescheduleStyles.successIdRow}>
              <Text style={rescheduleStyles.successIdLbl}>APPOINTMENT ID</Text>
              <Text style={rescheduleStyles.successIdVal}>
                ID - {appointment.appointment_id || appointment.id}
              </Text>
            </View>

            <View style={rescheduleStyles.successDivider} />

            <View style={rescheduleStyles.successDoctorRow}>
              <View style={rescheduleStyles.avatarLg}>
                <Text style={rescheduleStyles.avatarLgTxt}>
                  {getInitials(appointment.doctor_name)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={rescheduleStyles.successDoctorName}>{appointment.doctor_name}</Text>
                <Text style={rescheduleStyles.successSpec}>{appointment.specialization}</Text>
              </View>
            </View>

            {/* Info Mint: New Date & Time */}
            <View style={rescheduleStyles.infoMint}>
              <CalendarIcon size={20} color={theme.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={rescheduleStyles.infoMintLbl}>NEW DATE & TIME</Text>
                <Text style={rescheduleStyles.infoMintDate}>
                  {selectedDateObj.dayName}, {selectedDateObj.dayNum} Aug 2026
                </Text>
                <Text style={rescheduleStyles.infoMintTime}>{selectedSlotObj.label}</Text>
              </View>
            </View>

            {/* Info Blue: Consultation Mode & Clinic */}
            <View style={rescheduleStyles.infoBlue}>
              <MapPinIcon size={20} color={theme.colors.info} />
              <View style={{ flex: 1 }}>
                <Text style={rescheduleStyles.infoBlueLbl}>CONSULTATION</Text>
                <Text style={rescheduleStyles.infoBlueTitle}>
                  {appointment.consultation_type === 'video' ? 'Video Consultation' : 'In-Person Visit'}
                </Text>
                <Text style={rescheduleStyles.infoBlueSub}>
                  {appointment.clinic_name || 'ST. JUDE MEDICAL CENTER'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={rescheduleStyles.bottomBar}>
          <TouchableOpacity
            style={rescheduleStyles.primaryBtn}
            onPress={goAppointments}
            activeOpacity={0.85}
          >
            <Text style={rescheduleStyles.primaryBtnTxt}>Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={rescheduleStyles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />

      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.surfaceBorder,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={{ padding: 4 }}>
          <BackIcon size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary }}>
          Reschedule Appointment
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={rescheduleStyles.scroll}
        contentContainerStyle={rescheduleStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Appointment Box (Exact Reference Design) */}
        <View style={rescheduleStyles.currentCard}>
          <View style={rescheduleStyles.avatar}>
            <Text style={rescheduleStyles.avatarTxt}>{getInitials(appointment.doctor_name)}</Text>
          </View>
          <View style={rescheduleStyles.currentInfo}>
            <Text style={rescheduleStyles.currentLbl}>CURRENT APPOINTMENT</Text>
            <Text style={rescheduleStyles.currentDoctor}>{appointment.doctor_name}</Text>
            {!!appointment.specialization && (
              <Text style={rescheduleStyles.currentSpec}>{appointment.specialization}</Text>
            )}
            <View style={rescheduleStyles.metaRow}>
              <CalendarIcon size={14} color={theme.colors.textPrimary} />
              <Text style={rescheduleStyles.metaTxt}>
                {appointment.appointment_date_label || 'Monday, Aug 24, 2026'}
              </Text>
            </View>
            <View style={rescheduleStyles.metaRow}>
              <ClockIcon size={14} color={theme.colors.textPrimary} />
              <Text style={rescheduleStyles.metaTxt}>
                {appointment.start_time ? `${appointment.start_time} - ${appointment.end_time || '11:00 AM'}` : '10:30 AM - 11:00 AM'}
              </Text>
            </View>
          </View>
        </View>

        {/* Date Selector Section */}
        <View style={rescheduleStyles.section}>
          <View style={rescheduleStyles.sectionHeader}>
            <Text style={rescheduleStyles.sectionTitle}>Select New Date</Text>
            <Text style={rescheduleStyles.monthLbl}>{selectedDateObj.monthName}</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={rescheduleStyles.dateRow}>
            {MOCK_DATE_OPTIONS.map(item => {
              const selected = selectedDate === item.dateStr;
              return (
                <TouchableOpacity
                  key={item.dateStr}
                  style={[rescheduleStyles.dateChip, selected && rescheduleStyles.dateChipSelected]}
                  onPress={() => setSelectedDate(item.dateStr)}
                  activeOpacity={0.8}
                >
                  <Text style={[rescheduleStyles.dateChipDay, selected && rescheduleStyles.dateChipTxtSelected]}>
                    {item.dayName}
                  </Text>
                  <Text style={[rescheduleStyles.dateChipNum, selected && rescheduleStyles.dateChipTxtSelected]}>
                    {item.dayNum}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Time Slots Section */}
        <View style={rescheduleStyles.section}>
          <Text style={rescheduleStyles.sectionTitle}>Select New Time</Text>

          {/* Morning Slots */}
          <View style={rescheduleStyles.slotGroup}>
            <View style={rescheduleStyles.slotGroupHeader}>
              <SunIcon size={14} color={theme.colors.textSecondary} />
              <Text style={rescheduleStyles.slotGroupTitle}>MORNING</Text>
            </View>
            <View style={rescheduleStyles.timeGrid}>
              {morningSlots.map(slot => {
                const selected = selectedSlotId === slot.id;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    disabled={slot.booked}
                    style={[
                      rescheduleStyles.timeChip,
                      selected && rescheduleStyles.timeChipSelected,
                      slot.booked && rescheduleStyles.timeChipBooked,
                    ]}
                    onPress={() => setSelectedSlotId(slot.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        rescheduleStyles.timeChipTxt,
                        selected && rescheduleStyles.timeChipTxtSelected,
                        slot.booked && rescheduleStyles.timeChipTxtMuted,
                      ]}
                    >
                      {slot.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Afternoon Slots */}
          <View style={rescheduleStyles.slotGroup}>
            <View style={rescheduleStyles.slotGroupHeader}>
              <SunIcon size={14} color={theme.colors.textSecondary} solid />
              <Text style={rescheduleStyles.slotGroupTitle}>AFTERNOON</Text>
            </View>
            <View style={rescheduleStyles.timeGrid}>
              {afternoonSlots.map(slot => {
                const selected = selectedSlotId === slot.id;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    disabled={slot.booked}
                    style={[
                      rescheduleStyles.timeChip,
                      selected && rescheduleStyles.timeChipSelected,
                      slot.booked && rescheduleStyles.timeChipBooked,
                    ]}
                    onPress={() => setSelectedSlotId(slot.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        rescheduleStyles.timeChipTxt,
                        selected && rescheduleStyles.timeChipTxtSelected,
                        slot.booked && rescheduleStyles.timeChipTxtMuted,
                      ]}
                    >
                      {slot.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Evening Slots */}
          <View style={rescheduleStyles.slotGroup}>
            <View style={rescheduleStyles.slotGroupHeader}>
              <MoonIcon size={14} color={theme.colors.textSecondary} />
              <Text style={rescheduleStyles.slotGroupTitle}>EVENING</Text>
            </View>
            <View style={rescheduleStyles.timeGrid}>
              {eveningSlots.map(slot => {
                const selected = selectedSlotId === slot.id;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    disabled={slot.booked}
                    style={[
                      rescheduleStyles.timeChip,
                      selected && rescheduleStyles.timeChipSelected,
                      slot.booked && rescheduleStyles.timeChipBooked,
                    ]}
                    onPress={() => setSelectedSlotId(slot.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        rescheduleStyles.timeChipTxt,
                        selected && rescheduleStyles.timeChipTxtSelected,
                        slot.booked && rescheduleStyles.timeChipTxtMuted,
                      ]}
                    >
                      {slot.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Reason for Rescheduling */}
        <View style={rescheduleStyles.section}>
          <Text style={rescheduleStyles.reasonLbl}>Reason for Rescheduling (Optional)</Text>
          <TextInput
            style={rescheduleStyles.reasonInput}
            placeholder="Tell us why you are rescheduling..."
            placeholderTextColor={theme.colors.textMuted}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* New Appointment Summary Box (Exact Reference Design) */}
        <View style={rescheduleStyles.summaryCard}>
          <View style={{ flex: 1 }}>
            <Text style={rescheduleStyles.summaryLbl}>NEW APPOINTMENT SUMMARY</Text>
            <Text style={rescheduleStyles.summaryDate}>{selectedDateObj.longFormat}</Text>
            <Text style={rescheduleStyles.summaryTime}>{selectedSlotObj.label}</Text>
          </View>
          <View style={rescheduleStyles.summaryIconWrap}>
            <CalendarIcon size={26} color={theme.colors.primary} />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={rescheduleStyles.bottomBar}>
        <TouchableOpacity
          style={rescheduleStyles.primaryBtn}
          onPress={handleConfirmReschedule}
          activeOpacity={0.85}
        >
          <Text style={rescheduleStyles.primaryBtnTxt}>
            {rescheduling ? 'Updating Appointment...' : 'Confirm Reschedule'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default RescheduleAppointmentScreen;
