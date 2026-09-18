import { useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import { AvailableDatesPicker, TimeSlotPicker } from '../../components/Modules/Appointments';
import { CalendarDatePickerModal } from '../../components/Modules/Doctors';
import { DoctorClinicCardSkeleton } from '../../components/Skeletons/DoctorClinicCardSkeleton';
import AppHeader from '../../components/ui/AppHeader';
import { CalendarIcon, VideoIcon } from '../../components/ui/icons';
import {
  useDoctorAvailDates,
  useDoctorClinicSummary,
  useDoctorTimingsByDate,
} from '../../hooks/react-query/doctors/doctor.hooks';
import { getInitials } from '../../lib/common/common.utils';
import { bookAppointmentStyles } from '../../styled/BookAppointmentScreen.styled';
import { theme } from '../../styled/theme.styled';
import { ITimeSlotsDoc } from '../../typescripts/interfaces/doctors.interfaces';
import { useAuthStore } from '../../zustand/stores/useAuthStore';

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

const formatDateChip = (dateStr: string) => {
  if (!dateStr) return { labelTop: '', labelBottom: '', full: '' };
  const dateObj = new Date(`${dateStr}T00:00:00`);
  if (isNaN(dateObj.getTime())) {
    return { labelTop: '', labelBottom: dateStr, full: dateStr };
  }
  const labelTop = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
  const labelBottom = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const full = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return { labelTop, labelBottom, full };
};

export const BookAppointmentScreen: React.FC = () => {
  const router = useRoute();
  const { doctorId, clinicId } = (router.params || {}) as { doctorId: number; clinicId: number };

  const { userData } = useAuthStore(state => state);

  // 1. Fetch Doctor & Clinic Summary
  const { data: docSummary, isFetching: isSummaryPending } = useDoctorClinicSummary({
    doctorId,
    clinicId,
  });

  // 2. Fetch Doctor Available Dates
  const { data: availableDatesRes, isFetching: isAvailableDatesPending } = useDoctorAvailDates({
    doctorId,
    clinicId,
  });

  const availableDates: string[] = useMemo(() => {
    const raw = (availableDatesRes as any)?.data || availableDatesRes || [];
    return Array.isArray(raw) ? raw : [];
  }, [availableDatesRes]);

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [consultationType, setConsultationType] = useState<'in-person' | 'video'>('in-person');
  const [selectedSlot, setSelectedSlot] = useState<ITimeSlotsDoc | null>(null);
  const [reason, setReason] = useState<string>('');
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);

  // 3. Fetch Doctor Slots for Selected Date
  const { data: slotsRes, isFetching: isSlotsPending } = useDoctorTimingsByDate({
    doctorId,
    date: selectedDate,
    clinicId,
  });

  const allSlots: ITimeSlotsDoc[] = useMemo(() => {
    if (!slotsRes) return [];
    if (Array.isArray((slotsRes as any).slots)) return (slotsRes as any).slots;
    if (Array.isArray((slotsRes as any).data?.slots)) return (slotsRes as any).data.slots;
    if (Array.isArray((slotsRes as any).data)) return (slotsRes as any).data;
    if (Array.isArray(slotsRes)) return slotsRes as ITimeSlotsDoc[];
    return [];
  }, [slotsRes]);

  // Reset selected slot when date or consultationType changes
  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedDate, consultationType]);

  // Fee calculation
  const consultationFee = useMemo(() => {
    if (selectedSlot) {
      const fee =
        consultationType === 'in-person' ? selectedSlot.in_person_fee : selectedSlot.video_fee;
      if (fee !== undefined && fee !== null && !isNaN(Number(fee)) && Number(fee) > 0) {
        return Number(fee);
      }
    }
    return consultationType === 'in-person' ? 1000 : 800;
  }, [selectedSlot, consultationType]);

  const platformFee = 50;
  const totalAmount = consultationFee + platformFee;

  const selectedDateFormatted = formatDateChip(selectedDate);

  return (
    <SafeAreaWrapper style={bookAppointmentStyles.container}>
      <AppHeader title="Book Appointment" showBack={true} />

      <ScrollView
        style={bookAppointmentStyles.scroll}
        contentContainerStyle={bookAppointmentStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isSummaryPending ? (
          <DoctorClinicCardSkeleton />
        ) : (
          <View style={bookAppointmentStyles.doctorCard}>
            {docSummary?.doctor?.profile_image ? (
              <Image
                source={{ uri: docSummary.doctor.profile_image }}
                style={bookAppointmentStyles.doctorAvatarImage}
              />
            ) : (
              <View style={bookAppointmentStyles.doctorAvatar}>
                <Text style={bookAppointmentStyles.doctorAvatarText}>
                  {getInitials(docSummary?.doctor?.name || '')}
                </Text>
              </View>
            )}
            <View style={bookAppointmentStyles.doctorDetails}>
              <Text style={bookAppointmentStyles.doctorName}>
                {docSummary?.doctor?.name || 'Doctor'}
              </Text>
              <Text style={bookAppointmentStyles.doctorSpecialization}>
                {docSummary?.doctor?.specialization || ''}
              </Text>
              <Text style={bookAppointmentStyles.doctorSubline}>
                {docSummary?.doctor?.experience_years
                  ? `${docSummary.doctor.experience_years} Yrs Exp • `
                  : ''}
                {docSummary?.clinic?.name || 'Clinic'}
              </Text>
            </View>
          </View>
        )}

        {/* Patient Information */}
        <Text style={bookAppointmentStyles.sectionLabel}>PATIENT INFORMATION</Text>
        <View style={bookAppointmentStyles.patientCard}>
          <View style={bookAppointmentStyles.patientInfo}>
            <View style={bookAppointmentStyles.patientAvatar}>
              <Text style={bookAppointmentStyles.patientAvatarText}>
                {getInitials(userData?.name || '')}
              </Text>
            </View>
            <View>
              <Text style={bookAppointmentStyles.patientName}>{userData?.name || 'Patient'}</Text>
              <Text style={bookAppointmentStyles.patientId}>
                Patient ID - {userData?.patient_id || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Consultation Type */}
        <Text style={bookAppointmentStyles.sectionLabel}>CONSULTATION TYPE</Text>
        <View style={bookAppointmentStyles.consultationRow}>
          <TouchableOpacity
            style={[
              bookAppointmentStyles.consultationChip,
              consultationType === 'in-person' && bookAppointmentStyles.consultationChipActive,
            ]}
            onPress={() => setConsultationType('in-person')}
            activeOpacity={0.8}
          >
            <CalendarIcon
              size={18}
              color={
                consultationType === 'in-person'
                  ? theme.colors.primaryDark
                  : theme.colors.textSecondary
              }
            />
            <Text
              style={[
                bookAppointmentStyles.consultationChipText,
                consultationType === 'in-person' &&
                  bookAppointmentStyles.consultationChipTextActive,
              ]}
            >
              In-Person Visit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              bookAppointmentStyles.consultationChip,
              consultationType === 'video' && bookAppointmentStyles.consultationChipActive,
            ]}
            onPress={() => setConsultationType('video')}
            activeOpacity={0.8}
          >
            <VideoIcon
              size={18}
              color={
                consultationType === 'video' ? theme.colors.primaryDark : theme.colors.textSecondary
              }
            />
            <Text
              style={[
                bookAppointmentStyles.consultationChipText,
                consultationType === 'video' && bookAppointmentStyles.consultationChipTextActive,
              ]}
            >
              Video Consult
            </Text>
          </TouchableOpacity>
        </View>

        {/* Reason for Visit */}
        <Text style={bookAppointmentStyles.fieldLabel}>
          Reason for Visit <Text style={bookAppointmentStyles.optionalHint}>(optional)</Text>
        </Text>
        <TextInput
          value={reason}
          onChangeText={setReason}
          placeholder="Describe your reason for booking this appointment..."
          placeholderTextColor={theme.colors.textMuted}
          style={bookAppointmentStyles.reasonInput}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* Select Date */}
        <Text style={bookAppointmentStyles.sectionLabel}>SELECT DATE</Text>
        <AvailableDatesPicker
          dates={availableDates}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onOpenCalendar={() => setShowCalendarModal(true)}
          isLoading={isAvailableDatesPending}
        />

        {/* Select Time Slot */}
        <Text style={bookAppointmentStyles.sectionLabel}>SELECT TIME</Text>
        <TimeSlotPicker
          slots={allSlots}
          selectedSlot={selectedSlot}
          onSelectSlot={setSelectedSlot}
          isLoading={isSlotsPending}
          selectedDate={selectedDate}
          consultationType={consultationType}
        />

        {/* Booking Summary Box */}
        <View style={bookAppointmentStyles.summaryBox}>
          <Text style={bookAppointmentStyles.summaryTitle}>APPOINTMENT SUMMARY</Text>

          <View style={bookAppointmentStyles.summaryRow}>
            <Text style={bookAppointmentStyles.summaryLabel}>DOCTOR</Text>
            <Text style={bookAppointmentStyles.summaryValue}>
              {docSummary?.doctor?.name || 'N/A'}
            </Text>
          </View>

          <View style={bookAppointmentStyles.summaryRow}>
            <Text style={bookAppointmentStyles.summaryLabel}>CLINIC</Text>
            <Text style={bookAppointmentStyles.summaryValue}>
              {docSummary?.clinic?.name || 'N/A'}
            </Text>
          </View>

          <View style={bookAppointmentStyles.summaryRow}>
            <Text style={bookAppointmentStyles.summaryLabel}>CONSULTATION</Text>
            <Text style={bookAppointmentStyles.summaryValue}>
              {consultationType === 'in-person' ? 'In-Person' : 'Video Call'}
            </Text>
          </View>

          <View style={bookAppointmentStyles.summaryRow}>
            <Text style={bookAppointmentStyles.summaryLabel}>DATE</Text>
            <Text style={bookAppointmentStyles.summaryValue}>
              {selectedDateFormatted.full || 'Not selected'}
            </Text>
          </View>

          <View style={bookAppointmentStyles.summaryRow}>
            <Text style={bookAppointmentStyles.summaryLabel}>TIME</Text>
            <Text style={bookAppointmentStyles.summaryValue}>
              {selectedSlot
                ? `${formatTime12h(selectedSlot.from)} - ${formatTime12h(selectedSlot.to)}`
                : 'Not selected'}
            </Text>
          </View>

          <View style={bookAppointmentStyles.divider} />

          <View style={bookAppointmentStyles.summaryRow}>
            <Text style={bookAppointmentStyles.summaryLabel}>Consultation Fee</Text>
            <Text style={bookAppointmentStyles.summaryValue}>₹{consultationFee}</Text>
          </View>

          <View style={bookAppointmentStyles.summaryRow}>
            <Text style={bookAppointmentStyles.summaryLabel}>Platform Fee</Text>
            <Text style={bookAppointmentStyles.summaryValue}>₹{platformFee}</Text>
          </View>

          <View style={bookAppointmentStyles.divider} />

          <View style={bookAppointmentStyles.summaryRow}>
            <Text style={bookAppointmentStyles.totalLabel}>Total Amount</Text>
            <Text style={bookAppointmentStyles.totalValue}>₹{totalAmount}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={bookAppointmentStyles.footer}>
        <TouchableOpacity
          style={[
            bookAppointmentStyles.proceedBtn,
            (!selectedDate || !selectedSlot) && { opacity: 0.6 },
          ]}
          activeOpacity={0.85}
        >
          <Text style={bookAppointmentStyles.proceedBtnText}>
            Book Appointment • ₹{totalAmount}
          </Text>
        </TouchableOpacity>
      </View>
      <CalendarDatePickerModal
        visible={showCalendarModal}
        availableDates={availableDates}
        onSelectDate={d => {
          const formattedStr = d.toISOString().split('T')[0];
          setSelectedDate(formattedStr);
        }}
        onClose={() => setShowCalendarModal(false)}
      />
    </SafeAreaWrapper>
  );
};

export default BookAppointmentScreen;
