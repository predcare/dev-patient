import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import PolicyViewerModal, {
  PolicyItemType,
} from '../../components/commons/PolicyViewerModal/PolicyViewerModal';
import { ShieldIcon } from '../../components/ui/icons';
import { Assets } from '../../resources/assets';
import type {
  PolicyAcceptanceScreenNavigationProp,
  PolicyAcceptanceScreenProps,
} from '../../route';
import { AppRoute } from '../../route';
import { policyStyles } from '../../styled/PolicyAcceptanceScreen.styled';

// Static Mock Policy Documents
const MOCK_TERMS_POLICY: PolicyItemType = {
  title: 'Terms of Use — Patient Portal',
  version: '1.2',
  updatedAt: 'January 2026',
  content: `1. Acceptance of Terms
By creating an account and using the PRED Care Patient Portal, you agree to comply with and be bound by these Terms of Use.

2. Patient Responsibilities
You are responsible for maintaining the confidentiality of your account credentials and for providing accurate medical, contact, and emergency information.

3. Scope of Telehealth Services
PRED Care provides digital health tools and appointment booking. Video consultations and messaging services are supplementary and do not replace emergency medical care.

4. Limitation of Liability
In case of a medical emergency, immediately dial your local emergency services (e.g. 112 / 911) or visit the nearest emergency healthcare facility.`,
};

const MOCK_PRIVACY_POLICY: PolicyItemType = {
  title: 'Privacy Policy — Patient Care',
  version: '2.0',
  updatedAt: 'February 2026',
  content: `1. Data Security & Confidentiality
PRED Care employs end-to-end encryption, strict access controls, and industry-standard security protocols to safeguard your Personal Health Information (PHI).

2. Collection & Usage of Health Records
We collect personal information, consultation records, prescriptions, and lab diagnostic reports solely to facilitate medical care, doctor consultations, and health tracking.

3. Data Sharing Policies
Your medical records will never be sold to third parties. Data is shared exclusively with authorized doctors and healthcare providers involved in your treatment.

4. Patient Rights
You retain full ownership of your medical history and may request access to or deletion of your records at any time subject to applicable health regulations.`,
};

const MOCK_INFORMED_CONSENT_POLICY: PolicyItemType = {
  title: 'Informed Consent for Telehealth',
  version: '1.0',
  updatedAt: 'March 2026',
  content: `1. Digital Healthcare & Consultation Consent
By agreeing to this policy, you consent to receive healthcare services, medical assessments, and prescriptions via PRED Care's digital platform.

2. Electronic Records & Communications
You authorize PRED Care practitioners to access your uploaded medical documents and transmit electronic prescriptions to registered pharmacies.

3. Benefits & Potential Risks
Digital consultations offer convenient access to specialist physicians. However, limitations exist compared to in-person physical examinations.`,
};

export const PolicyAcceptanceScreen: React.FC<PolicyAcceptanceScreenProps> = ({
  navigation: propNavigation,
}) => {
  const defaultNavigation = useNavigation<PolicyAcceptanceScreenNavigationProp>();
  const navigation = propNavigation || defaultNavigation;
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 32, 480);

  const [selectedPolicyItem, setSelectedPolicyItem] = useState<PolicyItemType | null>(null);
  const [agreedTermsPrivacy, setAgreedTermsPrivacy] = useState(false);
  const [agreedConsent, setAgreedConsent] = useState(false);

  const isFormValid = agreedTermsPrivacy && agreedConsent;

  const handleAccept = () => {
    if (!isFormValid) return;
    if (navigation) {
      if (typeof navigation.reset === 'function') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else if (typeof navigation.navigate === 'function') {
        navigation.navigate('MainTabs');
      }
    }
  };

  const handleSignOut = () => {
    if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate(AppRoute.LOGIN);
    }
  };

  return (
    <SafeAreaView style={policyStyles.safeArea}>
      <View style={policyStyles.scrollContent}>
        {/* Header Logo */}
        <View style={policyStyles.logoContainer}>
          <Image source={Assets.logo2} style={policyStyles.logo} resizeMode="contain" />
        </View>

        {/* Main Card Container */}
        <View style={[policyStyles.card, { width: cardWidth }]}>
          {/* Title Header */}
          <View style={policyStyles.titleContainer}>
            <View style={policyStyles.titleBadgeContainer}>
              <ShieldIcon size={26} color="#0F766E" />
            </View>
            <Text style={policyStyles.title}>Review & Accept Policies</Text>
            <Text style={policyStyles.subtitle}>
              Please review and accept our patient terms and privacy policies to complete setup.
            </Text>
          </View>

          {/* Scrollable Policy Documents Box */}
          <ScrollView
            style={policyStyles.scrollableContent}
            contentContainerStyle={policyStyles.scrollableContentInner}
            showsVerticalScrollIndicator={true}
          >
            <View style={policyStyles.policyBox}>
              {/* Terms of Use */}
              <View style={policyStyles.policyCard}>
                <View style={policyStyles.policyCardHeader}>
                  <View style={policyStyles.policyCardTitleGroup}>
                    <Text style={policyStyles.policyCardTitle}>Terms of Use</Text>
                  </View>
                  <View style={policyStyles.policyVersionBadge}>
                    <Text style={policyStyles.policyVersionText}>v{MOCK_TERMS_POLICY.version}</Text>
                  </View>
                </View>
                <Text style={policyStyles.policyDescription}>
                  General Patient Terms of Service and Platform Usage Guidelines.
                </Text>
                <Pressable onPress={() => setSelectedPolicyItem(MOCK_TERMS_POLICY)}>
                  <Text style={policyStyles.viewPolicyLinkText}>Read Full Document →</Text>
                </Pressable>
              </View>

              {/* Privacy Policy */}
              <View style={policyStyles.policyCard}>
                <View style={policyStyles.policyCardHeader}>
                  <View style={policyStyles.policyCardTitleGroup}>
                    <Text style={policyStyles.policyCardTitle}>Privacy Policy</Text>
                  </View>
                  <View style={policyStyles.policyVersionBadge}>
                    <Text style={policyStyles.policyVersionText}>v{MOCK_PRIVACY_POLICY.version}</Text>
                  </View>
                </View>
                <Text style={policyStyles.policyDescription}>
                  Patient Data Protection & HIPAA Compliant Healthcare Standards.
                </Text>
                <Pressable onPress={() => setSelectedPolicyItem(MOCK_PRIVACY_POLICY)}>
                  <Text style={policyStyles.viewPolicyLinkText}>Read Full Document →</Text>
                </Pressable>
              </View>

              {/* Informed Consent Policy */}
              <View style={policyStyles.policyCard}>
                <View style={policyStyles.policyCardHeader}>
                  <View style={policyStyles.policyCardTitleGroup}>
                    <Text style={policyStyles.policyCardTitle}>Informed Consent for Telehealth</Text>
                  </View>
                  <View style={policyStyles.policyVersionBadge}>
                    <Text style={policyStyles.policyVersionText}>v{MOCK_INFORMED_CONSENT_POLICY.version}</Text>
                  </View>
                </View>
                <Text style={policyStyles.policyDescription}>
                  Consent to Digital Health Consultations & Electronic Medical Records.
                </Text>
                <Pressable onPress={() => setSelectedPolicyItem(MOCK_INFORMED_CONSENT_POLICY)}>
                  <Text style={policyStyles.viewPolicyLinkText}>Read Full Document →</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>

          {/* Interactive Consent Checkboxes */}
          <View style={policyStyles.fixedBottomSection}>
            <View style={policyStyles.checkboxContainer}>
              <Pressable
                style={policyStyles.checkboxRow}
                onPress={() => setAgreedTermsPrivacy(prev => !prev)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: agreedTermsPrivacy }}
              >
                <View
                  style={[
                    policyStyles.checkboxSquare,
                    agreedTermsPrivacy && policyStyles.checkboxSquareChecked,
                  ]}
                >
                  {agreedTermsPrivacy && <Text style={policyStyles.checkmarkIcon}>✓</Text>}
                </View>
                <Text style={policyStyles.checkboxLabel}>
                  I have read and agree to the{' '}
                  <Text
                    style={policyStyles.policyLinkBold}
                    onPress={() => setSelectedPolicyItem(MOCK_TERMS_POLICY)}
                  >
                    Terms of Use
                  </Text>{' '}
                  and{' '}
                  <Text
                    style={policyStyles.policyLinkBold}
                    onPress={() => setSelectedPolicyItem(MOCK_PRIVACY_POLICY)}
                  >
                    Privacy Policy
                  </Text>
                  .
                </Text>
              </Pressable>

              <Pressable
                style={policyStyles.checkboxRow}
                onPress={() => setAgreedConsent(prev => !prev)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: agreedConsent }}
              >
                <View
                  style={[
                    policyStyles.checkboxSquare,
                    agreedConsent && policyStyles.checkboxSquareChecked,
                  ]}
                >
                  {agreedConsent && <Text style={policyStyles.checkmarkIcon}>✓</Text>}
                </View>
                <Text style={policyStyles.checkboxLabel}>
                  I have read and agree to the{' '}
                  <Text
                    style={policyStyles.policyLinkBold}
                    onPress={() => setSelectedPolicyItem(MOCK_INFORMED_CONSENT_POLICY)}
                  >
                    Informed Consent Policy
                  </Text>
                  .
                </Text>
              </Pressable>
            </View>

            {/* Action Buttons */}
            <View style={policyStyles.buttonGroup}>
              <Pressable
                disabled={!isFormValid}
                style={({ pressed }) => [
                  policyStyles.primaryButton,
                  !isFormValid && policyStyles.primaryButtonDisabled,
                  pressed && isFormValid && { opacity: 0.85 },
                ]}
                onPress={handleAccept}
              >
                <Text style={policyStyles.primaryButtonText}>Accept & Complete Setup</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  policyStyles.secondaryButton,
                  pressed && { opacity: 0.75 },
                ]}
                onPress={handleSignOut}
              >
                <Text style={policyStyles.secondaryButtonText}>Cancel / Sign out</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Footer Copyright */}
        <View style={policyStyles.footerContainer}>
          <Text style={policyStyles.copyrightText}>
            © {new Date().getFullYear()} PRED Care. All rights reserved.
          </Text>
        </View>
      </View>

      {/* Policy Viewer Modal */}
      <PolicyViewerModal
        visible={!!selectedPolicyItem}
        policy={selectedPolicyItem}
        onClose={() => setSelectedPolicyItem(null)}
      />
    </SafeAreaView>
  );
};

export default PolicyAcceptanceScreen;
