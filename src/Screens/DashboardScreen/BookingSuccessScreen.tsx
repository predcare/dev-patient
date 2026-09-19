import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { BackHandler, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import AppHeader from '../../components/ui/AppHeader';
import { CalendarIcon, CheckIcon, MapPinIcon, StethoscopeIcon } from '../../components/ui/icons';
import { getInitials } from '../../lib/common/common.utils';
import { bookingSuccessStyles } from '../../styled/BookingSuccessScreen.styled';
import { theme } from '../../styled/theme.styled';

export const BookingSuccessScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const bookingData = route.params?.bookingData || {};
  const doctorName = bookingData.doctor?.doctor_name || bookingData.doctorName || 'Doctor';
  const specialization =
    bookingData.doctor?.specialization || bookingData.doctorSpecialization || 'Specialist';
  const clinicName =
    bookingData.doctor?.clinic_name ||
    bookingData.clinicName ||
    bookingData.clinic_details?.name ||
    'Care Clinic';
  const patientName = bookingData.patientName || 'Patient';
  const dateLabel = bookingData.dateLabel || bookingData.date || 'Scheduled Date';
  const slot = bookingData.slot || 'Scheduled Slot';
  const appointmentId =
    bookingData.appointment_id ||
    bookingData.appointmentId ||
    bookingData.id ||
    bookingData._id ||
    'Confirmed';
  const consultationFee =
    bookingData.consultationFee ??
    (bookingData.totalAmount ? bookingData.totalAmount - (bookingData.platformFee || 0) : 0);
  const platformFee = bookingData.platformFee ?? 0;
  const totalAmount = bookingData.totalAmount ?? Number(consultationFee) + Number(platformFee);

  const handleGoDashboard = () => {
    navigation.navigate('MainTabs');
  };

  useEffect(() => {
    const onBackPress = () => {
      navigation.navigate('MainTabs');
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [navigation]);

  return (
    <SafeAreaWrapper style={bookingSuccessStyles.container}>
      <AppHeader title="Booking Confirmed" showBack={true} onBack={handleGoDashboard} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={bookingSuccessStyles.scrollContent}
      >
        <View style={bookingSuccessStyles.checkCircle}>
          <CheckIcon size={40} color={theme.colors.surface} />
        </View>

        <Text style={bookingSuccessStyles.heroTitle}>Appointment Confirmed!</Text>
        <Text style={bookingSuccessStyles.heroSubtitle}>
          Your appointment has been successfully booked with {doctorName}.
        </Text>
        <View style={bookingSuccessStyles.card}>
          <View style={bookingSuccessStyles.doctorRow}>
            <View style={bookingSuccessStyles.doctorAvatar}>
              <Text style={bookingSuccessStyles.doctorAvatarText}>{getInitials(doctorName)}</Text>
            </View>
            <View style={bookingSuccessStyles.doctorInfo}>
              <Text style={bookingSuccessStyles.doctorName}>{doctorName}</Text>
              <Text style={bookingSuccessStyles.doctorMeta}>{specialization}</Text>
            </View>
          </View>
        </View>

        <View style={bookingSuccessStyles.card}>
          <Text style={bookingSuccessStyles.cardSectionTitle}>APPOINTMENT DETAILS</Text>

          <View style={bookingSuccessStyles.infoRow}>
            <StethoscopeIcon size={18} color={theme.colors.primary} />
            <View style={bookingSuccessStyles.infoTextWrap}>
              <Text style={bookingSuccessStyles.infoLabel}>Booking / Appointment ID</Text>
              <Text style={bookingSuccessStyles.infoValue}>{appointmentId}</Text>
            </View>
          </View>

          <View style={bookingSuccessStyles.infoRow}>
            <MapPinIcon size={18} color={theme.colors.primary} />
            <View style={bookingSuccessStyles.infoTextWrap}>
              <Text style={bookingSuccessStyles.infoLabel}>Location / Clinic</Text>
              <Text style={bookingSuccessStyles.infoValue}>{clinicName}</Text>
            </View>
          </View>

          <View style={bookingSuccessStyles.infoRow}>
            <CalendarIcon size={18} color={theme.colors.primary} />
            <View style={bookingSuccessStyles.infoTextWrap}>
              <Text style={bookingSuccessStyles.infoLabel}>Date & Time</Text>
              <Text style={bookingSuccessStyles.infoValue}>
                {dateLabel} at {slot}
              </Text>
            </View>
          </View>
        </View>
        <View style={bookingSuccessStyles.card}>
          <View style={bookingSuccessStyles.billingHeader}>
            <Text style={bookingSuccessStyles.cardSectionTitle}>BILLING SUMMARY</Text>
            <View style={bookingSuccessStyles.paidBadge}>
              <CheckIcon size={12} color={theme.colors.success} />
              <Text style={bookingSuccessStyles.paidBadgeText}>PAID ONLINE</Text>
            </View>
          </View>

          <View style={bookingSuccessStyles.billRow}>
            <Text style={bookingSuccessStyles.billLabel}>Consultation Fee</Text>
            <Text style={bookingSuccessStyles.billValue}>₹{consultationFee}</Text>
          </View>

          <View style={bookingSuccessStyles.billRow}>
            <Text style={bookingSuccessStyles.billLabel}>Platform Service Fee</Text>
            <Text style={bookingSuccessStyles.billValue}>₹{platformFee}</Text>
          </View>

          <View style={bookingSuccessStyles.billDivider} />

          <View style={bookingSuccessStyles.billRow}>
            <Text style={bookingSuccessStyles.totalLabel}>TOTAL</Text>
            <Text style={bookingSuccessStyles.totalValue}>₹{totalAmount}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Return to Dashboard Footer */}
      <View style={bookingSuccessStyles.footerBar}>
        <TouchableOpacity
          style={bookingSuccessStyles.dashboardBtn}
          onPress={handleGoDashboard}
          activeOpacity={0.85}
        >
          <Text style={bookingSuccessStyles.dashboardBtnText}>Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaWrapper>
  );
};

export default BookingSuccessScreen;
