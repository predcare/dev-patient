import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import { CommonProfileModal } from '../components/commons/CommonProfileModal/CommonProfileModal';
import LanguageSwitcherModal, { LANGUAGES } from '../components/commons/LanguageSwitcherModal/LanguageSwitcherModal';
import NotificationModal from '../components/commons/NotificationModal/NotificationModal';
import {
  ArrowLeftIcon,
  BellIcon,
  CalendarIcon,
  GlobeIcon,
  InfoCircleIcon,
  InvoiceIcon,
  PatientsIcon,
  PrescriptionIcon,
  SettingsIcon,
} from '../components/ui/icons';
import { useLanguageContext } from '../contexts/LanguageContext';
import { useNotificationCount } from '../hooks/react-query/notifications/notifications.hooks';
import { getInitials } from '../lib/common/common.utils';
import { mediaPaths } from '../services/api/endpoints';
import { headerStyles } from '../styled/Header.styled';
import { theme } from '../styled/theme.styled';
import { TSupportedLanguage } from '../typescripts/types/i18n.types';
import { useAuthStore } from '../zustand/stores/useAuthStore';

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
}) => {
  const navigation = useNavigation<any>();
  const [isLangModalOpen, setIsLangModalOpen] = useState<boolean>(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  const isHomeDashboard = isHomeScreen ?? isHome ?? false;
  const effectiveSubTitle = subTitle || subtitle || description;

  const { currentLanguage, changeLanguage } = useLanguageContext();
  const { userData } = useAuthStore(state => state);

  const currentLang = LANGUAGES.find(l => l.code === currentLanguage) || LANGUAGES[0];
  const { data: notificationData, isPending: isLoadingNotificationCount } = useNotificationCount();

  const effectiveUnreadCount = useMemo(() => {
    return notificationData?.data?.unread_count ?? unreadCount ?? 0;
  }, [notificationData?.data?.unread_count, unreadCount]);

  const hasUnread = effectiveUnreadCount > 0;

  const handleAvatarPress = () => {
    setShowProfileModal(true);
  };

  const handleNotificationPress = () => {
    setIsNotifModalOpen(true);
  };

  const nameFontSize = useMemo(() => {
    const len = (userData?.name || 'User').length;
    if (len > 30) return 14;
    if (len > 22) return 15;
    if (len > 16) return 16;
    return 17;
  }, [userData?.name]);

  const nameLineHeight = useMemo(() => {
    if (nameFontSize <= 14) return 18;
    if (nameFontSize <= 15) return 20;
    return 22;
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
            </>
          )}
        </View>
      </View>

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
        <NotificationModal
          visible={isNotifModalOpen}
          onClose={() => setIsNotifModalOpen(false)}
        />
      )}
    </View>
  );
};

export default Header;
