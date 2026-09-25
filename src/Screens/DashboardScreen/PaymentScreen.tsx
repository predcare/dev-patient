import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import { queryClient } from '../../components/providers/ReactQueryProvider';
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
import { useRazorpay } from '../../hooks/commons/useRazorpay';
import {
  useCheckPaymentStatus,
  useCreateAppointment,
} from '../../hooks/react-query/appointments/appointments.hooks';
import { AppointmemntQueryKey, DoctorQueryKeys } from '../../hooks/react-query/query.keys';
import { getInitials } from '../../lib/common/common.utils';
import { showErrorToast, showInfoToast, showSuccessToast } from '../../lib/common/toast.utils';
import { paymentStyles } from '../../styled/PaymentScreen.styled';
import { theme } from '../../styled/theme.styled';
import { useAuthStore } from '../../zustand/stores/useAuthStore';
import { useLoadingStore } from '../../zustand/stores/useLoadingStore';

export const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userData } = useAuthStore(state => state);
  const { showLoader, hideLoader } = useLoadingStore(state => state);

  const bookingData = route.params?.bookingData || {};
  const isFeeHidden = Boolean(
    bookingData.isFeeHidden || bookingData.hideFee || bookingData.hide_fee
  );
  const totalAmount = isFeeHidden
    ? 0
    : route.params?.totalAmount ||
      bookingData.totalAmount ||
      (bookingData.consultationFee ?? 0) + (bookingData.platformFee ?? 0);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [verificationStatus, setVerificationStatus] = useState<
    'idle' | 'validating' | 'success' | 'error'
  >('idle');
  const [paymentVerifyParams, setPaymentVerifyParams] = useState<{
    appointment_id: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    enabled: boolean;
  }>({
    appointment_id: '',
    razorpay_order_id: '',
    razorpay_payment_id: '',
    enabled: false,
  });

  const { refetch: refetchPaymentStatus } = useCheckPaymentStatus(paymentVerifyParams);

  const { mutate: createAppointmentMutation } = useCreateAppointment();
  const { openCheckout, isLoading: isRazorpayLoading } = useRazorpay({
    onPaymentDismiss: () => {
      setIsSubmitting(false);
      showInfoToast('Payment Cancelled by User');
    },
    onPaymentFailure: error => {
      setIsSubmitting(false);
      console.log('Payment failure:', error);
    },
  });

  const handlePay = async () => {
    if (isSubmitting || isRazorpayLoading) return;

    setIsSubmitting(true);

    const apiPayload = bookingData.apiPayload || {};
    const payloadToSend = {
      ...apiPayload,
      reason: apiPayload.reason || bookingData.reason || undefined,
    };

    const doctorName = bookingData.doctor?.doctor_name || bookingData.doctorName || 'Doctor';
    const patientName = bookingData.patientName || userData?.name || 'Patient';

    createAppointmentMutation(payloadToSend, {
      onSuccess: async (res: any) => {
        const data = res?.data;
        const appointmentId = data?.appointment_id || data?._id || data?.id || '';

        if (data?.requires_payment && data?.order_id) {
          const checkoutResult = await openCheckout(
            {
              key: data.key_id,
              amount: data.amount_paise || Math.round(Number(data.amount) * 100),
              order_id: data.order_id,
              currency: data.currency || 'INR',
              name: 'PRED Care',
              description: `Appointment with ${doctorName}`,
            },
            {
              name: userData?.name || patientName,
              email: userData?.email || '',
              contact: userData?.phone_number || '',
            },
            {
              color: theme.colors.primaryDark || '#0EA5E9',
              backdrop_color: '#000000',
            }
          );

          if (checkoutResult) {
            setPaymentVerifyParams({
              appointment_id: appointmentId,
              razorpay_order_id: checkoutResult.razorpay_order_id || data.order_id,
              razorpay_payment_id: checkoutResult.razorpay_payment_id,
              enabled: true,
            });
            setVerificationStatus('validating');
          } else {
            setIsSubmitting(false);
          }
        } else {
          // Free appointment / no payment required
          setIsSubmitting(false);
          showSuccessToast('Appointment confirmed successfully!');
          navigation.replace('BookingSuccess', {
            bookingData: {
              ...bookingData,
              appointmentId: appointmentId || data?.order_id,
              ...data,
            },
          });
        }
      },
      onError: (err: any) => {
        setIsSubmitting(false);
        showErrorToast(
          err?.response?.data?.message || err?.message || 'Failed to create appointment.'
        );
      },
    });
  };

  useEffect(() => {
    if (verificationStatus !== 'validating') return;

    showLoader('Verifying payment and confirming your appointment...');

    let attempts = 0;
    const maxDuration = 45 * 1000; // 45 seconds max
    const intervalTime = 3000; // 3 seconds interval

    const interval = setInterval(async () => {
      attempts++;
      try {
        const { data } = await refetchPaymentStatus();
        const statusData: any = data?.data;

        const isPaid =
          statusData?.payment_status?.toLowerCase() === 'paid' || statusData?.is_paid === true;
        const isConfirmed =
          statusData?.appointment_status?.toLowerCase() === 'confirmed' ||
          statusData?.booking_completed === true;

        if (isPaid && isConfirmed) {
          clearInterval(interval);
          setVerificationStatus('success');
          await queryClient.invalidateQueries({ queryKey: [DoctorQueryKeys.GET_AVAIL_DATES] });
          await queryClient.invalidateQueries({ queryKey: [DoctorQueryKeys.GET_SLOTS_BY_DATE] });
          await queryClient.invalidateQueries({ queryKey: [DoctorQueryKeys.MY_DOCS] });
          await queryClient.invalidateQueries({
            queryKey: [AppointmemntQueryKey.ALL_APPOINTMENTS],
          });
          hideLoader();
          setIsSubmitting(false);
          showSuccessToast('Appointment confirmed & payment successful!');
          navigation.replace('BookingSuccess', {
            bookingData: {
              ...bookingData,
              ...statusData,
              appointmentId:
                statusData?.appointment_id ||
                paymentVerifyParams.appointment_id ||
                paymentVerifyParams.razorpay_order_id,
              paymentStatus: statusData?.payment_status || 'paid',
              appointmentStatus: statusData?.appointment_status || 'confirmed',
            },
          });
          return;
        }

        if (
          statusData?.payment_status === 'failed' ||
          statusData?.appointment_status === 'cancelled'
        ) {
          clearInterval(interval);
          setVerificationStatus('error');
          hideLoader();
          setIsSubmitting(false);
          showErrorToast('Payment or appointment confirmation failed. Please contact support.');
          return;
        }
      } catch (err: any) {
        console.log('Error verifying payment status:', err);
      }

      // Stop after max duration if not active or confirmed
      if (attempts * intervalTime >= maxDuration) {
        clearInterval(interval);
        setVerificationStatus('error');
        hideLoader();
        setIsSubmitting(false);
        showInfoToast(
          'Payment verification is taking longer than expected. Please check your schedule.'
        );
        navigation.replace('Schedule', { refresh: true });
      }
    }, intervalTime);

    return () => {
      clearInterval(interval);
      hideLoader();
    };
  }, [
    verificationStatus,
    paymentVerifyParams,
    refetchPaymentStatus,
    bookingData,
    navigation,
    showLoader,
    hideLoader,
  ]);

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
              <Text style={paymentStyles.doctorAvatarText}>
                {getInitials(bookingData.doctor?.doctor_name || bookingData.doctorName || 'Dr.')}
              </Text>
            </View>
            <View style={paymentStyles.doctorDetails}>
              <Text style={paymentStyles.doctorName}>
                {bookingData.doctor?.doctor_name || bookingData.doctorName || 'Doctor'}
              </Text>
              <View style={paymentStyles.specializationBadge}>
                <Text style={paymentStyles.doctorSpecialization}>
                  {bookingData.doctor?.specialization ||
                    bookingData.doctorSpecialization ||
                    'Specialist'}
                </Text>
              </View>
            </View>
          </View>
        </View>
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
                <Text style={paymentStyles.detailValue}>
                  {bookingData.dateLabel || bookingData.date || 'Date'}
                </Text>
              </View>
            </View>

            <View style={paymentStyles.detailItem}>
              <View style={paymentStyles.iconBox}>
                <ClockIcon size={16} color={theme.colors.primary} />
              </View>
              <View style={paymentStyles.detailTextWrap}>
                <Text style={paymentStyles.detailLabel}>TIME</Text>
                <Text style={paymentStyles.detailValue}>{bookingData.slot || 'Selected Slot'}</Text>
              </View>
            </View>

            <View style={paymentStyles.detailItem}>
              <View style={paymentStyles.iconBox}>
                {(bookingData.consultation_type || bookingData.consultationType) === 'video' ? (
                  <VideoIcon size={16} color={theme.colors.primary} />
                ) : (
                  <StethoscopeIcon size={16} color={theme.colors.primary} />
                )}
              </View>
              <View style={paymentStyles.detailTextWrap}>
                <Text style={paymentStyles.detailLabel}>CONSULTATION TYPE</Text>
                <View style={paymentStyles.typeBadge}>
                  <Text style={paymentStyles.typeBadgeText}>
                    {(bookingData.consultation_type || bookingData.consultationType) === 'video'
                      ? 'Video Consult'
                      : 'In-Person Visit'}
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
                <Text style={paymentStyles.detailValue}>
                  {bookingData.patientName || userData?.name || 'Patient'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Summary Card */}
        {totalAmount > 0 && (
          <View style={paymentStyles.card}>
            <View style={paymentStyles.cardHeader}>
              <View style={paymentStyles.cardTitleRow}>
                <CreditCardIcon size={18} color={theme.colors.primary} />
                <Text style={paymentStyles.cardTitle}>Payment Summary</Text>
              </View>
            </View>

            <View style={paymentStyles.feeRow}>
              <Text style={paymentStyles.feeLabel}>Consultation Fee</Text>
              <Text style={paymentStyles.feeAmount}>
                ₹{bookingData.consultationFee ?? totalAmount - (bookingData.platformFee ?? 0)}
              </Text>
            </View>
            <View style={paymentStyles.feeRow}>
              <Text style={paymentStyles.feeLabel}>Platform Fee</Text>
              <Text style={paymentStyles.feeAmount}>₹{bookingData.platformFee ?? 0}</Text>
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
        )}
        <TouchableOpacity
          onPress={handlePay}
          disabled={isSubmitting || isRazorpayLoading}
          style={[
            paymentStyles.payButton,
            (isSubmitting || isRazorpayLoading) && paymentStyles.payButtonDisabled,
          ]}
          activeOpacity={0.85}
        >
          {isSubmitting || isRazorpayLoading ? (
            <ActivityIndicator color={theme.colors.surface} />
          ) : (
            <Text style={paymentStyles.payButtonText}>
              {totalAmount > 0 ? `Pay ₹${totalAmount} & Confirm` : 'Confirm Appointment'}
            </Text>
          )}
        </TouchableOpacity>
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
