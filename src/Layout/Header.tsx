import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import { CommonProfileModal } from '../components/commons/CommonProfileModal/CommonProfileModal';
import LanguageSwitcherModal, {
  LANGUAGES,
} from '../components/commons/LanguageSwitcherModal/LanguageSwitcherModal';
import NotificationModal from '../components/commons/NotificationModal/NotificationModal';
import { queryClient } from '../components/providers/ReactQueryProvider';
import {
  ArrowLeftIcon,
  BellIcon,
  CalendarIcon,
  GlobeIcon,
  InfoCircleIcon,
  InvoiceIcon,
  PatientsIcon,
  PrescriptionIcon,
  ReportsIcon,
  SettingsIcon,
} from '../components/ui/icons';
import { useLanguageContext } from '../contexts/LanguageContext';
import { useNotificationCount } from '../hooks/react-query/notifications/notifications.hooks';
import { fetchProfileQuery, useSwitchAccount } from '../hooks/react-query/profile/profile.hooks';
import { setItem, STORAGE_KEYS } from '../lib/common/asyncStorage';
import { getInitials } from '../lib/common/common.utils';
import { resetAndNavigate } from '../lib/common/navigation.utils';
import { showErrorToast, showSuccessToast } from '../lib/common/toast.utils';
import { AppRoute } from '../route';
import { mediaPaths } from '../services/api/endpoints';
import { headerStyles } from '../styled/Header.styled';
import { theme } from '../styled/theme.styled';
import { TSupportedLanguage } from '../typescripts/types/i18n.types';
import { useAlertStore } from '../zustand/stores/useAlertStore';
import { useAuthStore } from '../zustand/stores/useAuthStore';
import { useLoadingStore } from '../zustand/stores/useLoadingStore';

const getDefaultHeaderIcon = (title?: string) => {
  if (!title) return <SettingsIcon size={20} color={theme.colors.primary} />;
  const lower = title.toLowerCase();
  if (lower.includes('setting')) return <SettingsIcon size={20} color={theme.colors.primary} />;
  if (lower.includes('patient')) return <PatientsIcon size={20} color={theme.colors.primary} />;
  if (lower.includes('appoint') || lower.includes('schedul') || lower.includes('calendar')) {
    return <CalendarIcon size={20} color={theme.colors.primary} />;
  }
  if (lower.includes('invoic') || lower.includes('bill')) {
    return <InvoiceIcon size={20} color={theme.colors.primary} />;
  }
  if (lower.includes('prescrip') || lower.includes('rx')) {
    return <PrescriptionIcon size={20} color={theme.colors.primary} />;
  }
  if (lower.includes('report')) {
    return <ReportsIcon size={20} color={theme.colors.primary} />;
  }
  return <InfoCircleIcon size={20} color={theme.colors.primary} />;
};

export interface HeaderProps {
  isHome?: boolean;
  isHomeScreen?: boolean;
  title?: string;
  subTitle?: string;
  subtitle?: string;
  description?: string;
  isIconShow?: boolean;
  icon?: React.ReactNode;
  isBackBtn?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  initials?: string;
  avatarColor?: string;
  unreadCount?: number;
  isLang?: boolean;
  isNotifyShow?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isHome,
  isHomeScreen,
  title,
  subTitle,
  subtitle,
  description,
  icon,
  isIconShow = true,
  isBackBtn,
  onBackPress,
  rightAction,
  initials,
  avatarColor = theme.colors.primarySoft,
  unreadCount,
  isLang = true,
  isNotifyShow = true,
}) => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [isLangModalOpen, setIsLangModalOpen] = useState<boolean>(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  const isHomeDashboard = isHomeScreen ?? isHome ?? false;
  const effectiveSubTitle = subTitle || subtitle || description;

  const { currentLanguage, changeLanguage } = useLanguageContext();
  const { userData, setUserData } = useAuthStore(state => state);
  const { hideLoader, showLoader } = useLoadingStore(state => state);
  const { showConfirm } = useAlertStore(state => state);

  const currentLang = LANGUAGES.find(l => l.code === currentLanguage) || LANGUAGES[0];
  const { data: notificationData, isPending: isLoadingNotificationCount } = useNotificationCount();
  const { mutate: switchAccount } = useSwitchAccount();

  const effectiveUnreadCount = useMemo(() => {
    return notificationData?.data?.unread_count ?? unreadCount ?? 0;
  }, [notificationData?.data?.unread_count, unreadCount]);

  const hasUnread = effectiveUnreadCount > 0;

  const nameFontSize = useMemo(() => {
    const len = (userData?.name || 'User').length;
    if (len > 30) return 13.5;
    if (len > 22) return 14;
    if (len > 16) return 15;
    return 16;
  }, [userData?.name]);

  const nameLineHeight = useMemo(() => {
    if (nameFontSize <= 14) return 18;
    if (nameFontSize <= 15) return 20;
    return 21;
  }, [nameFontSize]);

  const titleFontSize = useMemo(() => {
    const len = (title || '').length;
    if (len > 30) return 15;
    if (len > 20) return 16;
    return 18;
  }, [title]);

  const titleLineHeight = useMemo(() => {
    if (titleFontSize <= 15) return 20;
    if (titleFontSize <= 16) return 21;
    return 23;
  }, [titleFontSize]);

  const handleAvatarPress = () => {
    setShowProfileModal(true);
  };

  const handleNotificationPress = () => {
    setIsNotifModalOpen(true);
  };

  const handleSwitchAccount = () => {
    if (!userData?.swithParentId) return showErrorToast('Invalid member ID');

    showConfirm({
      title: `Switch to Parent Account`,
      message: `Are you sure you want to switch to Parent Account?`,
      buttonText: 'Switch',
      cancelText: 'Cancel',
      onConfirm: () => {
        showLoader('Switching account...');
        switchAccount(
          { target_user_id: String(userData?.swithParentId) },
          {
            onSuccess: async res => {
              if (res?.success && res?.data?.token) {
                try {
                  const token = res.data.token;
                  await setItem(STORAGE_KEYS.AUTH_TOKEN, token);
                  await queryClient.clear();
                  const profileRes = await fetchProfileQuery(true);
                  if (profileRes?.data) {
                    setUserData(profileRes.data);
                  }

                  showSuccessToast(res?.message || 'Account switched successfully');
                  hideLoader();
                  resetAndNavigate(navigation, AppRoute.SPLASH);
                } catch (error) {
                  hideLoader();
                }
              } else {
                hideLoader();
                showErrorToast(res?.message || 'Failed to switch account');
              }
            },
            onError: () => {
              hideLoader();
            },
          }
        );
      },
    });
  };

  return (
    <View style={headerStyles.container}>
      <View style={headerStyles.row}>
        {!isHomeDashboard ? (
          <View style={headerStyles.titleContainer}>
            {isBackBtn && (
              <TouchableOpacity
                style={headerStyles.backButton}
                onPress={onBackPress || (() => navigation.goBack())}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <ArrowLeftIcon size={20} color={theme.colors.dark} />
              </TouchableOpacity>
            )}
            <View style={headerStyles.titleRow}>
              {isIconShow && !isBackBtn ? (
                <View style={headerStyles.titleIconBadge}>
                  {icon || getDefaultHeaderIcon(title)}
                </View>
              ) : null}
              <View style={headerStyles.titleTextGroup}>
                <Text
                  style={[
                    headerStyles.headerTitle,
                    { fontSize: titleFontSize, lineHeight: titleLineHeight },
                  ]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {title}
                </Text>
                {effectiveSubTitle ? (
                  <Text
                    style={headerStyles.headerDescription}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {effectiveSubTitle}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={headerStyles.left}
            onPress={handleAvatarPress}
            activeOpacity={0.8}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            {userData?.profile_image ? (
              <Image
                source={{ uri: mediaPaths(userData?.profile_image) }}
                style={headerStyles.avatarImage}
              />
            ) : (
              <View style={[headerStyles.avatar, { backgroundColor: avatarColor }]}>
                <Text style={headerStyles.avatarText}>
                  {initials || getInitials(userData?.name || 'User')}
                </Text>
              </View>
            )}

            <View style={headerStyles.greetingWrap}>
              <Text style={headerStyles.greeting} numberOfLines={1} ellipsizeMode="tail">
                {title || 'Welcome back,'}
              </Text>
              <Text
                style={[
                  headerStyles.userName,
                  { fontSize: nameFontSize, lineHeight: nameLineHeight },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {userData?.name || 'User'}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={headerStyles.rightActions}>
          {rightAction ? (
            rightAction
          ) : (
            <>
              {isLang && (
                <TouchableOpacity
                  style={headerStyles.langPill}
                  onPress={() => setIsLangModalOpen(true)}
                  activeOpacity={0.8}
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                  accessibilityRole="button"
                  accessibilityLabel="Select Language"
                >
                  <GlobeIcon size={16} color={theme.colors.primary} />
                  <Text style={headerStyles.langText} numberOfLines={1}>
                    {currentLang.code.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              )}

              {isNotifyShow && (
                <TouchableOpacity
                  style={headerStyles.notificationButton}
                  onPress={handleNotificationPress}
                  activeOpacity={0.8}
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                  accessibilityRole="button"
                  accessibilityLabel="Notifications"
                >
                  {isLoadingNotificationCount ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  ) : (
                    <BellIcon size={20} color={theme.colors.textSecondary} />
                  )}
                  {hasUnread && <View style={headerStyles.notificationDot} />}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>

      {userData?.isSwitchProfile && (
        <View style={headerStyles.memberBanner}>
          <Text style={headerStyles.memberBannerIcon}>👨‍👩‍👧</Text>
          <Text style={headerStyles.memberBannerText} numberOfLines={1}>
            {t('dashboard.viewingMember', {
              name: userData?.name || 'Member',
            })}
          </Text>
          <TouchableOpacity
            style={headerStyles.memberBannerBack}
            onPress={handleSwitchAccount}
            activeOpacity={0.8}
          >
            <Text style={headerStyles.memberBannerBackText}>{t('commons.switchToMe')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {showProfileModal && (
        <CommonProfileModal
          showProfileModal={showProfileModal}
          onCloseProfileModal={() => setShowProfileModal(false)}
        />
      )}

      {isLangModalOpen && (
        <LanguageSwitcherModal
          visible={isLangModalOpen}
          selectedLanguageCode={currentLanguage}
          onSelectLanguage={langCode => changeLanguage(langCode as TSupportedLanguage)}
          onClose={() => setIsLangModalOpen(false)}
        />
      )}

      {isNotifModalOpen && (
        <NotificationModal visible={isNotifModalOpen} onClose={() => setIsNotifModalOpen(false)} />
      )}
    </View>
  );
};

export default Header;
