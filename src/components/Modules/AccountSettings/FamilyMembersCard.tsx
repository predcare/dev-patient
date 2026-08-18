import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { settingStyles } from '../../../styled/SettingScreen.styled';

export interface FamilyMemberItemData {
  id: string;
  name: string;
  relation?: string;
  gender?: string;
  isCurrentUser?: boolean;
  initials: string;
  profile_picture?: string | null;
}

export interface FamilyMembersCardProps {
  members: FamilyMemberItemData[];
  activeMemberId: string;
  onSelectMember: (id: string) => void;
  onEditMember: (member: FamilyMemberItemData) => void;
  onDeleteMember: (member: FamilyMemberItemData) => void;
  onAddMember: () => void;
}

export const FamilyMembersCard: React.FC<FamilyMembersCardProps> = ({
  members,
  activeMemberId,
  onSelectMember,
  onEditMember,
  onDeleteMember,
  onAddMember,
}) => {
  return (
    <View style={settingStyles.card}>
      {members.map((member, index) => {
        const active = activeMemberId === member.id;
        return (
          <View
            key={member.id}
            style={[
              settingStyles.memberRow,
              active && settingStyles.memberRowActive,
              index < members.length - 1 && settingStyles.memberRowBorder,
            ]}
          >
            <TouchableOpacity
              style={settingStyles.memberMainPress}
              onPress={() => onSelectMember(member.id)}
              activeOpacity={0.7}
            >
              {member.profile_picture ? (
                <Image
                  source={{ uri: member.profile_picture }}
                  style={settingStyles.memberAvatarImage}
                />
              ) : (
                <View style={settingStyles.memberAvatar}>
                  <Text style={settingStyles.memberAvatarText}>{member.initials}</Text>
                </View>
              )}
              <View style={settingStyles.memberInfo}>
                <Text style={settingStyles.memberName}>{member.name}</Text>
                {member.relation ? (
                  <Text style={settingStyles.memberRelation}>{member.relation}</Text>
                ) : null}
              </View>
            </TouchableOpacity>

            {member.isCurrentUser ? (
              <View style={settingStyles.youBadge}>
                <Text style={settingStyles.youBadgeText}>YOU</Text>
              </View>
            ) : (
              <View style={settingStyles.memberActions}>
                <TouchableOpacity
                  style={settingStyles.memberActionBtn}
                  onPress={() => onEditMember(member)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={settingStyles.memberEditText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={settingStyles.memberActionBtn}
                  onPress={() => onDeleteMember(member)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={settingStyles.memberDeleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}

            {active ? <View style={settingStyles.memberActiveDot} /> : null}
          </View>
        );
      })}

      <TouchableOpacity
        style={[
          settingStyles.addMemberRow,
          members.length > 0 && settingStyles.memberRowBorderTop,
        ]}
        onPress={onAddMember}
        activeOpacity={0.7}
      >
        <View style={settingStyles.addMemberPlusCircle}>
          <Text style={settingStyles.addMemberPlusText}>+</Text>
        </View>
        <Text style={settingStyles.addMemberLabel}>Add New Member</Text>
        <Text style={settingStyles.rowArrow}>›</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FamilyMembersCard;
