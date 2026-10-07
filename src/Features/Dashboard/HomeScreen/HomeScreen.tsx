import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, View } from 'react-native';
import Header from '../../../Layout/Header';
import SafeAreaWrapper from '../../../Layout/SafeAreaWrapper';
import { getProfileCompletion } from '../../../lib/common/common.utils';
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
