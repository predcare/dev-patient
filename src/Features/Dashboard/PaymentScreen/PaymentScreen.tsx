import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import {
    CalendarIcon,
    CheckBadgeIcon,
    ClinicIcon,
    ClockIcon,
    CreditCardIcon,
    PatientsIcon,
    ShieldIcon,
    StethoscopeIcon,
    VideoIcon,
} from '../../../components/ui/icons';
import { SocketEvents } from '../../../config/socket.constants';
import { useRazorpay } from '../../../hooks/commons/useRazorpay';
import { useCreateAppointment } from '../../../hooks/react-query/appointments/appointments.hooks';
import Header from '../../../Layout/Header';
import SafeAreaWrapper from '../../../Layout/SafeAreaWrapper';
import { getInitials } from '../../../lib/common/common.utils';
import { showErrorToast, showInfoToast, showSuccessToast } from '../../../lib/common/toast.utils';
import { AppRoute } from '../../../route';
import paymentStyles from '../../../styled/PaymentScreen.styled';
import theme from '../../../styled/theme.styled';
import { IBookingData } from '../../../typescripts/interfaces/appointments.interfaces';
import { useAuthStore } from '../../../zustand/stores/useAuthStore';
import { useSocketStore } from '../../../zustand/stores/useSocketStore';

export const PaymentScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { userData } = useAuthStore(state => state);
    const { socketConnection } = useSocketStore((state) => state)
    const bookingData: Partial<IBookingData> = route.params?.bookingData || {};
    const isFeeHidden = Boolean(
        bookingData.isFeeHidden || bookingData.hideFee || bookingData.hide_fee
    );
    const totalAmount = isFeeHidden
        ? 0
        : route.params?.totalAmount ||
        bookingData.totalAmount ||
        (bookingData.consultationFee ?? 0) + (bookingData.platformFee ?? 0);

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [imageError, setImageError] = useState<boolean>(false);

    const doctorName = bookingData.doctor?.doctor_name;
    const doctorSpecialization = bookingData.doctor?.specialization;

    const doctorImage = bookingData.doctor?.profile_image;
    const clinicName = bookingData.clinic?.name;
    const clinicCity = bookingData.clinic?.city;

    const { mutate: createAppointmentMutation } = useCreateAppointment();
    const { openCheckout, isLoading: isRazorpayLoading } = useRazorpay({
        onPaymentDismiss: () => {
            setIsSubmitting(false);
            showInfoToast('Payment Cancelled by User');
            if (socketConnection) {
                socketConnection.emit(SocketEvents.PAYMENT_CANCEL_USER, { appointment_id: bookingData.id })
            }
        },
        onPaymentFailure: (error: unknown) => {
            setIsSubmitting(false);
            console.log('Payment failure:', error);
            showErrorToast('Payment failed. Please try again.');
        },
    });

    const handlePay = async () => {
        if (isSubmitting || isRazorpayLoading) return;

        setIsSubmitting(true);

        const apiPayload = bookingData.apiPayload || {};
        const payloadToSend = {
            ...apiPayload,
            reason: bookingData.reason || undefined,
        };

        const doctorName = bookingData.doctor?.doctor_name || bookingData.doctorName || 'Doctor';
        const patientName = bookingData.patientName || userData?.name || 'Patient';

        createAppointmentMutation(payloadToSend, {
            onSuccess: async (res: any) => {
                const data = res?.data;
                const appointmentId = data?.appointment_id || data?._id || data?.id || '';
                const bookingId = data?.appointment?.id

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
                            color: theme.colors.primary || '#0EA5E9',
                            backdrop_color: theme.colors.primary || '#0EA5E9',
                        }
                    );

                    if (checkoutResult) {
                        setIsSubmitting(false);
                        navigation.replace('PaymentProcessing', {
                            bookingData: {
                                ...bookingData,
                                appointmentId: appointmentId || data.order_id,
                                totalAmount,
                            },
                            paymentVerifyParams: {
                                appointment_id: appointmentId,
                                razorpay_order_id: checkoutResult.razorpay_order_id || data.order_id,
                                razorpay_payment_id: checkoutResult.razorpay_payment_id,
                            },
                        });
                    } else {
                        setIsSubmitting(false);
                    }
                } else {
                    setIsSubmitting(false);
                    showSuccessToast('Appointment confirmed successfully!');
                    navigation.replace(AppRoute.BOOKING_SUCCESS, {
                        appointmentId: bookingId,
                        bookingData: {
                            ...bookingData,
                            appointmentId: appointmentId,
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

    return (
        <SafeAreaWrapper
            header={
                <Header
                    title="Payment"
                    subtitle="Complete appointment booking"
                    isBackBtn={true}
                    onBackPress={() => navigation.goBack()}
                />
            }
        >
            <ScrollView
                style={paymentStyles.scroll}
                contentContainerStyle={paymentStyles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={paymentStyles.doctorCard}>
                    <View style={paymentStyles.doctorCardHeader}>
                        <View style={paymentStyles.cardTitleRow}>
                            <View style={paymentStyles.doctorHeaderIconWrap}>
                                <StethoscopeIcon size={15} color={theme.colors.primary} />
                            </View>
                            <Text style={paymentStyles.cardTitle}>Doctor Info</Text>
                        </View>
                        <View style={paymentStyles.verifiedBadge}>
                            <CheckBadgeIcon size={12} color={theme.colors.primary} />
                            <Text style={paymentStyles.verifiedBadgeText}>Verified</Text>
                        </View>
                    </View>

                    <View style={paymentStyles.doctorRow}>
                        <View style={paymentStyles.doctorAvatarWrapper}>
                            {doctorImage && !imageError ? (
                                <Image
                                    source={{ uri: doctorImage }}
                                    style={paymentStyles.doctorAvatarImage}
                                    onError={() => setImageError(true)}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={paymentStyles.doctorAvatar}>
                                    <Text style={paymentStyles.doctorAvatarText}>{getInitials(doctorName)}</Text>
                                </View>
                            )}
                            <View style={paymentStyles.avatarVerifiedBadge}>
                                <CheckBadgeIcon size={10} color={theme.colors.surface} />
                            </View>
                        </View>

                        <View style={paymentStyles.doctorDetails}>
                            <Text style={paymentStyles.doctorName} numberOfLines={1}>
                                {doctorName}
                            </Text>

                            <View style={paymentStyles.doctorMetaRow}>
                                <View style={paymentStyles.specializationBadge}>
                                    <StethoscopeIcon size={11} color={theme.colors.primary} />
                                    <Text style={paymentStyles.doctorSpecialization} numberOfLines={1}>
                                        {doctorSpecialization}
                                    </Text>
                                </View>
                            </View>

                            {clinicName ? (
                                <View style={paymentStyles.clinicRow}>
                                    <ClinicIcon size={12} color={theme.colors.textMuted} />
                                    <Text style={paymentStyles.clinicText} numberOfLines={1}>
                                        {clinicName}
                                        {clinicCity ? ` • ${clinicCity}` : ''}
                                    </Text>
                                </View>
                            ) : null}
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
