import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';

interface AddFamilyMemberSkeletonProps {
  scrollable?: boolean;
}

export const AddFamilyMemberSkeleton: React.FC<AddFamilyMemberSkeletonProps> = ({
  scrollable = true,
}) => {
  const pulseAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const content = (
    <Animated.View style={[styles.container, { opacity: pulseAnim }]}>
      {/* Inherited Info Banner Skeleton */}
      <View style={styles.bannerSkeleton}>
        <View style={styles.bannerIcon} />
        <View style={styles.bannerTextCol}>
          <View style={styles.bannerLine1} />
          <View style={styles.bannerLine2} />
        </View>
      </View>

      {/* Member Details Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.sectionTitle} />
          <View style={styles.sectionSubtitle} />
        </View>

        {/* Full Name */}
        <View style={styles.fieldWrapper}>
          <View style={[styles.fieldLabel, { width: 90 }]} />
          <View style={styles.inputBox}>
            <View style={[styles.inputTextPlaceholder, { width: '45%' }]} />
          </View>
        </View>

        {/* Relation */}
        <View style={styles.fieldWrapper}>
          <View style={[styles.fieldLabel, { width: 70 }]} />
          <View style={styles.inputBox}>
            <View style={[styles.inputTextPlaceholder, { width: '35%' }]} />
            <View style={styles.dropdownIcon} />
          </View>
        </View>

        {/* Gender */}
        <View style={styles.fieldWrapper}>
          <View style={[styles.fieldLabel, { width: 65 }]} />
          <View style={styles.inputBox}>
            <View style={[styles.inputTextPlaceholder, { width: '30%' }]} />
            <View style={styles.dropdownIcon} />
          </View>
        </View>

        {/* Date of Birth */}
        <View style={styles.fieldWrapper}>
          <View style={[styles.fieldLabel, { width: 100 }]} />
          <View style={styles.inputBox}>
            <View style={[styles.inputTextPlaceholder, { width: '40%' }]} />
            <View style={styles.calendarIcon} />
          </View>
        </View>
      </View>

      {/* Contact Information (Linked) Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.sectionTitle, { width: 180 }]} />
          <View style={[styles.sectionSubtitle, { width: 220 }]} />
        </View>

        {/* Phone Number */}
        <View style={styles.fieldWrapper}>
          <View style={[styles.fieldLabel, { width: 105 }]} />
          <View style={styles.readOnlyBox}>
            <View style={styles.readOnlyIcon} />
            <View style={[styles.readOnlyValue, { width: '45%' }]} />
            <View style={styles.lockBadge} />
          </View>
          <View style={styles.hintLine} />
        </View>

        {/* Email Address */}
        <View style={styles.fieldWrapper}>
          <View style={[styles.fieldLabel, { width: 100 }]} />
          <View style={styles.readOnlyBox}>
            <View style={styles.readOnlyIcon} />
            <View style={[styles.readOnlyValue, { width: '55%' }]} />
            <View style={styles.lockBadge} />
          </View>
          <View style={styles.hintLine} />
        </View>

        {/* Address */}
        <View style={styles.fieldWrapper}>
          <View style={[styles.fieldLabel, { width: 70 }]} />
          <View style={styles.readOnlyBox}>
            <View style={styles.readOnlyIcon} />
            <View style={[styles.readOnlyValue, { width: '70%' }]} />
            <View style={styles.lockBadge} />
          </View>
          <View style={styles.hintLine} />
        </View>
      </View>

      {/* Submit Button Skeleton */}
      <View style={styles.buttonSkeleton}>
        <View style={styles.buttonText} />
      </View>
    </Animated.View>
  );

  if (scrollable) {
    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
  },
  container: {
    width: '100%',
  },
  // Banner
  bannerSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderLeftWidth: 3,
    borderLeftColor: '#99F6E4',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  bannerIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#99F6E4',
  },
  bannerTextCol: {
    flex: 1,
    gap: 6,
  },
  bannerLine1: {
    width: '85%',
    height: 10,
    borderRadius: 4,
    backgroundColor: '#CCFBF1',
  },
  bannerLine2: {
    width: '55%',
    height: 10,
    borderRadius: 4,
    backgroundColor: '#CCFBF1',
  },
  // Card
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  cardHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    width: 130,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
    marginBottom: 6,
  },
  sectionSubtitle: {
    width: 200,
    height: 11,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  // Field wrapper
  fieldWrapper: {
    marginBottom: 16,
  },
  fieldLabel: {
    height: 12,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
    marginBottom: 8,
  },
  inputBox: {
    height: 50,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputTextPlaceholder: {
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  dropdownIcon: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  calendarIcon: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  // Read-only field
  readOnlyBox: {
    minHeight: 50,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    gap: 10,
  },
  readOnlyIcon: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  readOnlyValue: {
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  lockBadge: {
    width: 22,
    height: 18,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    marginLeft: 'auto',
  },
  hintLine: {
    width: 150,
    height: 10,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
    marginTop: 6,
  },
  // Submit button
  buttonSkeleton: {
    height: 54,
    backgroundColor: '#0F766E',
    opacity: 0.35,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    width: 130,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
});

export default AddFamilyMemberSkeleton;
