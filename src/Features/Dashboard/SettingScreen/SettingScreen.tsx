import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import LanguageSwitcherModal, {
    LANGUAGES,
} from '../../../components/commons/LanguageSwitcherModal/LanguageSwitcherModal';
import LogoutOptionsModal from '../../../components/commons/LogoutOptionsModal/LogoutOptionsModal';
import { queryClient } from '../../../components/providers/ReactQueryProvider';
import {
    GlobeIcon,
    HelpIcon,
    LogoutIcon,
    ProfileIcon,
    SettingsIcon,
} from '../../../components/ui/icons';
import { useLanguageContext } from '../../../contexts/LanguageContext';
import { useUserLogout } from '../../../hooks/react-query/auth/auth.hooks';
import { ProfileQueryKeys } from '../../../hooks/react-query/query.keys';
import Header from '../../../Layout/Header';
import SafeAreaWrapper from '../../../Layout/SafeAreaWrapper';
import { resetToLogin } from '../../../lib/common/navigation.utils';
import { navigationRef } from '../../../navigation/navigationRef';
import settingStyles from '../../../styled/SettingScreen.styled';
import theme from '../../../styled/theme.styled';
import { TSupportedLanguage } from '../../../typescripts/types/i18n.types';
import { useAuthStore } from '../../../zustand/stores/useAuthStore';
import { useLoadingStore } from '../../../zustand/stores/useLoadingStore';
import FamilyMembersCard from './Components/FamilyMembersCard';
import SettingsRowItem from './Components/SettingsRowItem';
import SettingsSectionLabel from './Components/SettingsSectionLabel';

export const SettingScreen: React.FC = () => {
    const navigation = useNavigation();
    const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false);
    const { currentLanguage: selectedLanguageCode, changeLanguage } = useLanguageContext();
    const { t } = useTranslation();

    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const logout = useAuthStore(state => state.logout);
    const showLoader = useLoadingStore(state => state.showLoader);
    const hideLoader = useLoadingStore(state => state.hideLoader);
    const { mutate: userLogoutMutate, isPending: isLoggingOut } = useUserLogout();

    const currentLanguage = LANGUAGES.find(l => l.code === selectedLanguageCode) || LANGUAGES[0];

    const rootNav = navigation.getParent() || navigation;

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                queryClient.refetchQueries({ queryKey: [ProfileQueryKeys.FAMILY_MEMBER_LIST] }),
                queryClient.refetchQueries({ queryKey: [ProfileQueryKeys.Profile] }),
            ]);
        } catch (error) {
            console.error('[SettingScreen] Refresh error:', error);
        } finally {
            setRefreshing(false);
        }
    }, []);

    const handleProfilePress = () => {
        rootNav.navigate('ProfileSetup');
    };

    const handleLanguagePress = () => {
        setIsLanguageModalOpen(true);
    };

    const handleSupportPress = () => {
        rootNav.navigate('Support');
    };

    const handleSignOut = () => {
        setIsLogoutModalOpen(true);
    };

    const performCleanupAndRedirect = async () => {
        try {
            await logout();
            await queryClient.clear();
        } catch (err) {
            console.error('[Logout] Cleanup error:', err);
        } finally {
            if (navigationRef.isReady()) {
                resetToLogin(navigationRef);
            } else {
                resetToLogin(rootNav);
            }
            setTimeout(() => {
                hideLoader();
            }, 500);
        }
    };

    const handleConfirmLogout = (allDevices: boolean) => {
        setIsLogoutModalOpen(false);
        showLoader(t('settingScreen.loggingOutMsg'));
        userLogoutMutate(
            { all_devices: allDevices },
            {
                onSuccess: async res => {
                    if (res?.success) {
                        await performCleanupAndRedirect();
                    }
                },
                onError: async () => {
                    await performCleanupAndRedirect();
                },
            }
        );
    };

    return (
        <SafeAreaWrapper
            showBottomBar={true}
            activeBottomTab="Account"
            header={
                <Header
                    icon={<SettingsIcon size={20} color={theme.colors.primary} />}
                    title={t('settingScreen.settingsTitle')}
                    subTitle={t('settingScreen.preferencesAccountSubtitle')}
                />
            }
        >
            <ScrollView
                style={settingStyles.scrollContainer}
                contentContainerStyle={settingStyles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.primary]}
                        tintColor={theme.colors.primary}
                    />
                }
            >
                <SettingsSectionLabel title={t('settingScreen.profile')} />
                <View style={settingStyles.card}>
                    <SettingsRowItem
                        icon={<ProfileIcon size={20} color={theme.colors.primary} />}
                        title={t('settingScreen.profile')}
                        subtitle={t('settingScreen.viewUpdateProfile')}
                        onPress={handleProfilePress}
                    />
                </View>
                <SettingsSectionLabel title={t('settingScreen.myMembers')} />
                <FamilyMembersCard />
                <SettingsSectionLabel title={t('settingScreen.preferences')} />
                <View style={settingStyles.card}>
                    <SettingsRowItem
                        icon={<GlobeIcon size={20} color={theme.colors.primary} />}
                        title={t('settingScreen.language')}
                        subtitle={`${currentLanguage.name} • ${currentLanguage.nativeName}`}
                        onPress={handleLanguagePress}
                    />
                </View>
                <SettingsSectionLabel title={t('settingScreen.support')} />
                <View style={settingStyles.card}>
                    <SettingsRowItem
                        icon={<HelpIcon size={20} color={theme.colors.primary} />}
                        title={t('settingScreen.helpSupport')}
                        subtitle={t('settingScreen.faqContactSupportGuides')}
                        onPress={handleSupportPress}
                    />
                </View>

                <SettingsSectionLabel title={t('settingScreen.accountActions')} />
                <View style={settingStyles.card}>
                    <SettingsRowItem
                        icon={<LogoutIcon size={20} color={theme.colors.errorRed} />}
                        title={t('settingScreen.signOut')}
                        subtitle={t('settingScreen.signOut')}
                        danger
                        onPress={handleSignOut}
                    />
                </View>

                <Text style={settingStyles.versionText}>PRED Care v1.0.0</Text>
            </ScrollView>
            {isLanguageModalOpen && (
                <LanguageSwitcherModal
                    visible={isLanguageModalOpen}
                    onClose={() => setIsLanguageModalOpen(false)}
                    selectedLanguageCode={selectedLanguageCode}
                    onSelectLanguage={langCode => changeLanguage(langCode as TSupportedLanguage)}
                />
            )}

            {isLogoutModalOpen && (
                <LogoutOptionsModal
                    visible={isLogoutModalOpen}
                    onClose={() => setIsLogoutModalOpen(false)}
                    onConfirmLogout={handleConfirmLogout}
                    isLoading={isLoggingOut}
                />
            )}
        </SafeAreaWrapper>
    );
};

export default SettingScreen;
