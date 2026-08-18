import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  CalendarDatePickerModal,
  FamilyMemberOption,
  FamilyMemberSelectSheet,
} from '../../components/Modules/Doctors';
import AppHeader from '../../components/ui/AppHeader';
import { CalendarIcon, VideoIcon } from '../../components/ui/icons';
import { MOCK_SEARCH_DOCTORS, SearchDoctorData } from '../../resources/mockData';
import { bookAppointmentStyles } from '../../styled/BookAppointmentScreen.styled';
import { theme } from '../../styled/theme.styled';

const MOCK_FAMILY_MEMBERS: FamilyMemberOption[] = [
  { id: 'self', name: 'John Doe', relation: 'Self', initials: 'JD' },
  { id: '2', name: 'Jane Doe', relation: 'Spouse', initials: 'JD' },
  { id: '3', name: 'Robert Doe', relation: 'Father', initials: 'RD' },
];

const DATE_OPTIONS = [
  { labelTop: 'Today', labelBottom: 'Aug 24', value: 'Mon, 24 Aug' },
  { labelTop: 'Tue', labelBottom: 'Aug 25', value: 'Tue, 25 Aug' },
  { labelTop: 'Wed', labelBottom: 'Aug 26', value: 'Wed, 26 Aug' },
];

const MORNING_SLOTS = [
  '09:00 AM - 09:30 AM',
  '09:30 AM - 10:00 AM',
  '10:00 AM - 10:30 AM',
  '10:30 AM - 11:00 AM',
  '11:00 AM - 11:30 AM',
];

const AFTERNOON_SLOTS = [
  '12:00 PM - 12:30 PM',
  '12:30 PM - 01:00 PM',
  '02:00 PM - 02:30 PM',
  '02:30 PM - 03:00 PM',
  '03:00 PM - 03:30 PM',
];

const EVENING_SLOTS = [
  '05:00 PM - 05:30 PM',
  '05:30 PM - 06:00 PM',
  '06:00 PM - 06:30 PM',
  '06:30 PM - 07:00 PM',
];

export const BookAppointmentScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const routeDoctor: SearchDoctorData | undefined = route.params?.doctor;
  const doctorId: number = route.params?.doctorId || 101;

  const doctor: SearchDoctorData =
    routeDoctor ||
    MOCK_SEARCH_DOCTORS.find(d => d.doctor_id === doctorId) ||
    MOCK_SEARCH_DOCTORS[0];

  const [selectedMember, setSelectedMember] = useState<FamilyMemberOption>(MOCK_FAMILY_MEMBERS[0]);
  const [consultationType, setConsultationType] = useState<'in-person' | 'video'>('in-person');
  const [selectedDateLabel, setSelectedDateLabel] = useState<string>('Mon, 24 Aug');
  const [selectedSlot, setSelectedSlot] = useState<string>('10:00 AM - 10:30 AM');
  const [reason, setReason] = useState<string>('');

  const [showMemberSheet, setShowMemberSheet] = useState<boolean>(false);
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);

  const consultationFee =
    consultationType === 'in-person'
      ? doctor.min_in_person_fee || 1000
      : doctor.min_video_fee || 800;
  const platformFee = 50;
  const totalAmount = consultationFee + platformFee;

  const handleProceed = () => {
    const bookingData = {
      doctor,
      patientName: selectedMember.name,
      patientRelation: selectedMember.relation,
      consultationType,
      appointmentDate: '2026-08-24',
      dateLabel: selectedDateLabel,
      slot: selectedSlot,
      reason,
      consultationFee,
      platformFee,
      totalAmount,
    };
    navigation.navigate('Payment', { bookingData, totalAmount });
  };

  const renderSlotGroup = (title: string, slots: string[]) => (
    <View style={{ marginBottom: 12 }}>
      <Text style={bookAppointmentStyles.slotGroupTitle}>{title}</Text>
      <View style={bookAppointmentStyles.slotsGrid}>
        {slots.map(slot => {
          const active = slot === selectedSlot;
          return (
            <TouchableOpacity
              key={slot}
              style={[bookAppointmentStyles.slotBtn, active && bookAppointmentStyles.slotBtnActive]}
              onPress={() => setSelectedSlot(slot)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  bookAppointmentStyles.slotText,
                  active && bookAppointmentStyles.slotTextActive,
                ]}
              >
                {slot}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={bookAppointmentStyles.container}>
      <AppHeader title="Book Appointment" showBack={true} />

      <ScrollView
        style={bookAppointmentStyles.scroll}
        contentContainerStyle={bookAppointmentStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Doctor Card */}
        <View style={bookAppointmentStyles.doctorCard}>
          <View style={bookAppointmentStyles.doctorAvatar}>
            <Text style={bookAppointmentStyles.doctorAvatarText}>
              {doctor.doctor_name
                .split(' ')
                .map(n => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase()}
            </Text>
          </View>
          <View style={bookAppointmentStyles.doctorDetails}>
            <Text style={bookAppointmentStyles.doctorName}>{doctor.doctor_name}</Text>
            <Text style={bookAppointmentStyles.doctorSpecialization}>{doctor.specialization}</Text>
            <Text style={bookAppointmentStyles.doctorSubline}>
              {doctor.years_of_experience || 12} Yrs Exp •{' '}
              {doctor.clinics?.[0]?.clinic_name || 'St. Jude Clinic'}
            </Text>
          </View>
        </View>

        {/* Patient Information */}
        <Text style={bookAppointmentStyles.sectionLabel}>PATIENT INFORMATION</Text>
        <View style={bookAppointmentStyles.patientCard}>
          <View style={bookAppointmentStyles.patientInfo}>
            <View style={bookAppointmentStyles.patientAvatar}>
              <Text style={bookAppointmentStyles.patientAvatarText}>{selectedMember.initials}</Text>
            </View>
            <View>
              <Text style={bookAppointmentStyles.patientName}>{selectedMember.name}</Text>
              <Text style={bookAppointmentStyles.patientId}>
                Patient ID - PT0004 ({selectedMember.relation})
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={bookAppointmentStyles.changeBtn}
            onPress={() => setShowMemberSheet(true)}
            activeOpacity={0.8}
          >
            <Text style={bookAppointmentStyles.changeBtnText}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Consultation Type Selector */}
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

        {/* Reason for Visit (optional) */}
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
        <View style={bookAppointmentStyles.dateRow}>
          {DATE_OPTIONS.map(opt => {
            const active = opt.value === selectedDateLabel;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  bookAppointmentStyles.dateChipCard,
                  active && bookAppointmentStyles.dateChipCardActive,
                ]}
                onPress={() => setSelectedDateLabel(opt.value)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    bookAppointmentStyles.dateChipTopText,
                    active && bookAppointmentStyles.dateChipTopTextActive,
                  ]}
                >
                  {opt.labelTop}
                </Text>
                <Text
                  style={[
                    bookAppointmentStyles.dateChipBottomText,
                    active && bookAppointmentStyles.dateChipBottomTextActive,
                  ]}
                >
                  {opt.labelBottom}
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            style={bookAppointmentStyles.calendarIconBtn}
            onPress={() => setShowCalendarModal(true)}
            activeOpacity={0.8}
          >
            <CalendarIcon size={22} color={theme.colors.primaryDark} />
          </TouchableOpacity>
        </View>

        {/* Select Time Slot Grouped by MORNING, AFTERNOON, EVENING */}
        <Text style={bookAppointmentStyles.sectionLabel}>SELECT TIME</Text>
        {renderSlotGroup('MORNING', MORNING_SLOTS)}
        {renderSlotGroup('AFTERNOON', AFTERNOON_SLOTS)}
        {renderSlotGroup('EVENING', EVENING_SLOTS)}

        {/* Booking Summary Box */}
        <View style={bookAppointmentStyles.summaryBox}>
          <Text style={bookAppointmentStyles.summaryTitle}>APPOINTMENT SUMMARY</Text>

          <View style={bookAppointmentStyles.summaryRow}>
            <Text style={bookAppointmentStyles.summaryLabel}>DOCTOR</Text>
            <Text style={bookAppointmentStyles.summaryValue}>{doctor.doctor_name}</Text>
          </View>

          <View style={bookAppointmentStyles.summaryRow}>
            <Text style={bookAppointmentStyles.summaryLabel}>CONSULTATION</Text>
            <Text style={bookAppointmentStyles.summaryValue}>
              {consultationType === 'in-person' ? 'In-Person' : 'Video Call'}
            </Text>
          </View>

          <View style={bookAppointmentStyles.summaryRow}>
            <Text style={bookAppointmentStyles.summaryLabel}>DATE</Text>
            <Text style={bookAppointmentStyles.summaryValue}>{selectedDateLabel}</Text>
          </View>

          <View style={bookAppointmentStyles.summaryRow}>
            <Text style={bookAppointmentStyles.summaryLabel}>TIME</Text>
            <Text style={bookAppointmentStyles.summaryValue}>{selectedSlot}</Text>
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

      {/* Sticky Bottom Footer */}
      <View style={bookAppointmentStyles.footer}>
        <TouchableOpacity
          style={bookAppointmentStyles.proceedBtn}
          onPress={handleProceed}
          activeOpacity={0.85}
        >
          <Text style={bookAppointmentStyles.proceedBtnText}>
            Book Appointment • ₹{totalAmount}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Patient Member Picker */}
      <FamilyMemberSelectSheet
        visible={showMemberSheet}
        members={MOCK_FAMILY_MEMBERS}
        selectedMemberId={selectedMember.id}
        onSelect={setSelectedMember}
        onClose={() => setShowMemberSheet(false)}
      />

      {/* Month Calendar Date Picker Modal */}
      <CalendarDatePickerModal
        visible={showCalendarModal}
        onSelectDate={d => {
          setSelectedDateLabel(
            d.toLocaleDateString('en-US', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })
          );
        }}
        onClose={() => setShowCalendarModal(false)}
      />
    </SafeAreaView>
  );
};

export default BookAppointmentScreen;
