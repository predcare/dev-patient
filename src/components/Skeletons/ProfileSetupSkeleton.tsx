import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import { theme } from '../../styled/theme.styled';

export const ProfileSetupSkeleton: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Photo Section Skeleton */}
      <View style={styles.profilePicSection}>
        <Animated.View style={[styles.avatarCircle, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.avatarSubtext, { opacity: pulseAnim }]} />
      </View>

      {/* Form Fields Section Skeleton */}
      <View style={styles.formSection}>
        {/* Full Name */}
        <View style={styles.inputWrapper}>
          <Animated.View style={[styles.labelSkeleton, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.inputSkeleton, { opacity: pulseAnim }]} />
        </View>

        {/* Email */}
        <View style={styles.inputWrapper}>
          <Animated.View style={[styles.labelSkeleton, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.inputSkeleton, { opacity: pulseAnim }]} />
        </View>

        {/* Phone Number */}
        <View style={styles.inputWrapper}>
          <Animated.View style={[styles.labelSkeleton, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.inputSkeleton, { opacity: pulseAnim }]} />
        </View>

        {/* Gender Pills */}
        <View style={styles.inputWrapper}>
          <Animated.View style={[styles.labelSkeleton, { opacity: pulseAnim }]} />
          <View style={styles.genderRow}>
            {[1, 2, 3].map(item => (
              <Animated.View
                key={item}
                style={[styles.genderPillSkeleton, { opacity: pulseAnim }]}
              />
            ))}
          </View>
        </View>

        {/* Date of Birth */}
        <View style={styles.inputWrapper}>
          <Animated.View style={[styles.labelSkeleton, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.inputSkeleton, { opacity: pulseAnim }]} />
        </View>

        {/* Address */}
        <View style={styles.inputWrapper}>
          <Animated.View style={[styles.labelSkeleton, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.addressSkeleton, { opacity: pulseAnim }]} />
        </View>

        {/* Country */}
        <View style={styles.inputWrapper}>
          <Animated.View style={[styles.labelSkeleton, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.inputSkeleton, { opacity: pulseAnim }]} />
        </View>

        {/* State */}
        <View style={styles.inputWrapper}>
          <Animated.View style={[styles.labelSkeleton, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.inputSkeleton, { opacity: pulseAnim }]} />
        </View>

        {/* City */}
        <View style={styles.inputWrapper}>
          <Animated.View style={[styles.labelSkeleton, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.inputSkeleton, { opacity: pulseAnim }]} />
        </View>

        {/* Postal Code */}
        <View style={styles.inputWrapper}>
          <Animated.View style={[styles.labelSkeleton, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.inputSkeleton, { opacity: pulseAnim }]} />
        </View>
      </View>

      {/* Button Skeleton */}
      <Animated.View style={[styles.buttonSkeleton, { opacity: pulseAnim }]} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  profilePicSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E2E8F0',
  },
  avatarSubtext: {
    width: 80,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginTop: 10,
  },
  formSection: {
    gap: 16,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  labelSkeleton: {
    width: 100,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginBottom: 8,
  },
  inputSkeleton: {
    width: '100%',
    height: 48,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  addressSkeleton: {
    width: '100%',
    height: 80,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderPillSkeleton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  buttonSkeleton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    marginTop: 12,
    marginBottom: 32,
  },
});

export default ProfileSetupSkeleton;
