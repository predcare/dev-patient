import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import LanguageSwitcherModal, { LANGUAGES } from '../../components/commons/LanguageSwitcherModal';
import PopupAlert, { AlertType } from '../../components/commons/PopupAlert/PopupAlert';
import {
  FamilyMemberItemData,
  FamilyMembersCard,
  SettingsRowItem,
  SettingsSectionLabel,
} from '../../components/Modules/AccountSettings';
import { GlobeIcon, HelpIcon, LogoutIcon, ProfileIcon } from '../../components/ui/icons';
import { Header } from '../../Layout/Header';
import { MOCK_FAMILY_MEMBERS } from '../../resources/mockData';
import { settingStyles } from '../../styled/SettingScreen.styled';
import { theme } from '../../styled/theme.styled';

interface PopupAlertState {
  visible: boolean;
  type?: AlertType;
  title?: string;
  message?: string;
  buttonText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onPress?: () => void;
  onCancel?: () => void;
}

export const SettingScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [activeMemberId, setActiveMemberId] = useState<string>('self');
  const [members, setMembers] = useState<FamilyMemberItemData[]>(MOCK_FAMILY_MEMBERS);
  const [alertConfig, setAlertConfig] = useState<PopupAlertState>({ visible: false });

  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false);
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>('en');

  const currentLanguage = LANGUAGES.find(l => l.code === selectedLanguageCode) || LANGUAGES[0];

  const closeAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const rootNav = navigation.getParent() || navigation;

  const handleSelectMember = (id: string) => {
    setActiveMemberId(id);
  };

  const handleProfilePress = () => {
    rootNav.navigate('ProfileSetup');
  };

  const handleEditMember = (member: FamilyMemberItemData) => {
    rootNav.navigate('AddNewMember', { memberToEdit: member });
  };

  const handleDeleteMember = (member: FamilyMemberItemData) => {
    setAlertConfig({
      visible: true,
      type: 'error',
      title: 'Delete Member',
      message: `Are you sure you want to delete ${member.name}? This action cannot be undone.`,
      buttonText: 'Delete',
      cancelText: 'Cancel',
      showCancel: true,
      onPress: () => {
        setMembers(prev => prev.filter(m => m.id !== member.id));
        if (activeMemberId === member.id) {
          setActiveMemberId('self');
        }
        closeAlert();
      },
      onCancel: closeAlert,
    });
  };

  const handleAddMember = () => {
    rootNav.navigate('AddNewMember');
  };

  const handleLanguagePress = () => {
    setIsLanguageModalOpen(true);
  };

  const handleSupportPress = () => {
    rootNav.navigate('Support');
  };

  const handleSignOut = () => {
    setAlertConfig({
      visible: true,
      type: 'warning',
      title: 'Sign Out',
      message: 'Are you sure you want to sign out of your account?',
      buttonText: 'Sign Out',
      cancelText: 'Cancel',
      showCancel: true,
      onPress: () => {
        closeAlert();
        rootNav.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      },
      onCancel: closeAlert,
    });
  };

  console.log("called settings screen")

  return (
    <SafeAreaView style={settingStyles.container}>
      <Header onProfilePress={handleProfilePress} />

      {/* Scrollable Screen Content */}
      <ScrollView
        style={settingStyles.scrollContainer}
        contentContainerStyle={settingStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Row Section */}
        <SettingsSectionLabel title="PROFILE" />
        <View style={settingStyles.card}>
          <SettingsRowItem
            icon={<ProfileIcon size={20} color={theme.colors.primary} />}
            title="Profile"
            subtitle="View and update your profile"
            onPress={handleProfilePress}
          />
        </View>

        {/* My Members Section */}
        <SettingsSectionLabel title="MY MEMBERS" />
        <FamilyMembersCard
          members={members}
          activeMemberId={activeMemberId}
          onSelectMember={handleSelectMember}
          onEditMember={handleEditMember}
          onDeleteMember={handleDeleteMember}
          onAddMember={handleAddMember}
        />

        {/* Preferences / Language Section */}
        <SettingsSectionLabel title="PREFERENCES" />
        <View style={settingStyles.card}>
          <SettingsRowItem
            icon={<GlobeIcon size={20} color={theme.colors.primary} />}
            title="Language"
            subtitle={`${currentLanguage.name} • ${currentLanguage.nativeName}`}
            onPress={handleLanguagePress}
          />
        </View>

        {/* Support Section */}
        <SettingsSectionLabel title="SUPPORT" />
        <View style={settingStyles.card}>
          <SettingsRowItem
            icon={<HelpIcon size={20} color={theme.colors.primary} />}
            title="Help & Support"
            subtitle="FAQ, contact support, and guides"
            onPress={handleSupportPress}
          />
        </View>

        {/* Account Actions Section */}
        <SettingsSectionLabel title="ACCOUNT ACTIONS" />
        <View style={settingStyles.card}>
          <SettingsRowItem
            icon={<LogoutIcon size={20} color={theme.colors.errorRed} />}
            title="Sign Out"
            subtitle="Sign out of your account"
            danger
            onPress={handleSignOut}
          />
        </View>

        {/* App Version Footer */}
        <Text style={settingStyles.versionText}>PredCare v1.0.0</Text>
      </ScrollView>

      {/* Common LanguageSwitcherModal */}
      <LanguageSwitcherModal
        visible={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        selectedLanguageCode={selectedLanguageCode}
        onSelectLanguage={setSelectedLanguageCode}
      />

      {/* Custom Reusable PopupAlert Modal */}
      <PopupAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        buttonText={alertConfig.buttonText}
        cancelText={alertConfig.cancelText}
        showCancel={alertConfig.showCancel}
        onPress={alertConfig.onPress}
        onCancel={alertConfig.onCancel || closeAlert}
      />
    </SafeAreaView>
  );
};

export default SettingScreen;
