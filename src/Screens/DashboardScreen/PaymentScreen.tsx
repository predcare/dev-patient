import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AppHeader from '../../components/ui/AppHeader';
import { paymentStyles } from '../../styled/PaymentScreen.styled';
import { theme } from '../../styled/theme.styled';

export const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const bookingData = route.params?.bookingData || {};
  const totalAmount = route.params?.totalAmount || bookingData.totalAmount || 1050;

  const [loading, setLoading] = useState<boolean>(false);

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('BookingSuccess', { bookingData });
    }, 600);
  };

  const doctorName = bookingData.doctor?.doctor_name || 'Dr. Sarah Jenkins';
  const specialization = bookingData.doctor?.specialization || 'Cardiologist • MD';
  const patientName = bookingData.patientName || 'John Doe';
  const slotDisplay = bookingData.slot || '10:30 AM';
  const dateDisplay = bookingData.dateLabel || 'Mon, 24 Aug 2026';
  const consultationFee = bookingData.consultationFee || 1000;
  const platformFee = bookingData.platformFee || 50;

  return (
    <SafeAreaView style={paymentStyles.container}>
      <AppHeader
        title="Payment"
        subtitle="Complete your appointment booking"
        showBack={true}
      />

      <ScrollView
        style={paymentStyles.scroll}
        contentContainerStyle={paymentStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Doctor Card */}
        <View style={paymentStyles.card}>
          <View style={paymentStyles.cardHeader}>
            <Text style={paymentStyles.cardTitle}>Doctor Info</Text>
          </View>
          <Text style={paymentStyles.doctorName}>{doctorName}</Text>
          <Text style={paymentStyles.doctorSpecialization}>{specialization}</Text>
        </View>

        {/* Appointment Details Card */}
        <View style={paymentStyles.card}>
          <View style={paymentStyles.cardHeader}>
            <Text style={paymentStyles.cardTitle}>Appointment Details</Text>
          </View>
          <View style={paymentStyles.detailRow}>
            <Text style={paymentStyles.detailLabel}>DATE</Text>
            <Text style={paymentStyles.detailValue}>{dateDisplay}</Text>
          </View>
          <View style={paymentStyles.detailRow}>
            <Text style={paymentStyles.detailLabel}>TIME</Text>
            <Text style={paymentStyles.detailValue}>{slotDisplay}</Text>
          </View>
          <View style={paymentStyles.detailRow}>
            <Text style={paymentStyles.detailLabel}>CONSULTATION TYPE</Text>
            <Text style={paymentStyles.detailValue}>
              {bookingData.consultationType === 'video'
                ? 'Video Consult'
                : 'In-Person Visit'}
            </Text>
          </View>
          <View style={paymentStyles.detailRow}>
            <Text style={paymentStyles.detailLabel}>PATIENT NAME</Text>
            <Text style={paymentStyles.detailValue}>{patientName}</Text>
          </View>
        </View>

        {/* Payment Summary Card */}
        <View style={paymentStyles.card}>
          <View style={paymentStyles.cardHeader}>
            <Text style={paymentStyles.cardTitle}>Payment Summary</Text>
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
            <Text style={paymentStyles.totalLabel}>Total Amount</Text>
            <Text style={paymentStyles.totalAmount}>₹{totalAmount}</Text>
          </View>
        </View>

        {/* Pay Button */}
        <TouchableOpacity
          onPress={handlePay}
          disabled={loading}
          style={paymentStyles.payButton}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.surface} />
          ) : (
            <Text style={paymentStyles.payButtonText}>
              Pay ₹{totalAmount} & Confirm
            </Text>
          )}
        </TouchableOpacity>

        {/* Security Notice */}
        <View style={paymentStyles.securityNotice}>
          <Text style={paymentStyles.securityText}>🔒 100% Secure Payment</Text>
          <Text style={paymentStyles.securitySubtext}>
            Powered by PredCare Health
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentScreen;
