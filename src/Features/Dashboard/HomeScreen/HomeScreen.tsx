import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Header from '../../../Layout/Header';
import SafeAreaWrapper from '../../../Layout/SafeAreaWrapper';
import { getProfileCompletion } from '../../../lib/common/common.utils';
import { showInfoToast } from '../../../lib/common/toast.utils';
import { DashboardProfile, MOCK_DASHBOARD_PROFILE } from '../../../resources/mockData';
import { AppRoute } from '../../../route';
import dashboardStyles from '../../../styled/DashboardScreen.styled';
import { theme } from '../../../styled/theme.styled';
import { useAuthStore } from '../../../zustand/stores/useAuthStore';
import DailyHealthTipsSection from './Components/DailyHealthTipsSection';
import FindSpecialistCard from './Components/FindSpecialistCard';
import MyDoctorsSection from './Components/MyDoctorsSection';
import ProfileCompletionCard from './Components/ProfileCompletionCard';
import QuickAccessGrid from './Components/QuickAccessGrid';
import { UpcomingAppointmentsCard } from './Components/UpcomingAppointmentsCard';

export const HomeScreen: React.FC = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const rootNav = navigation.getParent() || navigation;
    const { userData } = useAuthStore(state => state);
    const [profile] = useState<DashboardProfile>(MOCK_DASHBOARD_PROFILE);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const { isCompleted, percentage } = useMemo(() => {
        return getProfileCompletion(userData);
    }, [userData]);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 600);
    };

    return (
        <SafeAreaWrapper
            showBottomBar={true}
            activeBottomTab="Home"
            headerBackgroundColor={theme.colors.surface}
            header={<Header isHomeScreen title={t('commons.welcomeBack')} />}
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

                <View style={dashboardStyles.blockSpacing}>
                    <FindSpecialistCard onPress={() => rootNav.navigate(AppRoute.DOCTOR_SEARCH)} />
                </View>
                <UpcomingAppointmentsCard />
                <QuickAccessGrid />
                <DailyHealthTipsSection />
            </ScrollView>
        </SafeAreaWrapper>
    );
};

export default HomeScreen;
