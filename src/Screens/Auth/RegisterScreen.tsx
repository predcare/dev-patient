import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
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
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import OtpInput from '../../components/commons/OtpInput';
import { MailIcon, PhoneIcon, ProfileIcon } from '../../components/ui/icons';
import useFcmToken from '../../hooks/commons/useFcmToken';
import {
  usePatientRegister,
  usePatientVerifyOTP,
  useReSendOtp,
} from '../../hooks/react-query/auth/auth.hooks';
import { fetchProfileQuery } from '../../hooks/react-query/profile/profile.hooks';
import { setItem, STORAGE_KEYS } from '../../lib/common/asyncStorage';
import { PatientRegisterSchema, TPatientRegisterSchemaType } from '../../lib/schemas/auth.schema';
import { Assets } from '../../resources/assets';
import {
  AppRoute,
  type RegisterScreenNavigationProp,
  type RegisterScreenRouteProp,
} from '../../route';
import { registerStyles } from '../../styled/RegisterScreen.styled';
import { useAuthStore } from '../../zustand/stores/useAuthStore';

export interface RegisterScreenProps {
  navigation?: RegisterScreenNavigationProp;
  route?: RegisterScreenRouteProp;
}

type ScreenStep = 'form' | 'otp';

interface RegisterState {
  step: ScreenStep;
  resendTimer: number;
  canResend: boolean;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation: propNavigation }) => {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 32, 480);

  const defaultNavigation = useNavigation<RegisterScreenNavigationProp>();
  const navigation = propNavigation || defaultNavigation;
  const setUserData = useAuthStore(state => state.setUserData);
  const { fcmToken, deviceInfo } = useFcmToken();

  const [state, setState] = useState<RegisterState>({
    step: 'form',
    resendTimer: 60,
    canResend: false,
  });

  const updateState = useCallback(
    (patch: Partial<RegisterState> | ((prev: RegisterState) => Partial<RegisterState>)) => {
      setState(prev => ({
        ...prev,
        ...(typeof patch === 'function' ? patch(prev) : patch),
      }));
    },
    []
  );

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<TPatientRegisterSchemaType>({
    resolver: yupResolver(PatientRegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      phone_number: '',
      country_code: 91,
      gender: '',
      salutation: '',
      source: 'patient-app',
      created_from: 'patient-app',
    },
    mode: 'onChange',
  });

  const phoneNumber = watch('phone_number') || '';

  // Mutations
  const { mutate: register, isPending: isRegistering } = usePatientRegister();
  const { mutate: verifyOtp, isPending: isVerifying } = usePatientVerifyOTP();
  const { mutate: resendOtp, isPending: isResending } = useReSendOtp();

  const onRegisterSubmit = (formData: TPatientRegisterSchemaType) => {
    register(
      {
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone_number,
        country_code: formData.country_code || 91,
        gender: formData.gender || '',
        salutation: formData.salutation || 'Mr.',
        source: formData.source || 'patient-app',
        created_from: formData.created_from || 'patient-app',
      },
      {
        onSuccess: res => {
          if (res?.success) {
            updateState({ step: 'otp', resendTimer: 60, canResend: false });
            setValue('otp', '');
          }
        },
      }
    );
  };

  const onVerifyOtpSubmit = (formData: TPatientRegisterSchemaType) => {
    verifyOtp(
      {
        email: formData.email,
        phone_number: formData.phone_number,
        otp: formData.otp || '123456',
        device_id: deviceInfo?.device_id || 'device_sample_123',
        device_name: deviceInfo?.device_name || 'Samsung S23',
        platform: deviceInfo?.platform || Platform.OS || 'android',
        fcm_token: fcmToken || deviceInfo?.fcm_token || 'fcm_token_sample_string',
        os_version: deviceInfo?.os_version || '14',
        app_version: deviceInfo?.app_version || '1.0.0',
      },
      {
        onSuccess: async res => {
          if (res?.success && res?.token) {
            await setItem(STORAGE_KEYS.AUTH_TOKEN, res.token);
            let userData = null;
            try {
              const profileRes = await fetchProfileQuery(true);
              if (profileRes?.data) {
                userData = profileRes.data;
                setUserData(profileRes.data);
              }
            } catch (err) {
              console.error('Failed to fetch profile after login:', err);
            }

            const nav = navigation || defaultNavigation;
            if (!userData?.email_verified_at) {
              if (nav && typeof nav.replace === 'function') {
                nav.replace(AppRoute.EMAIL_VERIFY, {
                  email: formData.email,
                  phone: formData.phone_number,
                });
              }
            } else if (userData?.email_verified_at && !userData?.has_accepted_policies) {
              if (nav && typeof nav.replace === 'function') {
                nav.replace(AppRoute.POLICY_ACCEPTANCE);
              }
            } else {
              if (nav && typeof nav.reset === 'function') {
                nav.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                });
              } else if (nav && typeof nav.navigate === 'function') {
                nav.navigate('Home');
              }
            }
          }
        },
      }
    );
  };

  const handleResendOtp = () => {
    const currentValues = getValues();
    resendOtp(
      {
        email: currentValues.email,
        phone_number: currentValues.phone_number,
        user_type: 'patient',
      },
      {
        onSuccess: res => {
          if (res?.success) {
            updateState({ resendTimer: 60, canResend: false });
          }
        },
      }
    );
  };

  useEffect(() => {
    if (state.step !== 'otp') return;
    let timer: NodeJS.Timeout;
    if (state.resendTimer > 0) {
      timer = setTimeout(() => updateState(prev => ({ resendTimer: prev.resendTimer - 1 })), 1000);
    } else {
      updateState({ canResend: true });
    }
    return () => clearTimeout(timer);
  }, [state.resendTimer, state.step, updateState]);

  return (
    <SafeAreaWrapper style={registerStyles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={registerStyles.keyboardAvoid}
      >
        <ScrollView
          style={registerStyles.scrollContainer}
          contentContainerStyle={registerStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={registerStyles.logoContainer}>
            <Image source={Assets.logo2} style={registerStyles.logo} resizeMode="contain" />
          </View>

          <View style={[registerStyles.card, { width: cardWidth }]}>
            <View style={registerStyles.titleContainer}>
              <Text style={registerStyles.title}>Create Account</Text>
              <Text style={registerStyles.subtitle}>
                {state.step === 'form'
                  ? 'Fill in your details to get started'
                  : `OTP sent to +91 ${phoneNumber}`}
              </Text>
            </View>

            {state.step === 'form' && (
              <>
                <View style={registerStyles.fieldGroup}>
                  <Text style={registerStyles.label}>Full Name</Text>
                  <View
                    style={[
                      registerStyles.inputRow,
                      errors.name ? registerStyles.inputError : null,
                    ]}
                  >
                    <View style={registerStyles.inputIcon}>
                      <ProfileIcon size={20} color="#666666" />
                    </View>
                    <Controller
                      control={control}
                      name="name"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          style={registerStyles.inputField}
                          placeholder="Enter your full name"
                          placeholderTextColor="#999999"
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                        />
                      )}
                    />
                  </View>
                  {errors.name ? (
                    <Text style={registerStyles.errorText}>{errors.name.message}</Text>
                  ) : null}
                </View>

                <View style={registerStyles.fieldGroup}>
                  <Text style={registerStyles.label}>Email Address</Text>
                  <View
                    style={[
                      registerStyles.inputRow,
                      errors.email ? registerStyles.inputError : null,
                    ]}
                  >
                    <View style={registerStyles.inputIcon}>
                      <MailIcon size={20} color="#666666" />
                    </View>
                    <Controller
                      control={control}
                      name="email"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          style={registerStyles.inputField}
                          placeholder="patient@example.com"
                          placeholderTextColor="#999999"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                        />
                      )}
                    />
                  </View>
                  {errors.email ? (
                    <Text style={registerStyles.errorText}>{errors.email.message}</Text>
                  ) : null}
                </View>

                <View style={registerStyles.fieldGroup}>
                  <Text style={registerStyles.label}>Mobile Number</Text>
                  <View
                    style={[
                      registerStyles.inputRow,
                      errors.phone_number ? registerStyles.inputError : null,
                    ]}
                  >
                    <View style={registerStyles.inputIcon}>
                      <PhoneIcon size={20} color="#666666" />
                    </View>
                    <Controller
                      control={control}
                      name="phone_number"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          style={registerStyles.inputField}
                          placeholder="Enter 10-digit mobile number"
                          placeholderTextColor="#999999"
                          keyboardType="phone-pad"
                          maxLength={10}
                          value={value}
                          onBlur={onBlur}
                          onChangeText={text => onChange(text.replace(/\D/g, '').slice(0, 10))}
                        />
                      )}
                    />
                  </View>
                  {errors.phone_number ? (
                    <Text style={registerStyles.errorText}>{errors.phone_number.message}</Text>
                  ) : null}
                </View>

                {/* Action Button */}
                <Pressable
                  disabled={isRegistering}
                  style={({ pressed }) => [
                    registerStyles.primaryButton,
                    isRegistering && { opacity: 0.7 },
                    pressed && { opacity: 0.85 },
                  ]}
                  onPress={handleSubmit(onRegisterSubmit)}
                >
                  {isRegistering ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={registerStyles.primaryButtonText}>Create Account</Text>
                  )}
                </Pressable>
              </>
            )}

            {/* Step: OTP */}
            {state?.step === 'otp' && (
              <View style={registerStyles.otpSection}>
                <Text style={registerStyles.label}>Enter 6-digit OTP</Text>
                <Controller
                  control={control}
                  name="otp"
                  render={({ field: { onChange, value = '' } }) => (
                    <OtpInput
                      value={value}
                      onChange={val => {
                        onChange(val);
                        if (val.length === 6 && !isVerifying) {
                          Keyboard.dismiss();
                          const currentValues = getValues();
                          onVerifyOtpSubmit({ ...currentValues, otp: val });
                        }
                      }}
                      numInputs={6}
                    />
                  )}
                />
                {errors.otp ? (
                  <Text style={registerStyles.errorText}>{errors.otp.message}</Text>
                ) : null}

                {/* Resend Container */}
                <View style={registerStyles.resendContainer}>
                  <Text style={registerStyles.resendText}>Didn't receive OTP? </Text>
                  {state?.canResend ? (
                    <Pressable
                      disabled={isResending}
                      onPress={handleResendOtp}
                      style={({ pressed }) => [pressed && { opacity: 0.6 }]}
                    >
                      <Text style={registerStyles.resendLink}>
                        {isResending ? 'Sending...' : 'Resend'}
                      </Text>
                    </Pressable>
                  ) : (
                    <Text style={registerStyles.timerText}>
                      Resend in <Text style={registerStyles.timerBold}>{state?.resendTimer}s</Text>
                    </Text>
                  )}
                </View>

                {/* Verify Button */}
                <Pressable
                  disabled={isVerifying}
                  style={({ pressed }) => [
                    registerStyles.primaryButton,
                    isVerifying && { opacity: 0.7 },
                    pressed && { opacity: 0.85 },
                  ]}
                  onPress={handleSubmit(onVerifyOtpSubmit)}
                >
                  {isVerifying ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={registerStyles.primaryButtonText}>Verify OTP</Text>
                  )}
                </Pressable>

                {/* Back to Form */}
                <Pressable
                  style={({ pressed }) => [
                    registerStyles.changeNumberBtn,
                    pressed && { opacity: 0.6 },
                  ]}
                  onPress={() => {
                    updateState({ step: 'form' });
                    setValue('otp', '');
                  }}
                >
                  <Text style={registerStyles.changeNumberText}>← Change Details</Text>
                </Pressable>
              </View>
            )}

            <View style={registerStyles.bottomSection}>
              <View style={registerStyles.loginContainer}>
                <Text style={registerStyles.loginText}>Already have an account? </Text>
                <Pressable
                  onPress={() => navigation.navigate('Login')}
                  style={({ pressed }) => [pressed && { opacity: 1 }]}
                >
                  <Text style={registerStyles.loginLink}>Sign In</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
};

export default RegisterScreen;
