import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserLogout } from '../../../hooks/react-query/auth/auth.hooks';
import { useGetFamilyMembers } from '../../../hooks/react-query/profile/profile.hooks';
import { capitalize, formatDate, getInitials } from '../../../lib/common/common.utils';
import { resetToLogin } from '../../../lib/common/navigation.utils';
import { navigationRef } from '../../../navigation/navigationRef';
import { AppRoute } from '../../../route';
import dashboardStyles from '../../../styled/DashboardScreen.styled';
import theme from '../../../styled/theme.styled';
import { useAuthStore } from '../../../zustand/stores/useAuthStore';
import { useLoadingStore } from '../../../zustand/stores/useLoadingStore';
import { queryClient } from '../../providers/ReactQueryProvider';
import { CircleXIcon } from '../../ui/icons';
import LogoutOptionsModal from '../LogoutOptionsModal/LogoutOptionsModal';

export interface CommonProfileModalProps {
  showProfileModal: boolean;
  onCloseProfileModal: () => void;
}

export const CommonProfileModal: React.FC<CommonProfileModalProps> = ({
  showProfileModal,
  onCloseProfileModal,
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { userData } = useAuthStore(state => state);
  const logout = useAuthStore(state => state.logout);
  const showLoader = useLoadingStore(state => state.showLoader);
  const hideLoader = useLoadingStore(state => state.hideLoader);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { mutate: userLogoutMutate, isPending: isLoggingOut } = useUserLogout();
  const {
    data: memberLists,
    isPending: familyPending,
    isError: isFamilyError,
    isFetching: isFamilyFetching,
    refetch: refetchFamilyMembers,
  } = useGetFamilyMembers();

  const selfRelation = memberLists?.find(member => member.relation === 'Self')?.relation;
  const relationLabel =
    selfRelation || (typeof userData?.relation === 'string' ? userData.relation : '');

  const handeNavigate = (type?: string) => {
    switch (type) {
      case 'edit-profile':
        navigation.navigate(AppRoute.PROFILE_SETUP);
        onCloseProfileModal();
        break;
      case 'add-family-member':
        navigation.navigate(AppRoute.ADD_NEW_MEMBER);
        onCloseProfileModal();
        break;
      case 'settings':
        navigation.navigate(AppRoute.ACCOUNT);
        onCloseProfileModal();
        break;
      case 'sign-out':
        setIsLogoutModalOpen(true);
        break;
    }
  };

  const performCleanupAndRedirect = async () => {
    const rootNav = navigation.getParent() || navigation;
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
            onCloseProfileModal();
          }
        },
        onError: async () => {
          await performCleanupAndRedirect();
          onCloseProfileModal();
        },
      }
    );
  };

  return (
    <>
      <Modal
        visible={showProfileModal}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={onCloseProfileModal}
      >
        <View style={dashboardStyles.modalOverlay}>
          <TouchableOpacity
            style={dashboardStyles.modalBackdrop}
            activeOpacity={1}
            onPress={onCloseProfileModal}
          />
          <View
            style={[
              dashboardStyles.modalContent,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            <View style={dashboardStyles.modalHandle} />
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onCloseProfileModal}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Close profile modal"
            >
              <CircleXIcon size={24} color={theme.colors.textMuted} />
            </TouchableOpacity>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[
                dashboardStyles.modalScroll,
                { paddingBottom: Math.max(insets.bottom + 20, 40) },
              ]}
            >
              <View style={dashboardStyles.profileSection}>
                {userData?.profile_image ? (
                  <Image
                    source={{ uri: userData.profile_image }}
                    style={{ width: 88, height: 88, borderRadius: 44 }}
                  />
                ) : (
                  <View
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: 44,
                      backgroundColor: theme.colors.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 32, fontWeight: '700', color: theme.colors.surface }}>
                      {getInitials(userData?.name || 'User')}
                    </Text>
                  </View>
                )}
                <Text style={dashboardStyles.modalName}>{userData?.name || 'User'}</Text>
                {relationLabel ? (
                  <View style={dashboardStyles.relationBadge}>
                    <Text style={dashboardStyles.relationBadgeText}>{capitalize(relationLabel)}</Text>
                  </View>
                ) : null}
              </View>

              <View style={dashboardStyles.infoList}>
                <View style={dashboardStyles.infoCard}>
                  <View style={dashboardStyles.infoContent}>
                    <Text style={dashboardStyles.infoLabel}>Email Address</Text>
                    <Text style={dashboardStyles.infoValue}>{userData?.email || 'N/A'}</Text>
                  </View>
                </View>
                <View style={dashboardStyles.infoCard}>
                  <View style={dashboardStyles.infoContent}>
                    <Text style={dashboardStyles.infoLabel}>Phone Number</Text>
                    <Text style={dashboardStyles.infoValue}>{userData?.phone_number}</Text>
                  </View>
                </View>
                <View style={dashboardStyles.infoRow}>
                  <View style={[dashboardStyles.infoCard, dashboardStyles.infoCardHalf]}>
                    <View style={dashboardStyles.infoContent}>
                      <Text style={dashboardStyles.infoLabel}>Gender</Text>
                      <Text style={dashboardStyles.infoValue}>{userData?.gender || 'N/A'}</Text>
                    </View>
                  </View>
                  <View style={[dashboardStyles.infoCard, dashboardStyles.infoCardHalf]}>
                    <View style={dashboardStyles.infoContent}>
                      <Text style={dashboardStyles.infoLabel}>Date of Birth</Text>
                      <Text style={dashboardStyles.infoValue}>
                        {userData?.date_of_birth ? formatDate(userData?.date_of_birth) : 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={dashboardStyles.editProfileButton}
                activeOpacity={0.85}
                onPress={() => handeNavigate('edit-profile')}
              >
                <Text style={dashboardStyles.editProfileText}>Edit Profile</Text>
              </TouchableOpacity>

              <View style={dashboardStyles.membersCard}>
                <View style={dashboardStyles.membersCardHeader}>
                  <Text style={dashboardStyles.membersCardTitle}>My Family Members</Text>
                  <TouchableOpacity onPress={onCloseProfileModal} activeOpacity={0.7}>
                    <Text style={dashboardStyles.membersManageText}>Close</Text>
                  </TouchableOpacity>
                </View>

                {familyPending && !memberLists ? (
                  <View style={styles.membersStatus}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  </View>
                ) : isFamilyError && !memberLists ? (
                  <TouchableOpacity
                    style={styles.membersStatus}
                    activeOpacity={0.7}
                    onPress={() => refetchFamilyMembers()}
                    disabled={isFamilyFetching}
                  >
                    {isFamilyFetching ? (
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                      <Text style={dashboardStyles.membersManageText}>Try again</Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  memberLists?.map((member, index) => {
                    const isSelf = member.relation === 'Self';
                    return (
                      <View
                        key={`${member.user_id}-${member.relation}`}
                        style={[
                          dashboardStyles.memberRow,
                          isSelf && dashboardStyles.memberRowActive,
                          index < memberLists.length - 1 && dashboardStyles.memberRowBorder,
                        ]}
                      >
                        {member.profile_image ? (
                          <Image
                            source={{ uri: member.profile_image }}
                            style={dashboardStyles.memberAvatarImage}
                          />
                        ) : (
                          <View style={dashboardStyles.memberAvatar}>
                            <Text style={dashboardStyles.memberAvatarText}>
                              {getInitials(member.name)}
                            </Text>
                          </View>
                        )}
                        <View style={dashboardStyles.memberInfo}>
                          <Text style={dashboardStyles.memberName}>{member.name}</Text>
                          {member.relation ? (
                            <Text style={dashboardStyles.memberRelation}>
                              {capitalize(member.relation)}
                            </Text>
                          ) : null}
                        </View>
                        {isSelf ? (
                          <>
                            <View style={dashboardStyles.youBadge}>
                              <Text style={dashboardStyles.youBadgeText}>YOU</Text>
                            </View>
                            <View style={dashboardStyles.memberActiveIndicator} />
                          </>
                        ) : null}
                      </View>
                    );
                  })
                )}

                <TouchableOpacity
                  style={dashboardStyles.addMemberRow}
                  activeOpacity={0.7}
                  onPress={() => handeNavigate('add-family-member')}
                >
                  <View style={dashboardStyles.addMemberPlusCircle}>
                    <Text style={dashboardStyles.addMemberPlusText}>+</Text>
                  </View>
                  <Text style={dashboardStyles.addMemberLabel}>Add New Family Member</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={dashboardStyles.settingsButton} activeOpacity={0.85}>
                <Text style={dashboardStyles.settingsIcon}>⚙️</Text>
                <Text style={dashboardStyles.settingsText}>Settings & Account</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={dashboardStyles.signOutButton}
                activeOpacity={0.85}
                onPress={() => handeNavigate('sign-out')}
              >
                <Text style={dashboardStyles.signOutIcon}>⎋</Text>
                <Text style={dashboardStyles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      {isLogoutModalOpen && (
        <LogoutOptionsModal
          visible={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirmLogout={handleConfirmLogout}
          isLoading={isLoggingOut}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 18,
    zIndex: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  membersStatus: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CommonProfileModal;
