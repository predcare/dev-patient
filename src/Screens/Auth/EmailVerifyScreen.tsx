import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import OtpInput from '../../components/commons/OtpInput';
import { MailIcon } from '../../components/ui/icons';
import { Assets } from '../../resources/assets';
import type {
  EmailVerifyScreenNavigationProp,
  EmailVerifyScreenRouteProp,
} from '../../route';
import { AppRoute } from '../../route';
import { emailVerifyStyles } from '../../styled/EmailVerifyScreen.styled';

export interface EmailVerifyScreenProps {
  navigation?: EmailVerifyScreenNavigationProp;
  route?: EmailVerifyScreenRouteProp;
}

export const EmailVerifyScreen: React.FC<EmailVerifyScreenProps> = ({
  navigation: propNavigation,
  route: propRoute,
}) => {
  const defaultNavigation = useNavigation<EmailVerifyScreenNavigationProp>();
  const defaultRoute = useRoute<EmailVerifyScreenRouteProp>();
  const navigation = propNavigation || defaultNavigation;
  const route = propRoute || defaultRoute;

  const passedEmail = route?.params?.email || 'patient@example.com';
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 32, 480);

  const [otp, setOtp] = useState('123456');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleVerifyOtp = () => {
    Keyboard.dismiss();
    if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate(AppRoute.POLICY_ACCEPTANCE);
    }
  };

  const handleResendOtp = () => {
    setResendTimer(60);
    setCanResend(false);
  };

  const handleChangeEmail = () => {
    if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate(AppRoute.REGISTER);
    }
  };

  const isOtpComplete = otp.trim().length === 6;

  return (
    <SafeAreaView style={emailVerifyStyles.safeArea}>
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
          {/* Header Logo */}
          <View style={emailVerifyStyles.logoContainer}>
            <Image source={Assets.logo2} style={emailVerifyStyles.logo} resizeMode="contain" />
          </View>

          {/* Main Card */}
          <View style={[emailVerifyStyles.card, { width: cardWidth }]}>
            {/* Title Section */}
            <View style={emailVerifyStyles.titleContainer}>
              <View style={emailVerifyStyles.titleIconContainer}>
                <MailIcon size={28} color="#0F766E" />
              </View>
              <Text style={emailVerifyStyles.title}>Verify Your Email</Text>
              <Text style={emailVerifyStyles.subtitle}>
                We sent a 6-digit verification code to
              </Text>
              <Text style={emailVerifyStyles.emailBadge}>{passedEmail}</Text>
            </View>

            {/* OTP Section */}
            <View style={emailVerifyStyles.otpSection}>
              <Text style={emailVerifyStyles.otpLabel}>Enter 6-digit verification code</Text>
              <OtpInput value={otp} onChange={setOtp} numInputs={6} />

              {/* Resend Container */}
              <View style={emailVerifyStyles.resendContainer}>
                <Text style={emailVerifyStyles.resendText}>Didn't receive code? </Text>
                {canResend ? (
                  <Pressable
                    onPress={handleResendOtp}
                    style={({ pressed }) => [pressed && { opacity: 0.6 }]}
                  >
                    <Text style={emailVerifyStyles.resendLink}>Resend Code</Text>
                  </Pressable>
                ) : (
                  <Text style={emailVerifyStyles.timerText}>
                    Resend in <Text style={emailVerifyStyles.timerBold}>{resendTimer}s</Text>
                  </Text>
                )}
              </View>
            </View>

            {/* Action Buttons */}
            <Pressable
              disabled={!isOtpComplete}
              style={({ pressed }) => [
                emailVerifyStyles.primaryButton,
                !isOtpComplete && emailVerifyStyles.buttonDisabled,
                pressed && isOtpComplete && { opacity: 0.85 },
              ]}
              onPress={handleVerifyOtp}
            >
              <Text style={emailVerifyStyles.primaryButtonText}>Verify & Continue</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                emailVerifyStyles.secondaryButton,
                pressed && { opacity: 0.6 },
              ]}
              onPress={handleChangeEmail}
            >
              <Text style={emailVerifyStyles.secondaryButtonText}>← Change Email Address</Text>
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
    </SafeAreaView>
  );
};

export default EmailVerifyScreen;
