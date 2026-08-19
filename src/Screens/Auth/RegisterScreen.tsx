import { yupResolver } from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import OtpInput from '../../components/commons/OtpInput';
import { queryClient } from '../../components/providers/ReactQueryProvider';
import { MailIcon, PhoneIcon, ProfileIcon } from '../../components/ui/icons';
import { _projectToken } from '../../config/keys.constants';
import {
  useRegisterPatient,
  useResendOtp,
  useVerifyPatientOtp,
} from '../../hooks/react-query/auth/auth.hooks';
import {
  IPatientRegisterPayload,
  IPatientVerifyOtpPayload,
  IResendOtpPayload,
} from '../../hooks/react-query/auth/payload.interfaces';
import { UserQueryEnum } from '../../hooks/react-query/query.keys';
import useFcmToken from '../../hooks/useFcmToken';
import { resetToMainTabs } from '../../lib/common/navigation.utils';
import { showErrorToast, showSuccessToast } from '../../lib/common/toast.utils';
import { RegisterFormSchema, TRegisterFormSchemaType } from '../../lib/schemas/auth.schema';
import { Assets } from '../../resources/assets';
import type { RegisterScreenNavigationProp, RegisterScreenRouteProp } from '../../route';
import { registerStyles } from '../../styled/RegisterScreen.styled';
import { useAuthStore } from '../../zustand/stores/useAuthStore';
import { useLoadingStore } from '../../zustand/stores/useLoadingStore';

export interface RegisterScreenProps {
  navigation?: RegisterScreenNavigationProp;
  route?: RegisterScreenRouteProp;
}

type ScreenStep = 'form' | 'otp';

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation: propNavigation }) => {
  const defaultNavigation = useNavigation<RegisterScreenNavigationProp>();
  const navigation = propNavigation || defaultNavigation;
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 32, 480);

  const [step, setStep] = useState<ScreenStep>('form');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const { mutate: registerPatient, isPending: registerLoading } = useRegisterPatient();
  const { mutate: verifyPatientOtp, isPending: verifyOtpLoading } = useVerifyPatientOtp();
  const { mutate: resendOtp, isPending: resendOtpLoading } = useResendOtp();
  const { deviceInfo, fcmToken } = useFcmToken();

  const setUserData = useAuthStore(state => state.setUserData);
  const showLoader = useLoadingStore(state => state.showLoader);
  const hideLoader = useLoadingStore(state => state.hideLoader);

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm<TRegisterFormSchemaType>({
    resolver: yupResolver(RegisterFormSchema),
    mode: 'onBlur',
  });

  const phone = watch('phone') || '';

  const onSubmitRegister = (data: TRegisterFormSchemaType) => {
    const payload: IPatientRegisterPayload = {
      name: data.name,
      email: data.email,
      phone_number: data.phone,
      source: 'app',
      created_from: 'app',
    };

    registerPatient(payload, {
      onSuccess: res => {
        showSuccessToast(res?.message || 'OTP sent successfully to your mobile number!');
        setStep('otp');
        setResendTimer(60);
        setCanResend(false);
      },
    });
  };

  const onSubmitVerifyOtp = (data: TRegisterFormSchemaType) => {
    if (!data.otp || data.otp.length < 6) {
      showErrorToast('Please enter a valid 6-digit OTP code.');
      return;
    }

    const emailVal = getValues('email');
    const phoneVal = getValues('phone');

    const payload: IPatientVerifyOtpPayload = {
      email: emailVal,
      phone_number: phoneVal,
      otp: data.otp,
      device_id: deviceInfo?.device_id || `rn-${Date.now()}`,
      device_name: deviceInfo?.device_name || 'Mobile Device',
      platform: (deviceInfo?.platform as 'android' | 'ios') || (Platform.OS as 'android' | 'ios'),
      os_version: deviceInfo?.os_version || String(Platform.Version ?? ''),
      app_version: deviceInfo?.app_version || '1.1',
      fcm_token: deviceInfo?.fcm_token || fcmToken || '',
    };

    verifyPatientOtp(payload, {
      onSuccess: async res => {
        showLoader('Verifying account & initializing profile...');
        try {
          if (res?.token) {
            await AsyncStorage.setItem(_projectToken, res.token);
          }
          if (res?.data) {
            setUserData(res.data);
          }
          await queryClient.invalidateQueries({ queryKey: [UserQueryEnum.PROFILE] });

          showSuccessToast(res?.message || 'Account verified successfully!');
          resetToMainTabs(navigation || defaultNavigation);
        } finally {
          hideLoader();
        }
      },
    });
  };

  const handleResendOtp = () => {
    const emailVal = getValues('email');
    const phoneVal = getValues('phone');
    const payload: IResendOtpPayload = {
      user_type: 'patient',
      email: emailVal,
      phone_number: phoneVal,
    };

    resendOtp(payload, {
      onSuccess: res => {
        showSuccessToast(res?.message || 'OTP resent successfully!');
        setResendTimer(60);
        setCanResend(false);
      },
    });
  };

  useEffect(() => {
    if (step !== 'otp') return;
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [resendTimer, step]);

  return (
    <SafeAreaView style={registerStyles.safeArea}>
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
                {step === 'form'
                  ? 'Fill in your details to get started'
                  : `OTP sent to +91 ${phone}`}
              </Text>
            </View>
            {step === 'form' && (
              <>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={registerStyles.fieldGroup}>
                      <Text style={registerStyles.label}>Full Name</Text>
                      <View
                        style={[registerStyles.inputRow, errors.name && registerStyles.inputError]}
                      >
                        <View style={registerStyles.inputIcon}>
                          <ProfileIcon size={20} color="#666666" />
                        </View>
                        <TextInput
                          style={registerStyles.inputField}
                          placeholder="Enter your full name"
                          placeholderTextColor="#999999"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                        />
                      </View>
                      {errors.name?.message && (
                        <Text style={registerStyles.errorText}>{errors.name.message}</Text>
                      )}
                    </View>
                  )}
                />
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={registerStyles.fieldGroup}>
                      <Text style={registerStyles.label}>Email Address</Text>
                      <View
                        style={[registerStyles.inputRow, errors.email && registerStyles.inputError]}
                      >
                        <View style={registerStyles.inputIcon}>
                          <MailIcon size={20} color="#666666" />
                        </View>
                        <TextInput
                          style={registerStyles.inputField}
                          placeholder="patient@example.com"
                          placeholderTextColor="#999999"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                        />
                      </View>
                      {errors.email?.message && (
                        <Text style={registerStyles.errorText}>{errors.email.message}</Text>
                      )}
                    </View>
                  )}
                />
                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={registerStyles.fieldGroup}>
                      <Text style={registerStyles.label}>Mobile Number</Text>
                      <View
                        style={[registerStyles.inputRow, errors.phone && registerStyles.inputError]}
                      >
                        <View style={registerStyles.inputIcon}>
                          <PhoneIcon size={20} color="#666666" />
                        </View>
                        <TextInput
                          style={registerStyles.inputField}
                          placeholder="Enter 10-digit mobile number"
                          placeholderTextColor="#999999"
                          keyboardType="phone-pad"
                          maxLength={10}
                          value={value}
                          onChangeText={text => onChange(text.replace(/\D/g, '').slice(0, 10))}
                          onBlur={onBlur}
                        />
                      </View>
                      {errors.phone?.message && (
                        <Text style={registerStyles.errorText}>{errors.phone.message}</Text>
                      )}
                    </View>
                  )}
                />
                <Pressable
                  disabled={registerLoading}
                  style={({ pressed }) => [
                    registerStyles.primaryButton,
                    registerLoading && registerStyles.buttonDisabled,
                    pressed && { opacity: 0.85 },
                  ]}
                  onPress={() => handleSubmit(onSubmitRegister)()}
                >
                  {registerLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={registerStyles.primaryButtonText}>Create Account</Text>
                  )}
                </Pressable>
              </>
            )}
            {step === 'otp' && (
              <Controller
                control={control}
                name="otp"
                render={({ field: { onChange, value } }) => (
                  <View style={registerStyles.otpSection}>
                    <Text style={registerStyles.label}>Enter 6-digit OTP</Text>
                    <OtpInput value={value || ''} onChange={onChange} numInputs={6} />
                    {errors.otp?.message && (
                      <Text style={registerStyles.errorText}>{errors.otp.message}</Text>
                    )}

                    {/* Resend Container */}
                    <View style={registerStyles.resendContainer}>
                      <Text style={registerStyles.resendText}>Didn't receive OTP? </Text>
                      {canResend ? (
                        <Pressable
                          disabled={resendOtpLoading}
                          onPress={() => handleResendOtp()}
                          style={({ pressed }) => [pressed && { opacity: 0.6 }]}
                        >
                          {resendOtpLoading ? (
                            <ActivityIndicator size="small" color="#0052CC" />
                          ) : (
                            <Text style={registerStyles.resendLink}>Resend</Text>
                          )}
                        </Pressable>
                      ) : (
                        <Text style={registerStyles.timerText}>
                          Resend in <Text style={registerStyles.timerBold}>{resendTimer}s</Text>
                        </Text>
                      )}
                    </View>
                    <Pressable
                      disabled={verifyOtpLoading}
                      style={({ pressed }) => [
                        registerStyles.primaryButton,
                        verifyOtpLoading && registerStyles.buttonDisabled,
                        pressed && { opacity: 0.85 },
                      ]}
                      onPress={() => handleSubmit(onSubmitVerifyOtp)()}
                    >
                      {verifyOtpLoading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={registerStyles.primaryButtonText}>Verify OTP</Text>
                      )}
                    </Pressable>

                    <Pressable
                      disabled={verifyOtpLoading}
                      style={({ pressed }) => [
                        registerStyles.changeNumberBtn,
                        pressed && { opacity: 0.6 },
                      ]}
                      onPress={() => setStep('form')}
                    >
                      <Text style={registerStyles.changeNumberText}>← Change Details</Text>
                    </Pressable>
                  </View>
                )}
              />
            )}
            <View style={registerStyles.bottomSection}>
              <View style={registerStyles.loginContainer}>
                <Text style={registerStyles.loginText}>Already have an account? </Text>
                <Pressable
                  onPress={() => navigation.navigate('Login')}
                  style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                >
                  <Text style={registerStyles.loginLink}>Sign In</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
