import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import OtpInput from '../../components/commons/OtpInput';
import { MailIcon } from '../../components/ui/icons';
import { useResendEmailOtp, useVerifyEmail } from '../../hooks/react-query/auth/auth.hooks';
import { fetchProfileQuery } from '../../hooks/react-query/profile/profile.hooks';
import { TVerifyEmailSchemaType, VerifyEmailSchema } from '../../lib/schemas/auth.schema';
import { Assets } from '../../resources/assets';
import type { EmailVerifyScreenNavigationProp, EmailVerifyScreenRouteProp } from '../../route';
import { AppRoute } from '../../route';
import { emailVerifyStyles } from '../../styled/EmailVerifyScreen.styled';
import { useAuthStore } from '../../zustand/stores/useAuthStore';

export interface EmailVerifyScreenProps {
  navigation?: EmailVerifyScreenNavigationProp;
  route?: EmailVerifyScreenRouteProp;
}

export const EmailVerifyScreen: React.FC<EmailVerifyScreenProps> = ({
  navigation: propNavigation,
  route: propRoute,
}) => {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 32, 480);
  const defaultNavigation = useNavigation<EmailVerifyScreenNavigationProp>();
  const defaultRoute = useRoute<EmailVerifyScreenRouteProp>();
  const navigation = propNavigation || defaultNavigation;
  const route = propRoute || defaultRoute;
  const passedEmail = route?.params?.email || '';
  const { userData, setUserData } = useAuthStore(state => state);
  const targetEmail = passedEmail || userData?.email || '';

  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TVerifyEmailSchemaType>({
    resolver: yupResolver(VerifyEmailSchema),
    defaultValues: {
      email: targetEmail,
      otp: '',
    },
    mode: 'onChange',
  });

  const otpValue = watch('otp') || '';
  const isOtpComplete = otpValue.trim().length === 6;

  // Mutations
  const { mutate: verifyEmailMutate, isPending: isVerifying } = useVerifyEmail();
  const { mutate: resendEmailOtpMutate, isPending: isResending } = useResendEmailOtp();

  const onVerifySubmit = (formData: TVerifyEmailSchemaType) => {
    Keyboard.dismiss();
    verifyEmailMutate(
      {
        email: formData.email,
        otp: formData.otp,
      },
      {
        onSuccess: async res => {
          let updatedUserData = userData;
          try {
            const profileRes = await fetchProfileQuery(true);
            if (profileRes?.data) {
              updatedUserData = profileRes.data;
              setUserData(profileRes.data);
            }
          } catch (err) {
            console.error('Failed to fetch profile after email verification:', err);
          }

          const nav = navigation || defaultNavigation;
          if (nav) {
            if (!updatedUserData?.has_accepted_policies) {
              if (typeof nav.replace === 'function') {
                nav.replace(AppRoute.POLICY_ACCEPTANCE);
              } else if (typeof nav.navigate === 'function') {
                nav.navigate(AppRoute.POLICY_ACCEPTANCE);
              }
            } else {
              if (typeof nav.reset === 'function') {
                nav.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                });
              } else if (typeof nav.navigate === 'function') {
                nav.navigate('Home');
              }
            }
          }
        },
        onError: err => {
          console.error('Failed to verify email:', err);
        },
      }
    );
  };

  const handleResendOtp = () => {
    resendEmailOtpMutate(
      { email: targetEmail },
      {
        onSuccess: () => {
          setResendTimer(60);
          setCanResend(false);
        },
        onError: err => {
          console.error('Failed to resend email OTP:', err);
        },
      }
    );
  };

  const handleSkipForNow = () => {
    const nav = navigation || defaultNavigation;
    if (nav) {
      if (!userData?.has_accepted_policies) {
        if (typeof nav.replace === 'function') {
          nav.replace(AppRoute.POLICY_ACCEPTANCE);
        } else if (typeof nav.navigate === 'function') {
          nav.navigate(AppRoute.POLICY_ACCEPTANCE);
        }
      } else {
        if (typeof nav.reset === 'function') {
          nav.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        } else if (typeof nav.navigate === 'function') {
          nav.navigate('Home');
        }
      }
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  return (
    <SafeAreaWrapper style={emailVerifyStyles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={emailVerifyStyles.keyboardAvoid}
      >
        <ScrollView
          style={emailVerifyStyles.scrollContainer}
          contentContainerStyle={emailVerifyStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={emailVerifyStyles.logoContainer}>
            <Image source={Assets.logo2} style={emailVerifyStyles.logo} resizeMode="contain" />
          </View>

          <View style={[emailVerifyStyles.card, { width: cardWidth }]}>
            <View style={emailVerifyStyles.titleContainer}>
              <View style={emailVerifyStyles.titleIconContainer}>
                <MailIcon size={28} color="#0F766E" />
              </View>
              <Text style={emailVerifyStyles.title}>Verify Your Email</Text>
              <Text style={emailVerifyStyles.subtitle}>We sent a 6-digit verification code to</Text>
              <Text style={emailVerifyStyles.emailBadge}>{targetEmail}</Text>
            </View>

            {/* OTP Section */}
            <View style={emailVerifyStyles.otpSection}>
              <Text style={emailVerifyStyles.otpLabel}>Enter 6-digit verification code</Text>
              <Controller
                control={control}
                name="otp"
                render={({ field: { onChange, value } }) => (
                  <OtpInput value={value || ''} onChange={onChange} numInputs={6} />
                )}
              />
              {errors.otp ? (
                <Text style={emailVerifyStyles.errorText}>{errors.otp.message}</Text>
              ) : null}

              {/* Resend Container */}
              <View style={emailVerifyStyles.resendContainer}>
                <Text style={emailVerifyStyles.resendText}>Didn't receive code? </Text>
                {canResend ? (
                  <Pressable
                    disabled={isResending}
                    onPress={handleResendOtp}
                    style={({ pressed }) => [pressed && { opacity: 0.6 }]}
                  >
                    <Text style={emailVerifyStyles.resendLink}>
                      {isResending ? 'Sending...' : 'Resend Code'}
                    </Text>
                  </Pressable>
                ) : (
                  <Text style={emailVerifyStyles.timerText}>
                    Resend in <Text style={emailVerifyStyles.timerBold}>{resendTimer}s</Text>
                  </Text>
                )}
              </View>
            </View>

            <Pressable
              disabled={!isOtpComplete || isVerifying}
              style={({ pressed }) => [
                emailVerifyStyles.primaryButton,
                (!isOtpComplete || isVerifying) && emailVerifyStyles.buttonDisabled,
                pressed && isOtpComplete && !isVerifying && { opacity: 0.85 },
              ]}
              onPress={handleSubmit(onVerifySubmit)}
            >
              {isVerifying ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={emailVerifyStyles.primaryButtonText}>Verify & Continue</Text>
              )}
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                emailVerifyStyles.secondaryButton,
                pressed && { opacity: 0.85 },
              ]}
              onPress={handleSkipForNow}
            >
              <Text style={emailVerifyStyles.secondaryButtonText}>Skip For Now</Text>
            </Pressable>

            {/* Bottom Support Hint */}
            <View style={emailVerifyStyles.bottomSection}>
              <Text style={emailVerifyStyles.helpText}>
                Need help? Contact PRED Care support team
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
};

export default EmailVerifyScreen;
