import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import {
  DailyHealthTipsSection,
  DashboardModals,
  FindSpecialistCard,
  MyDoctorsSection,
  ProfileCompletionCard,
  QuickAccessGrid,
  UpcomingAppointmentsSection,
} from '../../components/Modules/Dashboard';
import { Header } from '../../Layout/Header';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import { getProfileCompletion } from '../../lib/common/common.utils';
import { showInfoToast } from '../../lib/common/toast.utils';
import { DashboardProfile, MOCK_DASHBOARD_PROFILE } from '../../resources/mockData';
import { AppRoute } from '../../route';
import { dashboardStyles } from '../../styled/DashboardScreen.styled';
import { useAuthStore } from '../../zustand/stores/useAuthStore';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const rootNav = navigation.getParent() || navigation;
  const { userData } = useAuthStore(state => state);
  const [profile] = useState<DashboardProfile>(MOCK_DASHBOARD_PROFILE);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const { isCompleted, percentage } = useMemo(() => {
    return getProfileCompletion(userData);
  }, [userData]);

  return (
    <SafeAreaWrapper
      style={dashboardStyles.container}
      showBottomBar={true}
      activeBottomTab="Home"
      isPathClear={true}
    >
      {profile.isFamilyMember && (
        <View style={dashboardStyles.memberBanner}>
          <Text style={dashboardStyles.memberBannerIcon}>👨‍👩‍👧</Text>
          <Text style={dashboardStyles.memberBannerText}>
            {t('dashboard.viewingMember', {
              name: profile.name,
              relation: profile.relation ? ` · ${profile.relation}` : '',
            })}
          </Text>
          <TouchableOpacity
            style={dashboardStyles.memberBannerBack}
            onPress={() => {
              showInfoToast('Under Development');
            }}
            activeOpacity={0.8}
          >
            <Text style={dashboardStyles.memberBannerBackText}>{t('commons.switchToMe')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <Header
        isHomeScreen
        title={t('commons.welcomeBack')}
        onProfilePress={() => setShowProfileModal(true)}
      />
      <ScrollView
        style={dashboardStyles.scrollView}
        contentContainerStyle={dashboardStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {!isCompleted && (
          <ProfileCompletionCard
            percent={percentage}
            onPress={() => rootNav.navigate(AppRoute.PROFILE_SETUP)}
          />
        )}
        <MyDoctorsSection />
        <View>
          <FindSpecialistCard onPress={() => rootNav.navigate('DoctorSearch')} />
        </View>
        <UpcomingAppointmentsSection />
        <QuickAccessGrid />
        <DailyHealthTipsSection />
      </ScrollView>
      <DashboardModals
        showProfileModal={showProfileModal}
        onCloseProfileModal={() => setShowProfileModal(false)}
      />
    </SafeAreaWrapper>
  );
};

export default DashboardScreen;
