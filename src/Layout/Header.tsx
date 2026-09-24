import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import { mediaPaths } from '../api/endpoints';
import LanguageSwitcherModal, { LANGUAGES } from '../components/commons/LanguageSwitcherModal';
import NotificationModal from '../components/commons/NotificationModal/NotificationModal';
import { BellIcon, GlobeIcon } from '../components/ui/icons';
import { useLanguageContext } from '../contexts/LanguageContext';
import { useNotificationCount } from '../hooks/react-query/notifications/notifications.hooks';
import { getInitials } from '../lib/common/common.utils';
import { headerStyles } from '../styled/Header.styled';
import { theme } from '../styled/theme.styled';
import { TSupportedLanguage } from '../typescripts/types/i18n.types';
import { useAuthStore } from '../zustand/stores/useAuthStore';

export interface HeaderProps {
  title?: string;
  subTitle?: string;
  isHomeScreen?: boolean;
  profileImageUrl?: string | null;
  initials?: string;
  avatarColor?: string;
  unreadCount?: number;
  onAvatarPress?: () => void;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Welcome Back 👋',
  subTitle,
  isHomeScreen = false,
  initials,
  avatarColor = theme.colors.primary,
  onAvatarPress,
  onProfilePress,
  onNotificationPress,
}) => {
  const navigation = useNavigation<any>();
  const [isLangModalOpen, setIsLangModalOpen] = useState<boolean>(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState<boolean>(false);

  const { currentLanguage, changeLanguage } = useLanguageContext();
  const { userData } = useAuthStore(state => state);

  const currentLang = LANGUAGES.find(l => l.code === currentLanguage) || LANGUAGES[0];

  const { data: notifyCounts, isPending: isLoadingNotifyCounts } = useNotificationCount();

  const handleAvatarPress = () => {
    if (onAvatarPress) {
      onAvatarPress();
    } else if (onProfilePress) {
      onProfilePress();
    } else {
      navigation.navigate('Home');
    }
  };

  const handleNotificationPress = () => {
    onNotificationPress?.();
    setIsNotifModalOpen(true);
  };

  return (
    <View style={headerStyles.container}>
      <View style={headerStyles.row}>
        <TouchableOpacity
          style={headerStyles.left}
          onPress={handleAvatarPress}
          activeOpacity={0.8}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          {userData?.profile_image ? (
            <Image
              source={{ uri: mediaPaths(userData.profile_image) }}
              style={headerStyles.avatarImage}
            />
          ) : (
            <View style={[headerStyles.avatar, { backgroundColor: avatarColor }]}>
              <Text style={headerStyles.avatarText}>
                {initials || getInitials(userData?.name || '')}
              </Text>
            </View>
          )}

          <View style={headerStyles.greetingWrap}>
            {isHomeScreen ? (
              <>
                <Text style={headerStyles.greeting} numberOfLines={1} ellipsizeMode="tail">
                  {title}
                </Text>
                <Text style={headerStyles.userName} numberOfLines={1} ellipsizeMode="tail">
                  {userData?.name || 'Unknown'}
                </Text>
              </>
            ) : (
              <>
                <Text style={headerStyles.userName} numberOfLines={1} ellipsizeMode="tail">
                  {title}
                </Text>
                {subTitle ? (
                  <Text style={headerStyles.greeting} numberOfLines={1} ellipsizeMode="tail">
                    {subTitle}
                  </Text>
                ) : null}
              </>
            )}
          </View>
        </TouchableOpacity>

        <View style={headerStyles.rightActions}>
          <TouchableOpacity
            style={headerStyles.langPill}
            onPress={() => setIsLangModalOpen(true)}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
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
          >
            {isLoadingNotifyCounts ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <BellIcon size={20} color={theme.colors.textSecondary} />
            )}
            {notifyCounts && notifyCounts?.data?.unread_count > 0 && (
              <View style={headerStyles.notificationDot} />
            )}
          </TouchableOpacity>
        </View>
      </View>
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
