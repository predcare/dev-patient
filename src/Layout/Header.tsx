import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import LanguageSwitcherModal, { LANGUAGES } from '../components/commons/LanguageSwitcherModal';
import NotificationModal, {
  NotificationItem,
} from '../components/commons/NotificationModal/NotificationModal';
import { BellIcon, GlobeIcon } from '../components/ui/icons';
import { MOCK_NOTIFICATIONS, MOCK_USER_PROFILE } from '../resources/mockData';
import { headerStyles } from '../styled/Header.styled';
import { theme } from '../styled/theme.styled';

export interface HeaderProps {
  greeting?: string;
  userName?: string;
  profileImageUrl?: string | null;
  initials?: string;
  avatarColor?: string;
  unreadCount?: number;
  notifications?: NotificationItem[];
  onAvatarPress?: () => void;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
  onNotificationItemPress?: (item: NotificationItem) => void;
}

export const Header: React.FC<HeaderProps> = ({
  greeting = 'Welcome Back 👋',
  userName = MOCK_USER_PROFILE.name,
  profileImageUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
  initials = MOCK_USER_PROFILE.initials,
  avatarColor = theme.colors.primary,
  unreadCount = 1,
  notifications = MOCK_NOTIFICATIONS,
  onAvatarPress,
  onProfilePress,
  onNotificationPress,
  onNotificationItemPress,
}) => {
  const navigation = useNavigation<any>();

  const [isLangModalOpen, setIsLangModalOpen] = useState<boolean>(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState<boolean>(false);
  const [selectedLangCode, setSelectedLangCode] = useState<string>('en');

  const currentLang = LANGUAGES.find(l => l.code === selectedLangCode) || LANGUAGES[0];

  const handleAvatarPress = () => {
    if (onAvatarPress) {
      onAvatarPress();
    } else if (onProfilePress) {
      onProfilePress();
    } else {
      navigation.navigate('MainTabs', { screen: 'Home' });
    }
  };

  const handleNotificationPress = () => {
    onNotificationPress?.();
    setIsNotifModalOpen(true);
  };

  return (
    <View style={headerStyles.container}>
      <View style={headerStyles.row}>
        {/* Left: Avatar + Greeting + User Name */}
        <TouchableOpacity style={headerStyles.left} onPress={handleAvatarPress} activeOpacity={0.8}>
          {profileImageUrl ? (
            <Image source={{ uri: profileImageUrl }} style={headerStyles.avatarImage} />
          ) : (
            <View style={[headerStyles.avatar, { backgroundColor: avatarColor }]}>
              <Text style={headerStyles.avatarText}>{initials}</Text>
            </View>
          )}

          <View style={headerStyles.greetingWrap}>
            <Text style={headerStyles.greeting}>{greeting}</Text>
            <Text style={headerStyles.userName}>{userName}</Text>
          </View>
        </TouchableOpacity>

        {/* Right Actions: Language Switcher + Notification Bell */}
        <View style={headerStyles.rightActions}>
          <TouchableOpacity
            style={headerStyles.langPill}
            onPress={() => setIsLangModalOpen(true)}
            activeOpacity={0.8}
          >
            <GlobeIcon size={16} color={theme.colors.primary} />
            <Text style={headerStyles.langText}>{currentLang.code.toUpperCase()}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={headerStyles.notificationButton}
            onPress={handleNotificationPress}
            activeOpacity={0.8}
          >
            <BellIcon size={20} color={theme.colors.textSecondary} />
            {unreadCount > 0 && <View style={headerStyles.notificationDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Common Language Switcher Modal */}
      <LanguageSwitcherModal
        visible={isLangModalOpen}
        selectedLanguageCode={selectedLangCode}
        onSelectLanguage={langCode => setSelectedLangCode(langCode)}
        onClose={() => setIsLangModalOpen(false)}
      />

      {/* Common Notification Modal for all screens */}
      <NotificationModal
        visible={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        notifications={notifications}
        onNotificationPress={onNotificationItemPress}
      />
    </View>
  );
};

export default Header;
