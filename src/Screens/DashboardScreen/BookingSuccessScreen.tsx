import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import AppHeader from '../../components/ui/AppHeader';
import { CalendarIcon, CheckIcon, MapPinIcon, StethoscopeIcon } from '../../components/ui/icons';
import { bookingSuccessStyles } from '../../styled/BookingSuccessScreen.styled';
import { theme } from '../../styled/theme.styled';

export const BookingSuccessScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const bookingData = route.params?.bookingData || {};
  const doctorName = bookingData.doctor?.doctor_name || 'Dr. Sarah Jenkins';
  const specialization = bookingData.doctor?.specialization || 'Cardiologist • MD';
  const patientName = bookingData.patientName || 'John Doe';
  const dateLabel = bookingData.dateLabel || 'Mon, 24 Aug 2026';
  const slot = bookingData.slot || '10:30 AM';
  const consultationFee = bookingData.consultationFee || 1000;
  const platformFee = bookingData.platformFee || 50;
  const totalAmount = bookingData.totalAmount || 1050;

  const handleGoDashboard = () => {
    navigation.navigate('MainTabs');
  };

  return (
    <SafeAreaView style={bookingSuccessStyles.container}>
      <AppHeader title="Booking Confirmed" showBack={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={bookingSuccessStyles.scrollContent}
      >
        {/* Success Check Circle Hero */}
        <View style={bookingSuccessStyles.checkCircle}>
          <CheckIcon size={40} color={theme.colors.surface} />
        </View>

        <Text style={bookingSuccessStyles.heroTitle}>Appointment Confirmed!</Text>
        <Text style={bookingSuccessStyles.heroSubtitle}>
          Your appointment has been successfully booked with {doctorName}.
        </Text>

        {/* Doctor Card */}
        <View style={bookingSuccessStyles.card}>
          <View style={bookingSuccessStyles.doctorRow}>
            <View style={bookingSuccessStyles.doctorAvatar}>
              <Text style={bookingSuccessStyles.doctorAvatarText}>SJ</Text>
            </View>
            <View style={bookingSuccessStyles.doctorInfo}>
              <Text style={bookingSuccessStyles.doctorName}>{doctorName}</Text>
              <Text style={bookingSuccessStyles.doctorMeta}>{specialization}</Text>
              <View style={bookingSuccessStyles.expBadge}>
                <Text style={bookingSuccessStyles.expBadgeText}>12+ YRS EXP</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Appointment Details Card */}
        <View style={bookingSuccessStyles.card}>
          <Text style={bookingSuccessStyles.cardSectionTitle}>APPOINTMENT DETAILS</Text>

          <View style={bookingSuccessStyles.infoRow}>
            <StethoscopeIcon size={18} color={theme.colors.primary} />
            <View style={bookingSuccessStyles.infoTextWrap}>
              <Text style={bookingSuccessStyles.infoLabel}>Booking ID</Text>
              <Text style={bookingSuccessStyles.infoValue}>#APPT-849201</Text>
            </View>
          </View>

          <View style={bookingSuccessStyles.infoRow}>
            <MapPinIcon size={18} color={theme.colors.primary} />
            <View style={bookingSuccessStyles.infoTextWrap}>
              <Text style={bookingSuccessStyles.infoLabel}>Location / Clinic</Text>
              <Text style={bookingSuccessStyles.infoValue}>
                St. Jude Medical Center, MG Road
              </Text>
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

        {/* Patient Info Card */}
        <View style={bookingSuccessStyles.card}>
          <Text style={bookingSuccessStyles.cardSectionTitle}>PATIENT INFO</Text>
          <View style={bookingSuccessStyles.infoRow}>
            <StethoscopeIcon size={18} color={theme.colors.primary} />
            <View style={bookingSuccessStyles.infoTextWrap}>
              <Text style={bookingSuccessStyles.infoLabel}>Patient Name</Text>
              <Text style={bookingSuccessStyles.infoValue}>{patientName}</Text>
            </View>
          </View>
        </View>

        {/* Billing Summary Card */}
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
          <Text style={bookingSuccessStyles.dashboardBtnText}>
            Go to Dashboard
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default BookingSuccessScreen;
