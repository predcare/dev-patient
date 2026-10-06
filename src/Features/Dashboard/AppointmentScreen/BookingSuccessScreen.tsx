import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect } from 'react';
import {
  BackHandler,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Header from '../../../Layout/Header';
import SafeAreaWrapper from '../../../Layout/SafeAreaWrapper';
import CommonErrorCard from '../../../components/commons/CommonErrorCard/CommonErrorCard';
import { CalendarIcon, CheckIcon, MapPinIcon, StethoscopeIcon } from '../../../components/ui/icons';
import { useGetApptInfo } from '../../../hooks/react-query/appointments/appointments.hooks';
import { _formatTime, formatDate, getInitials } from '../../../lib/common/common.utils';
import { AppRoute } from '../../../route';
import bookingSuccessStyles from '../../../styled/BookingSuccessScreen.styled';
import theme from '../../../styled/theme.styled';
import BookingSuccessSkeleton from './Skeletons/BookingSuccessSkeleton';

interface IRouterProps {
  appointmentId: string | number;
}
export const BookingSuccessScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { appointmentId } = route.params as IRouterProps;

  const {
    data: apptInfo,
    isFetching: apptInfoIsPending,
    isError: apptInfoIsError,
    refetch: refetchApptInfo,
  } = useGetApptInfo(appointmentId);

  const handleGoDetails = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: AppRoute.APPOINTMENT_DETAILS, params: { appointmentId } }],
    });
  };

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: AppRoute.HOME }],
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
        routes: [{ name: AppRoute.HOME }],
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
      {apptInfoIsPending && !apptInfo ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={bookingSuccessStyles.scrollContent}
        >
          <BookingSuccessSkeleton />
        </ScrollView>
      ) : apptInfoIsError && !apptInfo ? (
        <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
          <CommonErrorCard
            title="Unable to Load Booking"
            message="We could not load your appointment confirmation details. Please try again."
            onRetry={refetchApptInfo}
          />
          <TouchableOpacity
            style={[bookingSuccessStyles.dashboardBtn, { marginTop: 16 }]}
            onPress={handleGoHome}
            activeOpacity={0.85}
          >
            <Text style={bookingSuccessStyles.dashboardBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      ) : !apptInfo ? (
        <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
          <CommonErrorCard
            title="Appointment Not Found"
            message="No details found for this appointment ID."
            onRetry={refetchApptInfo}
          />
          <TouchableOpacity
            style={[bookingSuccessStyles.dashboardBtn, { marginTop: 16 }]}
            onPress={handleGoHome}
            activeOpacity={0.85}
          >
            <Text style={bookingSuccessStyles.dashboardBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
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
              Your appointment has been successfully booked with {apptInfo?.doctor?.name || 'N/A'}.
            </Text>
            <View style={bookingSuccessStyles.card}>
              <View style={bookingSuccessStyles.doctorRow}>
                <View style={bookingSuccessStyles.doctorAvatar}>
                  <Text style={bookingSuccessStyles.doctorAvatarText}>
                    {getInitials(apptInfo?.doctor?.name || 'N/A')}
                  </Text>
                </View>
                <View style={bookingSuccessStyles.doctorInfo}>
                  <Text style={bookingSuccessStyles.doctorName}>
                    {apptInfo?.doctor?.name || 'N/A'}
                  </Text>
                  <Text style={bookingSuccessStyles.doctorMeta}>
                    {apptInfo?.doctor?.specialization || 'N/A'}
                  </Text>
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
                  <Text style={bookingSuccessStyles.infoValue}>
                    {apptInfo?.clinic?.name || 'N/A'}
                  </Text>
                </View>
              </View>

              <View style={bookingSuccessStyles.infoRow}>
                <CalendarIcon size={18} color={theme.colors.primary} />
                <View style={bookingSuccessStyles.infoTextWrap}>
                  <Text style={bookingSuccessStyles.infoLabel}>Date & Time</Text>
                  <Text style={bookingSuccessStyles.infoValue}>
                    {formatDate(apptInfo?.appointment_date)} at {_formatTime(apptInfo?.start_time)}{' '}
                    - {_formatTime(apptInfo?.end_time)}
                  </Text>
                </View>
              </View>
            </View>
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
        </>
      )}
    </SafeAreaWrapper>
  );
};

export default BookingSuccessScreen;
