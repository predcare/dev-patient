import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { BackHandler, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Header from '../../../Layout/Header';
import SafeAreaWrapper from '../../../Layout/SafeAreaWrapper';
import { CalendarIcon, CheckIcon, MapPinIcon, StethoscopeIcon } from '../../../components/ui/icons';
import { getInitials } from '../../../lib/common/common.utils';
import { AppRoute } from '../../../route';
import bookingSuccessStyles from '../../../styled/BookingSuccessScreen.styled';
import theme from '../../../styled/theme.styled';
import { IBookingData } from '../../../typescripts/interfaces/appointments.interfaces';

export const BookingSuccessScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const bookingData: Partial<IBookingData> = route.params || {};
  const doctorName = bookingData.doctor?.doctor_name;
  const specialization = bookingData.doctor?.specialization;
  const clinicName = bookingData.clinic?.name;
  const dateLabel = bookingData.dateLabel;
  const slot = bookingData.slot;
  const appointmentId = bookingData.appointment_id;
  const consultationFee = bookingData.consultationFee;
  const platformFee = bookingData.platformFee;
  const totalAmount = bookingData.totalAmount;

  const handleGoDetails = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: AppRoute.APPOINTMENT_DETAILS, params: { appointmentId } }],
    });
  };

  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: false,
    });

    const unsubscribeBeforeRemove = navigation.addListener('beforeRemove', (e: any) => {
      if (e.data.action.type === 'GO_BACK') {
        e.preventDefault();
        navigation.reset({
          index: 0,
          routes: [{ name: AppRoute.HOME }],
        });
      }
    });

    const onBackPress = () => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      unsubscribeBeforeRemove();
      subscription.remove();
    };
  }, [navigation]);

  return (
    <SafeAreaWrapper
      header={
        <Header title="Booking Confirmed" isBackBtn={false} isNotifyShow={false} isLang={false} />
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={bookingSuccessStyles.scrollContent}
        keyboardShouldPersistTaps="handled"
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
        {Number(totalAmount) > 0 && (
          <View style={bookingSuccessStyles.card}>
            <View style={bookingSuccessStyles.billingHeader}>
              <Text style={bookingSuccessStyles.cardSectionTitle}>BILLING SUMMARY</Text>
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
        )}
      </ScrollView>
      <View style={bookingSuccessStyles.footerBar}>
        <TouchableOpacity
          style={bookingSuccessStyles.dashboardBtn}
          onPress={handleGoDetails}
          activeOpacity={0.85}
        >
          <Text style={bookingSuccessStyles.dashboardBtnText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaWrapper>
  );
};

export default BookingSuccessScreen;
