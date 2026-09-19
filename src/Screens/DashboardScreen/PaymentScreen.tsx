import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import AppHeader from '../../components/ui/AppHeader';
import {
  CalendarIcon,
  CheckBadgeIcon,
  ClockIcon,
  CreditCardIcon,
  PatientsIcon,
  ShieldIcon,
  StethoscopeIcon,
  VideoIcon,
} from '../../components/ui/icons';
import { getInitials } from '../../lib/common/common.utils';
import { paymentStyles } from '../../styled/PaymentScreen.styled';
import { theme } from '../../styled/theme.styled';

export const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const rawBookingData = route.params?.bookingData;
  const bookingData = rawBookingData?.bookingData || rawBookingData || {};

  const doctorName = bookingData.doctor?.doctor_name || bookingData.doctorName || 'Dr. John Doe';
  const specialization =
    bookingData.doctor?.specialization || bookingData.doctorSpecialization || 'Cardiologist • MD';
  const patientName = bookingData.patientName || 'John Doe';
  const dateLabel = bookingData.dateLabel || bookingData.date || 'Mon, 24 Aug 2026';
  const slot = bookingData.slot || '10:30 AM - 10:40 AM';
  const consultationType = bookingData.consultation_type || bookingData.consultationType || 'in-person';
  const consultationFee =
    bookingData.consultationFee ??
    (route.params?.totalAmount || bookingData.totalAmount || 1000);
  const platformFee = bookingData.platformFee ?? 0;
  const totalAmount =
    route.params?.totalAmount ||
    bookingData.totalAmount ||
    consultationFee + platformFee;

  const [loading, setLoading] = useState<boolean>(false);

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('BookingSuccess', { bookingData });
    }, 600);
  };

  const isVideo = consultationType === 'video';

  return (
    <SafeAreaWrapper style={paymentStyles.container}>
      <AppHeader title="Payment" subtitle="Complete your appointment booking" showBack={true} />
      <ScrollView
        style={paymentStyles.scroll}
        contentContainerStyle={paymentStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Doctor Info Card */}
        <View style={paymentStyles.card}>
          <View style={paymentStyles.cardHeader}>
            <View style={paymentStyles.cardTitleRow}>
              <StethoscopeIcon size={18} color={theme.colors.primary} />
              <Text style={paymentStyles.cardTitle}>Doctor Info</Text>
            </View>
          </View>
          <View style={paymentStyles.doctorRow}>
            <View style={paymentStyles.doctorAvatar}>
              <Text style={paymentStyles.doctorAvatarText}>{getInitials(doctorName)}</Text>
            </View>
            <View style={paymentStyles.doctorDetails}>
              <Text style={paymentStyles.doctorName}>{doctorName}</Text>
              <View style={paymentStyles.specializationBadge}>
                <Text style={paymentStyles.doctorSpecialization}>{specialization}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Appointment Details Card */}
        <View style={paymentStyles.card}>
          <View style={paymentStyles.cardHeader}>
            <View style={paymentStyles.cardTitleRow}>
              <CalendarIcon size={18} color={theme.colors.primary} />
              <Text style={paymentStyles.cardTitle}>Appointment Details</Text>
            </View>
          </View>

          <View style={paymentStyles.detailsList}>
            <View style={paymentStyles.detailItem}>
              <View style={paymentStyles.iconBox}>
                <CalendarIcon size={16} color={theme.colors.primary} />
              </View>
              <View style={paymentStyles.detailTextWrap}>
                <Text style={paymentStyles.detailLabel}>DATE</Text>
                <Text style={paymentStyles.detailValue}>{dateLabel}</Text>
              </View>
            </View>

            <View style={paymentStyles.detailItem}>
              <View style={paymentStyles.iconBox}>
                <ClockIcon size={16} color={theme.colors.primary} />
              </View>
              <View style={paymentStyles.detailTextWrap}>
                <Text style={paymentStyles.detailLabel}>TIME</Text>
                <Text style={paymentStyles.detailValue}>{slot}</Text>
              </View>
            </View>

            <View style={paymentStyles.detailItem}>
              <View style={paymentStyles.iconBox}>
                {isVideo ? (
                  <VideoIcon size={16} color={theme.colors.primary} />
                ) : (
                  <StethoscopeIcon size={16} color={theme.colors.primary} />
                )}
              </View>
              <View style={paymentStyles.detailTextWrap}>
                <Text style={paymentStyles.detailLabel}>CONSULTATION TYPE</Text>
                <View style={paymentStyles.typeBadge}>
                  <Text style={paymentStyles.typeBadgeText}>
                    {isVideo ? 'Video Consult' : 'In-Person Visit'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={paymentStyles.detailItem}>
              <View style={paymentStyles.iconBox}>
                <PatientsIcon size={16} color={theme.colors.primary} />
              </View>
              <View style={paymentStyles.detailTextWrap}>
                <Text style={paymentStyles.detailLabel}>PATIENT NAME</Text>
                <Text style={paymentStyles.detailValue}>{patientName}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Summary Card */}
        <View style={paymentStyles.card}>
          <View style={paymentStyles.cardHeader}>
            <View style={paymentStyles.cardTitleRow}>
              <CreditCardIcon size={18} color={theme.colors.primary} />
              <Text style={paymentStyles.cardTitle}>Payment Summary</Text>
            </View>
          </View>

          <View style={paymentStyles.feeRow}>
            <Text style={paymentStyles.feeLabel}>Consultation Fee</Text>
            <Text style={paymentStyles.feeAmount}>₹{consultationFee}</Text>
          </View>
          <View style={paymentStyles.feeRow}>
            <Text style={paymentStyles.feeLabel}>Platform Fee</Text>
            <Text style={paymentStyles.feeAmount}>₹{platformFee}</Text>
          </View>

          <View style={paymentStyles.divider} />

          <View style={paymentStyles.totalRow}>
            <View style={paymentStyles.totalLabelWrap}>
              <Text style={paymentStyles.totalLabel}>Total Amount</Text>
              <Text style={paymentStyles.totalSublabel}>Inclusive of all taxes</Text>
            </View>
            <Text style={paymentStyles.totalAmount}>₹{totalAmount}</Text>
          </View>
        </View>

        {/* Pay Button */}
        <TouchableOpacity
          onPress={handlePay}
          disabled={loading}
          style={[paymentStyles.payButton, loading && paymentStyles.payButtonDisabled]}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.surface} />
          ) : (
            <Text style={paymentStyles.payButtonText}>Pay ₹{totalAmount} & Confirm</Text>
          )}
        </TouchableOpacity>

        {/* Security Notice */}
        <View style={paymentStyles.securityNotice}>
          <View style={paymentStyles.securityHeader}>
            <ShieldIcon size={16} color={theme.colors.primary} />
            <Text style={paymentStyles.securityText}>100% Secure Payment</Text>
            <CheckBadgeIcon size={14} color={theme.colors.success} />
          </View>
          <Text style={paymentStyles.securitySubtext}>Powered by PredCare Health</Text>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

export default PaymentScreen;

