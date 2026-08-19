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
import { MailIcon, PhoneIcon } from '../../components/ui/icons';
import { _projectToken } from '../../config/keys.constants';
import { useLoginSendOtp, useLoginVerifyOtp } from '../../hooks/react-query/auth/auth.hooks';
import {
  ILoginSendOtpPayload,
  ILoginVerifyOtpPayload,
} from '../../hooks/react-query/auth/payload.interfaces';
import { UserQueryEnum } from '../../hooks/react-query/query.keys';
import useFcmToken from '../../hooks/useFcmToken';
import { resetToMainTabs } from '../../lib/common/navigation.utils';
import { showErrorToast, showSuccessToast } from '../../lib/common/toast.utils';
import { LoginFormSchema, TLoginFormSchemaType } from '../../lib/schemas/auth.schema';
import { Assets } from '../../resources/assets';
import type { LoginScreenNavigationProp, LoginScreenRouteProp } from '../../route';
import { loginStyles } from '../../styled/LoginScreen.styled';
import { LoginMode } from '../../typescripts/types/common.types';
import { useAuthStore } from '../../zustand/stores/useAuthStore';
import { useLoadingStore } from '../../zustand/stores/useLoadingStore';

export interface LoginScreenProps {
  navigation?: LoginScreenNavigationProp;
  route?: LoginScreenRouteProp;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation: propNavigation }) => {
  const defaultNavigation = useNavigation<LoginScreenNavigationProp>();
  const navigation = propNavigation || defaultNavigation;
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 32, 480);

  const [loginMode, setLoginMode] = useState<LoginMode>('mobile');
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // React Query Mutations & FCM Session
  const { mutate: loginSendOtp, isPending: sendOtpLoading } = useLoginSendOtp();
  const { mutate: loginVerifyOtp, isPending: verifyOtpLoading } = useLoginVerifyOtp();
  const { deviceInfo, fcmToken } = useFcmToken();
  const setUserData = useAuthStore(state => state.setUserData);
  const showLoader = useLoadingStore(state => state.showLoader);
  const hideLoader = useLoadingStore(state => state.hideLoader);

  // React Hook Form
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    clearErrors,
    formState: { errors },
  } = useForm<TLoginFormSchemaType>({
    resolver: yupResolver(LoginFormSchema),
    defaultValues: {
      mode: 'mobile',
      identifier: '',
      otp: '',
    },
    mode: 'onBlur',
  });

  const identifier = watch('identifier') || '';

  const switchMode = (mode: LoginMode) => {
    setLoginMode(mode);
    clearErrors();
    setValue('mode', mode, { shouldValidate: false });
    setValue('identifier', '', { shouldValidate: false });
    setValue('otp', '', { shouldValidate: false });
    setOtpSent(false);
  };

  const onSubmitSendOtp = (data: TLoginFormSchemaType) => {
    const payload: ILoginSendOtpPayload = {
      user_type: 'patient',
      ...(loginMode === 'mobile' ? { phone_number: data.identifier } : { email: data.identifier }),
    };

    loginSendOtp(payload, {
      onSuccess: res => {
        if (res?.success) {
          showSuccessToast(res?.message || 'OTP sent successfully!');
          setOtpSent(true);
          setResendTimer(60);
          setCanResend(false);
        }
      },
    });
  };

  const onSubmitVerifyOtp = (data: TLoginFormSchemaType) => {
    if (!data.otp || data.otp.length < 6) {
      showErrorToast('Please enter a valid 6-digit OTP code.');
      return;
    }

    const identifierVal = getValues('identifier');

    const payload: ILoginVerifyOtpPayload = {
      user_type: 'patient',
      ...(loginMode === 'mobile' ? { phone_number: identifierVal } : { email: identifierVal }),
      otp: data.otp,
      device_id: deviceInfo?.device_id || `rn-${Date.now()}`,
      device_name: deviceInfo?.device_name || 'Mobile Device',
      platform: (deviceInfo?.platform as 'android' | 'ios') || (Platform.OS as 'android' | 'ios'),
      os_version: deviceInfo?.os_version || String(Platform.Version ?? ''),
      app_version: deviceInfo?.app_version || '1.1',
      fcm_token: deviceInfo?.fcm_token || fcmToken || '',
    };

    loginVerifyOtp(payload, {
      onSuccess: async res => {
        if (res?.success) {
          showLoader('Logging in & updating profile...');
          try {
            if (res?.token) {
              await AsyncStorage.setItem(_projectToken, res.token);
            }
            if (res?.data) {
              setUserData(res.data);
            }
            await queryClient.invalidateQueries({ queryKey: [UserQueryEnum.PROFILE] });
            showSuccessToast(res?.message || 'Logged in successfully!');
            resetToMainTabs(navigation || defaultNavigation);
          } finally {
            hideLoader();
          }
        }
      },
    });
  };

  const handleResendOtp = () => {
    const identifierVal = getValues('identifier');
    const payload: ILoginSendOtpPayload = {
      user_type: 'patient',
      ...(loginMode === 'mobile' ? { phone_number: identifierVal } : { email: identifierVal }),
    };

    loginSendOtp(payload, {
      onSuccess: res => {
        showSuccessToast(res?.message || 'OTP resent successfully!');
        setResendTimer(60);
        setCanResend(false);
      },
    });
  };

  const handlePrimaryPress = () => {
    if (!otpSent) {
      handleSubmit(onSubmitSendOtp)();
    } else {
      handleSubmit(onSubmitVerifyOtp)();
    }
  };

  const displayIdentifier =
    identifier || (loginMode === 'mobile' ? 'your mobile number' : 'your email');

  // Timer for OTP resend
  useEffect(() => {
    if (!otpSent) return;
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [resendTimer, otpSent]);

  return (
    <SafeAreaView style={loginStyles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={loginStyles.keyboardAvoid}
      >
        <ScrollView
          style={loginStyles.scrollContainer}
          contentContainerStyle={loginStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={loginStyles.logoContainer}>
            <Image source={Assets.logo2} style={loginStyles.logo} resizeMode="contain" />
          </View>
          <View style={[loginStyles.card, { width: cardWidth }]}>
            <View style={loginStyles.titleContainer}>
              <Text style={loginStyles.title}>Welcome Back</Text>
              <Text style={loginStyles.subtitle}>
                {otpSent ? `OTP sent to ${displayIdentifier}` : 'Enter Your Details to Continue'}
              </Text>
            </View>

            {/* Mode Selector Tabs (Mobile / Email) */}
            <View style={loginStyles.tabContainer}>
              <Pressable
                style={({ pressed }) => [
                  loginStyles.tabButton,
                  loginMode === 'mobile' && loginStyles.tabButtonActive,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => switchMode('mobile')}
              >
                <Text
                  style={[loginStyles.tabText, loginMode === 'mobile' && loginStyles.tabTextActive]}
                >
                  Mobile
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  loginStyles.tabButton,
                  loginMode === 'email' && loginStyles.tabButtonActive,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => switchMode('email')}
              >
                <Text
                  style={[loginStyles.tabText, loginMode === 'email' && loginStyles.tabTextActive]}
                >
                  Email
                </Text>
              </Pressable>
            </View>

            {/* Identifier Input */}
            <View style={loginStyles.inputSection}>
              <Text style={loginStyles.label}>
                {loginMode === 'mobile' ? 'Mobile Number' : 'Email Address'}
              </Text>
              <View
                style={[loginStyles.inputRow, errors.identifier ? loginStyles.inputError : null]}
              >
                <View style={loginStyles.inputIcon}>
                  {loginMode === 'mobile' ? (
                    <PhoneIcon size={20} color="#666666" />
                  ) : (
                    <MailIcon size={20} color="#666666" />
                  )}
                </View>
                <Controller
                  control={control}
                  name="identifier"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      key={loginMode}
                      style={loginStyles.inputField}
                      placeholder={
                        loginMode === 'mobile'
                          ? 'Enter 10-digit mobile number'
                          : 'patient@example.com'
                      }
                      placeholderTextColor="#999999"
                      keyboardType={loginMode === 'mobile' ? 'phone-pad' : 'email-address'}
                      maxLength={loginMode === 'mobile' ? 10 : undefined}
                      autoCapitalize="none"
                      value={value}
                      onChangeText={text => {
                        if (loginMode === 'mobile') {
                          const cleanNum = text.replace(/\D/g, '').slice(0, 10);
                          onChange(cleanNum);
                        } else {
                          onChange(text);
                        }
                      }}
                    />
                  )}
                />
              </View>
              {errors.identifier ? (
                <Text style={loginStyles.errorText}>{errors.identifier.message}</Text>
              ) : null}
            </View>
            {otpSent && (
              <View style={loginStyles.otpSection}>
                <Text style={loginStyles.label}>Enter 6-digit OTP</Text>
                <Controller
                  control={control}
                  name="otp"
                  render={({ field: { onChange, value } }) => (
                    <OtpInput value={value || ''} onChange={onChange} numInputs={6} />
                  )}
                />
                {errors.otp ? (
                  <Text style={loginStyles.errorText}>{errors.otp.message}</Text>
                ) : null}

                <View style={loginStyles.resendContainer}>
                  <Text style={loginStyles.resendText}>Didn't receive OTP? </Text>
                  {canResend ? (
                    <Pressable
                      disabled={sendOtpLoading}
                      onPress={handleResendOtp}
                      style={({ pressed }) => [pressed && { opacity: 0.6 }]}
                    >
                      {sendOtpLoading ? (
                        <ActivityIndicator size="small" color="#0052CC" />
                      ) : (
                        <Text style={loginStyles.resendLink}>Resend</Text>
                      )}
                    </Pressable>
                  ) : (
                    <Text style={loginStyles.timerText}>
                      Resend in <Text style={loginStyles.timerBold}>{resendTimer}s</Text>
                    </Text>
                  )}
                </View>

                {/* Change Identifier Link */}
                <Pressable
                  disabled={verifyOtpLoading}
                  style={({ pressed }) => [
                    loginStyles.changeNumberBtn,
                    pressed && { opacity: 0.6 },
                  ]}
                  onPress={() => setOtpSent(false)}
                >
                  <Text style={loginStyles.changeNumberText}>
                    ← Change {loginMode === 'mobile' ? 'Mobile Number' : 'Email'}
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Primary Action Button */}
            <Pressable
              disabled={sendOtpLoading || verifyOtpLoading}
              style={({ pressed }) => [
                loginStyles.primaryButton,
                (sendOtpLoading || verifyOtpLoading) && loginStyles.buttonDisabled,
                pressed && { opacity: 0.85 },
              ]}
              onPress={handlePrimaryPress}
            >
              {sendOtpLoading || verifyOtpLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : !otpSent ? (
                <Text style={loginStyles.primaryButtonText}>Send OTP</Text>
              ) : (
                <View style={loginStyles.verifyBtnInner}>
                  <Text style={loginStyles.verifyBtnIcon}>✓</Text>
                  <Text style={loginStyles.primaryButtonText}>Verify OTP</Text>
                </View>
              )}
            </Pressable>

            {/* Register Link Section */}
            <View style={loginStyles.bottomSection}>
              <View style={loginStyles.signupContainer}>
                <Text style={loginStyles.signupText}>Don't have an account? </Text>
                <Pressable
                  onPress={() => navigation.navigate('Register')}
                  style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                >
                  <Text style={loginStyles.signupLink}>Register Now</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
