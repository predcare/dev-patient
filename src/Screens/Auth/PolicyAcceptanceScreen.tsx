import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import PolicyViewerModal, {
  PolicyItemType,
} from '../../components/commons/PolicyViewerModal/PolicyViewerModal';
import { queryClient } from '../../components/providers/ReactQueryProvider';
import PolicyAcceptanceSkeleton from '../../components/Skeletons/PolicyAcceptanceSkeleton';
import { ShieldIcon } from '../../components/ui/icons';
import {
  usePolicies,
  usePostPolicyAcceptance,
} from '../../hooks/react-query/policies/policies.hooks';
import { fetchProfileQuery } from '../../hooks/react-query/profile/profile.hooks';
import { resetToLogin, resetToMainTabs } from '../../lib/common/navigation.utils';
import { Assets } from '../../resources/assets';
import type {
  PolicyAcceptanceScreenNavigationProp,
  PolicyAcceptanceScreenProps,
} from '../../route';
import { policyStyles } from '../../styled/PolicyAcceptanceScreen.styled';
import { IPolicyAcceptancePayload } from '../../typescripts/interfaces/policies.interfaces';
import { useAlertStore } from '../../zustand/stores/useAlertStore';
import { useAuthStore } from '../../zustand/stores/useAuthStore';

export const PolicyAcceptanceScreen: React.FC<PolicyAcceptanceScreenProps> = ({
  navigation: propNavigation,
}) => {
  const defaultNavigation = useNavigation<PolicyAcceptanceScreenNavigationProp>();
  const navigation = propNavigation || defaultNavigation;
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 32, 480);

  const { data: allPolicies, isPending: isLoadingPolicies, refetch, isRefetching } = usePolicies();
  const { logout, userData, setUserData } = useAuthStore(state => state);
  const { showConfirm, showError } = useAlertStore(state => state);
  const [selectedPolicyItem, setSelectedPolicyItem] = useState<PolicyItemType | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [formStates, setFormStates] = useState<IPolicyAcceptancePayload>({
    audience: 'patient',
    source: 'forced_reaccept',
    documents: [],
  });
  const { mutate: postPolicyAcceptanceMutation, isPending: isPostPolicyAcceptancePending } =
    usePostPolicyAcceptance();

  const termsData = allPolicies?.terms;
  const privacyData = allPolicies?.privacy_policy;
  const consentData = allPolicies?.informed_consent;

  const isAgreedTermsAndPrivacy =
    Boolean(formStates.documents?.some(d => d.document_kind === 'terms')) &&
    Boolean(formStates.documents?.some(d => d.document_kind === 'privacy'));

  const isAgreedConsent = Boolean(
    formStates.documents?.some(d => d.document_kind === 'informed_consent')
  );

  const isFormValid = isAgreedTermsAndPrivacy && isAgreedConsent;

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const toggleTermsAndPrivacy = () => {
    setFormStates(prev => {
      const existingDocs = prev.documents || [];
      if (isAgreedTermsAndPrivacy) {
        return {
          ...prev,
          documents: existingDocs.filter(
            d => d.document_kind !== 'terms' && d.document_kind !== 'privacy'
          ),
        };
      } else {
        const newDocs = existingDocs.filter(
          d => d.document_kind !== 'terms' && d.document_kind !== 'privacy'
        );
        if (termsData) {
          newDocs.push({
            document_kind: 'terms',
            document_id: Number(termsData.id),
            document_version: termsData.version,
          });
        }
        if (privacyData) {
          newDocs.push({
            document_kind: 'privacy',
            document_id: Number(privacyData.id),
            document_version: privacyData.version,
          });
        }
        return {
          ...prev,
          documents: newDocs,
        };
      }
    });
  };

  const toggleConsent = () => {
    setFormStates(prev => {
      const existingDocs = prev.documents || [];
      if (isAgreedConsent) {
        return {
          ...prev,
          documents: existingDocs.filter(d => d.document_kind !== 'informed_consent'),
        };
      } else {
        const newDocs = existingDocs.filter(d => d.document_kind !== 'informed_consent');
        if (consentData) {
          newDocs.push({
            document_kind: 'informed_consent',
            document_id: Number(consentData.id),
            document_version: consentData.version,
          });
        }
        return {
          ...prev,
          documents: newDocs,
        };
      }
    });
  };

  const handleAccept = () => {
    if (!isFormValid || isPostPolicyAcceptancePending) return;
    postPolicyAcceptanceMutation(formStates, {
      onSuccess: async res => {
        if (res?.success) {
          const profileRes = await fetchProfileQuery(true);
          if (profileRes?.data) {
            setUserData(profileRes.data);
          }
          resetToMainTabs(navigation);
        } else if (res?.message) {
          showError(res.message);
        }
      },
      onError: (err: any) => {
        showError(err?.response?.data?.message || 'Failed to submit policy acceptance.');
      },
    });
  };

  const handleSignOut = () => {
    showConfirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out and return to the login screen?',
      buttonText: 'Sign Out',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await logout();
          queryClient.clear();
          resetToLogin(navigation);
        } catch (error) {
          console.error('Logout error:', error);
        }
      },
    });
  };

  const openPolicyModal = (policyData?: any) => {
    if (policyData && policyData.content) {
      setSelectedPolicyItem({
        title: policyData.title || 'Policy Document',
        version: String(policyData.version || '1.0'),
        content: policyData.content,
        updatedAt: policyData.updated_at || policyData.published_at,
      });
    }
  };

  return (
    <SafeAreaWrapper style={policyStyles.safeArea}>
      <ScrollView
        style={policyStyles.scrollContainer}
        contentContainerStyle={policyStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isRefetching}
            onRefresh={onRefresh}
            colors={['#0F766E']}
            tintColor="#0F766E"
          />
        }
      >
        <View style={policyStyles.logoContainer}>
          <Image source={Assets.logo2} style={policyStyles.logo} resizeMode="contain" />
        </View>

        <View style={[policyStyles.card, { width: cardWidth }]}>
          <View style={policyStyles.titleContainer}>
            <View style={policyStyles.titleBadgeContainer}>
              <ShieldIcon size={26} color="#0F766E" />
            </View>
            <Text style={policyStyles.title}>Review & Accept Policies</Text>
            <Text style={policyStyles.subtitle}>
              Please review and accept our patient terms and privacy policies to complete setup.
            </Text>
          </View>

          <ScrollView
            style={policyStyles.scrollableContent}
            contentContainerStyle={policyStyles.scrollableContentInner}
            showsVerticalScrollIndicator={true}
            refreshControl={
              <RefreshControl
                refreshing={refreshing || isRefetching}
                onRefresh={onRefresh}
                colors={['#0F766E']}
                tintColor="#0F766E"
              />
            }
          >
            {isLoadingPolicies ? (
              <PolicyAcceptanceSkeleton />
            ) : (
              <View style={policyStyles.policyBox}>
                <View style={policyStyles.policyCard}>
                  <View style={policyStyles.policyCardHeader}>
                    <View style={policyStyles.policyCardTitleGroup}>
                      <Text style={policyStyles.policyCardTitle} numberOfLines={2}>
                        {termsData?.title || 'Terms of Use'}
                      </Text>
                    </View>
                    {termsData?.version !== undefined && (
                      <View style={policyStyles.policyVersionBadge}>
                        <Text style={policyStyles.policyVersionText}>v{termsData.version}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={policyStyles.policyDescription}>
                    General Patient Terms of Service and Platform Usage Guidelines.
                  </Text>
                  <Pressable onPress={() => openPolicyModal(termsData)}>
                    <Text style={policyStyles.viewPolicyLinkText}>Read Full Document →</Text>
                  </Pressable>
                </View>

                {/* Privacy Policy */}
                <View style={policyStyles.policyCard}>
                  <View style={policyStyles.policyCardHeader}>
                    <View style={policyStyles.policyCardTitleGroup}>
                      <Text style={policyStyles.policyCardTitle} numberOfLines={2}>
                        {privacyData?.title || 'Privacy Policy'}
                      </Text>
                    </View>
                    {privacyData?.version !== undefined && (
                      <View style={policyStyles.policyVersionBadge}>
                        <Text style={policyStyles.policyVersionText}>v{privacyData.version}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={policyStyles.policyDescription}>
                    Patient Data Protection & HIPAA Compliant Healthcare Standards.
                  </Text>
                  <Pressable onPress={() => openPolicyModal(privacyData)}>
                    <Text style={policyStyles.viewPolicyLinkText}>Read Full Document →</Text>
                  </Pressable>
                </View>

                {/* Informed Consent Policy */}
                <View style={policyStyles.policyCard}>
                  <View style={policyStyles.policyCardHeader}>
                    <View style={policyStyles.policyCardTitleGroup}>
                      <Text style={policyStyles.policyCardTitle} numberOfLines={2}>
                        {consentData?.title || 'Informed Consent for Telehealth'}
                      </Text>
                    </View>
                    {consentData?.version !== undefined && (
                      <View style={policyStyles.policyVersionBadge}>
                        <Text style={policyStyles.policyVersionText}>v{consentData.version}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={policyStyles.policyDescription}>
                    Consent to Digital Health Consultations & Electronic Medical Records.
                  </Text>
                  <Pressable onPress={() => openPolicyModal(consentData)}>
                    <Text style={policyStyles.viewPolicyLinkText}>Read Full Document →</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Interactive Consent Checkboxes */}
          <View style={policyStyles.fixedBottomSection}>
            <View style={policyStyles.checkboxContainer}>
              <Pressable
                style={policyStyles.checkboxRow}
                onPress={toggleTermsAndPrivacy}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isAgreedTermsAndPrivacy }}
              >
                <View
                  style={[
                    policyStyles.checkboxSquare,
                    isAgreedTermsAndPrivacy && policyStyles.checkboxSquareChecked,
                  ]}
                >
                  {isAgreedTermsAndPrivacy && <Text style={policyStyles.checkmarkIcon}>✓</Text>}
                </View>
                <Text style={policyStyles.checkboxLabel}>
                  I have read and agree to the{' '}
                  <Text
                    style={policyStyles.policyLinkBold}
                    onPress={() => openPolicyModal(termsData)}
                  >
                    Terms of Use
                  </Text>{' '}
                  and{' '}
                  <Text
                    style={policyStyles.policyLinkBold}
                    onPress={() => openPolicyModal(privacyData)}
                  >
                    Privacy Policy
                  </Text>
                  .
                </Text>
              </Pressable>

              <Pressable
                style={policyStyles.checkboxRow}
                onPress={toggleConsent}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isAgreedConsent }}
              >
                <View
                  style={[
                    policyStyles.checkboxSquare,
                    isAgreedConsent && policyStyles.checkboxSquareChecked,
                  ]}
                >
                  {isAgreedConsent && <Text style={policyStyles.checkmarkIcon}>✓</Text>}
                </View>
                <Text style={policyStyles.checkboxLabel}>
                  I have read and agree to the{' '}
                  <Text
                    style={policyStyles.policyLinkBold}
                    onPress={() => openPolicyModal(consentData)}
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
                disabled={!isFormValid || isPostPolicyAcceptancePending}
                style={({ pressed }) => [
                  policyStyles.primaryButton,
                  (!isFormValid || isPostPolicyAcceptancePending) &&
                    policyStyles.primaryButtonDisabled,
                  pressed && isFormValid && !isPostPolicyAcceptancePending && { opacity: 0.85 },
                ]}
                onPress={handleAccept}
              >
                {isPostPolicyAcceptancePending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={policyStyles.primaryButtonText}>Accept & Complete Setup</Text>
                )}
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
      </ScrollView>
      <PolicyViewerModal
        visible={!!selectedPolicyItem}
        policy={selectedPolicyItem}
        onClose={() => setSelectedPolicyItem(null)}
      />
    </SafeAreaWrapper>
  );
};

export default PolicyAcceptanceScreen;
