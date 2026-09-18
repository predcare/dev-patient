import { useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useState } from 'react';
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

interface IFormStates {
  selectedDate: string;
  consultationType: 'in-person' | 'video';
  selectedSlot: ITimeSlotsDoc | null;
  reason: string;
  showCalendarModal: boolean;
}

export const BookAppointmentScreen: React.FC = () => {
  const router = useRoute();
  const { doctorId, clinicId } = (router.params || {}) as { doctorId: number; clinicId: number };
  const { userData } = useAuthStore(state => state);

  const [formStates, setFormStates] = useState<IFormStates>({
    selectedDate: '',
    consultationType: 'in-person',
    selectedSlot: null,
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

  const updateForm = <K extends keyof IFormStates>(key: K, value: IFormStates[K]) => {
    setFormStates(prev => ({ ...prev, [key]: value }));
  };

  const handleConsultationTypeChange = (type: 'in-person' | 'video') => {
    setFormStates(prev => ({
      ...prev,
      consultationType: type,
      selectedSlot: null,
      selectedDate: '',
      showCalendarModal: false,
    }));
  };

  const handleDateChange = (date: string) => {
    setFormStates(prev => ({
      ...prev,
      selectedDate: date,
      selectedSlot: null,
    }));
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
          placeholder="Describe your reason for booking this appointment..."
          placeholderTextColor={theme.colors.textMuted}
          style={bookAppointmentStyles.reasonInput}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* Select Date */}
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

        <Text style={bookAppointmentStyles.sectionLabel}>SELECT TIME</Text>
        <TimeSlotPicker
          slots={slotsRes?.slots || []}
          selectedSlot={formStates.selectedSlot}
          onSelectSlot={s => updateForm('selectedSlot', s)}
          isLoading={isSlotsPending}
          selectedDate={formStates.selectedDate}
          consultationType={formStates.consultationType}
        />
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
            <Text style={bookAppointmentStyles.summaryValue}>Not selected</Text>
          </View>

          <View style={bookAppointmentStyles.summaryRow}>
            <Text style={bookAppointmentStyles.summaryLabel}>TIME</Text>
            <Text style={bookAppointmentStyles.summaryValue}>Not selected</Text>
          </View>

          <View style={bookAppointmentStyles.divider} />

          <View style={bookAppointmentStyles.summaryRow}>
            <Text style={bookAppointmentStyles.summaryLabel}>Consultation Fee</Text>
            <Text style={bookAppointmentStyles.summaryValue}>₹0</Text>
          </View>

          <View style={bookAppointmentStyles.summaryRow}>
            <Text style={bookAppointmentStyles.summaryLabel}>Platform Fee</Text>
            <Text style={bookAppointmentStyles.summaryValue}>₹0</Text>
          </View>

          <View style={bookAppointmentStyles.divider} />

          <View style={bookAppointmentStyles.summaryRow}>
            <Text style={bookAppointmentStyles.totalLabel}>Total Amount</Text>
            <Text style={bookAppointmentStyles.totalValue}>₹0</Text>
          </View>
        </View>
      </ScrollView>

      <View style={bookAppointmentStyles.footer}>
        <TouchableOpacity
          style={[
            bookAppointmentStyles.proceedBtn,
            (!formStates.selectedDate || !formStates.selectedSlot) && { opacity: 0.6 },
          ]}
          activeOpacity={0.85}
        >
          <Text style={bookAppointmentStyles.proceedBtnText}>Book Appointment • ₹0</Text>
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
