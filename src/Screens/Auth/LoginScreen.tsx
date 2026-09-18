import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
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
import { MailIcon, PhoneIcon } from '../../components/ui/icons';
import useFcmToken from '../../hooks/commons/useFcmToken';
import { useReSendOtp, useSendOtp, useVerifyOTP } from '../../hooks/react-query/auth/auth.hooks';
import { fetchProfileQuery } from '../../hooks/react-query/profile/profile.hooks';
import { setItem, STORAGE_KEYS } from '../../lib/common/asyncStorage';
import { showErrorToast } from '../../lib/common/toast.utils';
import { LoginFormSchema, TLoginFormSchemaType } from '../../lib/schemas/auth.schema';
import { Assets } from '../../resources/assets';
import { AppRoute, type LoginScreenNavigationProp, type LoginScreenRouteProp } from '../../route';
import { loginStyles } from '../../styled/LoginScreen.styled';
import { theme } from '../../styled/theme.styled';
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
  const { deviceInfo, fcmToken } = useFcmToken();

  const [loginMode, setLoginMode] = useState<LoginMode>('mobile');
  const [otpSent, setOtpSent] = useState(false);

  const setUserData = useAuthStore(state => state.setUserData);
  const { showLoader, hideLoader } = useLoadingStore(state => state);

  const { mutate: sendOtpMutation, isPending: sendOtpPending } = useSendOtp();
  const { mutate: resendOtpMutation, isPending: resendOtpPending } = useReSendOtp();
  const { mutate: verifyOtpMutation, isPending: verifyOtpPending } = useVerifyOTP();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    clearErrors,
    getValues,
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
  const otpValue = watch('otp') || '';

  const maskedIdentifier = () => {
    if (!identifier) return '';
    if (loginMode === 'email') {
      const [name, domain] = identifier.split('@');
      if (!name || !domain) return identifier;
      return `${name.slice(0, 2)}${'*'.repeat(Math.max(0, name.length - 2))}@${domain}`;
    }
    return `+91 ${identifier.slice(0, 2)}****${identifier.slice(-2)}`;
  };

  const isVerifyDisabled = otpSent && (otpValue.length !== 6 || verifyOtpPending);

  const switchMode = (mode: LoginMode) => {
    if (otpSent) return;
    setLoginMode(mode);
    clearErrors();
    setValue('mode', mode, { shouldValidate: false });
    setValue('identifier', '', { shouldValidate: false });
    setValue('otp', '', { shouldValidate: false });
    setOtpSent(false);
  };

  const getOtpPayload = (identifierStr: string, mode: string) => {
    const cleanIdentifier = identifierStr.trim();
    if (mode === 'mobile') {
      return {
        phone_number: cleanIdentifier,
        user_type: 'patient',
      };
    }
    return {
      email: cleanIdentifier.toLowerCase(),
      user_type: 'patient',
    };
  };

  const handleSendOtp = (_data: TLoginFormSchemaType, type: 'send' | 'resend' = 'send') => {
    if (type === 'resend' && resendOtpPending) return;
    if (type === 'send' && sendOtpPending) return;

    const payload = getOtpPayload(_data.identifier || '', loginMode);
    if (type === 'resend') {
      resendOtpMutation(payload, {
        onSuccess: (res: any) => {
          if (res?.success) {
            setValue('otp', '');
          }
        },
      });
    } else {
      sendOtpMutation(payload, {
        onSuccess: (res: any) => {
          if (res?.success) {
            setOtpSent(true);
            setValue('otp', '');
          }
        },
      });
    }
  };

  const onSubmitSendOtp = (_data: TLoginFormSchemaType) => {
    handleSendOtp(_data, 'send');
  };

  const onSubmitResendOtp = (_data: TLoginFormSchemaType) => {
    handleSendOtp(_data, 'resend');
  };

  const onSubmitVerifyOtp = async (_data: TLoginFormSchemaType) => {
    if (verifyOtpPending) return;
    if (!_data.otp || _data.otp.length < 6) {
      showErrorToast('Please enter a valid 6-digit OTP code.');
      return;
    }
    if (!identifier) return;

    const cleanIdentifier = identifier.trim();

    const payload = {
      ...(loginMode === 'email'
        ? { email: cleanIdentifier.toLowerCase() }
        : { phone_number: cleanIdentifier }),
      otp: _data.otp,
      user_type: 'patient',
      device_id: deviceInfo?.device_id || 'device_sample_123',
      device_name: deviceInfo?.device_name || 'Samsung S23',
      platform: deviceInfo?.platform || Platform.OS || 'android',
      fcm_token: fcmToken || deviceInfo?.fcm_token || '',
      os_version: deviceInfo?.os_version || String(Platform.Version),
      app_version: deviceInfo?.app_version || '1.0.0',
    };

    verifyOtpMutation(payload, {
      onSuccess: async res => {
        if (res?.success) {
          const token = res?.token;
          if (token) {
            showLoader('Please wait...');
            await setItem(STORAGE_KEYS.AUTH_TOKEN, token);
            let userData: any = null;
            try {
              const profileRes = await fetchProfileQuery(true);
              if (profileRes?.data) {
                userData = profileRes.data;
                setUserData(profileRes.data);
              }
            } catch (err) {
              console.error('Failed to fetch patient profile after login:', err);
            }
            hideLoader();

            const nav = navigation || defaultNavigation;
            if (!userData?.email_verified_at) {
              if (nav && typeof nav.replace === 'function') {
                nav.replace(AppRoute.EMAIL_VERIFY, {
                  email: loginMode === 'email' ? cleanIdentifier : userData?.email,
                  phone: loginMode === 'mobile' ? cleanIdentifier : userData?.phone_number,
                });
              }
            } else if (userData?.email_verified_at && !userData?.has_accepted_policies) {
              if (nav && typeof nav.replace === 'function') {
                nav.replace(AppRoute.POLICY_ACCEPTANCE);
              } else if (nav && typeof nav.navigate === 'function') {
                nav.navigate(AppRoute.POLICY_ACCEPTANCE);
              }
            } else {
              if (nav && typeof nav.reset === 'function') {
                nav.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                });
              } else if (nav && typeof nav.navigate === 'function') {
                nav.navigate('MainTabs');
              }
            }
          } else {
            hideLoader();
          }
        }
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

  return (
    <SafeAreaWrapper style={loginStyles.safeArea}>
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
              <Text style={loginStyles.title}>{!otpSent ? 'Welcome Back' : 'Verify OTP'}</Text>
              <Text style={loginStyles.subtitle}>
                {otpSent
                  ? loginMode === 'mobile'
                    ? `OTP sent via SMS & WhatsApp to ${maskedIdentifier()}`
                    : `OTP sent to ${maskedIdentifier()}`
                  : 'Enter Your Details to Continue'}
              </Text>
            </View>

            {!otpSent ? (
              <>
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
                      style={[
                        loginStyles.tabText,
                        loginMode === 'mobile' && loginStyles.tabTextActive,
                      ]}
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
                      style={[
                        loginStyles.tabText,
                        loginMode === 'email' && loginStyles.tabTextActive,
                      ]}
                    >
                      Email
                    </Text>
                  </Pressable>
                </View>

                <View style={loginStyles.inputSection}>
                  <Text style={loginStyles.label}>
                    {loginMode === 'mobile' ? 'Mobile Number' : 'Email Address'}
                  </Text>
                  <View
                    style={[
                      loginStyles.inputRow,
                      errors.identifier ? loginStyles.inputError : null,
                    ]}
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
              </>
            ) : (
              <View style={loginStyles.otpSection}>
                <Text style={loginStyles.label}>Enter 6-digit OTP</Text>
                <Controller
                  control={control}
                  name="otp"
                  render={({ field: { onChange, value = '' } }) => (
                    <OtpInput
                      value={value}
                      onChange={val => {
                        onChange(val);
                        if (val.length === 6 && !verifyOtpPending) {
                          Keyboard.dismiss();
                          const currentValues = getValues();
                          onSubmitVerifyOtp({ ...currentValues, otp: val });
                        }
                      }}
                      numInputs={6}
                    />
                  )}
                />
                {errors.otp ? (
                  <Text style={loginStyles.errorText}>{errors.otp.message}</Text>
                ) : null}

                <View style={loginStyles.resendContainer}>
                  <Text style={loginStyles.resendText}>Didn't receive OTP? </Text>
                  <Pressable
                    onPress={() => handleSubmit(onSubmitResendOtp)()}
                    disabled={resendOtpPending}
                    style={({ pressed }) => [(pressed || resendOtpPending) && { opacity: 0.6 }]}
                  >
                    <Text style={loginStyles.resendLink}>
                      {resendOtpPending ? 'Resending...' : 'Resend'}
                    </Text>
                  </Pressable>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    loginStyles.changeNumberBtn,
                    pressed && { opacity: 0.6 },
                  ]}
                  onPress={() => {
                    setOtpSent(false);
                    setValue('otp', '');
                  }}
                >
                  <Text style={loginStyles.changeNumberText}>
                    ← Change {loginMode === 'mobile' ? 'Mobile Number' : 'Email'}
                  </Text>
                </Pressable>
              </View>
            )}

            <Pressable
              disabled={isVerifyDisabled || sendOtpPending || verifyOtpPending}
              style={({ pressed }) => [
                loginStyles.primaryButton,
                (isVerifyDisabled || sendOtpPending || verifyOtpPending) &&
                  loginStyles.buttonDisabled,
                pressed &&
                  !isVerifyDisabled &&
                  !sendOtpPending &&
                  !verifyOtpPending && { opacity: 0.85 },
              ]}
              onPress={handlePrimaryPress}
            >
              {sendOtpPending || verifyOtpPending ? (
                <ActivityIndicator color={theme.colors.surface} />
              ) : !otpSent ? (
                <Text style={loginStyles.primaryButtonText}>Send OTP</Text>
              ) : (
                <View style={loginStyles.verifyBtnInner}>
                  <Text style={loginStyles.verifyBtnIcon}>✓</Text>
                  <Text style={loginStyles.primaryButtonText}>Verify OTP</Text>
                </View>
              )}
            </Pressable>

            <View style={loginStyles.bottomSection}>
              <View style={loginStyles.signupContainer}>
                <Text style={loginStyles.signupText}>Don't have an account? </Text>
                <Pressable
                  onPress={() => navigation.navigate(AppRoute.REGISTER)}
                  style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                >
                  <Text style={loginStyles.signupLink}>Register Now</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
};

export default LoginScreen;
