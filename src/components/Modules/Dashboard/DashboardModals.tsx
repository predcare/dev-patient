import React from 'react';
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  DashboardProfile,
  MockFamilyMember,
} from '../../../resources/mockData';
import { dashboardStyles } from '../../../styled/DashboardScreen.styled';
import { theme } from '../../../styled/theme.styled';

export interface DashboardModalsProps {
  // Profile Modal
  showProfileModal: boolean;
  onCloseProfileModal: () => void;
  profile: DashboardProfile | null;
  familyMembers: MockFamilyMember[];
  activeMemberId: string;
  onSwitchMember: (memberId: string) => void;
  onEditProfile: () => void;
  onAddNewMember: () => void;
  onOpenSettings: () => void;
  onSignOut: () => void;

  // Member Sheet Modal
  showMemberSheet: boolean;
  onCloseMemberSheet: () => void;
}

export const DashboardModals: React.FC<DashboardModalsProps> = ({
  showProfileModal,
  onCloseProfileModal,
  profile,
  familyMembers,
  activeMemberId,
  onSwitchMember,
  onEditProfile,
  onAddNewMember,
  onOpenSettings,
  onSignOut,
  showMemberSheet,
  onCloseMemberSheet,
}) => {
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name[0].toUpperCase();
  };

  return (
    <>
      {/* ── Profile Modal ── */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        transparent
        onRequestClose={onCloseProfileModal}
      >
        <View style={dashboardStyles.modalOverlay}>
          <TouchableOpacity
            style={dashboardStyles.modalBackdrop}
            activeOpacity={1}
            onPress={onCloseProfileModal}
          />
          <View style={dashboardStyles.modalContent}>
            <View style={dashboardStyles.modalHandle} />
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={dashboardStyles.modalScroll}
            >
              {profile && (
                <>
                  <View style={dashboardStyles.profileSection}>
                    {profile.profile_picture ? (
                      <Image
                        source={{ uri: profile.profile_picture }}
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
                          {getInitials(profile.name)}
                        </Text>
                      </View>
                    )}
                    <Text style={dashboardStyles.modalName}>{profile.name}</Text>
                    {profile.isFamilyMember && profile.relation && (
                      <View style={dashboardStyles.relationBadge}>
                        <Text style={dashboardStyles.relationBadgeText}>{profile.relation}</Text>
                      </View>
                    )}
                  </View>

                  <View style={dashboardStyles.infoList}>
                    {!profile.isFamilyMember && (
                      <>
                        <View style={dashboardStyles.infoCard}>
                          <View style={dashboardStyles.infoContent}>
                            <Text style={dashboardStyles.infoLabel}>Email Address</Text>
                            <Text style={dashboardStyles.infoValue}>{profile.email}</Text>
                          </View>
                        </View>
                        <View style={dashboardStyles.infoCard}>
                          <View style={dashboardStyles.infoContent}>
                            <Text style={dashboardStyles.infoLabel}>Phone Number</Text>
                            <Text style={dashboardStyles.infoValue}>{profile.phone_number}</Text>
                          </View>
                        </View>
                      </>
                    )}
                    <View style={dashboardStyles.infoRow}>
                      <View style={[dashboardStyles.infoCard, dashboardStyles.infoCardHalf]}>
                        <View style={dashboardStyles.infoContent}>
                          <Text style={dashboardStyles.infoLabel}>Gender</Text>
                          <Text style={dashboardStyles.infoValue}>{profile.gender || 'Not set'}</Text>
                        </View>
                      </View>
                      <View style={[dashboardStyles.infoCard, dashboardStyles.infoCardHalf]}>
                        <View style={dashboardStyles.infoContent}>
                          <Text style={dashboardStyles.infoLabel}>Date of Birth</Text>
                          <Text style={dashboardStyles.infoValue}>{profile.date_of_birth || 'Not set'}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {!profile.isFamilyMember && (
                    <TouchableOpacity
                      style={dashboardStyles.editProfileButton}
                      onPress={onEditProfile}
                      activeOpacity={0.85}
                    >
                      <Text style={dashboardStyles.editProfileText}>Edit Profile</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              {/* ── My Members Section (reused styling as in SettingScreen) ── */}
              <View style={dashboardStyles.membersCard}>
                <View style={dashboardStyles.membersCardHeader}>
                  <Text style={dashboardStyles.membersCardTitle}>My Family Members</Text>
                  <TouchableOpacity onPress={onCloseProfileModal} activeOpacity={0.7}>
                    <Text style={dashboardStyles.membersManageText}>Close</Text>
                  </TouchableOpacity>
                </View>

                {familyMembers.map((member, index) => (
                  <TouchableOpacity
                    key={member.id}
                    style={[
                      dashboardStyles.memberRow,
                      activeMemberId === member.id && dashboardStyles.memberRowActive,
                      index < familyMembers.length - 1 && dashboardStyles.memberRowBorder,
                    ]}
                    onPress={() => onSwitchMember(member.id)}
                    activeOpacity={0.7}
                  >
                    {member.profile_picture ? (
                      <Image
                        source={{ uri: member.profile_picture }}
                        style={dashboardStyles.memberAvatarImage}
                      />
                    ) : (
                      <View style={dashboardStyles.memberAvatar}>
                        <Text style={dashboardStyles.memberAvatarText}>{member.initials}</Text>
                      </View>
                    )}
                    <View style={dashboardStyles.memberInfo}>
                      <Text style={dashboardStyles.memberName}>{member.name}</Text>
                      {member.relation ? (
                        <Text style={dashboardStyles.memberRelation}>{member.relation}</Text>
                      ) : null}
                    </View>
                    {member.isCurrentUser && (
                      <View style={dashboardStyles.youBadge}>
                        <Text style={dashboardStyles.youBadgeText}>YOU</Text>
                      </View>
                    )}
                    {activeMemberId === member.id && (
                      <View style={dashboardStyles.memberActiveIndicator} />
                    )}
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={dashboardStyles.addMemberRow}
                  onPress={onAddNewMember}
                  activeOpacity={0.7}
                >
                  <View style={dashboardStyles.addMemberPlusCircle}>
                    <Text style={dashboardStyles.addMemberPlusText}>+</Text>
                  </View>
                  <Text style={dashboardStyles.addMemberLabel}>Add New Family Member</Text>
                </TouchableOpacity>
              </View>

              {/* Settings Action */}
              {!profile?.isFamilyMember && (
                <TouchableOpacity
                  style={dashboardStyles.settingsButton}
                  onPress={onOpenSettings}
                  activeOpacity={0.85}
                >
                  <Text style={dashboardStyles.settingsIcon}>⚙️</Text>
                  <Text style={dashboardStyles.settingsText}>Settings & Account</Text>
                </TouchableOpacity>
              )}

              {/* Sign Out Action */}
              <TouchableOpacity
                style={dashboardStyles.signOutButton}
                onPress={onSignOut}
                activeOpacity={0.85}
              >
                <Text style={dashboardStyles.signOutIcon}>⎋</Text>
                <Text style={dashboardStyles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Select Member Bottom Sheet ── */}
      <Modal
        visible={showMemberSheet}
        animationType="slide"
        transparent
        onRequestClose={onCloseMemberSheet}
      >
        <View style={dashboardStyles.modalOverlay}>
          <TouchableOpacity
            style={dashboardStyles.modalBackdrop}
            activeOpacity={1}
            onPress={onCloseMemberSheet}
          />
          <View style={dashboardStyles.memberSheetContent}>
            <View style={dashboardStyles.modalHandle} />
            <Text style={dashboardStyles.memberSheetTitle}>Select Family Member</Text>
            <View style={dashboardStyles.memberSheetDivider} />

            {familyMembers.map(member => (
              <TouchableOpacity
                key={member.id}
                style={[
                  dashboardStyles.sheetMemberRow,
                  activeMemberId === member.id && dashboardStyles.sheetMemberRowActive,
                ]}
                onPress={() => {
                  onSwitchMember(member.id);
                  onCloseMemberSheet();
                }}
                activeOpacity={0.7}
              >
                {member.profile_picture ? (
                  <Image
                    source={{ uri: member.profile_picture }}
                    style={dashboardStyles.sheetMemberAvatarImage}
                  />
                ) : (
                  <View style={dashboardStyles.sheetMemberAvatar}>
                    <Text style={dashboardStyles.memberAvatarText}>{member.initials}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={dashboardStyles.sheetMemberName}>{member.name}</Text>
                  {member.relation ? (
                    <Text style={dashboardStyles.memberRelation}>{member.relation}</Text>
                  ) : null}
                </View>
                {activeMemberId === member.id ? (
                  <View style={dashboardStyles.radioSelected}>
                    <View style={dashboardStyles.radioDot} />
                  </View>
                ) : (
                  <View style={dashboardStyles.radioEmpty} />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={dashboardStyles.sheetAddRow}
              onPress={() => {
                onCloseMemberSheet();
                onAddNewMember();
              }}
              activeOpacity={0.7}
            >
              <View style={dashboardStyles.sheetPlusCircle}>
                <Text style={dashboardStyles.sheetPlusText}>+</Text>
              </View>
              <Text style={dashboardStyles.sheetAddLabel}>Add New Family Member</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default DashboardModals;
