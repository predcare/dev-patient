import { useNavigation, useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import { TimeSlotPicker } from '../../components/Modules/Appointments';
import { CalendarDatePickerModal } from '../../components/Modules/Doctors';
import BookingSlotsSkeleton from '../../components/Skeletons/BookingSlotsSkeleton';
import { DoctorClinicCardSkeleton } from '../../components/Skeletons/DoctorClinicCardSkeleton';
import AppHeader from '../../components/ui/AppHeader';
import { CalendarIcon, VideoIcon } from '../../components/ui/icons';
import {
  useDoctorAvailDates,
  useDoctorClinicSummary,
  useDoctorTimingsByDate,
} from '../../hooks/react-query/doctors/doctor.hooks';
import { getInitials } from '../../lib/common/common.utils';
import { showErrorToast } from '../../lib/common/toast.utils';
import { bookAppointmentStyles } from '../../styled/BookAppointmentScreen.styled';
import { theme } from '../../styled/theme.styled';
import { ITimeSlotsDoc } from '../../typescripts/interfaces/doctors.interfaces';
import { useAuthStore } from '../../zustand/stores/useAuthStore';

const formatDateChip = (dateStr: string) => {
  if (!dateStr) return { labelTop: '', labelBottom: '', full: '' };
  const d = dayjs(dateStr);
  if (!d.isValid()) return { labelTop: '', labelBottom: dateStr, full: dateStr };
  return {
    labelTop: d.format('ddd'),
    labelBottom: d.format('MMM D'),
    full: d.format('ddd, D MMM YYYY'),
  };
};

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

interface IFormStates {
  selectedDate: string;
  consultationType: 'in-person' | 'video';
  appointmentType: 'first_visit' | 'follow_up';
  selectedSlot: ITimeSlotsDoc | null;
  selectedSlots: ITimeSlotsDoc[];
  reason: string;
  showCalendarModal: boolean;
}

export const BookAppointmentScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const router = useRoute();
  const { doctorId, clinicId } = (router.params || {}) as { doctorId: number; clinicId: number };
  const { userData } = useAuthStore(state => state);

  const [formStates, setFormStates] = useState<IFormStates>({
    selectedDate: '',
    consultationType: 'in-person',
    appointmentType: 'first_visit',
    selectedSlot: null,
    selectedSlots: [],
    reason: '',
    showCalendarModal: false,
  });

  // 1. Fetch Doctor & Clinic Summary
  const { data: docSummary, isFetching: isSummaryPending } = useDoctorClinicSummary({
    doctorId,
    clinicId,
  });

  // 2. Fetch Doctor Available Dates
  const { data: availableDatesRes, isFetching: isAvailableDatesPending } = useDoctorAvailDates({
    doctorId,
    consultation_type: formStates?.consultationType,
    clinicId,
  });

  // 3. Fetch Doctor Slots for Selected Date
  const { data: slotsRes, isFetching: isSlotsPending } = useDoctorTimingsByDate({
    doctorId,
    date: formStates.selectedDate,
    clinicId,
    consultation_type: formStates.consultationType,
  });

  console.log('slotsRes', slotsRes);

  const consultationFee = useMemo(() => {
    if (!formStates.selectedSlots || formStates.selectedSlots.length === 0) return 0;
    return formStates.selectedSlots.reduce((sum, slot) => {
      const feeStr = formStates.consultationType === 'video' ? slot.video_fee : slot.in_person_fee;
      const feeNum = parseFloat(feeStr || '0') || 0;
      return sum + feeNum;
    }, 0);
  }, [formStates.selectedSlots, formStates.consultationType]);

  const updateForm = <K extends keyof IFormStates>(key: K, value: IFormStates[K]) => {
    setFormStates(prev => ({ ...prev, [key]: value }));
  };

  const handleConsultationTypeChange = (type: 'in-person' | 'video') => {
    setFormStates(prev => ({
      ...prev,
      consultationType: type,
      selectedSlot: null,
      selectedSlots: [],
      selectedDate: '',
      showCalendarModal: false,
    }));
  };

  const handleDateChange = (date: string) => {
    setFormStates(prev => ({
      ...prev,
      selectedDate: date,
      selectedSlot: null,
      selectedSlots: [],
    }));
  };

  const handleProceed = () => {
    if (!formStates?.selectedDate) return showErrorToast('Please select a date');
    if (formStates?.selectedSlots.length === 0)
      return showErrorToast('Please select consultation slots');

    const firstSlot = formStates.selectedSlots[0];
    const lastSlot = formStates.selectedSlots[formStates.selectedSlots.length - 1];

    const rawStartTime = firstSlot.from;
    const rawEndTime = lastSlot.to;
    const startTimeNorm = rawStartTime.length === 5 ? `${rawStartTime}:00` : rawStartTime;
    const endTimeNorm = rawEndTime.length === 5 ? `${rawEndTime}:00` : rawEndTime;

    const slotTimesArray = formStates.selectedSlots.map(s => ({
      start: s.from,
      end: s.to,
      booked: true,
    }));

    const allAvailablityIds = formStates?.selectedSlots?.map(slot => slot.availability_id);

    const apiPayload = {
      doctor_id: String(doctorId || docSummary?.doctor?.id || ''),
      patient_id: String(userData?.id || ''),
      clinic_id: String(firstSlot?.clinic_id || clinicId || docSummary?.clinic?.id || ''),
      availability_id: allAvailablityIds,
      appointment_date: formStates.selectedDate,
      start_time: startTimeNorm,
      end_time: endTimeNorm,
      consultation_type: formStates.consultationType,
      appointment_type: formStates.appointmentType,
      reason: formStates.reason.trim() || undefined,
      appointment_slot_time: JSON.stringify(slotTimesArray),
    };

    const slotLabel = `${formatTime12h(firstSlot.from)} - ${formatTime12h(lastSlot.to)}${
      formStates.selectedSlots.length > 1 ? ` (${formStates.selectedSlots.length} slots)` : ''
    }`;

    const bookingData = {
      apiPayload,
      date: formStates.selectedDate,
      dateLabel: formatDateChip(formStates.selectedDate).full,
      doctor: {
        doctor_name: docSummary?.doctor?.name || 'Dr. Doctor',
        specialization: docSummary?.doctor?.specialization || 'Specialist',
        profile_image: docSummary?.doctor?.profile_image,
      },
      clinic: {
        name: docSummary?.clinic?.name || 'Clinic',
        city: docSummary?.clinic?.city || '',
      },
      patientName: userData?.name || 'Patient',
      patientId: userData?.id,
      slot: slotLabel,
      consultationFee,
      platformFee: 0,
      consultation_type: formStates.consultationType,
      appointment_type: formStates.appointmentType,
      reason: formStates.reason,
      totalAmount: consultationFee,
    };
    navigation.navigate('Payment', { bookingData });
  };

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
              formStates.consultationType === 'in-person' &&
                bookAppointmentStyles.consultationChipActive,
            ]}
            onPress={() => handleConsultationTypeChange('in-person')}
            activeOpacity={0.8}
          >
            <CalendarIcon
              size={18}
              color={
                formStates.consultationType === 'in-person'
                  ? theme.colors.primaryDark
                  : theme.colors.textSecondary
              }
            />
            <Text
              style={[
                bookAppointmentStyles.consultationChipText,
                formStates.consultationType === 'in-person' &&
                  bookAppointmentStyles.consultationChipTextActive,
              ]}
            >
              In-Person
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              bookAppointmentStyles.consultationChip,
              formStates.consultationType === 'video' &&
                bookAppointmentStyles.consultationChipActive,
            ]}
            onPress={() => handleConsultationTypeChange('video')}
            activeOpacity={0.8}
          >
            <VideoIcon
              size={18}
              color={
                formStates.consultationType === 'video'
                  ? theme.colors.primaryDark
                  : theme.colors.textSecondary
              }
            />
            <Text
              style={[
                bookAppointmentStyles.consultationChipText,
                formStates.consultationType === 'video' &&
                  bookAppointmentStyles.consultationChipTextActive,
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
          placeholder="e.g. Headache and fever"
          placeholderTextColor={theme.colors.textMuted}
          style={bookAppointmentStyles.reasonInput}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          value={formStates.reason}
          onChangeText={text => updateForm('reason', text)}
        />
        <Text style={bookAppointmentStyles.sectionLabel}>SELECT DATE</Text>
        {isAvailableDatesPending ? (
          <BookingSlotsSkeleton datesOnly />
        ) : !availableDatesRes || availableDatesRes?.length === 0 ? (
          <Text
            style={{
              fontSize: 13,
              color: theme.colors.textMuted,
              fontStyle: 'italic',
              marginBottom: 12,
            }}
          >
            No available dates found for this doctor.
          </Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={bookAppointmentStyles.dateRow}
          >
            {availableDatesRes &&
              availableDatesRes?.map((dateStr, idx) => {
                const active = dateStr === formStates.selectedDate;
                const formatted = formatDateChip(dateStr as string);
                return (
                  <TouchableOpacity
                    key={`${dateStr}-${idx}`}
                    style={[
                      bookAppointmentStyles.dateChipCard,
                      active && bookAppointmentStyles.dateChipCardActive,
                    ]}
                    onPress={() => handleDateChange(dateStr)}
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
              onPress={() => updateForm('showCalendarModal', true)}
              activeOpacity={0.8}
            >
              <CalendarIcon size={22} color={theme.colors.primaryDark} />
            </TouchableOpacity>
          </ScrollView>
        )}

        {formStates.selectedDate && (
          <>
            <Text style={bookAppointmentStyles.sectionLabel}>SELECT TIME</Text>
            <TimeSlotPicker
              availSlots={slotsRes?.slots || []}
              selectedSlots={formStates.selectedSlots}
              onSelectSlots={slots => {
                setFormStates(prev => ({
                  ...prev,
                  selectedSlots: slots,
                  selectedSlot: slots[0] || null,
                }));
              }}
              isLoading={isSlotsPending}
            />
          </>
        )}

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
              {formStates.consultationType === 'in-person' ? 'In-Person' : 'Video Call'}
            </Text>
          </View>

          <View style={bookAppointmentStyles.summaryRow}>
            <Text style={bookAppointmentStyles.summaryLabel}>DATE</Text>
            <Text style={bookAppointmentStyles.summaryValue}>
              {formStates.selectedDate
                ? formatDateChip(formStates.selectedDate).full
                : 'Not selected'}
            </Text>
          </View>

          <View style={bookAppointmentStyles.summaryRow}>
            <Text style={bookAppointmentStyles.summaryLabel}>TIME</Text>
            <Text style={bookAppointmentStyles.summaryValue}>
              {formStates.selectedSlots.length > 0
                ? `${formatTime12h(formStates.selectedSlots[0].from)} - ${formatTime12h(
                    formStates.selectedSlots[formStates.selectedSlots.length - 1].to
                  )}${
                    formStates.selectedSlots.length > 1
                      ? ` (${formStates.selectedSlots.length} slots)`
                      : ''
                  }`
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
            <Text style={bookAppointmentStyles.summaryValue}>₹0</Text>
          </View>

          <View style={bookAppointmentStyles.divider} />

          <View style={bookAppointmentStyles.summaryRow}>
            <Text style={bookAppointmentStyles.totalLabel}>Total Amount</Text>
            <Text style={bookAppointmentStyles.totalValue}>₹{consultationFee}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={bookAppointmentStyles.footer}>
        <TouchableOpacity
          style={[
            bookAppointmentStyles.proceedBtn,
            (!formStates.selectedDate || formStates.selectedSlots.length === 0) && { opacity: 0.6 },
          ]}
          disabled={!formStates.selectedDate || formStates.selectedSlots.length === 0}
          activeOpacity={0.85}
          onPress={handleProceed}
        >
          <Text style={bookAppointmentStyles.proceedBtnText}>
            Book Appointment • ₹{consultationFee}
          </Text>
        </TouchableOpacity>
      </View>

      <CalendarDatePickerModal
        visible={formStates.showCalendarModal}
        availableDates={availableDatesRes || []}
        onSelectDate={d => {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          handleDateChange(`${yyyy}-${mm}-${dd}`);
        }}
        onClose={() => updateForm('showCalendarModal', false)}
      />
    </SafeAreaWrapper>
  );
};

export default BookAppointmentScreen;
