import React from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getInitials } from '../../../lib/common/common.utils';
import dashboardStyles from '../../../styled/DashboardScreen.styled';
import theme from '../../../styled/theme.styled';
import { useAuthStore } from '../../../zustand/stores/useAuthStore';
import { CircleXIcon } from '../../ui/icons';

export interface CommonProfileModalProps {
  showProfileModal: boolean;
  onCloseProfileModal: () => void;
}

export const CommonProfileModal: React.FC<CommonProfileModalProps> = ({
  showProfileModal,
  onCloseProfileModal,
}) => {
  const insets = useSafeAreaInsets();
  const { userData } = useAuthStore(state => state);
  return (
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
            keyboardShouldPersistTaps='handled'
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
              <View style={dashboardStyles.relationBadge}>
                <Text style={dashboardStyles.relationBadgeText}>Dummy</Text>
              </View>
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
                      {userData?.date_of_birth || 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity style={dashboardStyles.editProfileButton} activeOpacity={0.85}>
              <Text style={dashboardStyles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>

            <View style={dashboardStyles.membersCard}>
              <View style={dashboardStyles.membersCardHeader}>
                <Text style={dashboardStyles.membersCardTitle}>My Family Members</Text>
                <TouchableOpacity onPress={onCloseProfileModal} activeOpacity={0.7}>
                  <Text style={dashboardStyles.membersManageText}>Close</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={dashboardStyles.memberRow} activeOpacity={0.7}>
                <View style={dashboardStyles.memberAvatar}>
                  <Text style={dashboardStyles.memberAvatarText}>PT</Text>
                </View>
                <View style={dashboardStyles.memberInfo}>
                  <Text style={dashboardStyles.memberName}>Sahil Mallick</Text>
                  <Text style={dashboardStyles.memberRelation}>Patient</Text>
                </View>
                <View style={dashboardStyles.youBadge}>
                  <Text style={dashboardStyles.youBadgeText}>YOU</Text>
                </View>
                <View style={dashboardStyles.memberActiveIndicator} />
              </TouchableOpacity>

              <TouchableOpacity style={dashboardStyles.addMemberRow} activeOpacity={0.7}>
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
            <TouchableOpacity style={dashboardStyles.signOutButton} activeOpacity={0.85}>
              <Text style={dashboardStyles.signOutIcon}>⎋</Text>
              <Text style={dashboardStyles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
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
});

export default CommonProfileModal;
