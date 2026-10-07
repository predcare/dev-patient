import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  BackHandler,
  Easing,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { queryClient } from '../../../components/providers/ReactQueryProvider';
import {
  CheckIcon,
  ClockIcon,
  InfoCircleIcon,
  XCircleIcon,
} from '../../../components/ui/icons';
import { getBookingPaymentStatus } from '../../../hooks/react-query/appointments/appointments.funcs';
import { AppointmemntQueryKey, DoctorQueryKeys } from '../../../hooks/react-query/query.keys';
import Header from '../../../Layout/Header';
import SafeAreaWrapper from '../../../Layout/SafeAreaWrapper';
import { showErrorToast, showInfoToast, showSuccessToast } from '../../../lib/common/toast.utils';
import { AppRoute } from '../../../route';
import paymentProcessingStyles from '../../../styled/PaymentProcessingScreen.styled';
import theme from '../../../styled/theme.styled';

type TVerificationState = 'processing' | 'success' | 'error' | 'timeout';

export const PaymentProcessingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const bookingData = route.params?.bookingData || {};
  const paymentVerifyParams = route.params?.paymentVerifyParams || {
    appointment_id: '',
    razorpay_order_id: '',
    razorpay_payment_id: '',
  };

  const [verificationStatus, setVerificationStatus] = useState<TVerificationState>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(12);
  const [stageMessage, setStageMessage] = useState<string>('Initiating secure payment verification...');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.7)).current;
  const badgeScaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0.12)).current;

  const isAllowedNavigationRef = useRef<boolean>(false);
  const successTimeoutRef = useRef<any | null>(null);

  const showBackWarning = useCallback(() => {
    Alert.alert(
      'Payment In Progress',
      'Please do not exit or navigate back while your payment and appointment confirmation are being processed.',
      [{ text: 'Stay Here', style: 'cancel' }],
      { cancelable: false }
    );
    showInfoToast('Payment confirmation in progress. Please do not close or leave the app.');
  }, []);

  const handleBack = useCallback(() => {
    if (verificationStatus === 'error' || verificationStatus === 'timeout') {
      isAllowedNavigationRef.current = true;
      navigation.navigate('Home');
    }
  }, [verificationStatus, navigation]);

  const handleRetry = useCallback(() => {
    isAllowedNavigationRef.current = true;
    navigation.navigate(AppRoute.BOOK_APPOINTMENT, {
      doctorId: bookingData.doctor?.id || bookingData.doctorId,
      doctor: bookingData.doctor,
    });
  }, [navigation, bookingData]);

  const handleGoSchedule = useCallback(() => {
    isAllowedNavigationRef.current = true;
    navigation.navigate(AppRoute.SCHEDULE, { refresh: true });
  }, [navigation]);

  const handleContactSupport = useCallback(() => {
    isAllowedNavigationRef.current = true;
    navigation.navigate(AppRoute.SUPPORT);
  }, [navigation]);

  useEffect(() => {
    const listenerId = progressAnim.addListener(({ value }) => {
      setProgressPercent(Math.min(100, Math.max(0, Math.round(value * 100))));
    });
    return () => {
      progressAnim.removeListener(listenerId);
    };
  }, [progressAnim]);

  useEffect(() => {
    navigation.setOptions({ gestureEnabled: false });

    const unsubscribeBeforeRemove = navigation.addListener('beforeRemove', (e: any) => {
      if (isAllowedNavigationRef.current) return;
      if (verificationStatus === 'processing') {
        e.preventDefault();
        showBackWarning();
      }
    });

    const onBackPress = () => {
      if (verificationStatus === 'processing') {
        showBackWarning();
        return true;
      }
      if (verificationStatus === 'success') {
        return true;
      }
      if (verificationStatus === 'timeout') {
        isAllowedNavigationRef.current = true;
        navigation.navigate(AppRoute.SCHEDULE, { refresh: true });
        return true;
      }
      if (verificationStatus === 'error') {
        isAllowedNavigationRef.current = true;
        navigation.navigate('Home');
        return true;
      }
      return false;
    };

    const backSubscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => {
      unsubscribeBeforeRemove();
      backSubscription.remove();
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, [verificationStatus, navigation, showBackWarning]);

  useEffect(() => {
    if (verificationStatus !== 'processing') return;

    Animated.timing(progressAnim, {
      toValue: 0.35,
      duration: 1200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    const stageTimer1 = setTimeout(() => {
      setStageMessage('Verifying transaction with your bank...');
      Animated.timing(progressAnim, {
        toValue: 0.65,
        duration: 2500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }, 2000);

    const stageTimer2 = setTimeout(() => {
      setStageMessage('Securing your appointment reservation...');
      Animated.timing(progressAnim, {
        toValue: 0.88,
        duration: 3500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }, 5000);

    const pulseAnimation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 1200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, { toValue: 0.3, duration: 1200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.7, duration: 1200, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        ]),
      ])
    );
    pulseAnimation.start();

    let attempts = 0;
    const maxDuration = 45000;
    const intervalTime = 3000;

    const pollInterval = setInterval(async () => {
      attempts++;
      try {
        const response: any = await getBookingPaymentStatus({
          appointment_id: paymentVerifyParams.appointment_id,
          razorpay_order_id: paymentVerifyParams.razorpay_order_id,
          razorpay_payment_id: paymentVerifyParams.razorpay_payment_id,
        });

        const statusData: any = response?.data;
        const isPaid = statusData?.payment_status?.toLowerCase() === 'paid' || statusData?.is_paid === true;
        const isConfirmed = statusData?.appointment_status?.toLowerCase() === 'confirmed' || statusData?.booking_completed === true;

        if (isPaid && isConfirmed) {
          clearInterval(pollInterval);
          setVerificationStatus('success');

          Animated.sequence([
            Animated.spring(badgeScaleAnim, { toValue: 1.15, friction: 4, useNativeDriver: true }),
            Animated.spring(badgeScaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
          ]).start();

          setStageMessage('Appointment confirmed & slot reserved!');
          Animated.timing(progressAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();

          await queryClient.invalidateQueries({ queryKey: [DoctorQueryKeys.GET_AVAIL_DATES] });
          await queryClient.invalidateQueries({ queryKey: [DoctorQueryKeys.GET_SLOTS_BY_DATE] });
          await queryClient.invalidateQueries({ queryKey: [DoctorQueryKeys.MY_DOCS] });
          await queryClient.invalidateQueries({ queryKey: [AppointmemntQueryKey.ALL_APPOINTMENTS] });

          showSuccessToast('Payment confirmed & appointment scheduled!');

          successTimeoutRef.current = setTimeout(() => {
            isAllowedNavigationRef.current = true;
            navigation.replace(AppRoute.BOOKING_SUCCESS, {
              appointmentId: statusData?.appointment_id,
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
          }, 1500);
          return;
        }

        if (statusData?.payment_status === 'failed' || statusData?.appointment_status === 'cancelled') {
          clearInterval(pollInterval);
          setVerificationStatus('error');
          setStageMessage('Transaction verification failed');
          setErrorMessage(statusData?.failure_reason || 'Payment or appointment confirmation failed. Please contact support.');
          showErrorToast('Payment or appointment confirmation failed. Please contact support.');
          return;
        }
      } catch (err: any) {
        console.log('Payment verification error:', err);
      }

      if (attempts * intervalTime >= maxDuration) {
        clearInterval(pollInterval);
        setVerificationStatus('timeout');
        setStageMessage('Verification response delayed');
        showInfoToast('Payment verification is taking longer than expected. Please check your schedule.');
      }
    }, intervalTime);

    return () => {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      pulseAnimation.stop();
      clearInterval(pollInterval);
    };
  }, [verificationStatus, paymentVerifyParams, bookingData, navigation, badgeScaleAnim, progressAnim, pulseAnim, pulseOpacity]);

  const headerConfig = useMemo(() => {
    switch (verificationStatus) {
      case 'processing':
        return { title: 'Payment Verification', subtitle: 'Securing your appointment reservation', isBackBtn: false };
      case 'success':
        return { title: 'Payment Confirmed', subtitle: 'Appointment booked successfully', isBackBtn: false };
      case 'error':
        return { title: 'Payment Status', subtitle: 'Unable to confirm transaction', isBackBtn: true };
      case 'timeout':
      default:
        return { title: 'Verification Pending', subtitle: 'Taking longer than expected', isBackBtn: true };
    }
  }, [verificationStatus]);

  const statusContent = useMemo(() => {
    switch (verificationStatus) {
      case 'processing':
        return {
          title: 'Processing Your Payment',
          subtitle: 'Please stay on this screen while we securely verify your payment with the clinic bank.',
          subnote: 'Real-time communication with clinic authorization server',
          titleStyle: paymentProcessingStyles.title,
          dotStyle: null,
          percentStyle: null,
          progressFillStyle: null,
          badgeStyle: null,
          badgeIcon: <ActivityIndicator size="small" color={theme.colors.surface} />,
        };
      case 'success':
        return {
          title: 'Payment Confirmed!',
          subtitle: 'Your appointment slot is reserved. Preparing confirmation details...',
          subnote: 'Redirecting to appointment confirmation...',
          titleStyle: [paymentProcessingStyles.title, paymentProcessingStyles.titleSuccess],
          dotStyle: paymentProcessingStyles.progressDotSuccess,
          percentStyle: paymentProcessingStyles.progressPercentSuccess,
          progressFillStyle: paymentProcessingStyles.progressBarFillSuccess,
          badgeStyle: paymentProcessingStyles.centerBadgeSuccess,
          badgeIcon: <CheckIcon size={32} color={theme.colors.surface} />,
        };
      case 'error':
        return {
          title: 'Payment Confirmation Failed',
          subtitle: errorMessage || 'We could not verify your payment. If money was debited, it will be refunded within 3-5 business days.',
          subnote: 'Transaction halted. You can retry or contact clinic support.',
          titleStyle: [paymentProcessingStyles.title, paymentProcessingStyles.titleError],
          dotStyle: paymentProcessingStyles.progressDotError,
          percentStyle: paymentProcessingStyles.progressPercentError,
          progressFillStyle: paymentProcessingStyles.progressBarFillError,
          badgeStyle: paymentProcessingStyles.centerBadgeError,
          badgeIcon: <XCircleIcon size={32} color={theme.colors.surface} />,
        };
      case 'timeout':
      default:
        return {
          title: 'Confirmation In Progress',
          subtitle: 'Your bank response is taking longer than usual. Please check your schedule or contact support if the slot is not updated.',
          subnote: 'Your payment is still being confirmed. Check your schedule shortly.',
          titleStyle: [paymentProcessingStyles.title, paymentProcessingStyles.titleWarning],
          dotStyle: paymentProcessingStyles.progressDotWarning,
          percentStyle: paymentProcessingStyles.progressPercentWarning,
          progressFillStyle: paymentProcessingStyles.progressBarFillWarning,
          badgeStyle: paymentProcessingStyles.centerBadgeWarning,
          badgeIcon: <ClockIcon size={32} color={theme.colors.surface} />,
        };
    }
  }, [verificationStatus, errorMessage]);

  const actionButtons = useMemo(() => {
    if (verificationStatus === 'error') {
      return (
        <View style={paymentProcessingStyles.actionButtonsWrap}>
          <TouchableOpacity style={paymentProcessingStyles.primaryBtn} onPress={handleRetry} activeOpacity={0.85}>
            <Text style={paymentProcessingStyles.primaryBtnText}>Retry Booking</Text>
          </TouchableOpacity>
          <TouchableOpacity style={paymentProcessingStyles.secondaryBtn} onPress={handleContactSupport} activeOpacity={0.85}>
            <Text style={paymentProcessingStyles.secondaryBtnText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (verificationStatus === 'timeout') {
      return (
        <View style={paymentProcessingStyles.actionButtonsWrap}>
          <TouchableOpacity style={paymentProcessingStyles.primaryBtn} onPress={handleGoSchedule} activeOpacity={0.85}>
            <Text style={paymentProcessingStyles.primaryBtnText}>Check Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity style={paymentProcessingStyles.secondaryBtn} onPress={handleContactSupport} activeOpacity={0.85}>
            <Text style={paymentProcessingStyles.secondaryBtnText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  }, [verificationStatus, handleRetry, handleGoSchedule, handleContactSupport]);

  return (
    <SafeAreaWrapper
      style={paymentProcessingStyles.container}
      header={
        <Header
          title={headerConfig.title}
          subtitle={headerConfig.subtitle}
          isBackBtn={headerConfig.isBackBtn}
          onBackPress={handleBack}
          isLang={false}
          isNotifyShow={false}
        />
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={paymentProcessingStyles.scrollContent}
      >
        <View style={paymentProcessingStyles.mainCard}>
          <View style={paymentProcessingStyles.radarContainer}>
            {verificationStatus === 'processing' && (
              <>
                <Animated.View
                  style={[
                    paymentProcessingStyles.radarOuterRing,
                    { transform: [{ scale: pulseAnim }], opacity: pulseOpacity },
                  ]}
                />
                <Animated.View
                  style={[
                    paymentProcessingStyles.radarMiddleRing,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                />
              </>
            )}

            <Animated.View
              style={[
                paymentProcessingStyles.centerBadge,
                statusContent.badgeStyle,
                { transform: [{ scale: badgeScaleAnim }] },
              ]}
            >
              {statusContent.badgeIcon}
            </Animated.View>
          </View>

          <Text style={statusContent.titleStyle}>{statusContent.title}</Text>
          <Text style={paymentProcessingStyles.subtitle}>{statusContent.subtitle}</Text>

          <View style={paymentProcessingStyles.progressSection}>
            <View style={paymentProcessingStyles.progressMetaRow}>
              <View style={paymentProcessingStyles.progressStatusGroup}>
                <View style={[paymentProcessingStyles.progressDot, statusContent.dotStyle]} />
                <Text style={paymentProcessingStyles.progressStatusText} numberOfLines={1} ellipsizeMode="tail">
                  {stageMessage}
                </Text>
              </View>
              <Text style={[paymentProcessingStyles.progressPercentText, statusContent.percentStyle]}>
                {progressPercent}%
              </Text>
            </View>

            <View style={paymentProcessingStyles.progressBarTrack}>
              <Animated.View
                style={[
                  paymentProcessingStyles.progressBarFill,
                  statusContent.progressFillStyle,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>

            <Text style={paymentProcessingStyles.progressSubnote}>{statusContent.subnote}</Text>
          </View>
        </View>

        {verificationStatus === 'processing' && (
          <View style={paymentProcessingStyles.warningNotice}>
            <InfoCircleIcon size={18} color={theme.colors.primaryDark} />
            <Text style={paymentProcessingStyles.warningNoticeText}>
              Do not press back or leave the app. Your slot is being confirmed in real-time.
            </Text>
          </View>
        )}

        {actionButtons}
      </ScrollView>
    </SafeAreaWrapper>
  );
};

export default PaymentProcessingScreen;
