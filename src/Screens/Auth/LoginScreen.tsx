import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
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
import { MailIcon, PhoneIcon } from '../../components/ui/icons';
import { LoginFormSchema, TLoginFormSchemaType } from '../../lib/schemas/auth.schema';
import { Assets } from '../../resources/assets';
import type { LoginScreenNavigationProp, LoginScreenRouteProp } from '../../route';
import { loginStyles } from '../../styled/LoginScreen.styled';
import { LoginMode } from '../../typescripts/types/common.types';

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

  const {
    control,
    handleSubmit,
    setValue,
    watch,
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
    setValue('identifier', '', {
      shouldValidate: false,
    });
    setValue('otp', '', { shouldValidate: false });
    setOtpSent(false);
  };

  const onSubmitSendOtp = (_data: TLoginFormSchemaType) => {
    setOtpSent(true);
  };

  const onSubmitVerifyOtp = (_data: TLoginFormSchemaType) => {
    const nav = navigation || defaultNavigation;
    if (nav) {
      if (typeof nav.reset === 'function') {
        nav.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else if (typeof nav.navigate === 'function') {
        nav.navigate('MainTabs');
      }
    }
  };

  const handlePrimaryPress = () => {
    if (!otpSent) {
      handleSubmit(onSubmitSendOtp, errs => {
        console.log('Send OTP validation errors:', errs);
      })();
    } else {
      handleSubmit(onSubmitVerifyOtp, errs => {
        console.log('Verify OTP validation errors:', errs);
      })();
    }
  };

  const displayIdentifier =
    identifier || (loginMode === 'mobile' ? '+91 9876543210' : 'doctor@example.com');

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
                          : 'doctor@example.com'
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
                  <Pressable
                    onPress={handleSubmit(onSubmitSendOtp)}
                    style={({ pressed }) => [pressed && { opacity: 0.6 }]}
                  >
                    <Text style={loginStyles.resendLink}>Resend</Text>
                  </Pressable>
                </View>
                <Pressable
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
            <Pressable
              style={({ pressed }) => [loginStyles.primaryButton, pressed && { opacity: 0.85 }]}
              onPress={handlePrimaryPress}
            >
              {!otpSent ? (
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
