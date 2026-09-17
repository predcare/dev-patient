import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
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
import { MailIcon, PhoneIcon, ProfileIcon } from '../../components/ui/icons';
import { Assets } from '../../resources/assets';
import {
  AppRoute,
  type RegisterScreenNavigationProp,
  type RegisterScreenRouteProp,
} from '../../route';
import { registerStyles } from '../../styled/RegisterScreen.styled';

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
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('patient@example.com');
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('123456');

  // Timer for OTP resend
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

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

  const handleCreateAccount = () => {
    const nav = navigation || defaultNavigation;
    if (nav && typeof nav.navigate === 'function') {
      nav.navigate(AppRoute.EMAIL_VERIFY, { email, phone });
    } else {
      setStep('otp');
    }
  };

  const handleVerifyOtp = () => {
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

  const handleResendOtp = () => {
    setResendTimer(60);
    setCanResend(false);
  };

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
          {/* Header Logo */}
          <View style={registerStyles.logoContainer}>
            <Image source={Assets.logo2} style={registerStyles.logo} resizeMode="contain" />
          </View>

          {/* Card */}
          <View style={[registerStyles.card, { width: cardWidth }]}>
            <View style={registerStyles.titleContainer}>
              <Text style={registerStyles.title}>Create Account</Text>
              <Text style={registerStyles.subtitle}>
                {step === 'form'
                  ? 'Fill in your details to get started'
                  : `OTP sent to +91 ${phone}`}
              </Text>
            </View>

            {/* Step: Form */}
            {step === 'form' && (
              <>
                {/* Full Name */}
                <View style={registerStyles.fieldGroup}>
                  <Text style={registerStyles.label}>Full Name</Text>
                  <View style={registerStyles.inputRow}>
                    <View style={registerStyles.inputIcon}>
                      <ProfileIcon size={20} color="#666666" />
                    </View>
                    <TextInput
                      style={registerStyles.inputField}
                      placeholder="Enter your full name"
                      placeholderTextColor="#999999"
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                </View>

                {/* Email Address */}
                <View style={registerStyles.fieldGroup}>
                  <Text style={registerStyles.label}>Email Address</Text>
                  <View style={registerStyles.inputRow}>
                    <View style={registerStyles.inputIcon}>
                      <MailIcon size={20} color="#666666" />
                    </View>
                    <TextInput
                      style={registerStyles.inputField}
                      placeholder="patient@example.com"
                      placeholderTextColor="#999999"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                </View>

                {/* Phone Number */}
                <View style={registerStyles.fieldGroup}>
                  <Text style={registerStyles.label}>Mobile Number</Text>
                  <View style={registerStyles.inputRow}>
                    <View style={registerStyles.inputIcon}>
                      <PhoneIcon size={20} color="#666666" />
                    </View>
                    <TextInput
                      style={registerStyles.inputField}
                      placeholder="Enter 10-digit mobile number"
                      placeholderTextColor="#999999"
                      keyboardType="phone-pad"
                      maxLength={10}
                      value={phone}
                      onChangeText={text => setPhone(text.replace(/\D/g, '').slice(0, 10))}
                    />
                  </View>
                </View>

                {/* Action Button */}
                <Pressable
                  style={({ pressed }) => [
                    registerStyles.primaryButton,
                    pressed && { opacity: 0.85 },
                  ]}
                  onPress={handleCreateAccount}
                >
                  <Text style={registerStyles.primaryButtonText}>Create Account</Text>
                </Pressable>
              </>
            )}

            {/* Step: OTP */}
            {step === 'otp' && (
              <View style={registerStyles.otpSection}>
                <Text style={registerStyles.label}>Enter 6-digit OTP</Text>
                <OtpInput value={otp} onChange={setOtp} numInputs={6} />

                {/* Resend Container */}
                <View style={registerStyles.resendContainer}>
                  <Text style={registerStyles.resendText}>Didn't receive OTP? </Text>
                  {canResend ? (
                    <Pressable
                      onPress={handleResendOtp}
                      style={({ pressed }) => [pressed && { opacity: 0.6 }]}
                    >
                      <Text style={registerStyles.resendLink}>Resend</Text>
                    </Pressable>
                  ) : (
                    <Text style={registerStyles.timerText}>
                      Resend in <Text style={registerStyles.timerBold}>{resendTimer}s</Text>
                    </Text>
                  )}
                </View>

                {/* Verify Button */}
                <Pressable
                  style={({ pressed }) => [
                    registerStyles.primaryButton,
                    pressed && { opacity: 0.85 },
                  ]}
                  onPress={handleVerifyOtp}
                >
                  <Text style={registerStyles.primaryButtonText}>Verify OTP</Text>
                </Pressable>

                {/* Back to Form */}
                <Pressable
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

            {/* Bottom Login Link */}
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
