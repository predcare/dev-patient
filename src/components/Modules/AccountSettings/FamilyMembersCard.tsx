import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import {
  useGetFamilyMembers,
  useRevokeFamilyMember,
} from '../../../hooks/react-query/profile/profile.hooks';
import { capitalize, getInitials } from '../../../lib/common/common.utils';
import { showErrorToast, showInfoToast } from '../../../lib/common/toast.utils';
import { AppRoute } from '../../../route';
import { settingStyles } from '../../../styled/SettingScreen.styled';
import { theme } from '../../../styled/theme.styled';
import { useAlertStore } from '../../../zustand/stores/useAlertStore';
import { useLoadingStore } from '../../../zustand/stores/useLoadingStore';
import FamilyMembersSkeleton from '../../Skeletons/FamilyMembersSkeleton';
import { AlertIcon } from '../../ui/icons';

export interface FamilyMemberItemData {
  id: string;
  name: string;
  relation?: string;
  gender?: string;
  isCurrentUser?: boolean;
  initials: string;
  profile_picture?: string | null;
}

export const FamilyMembersCard: React.FC = () => {
  const navigation = useNavigation();
  const [isRefetching, setIsRefetching] = useState(false);
  const { hideLoader, showLoader } = useLoadingStore(state => state);
  const { showConfirm } = useAlertStore(state => state);
  const {
    data: memberLists,
    isPending: familyPending,
    isError: isFamilyError,
    refetch: refetchFamilyMembers,
  } = useGetFamilyMembers();
  const { mutate: revokeMember } = useRevokeFamilyMember();

  const handleNewMember = (type: string, options?: { userId: number }) => {
    if (type === 'new') {
      navigation.navigate(AppRoute.ADD_NEW_MEMBER);
    } else if (type === 'edit' && options?.userId) {
      navigation.navigate(AppRoute.ADD_NEW_MEMBER, { memberId: Number(options?.userId) });
    } else {
      showInfoToast('Invalid action');
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefetching(true);
    await refetchFamilyMembers();
    setIsRefetching(false);
  }, [refetchFamilyMembers]);

  const handleDelete = (id: number) => {
    if (!id) return showErrorToast('Invalid member ID');
    showConfirm({
      title: 'Delete Family Member',
      message: 'Are you sure you want to delete this family member?',
      buttonText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        showLoader();
        revokeMember(id, {
          onSuccess: async res => {
            if (res?.success) {
              showErrorToast(res?.message || 'Member deleted successfully');
              await refetchFamilyMembers();
              hideLoader();
            }
          },
          onError: () => {
            hideLoader();
          },
          onSettled: () => {
            hideLoader();
          },
        });
      },
    });
  };

  if (familyPending) {
    return <FamilyMembersSkeleton />;
  }

  return (
    <View style={settingStyles.card}>
      {isFamilyError && !memberLists ? (
        <View style={settingStyles.membersErrorContainer}>
          <View style={settingStyles.membersErrorIconWrap}>
            <AlertIcon size={24} color={theme.colors.errorRed} />
          </View>
          <Text style={settingStyles.membersErrorTitle}>Unable to load members</Text>
          <Text style={settingStyles.membersErrorMessage}>
            We couldn't retrieve your family members. Please check your connection and try again.
          </Text>
          <TouchableOpacity
            style={settingStyles.membersRetryButton}
            onPress={handleRefresh}
            disabled={isRefetching}
            activeOpacity={0.8}
          >
            {isRefetching ? (
              <ActivityIndicator size="small" color={theme.colors.surface} />
            ) : (
              <Text style={settingStyles.membersRetryText}>Try Again</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        memberLists?.map((member, index) => {
          const active = member?.relation === 'Self';
          return (
            <View
              key={`${member.user_id}-${member?.relation}`}
              style={[
                settingStyles.memberRow,
                active && settingStyles.memberRowActive,
                index < memberLists.length - 1 && settingStyles.memberRowBorder,
              ]}
            >
              <TouchableOpacity style={settingStyles.memberMainPress} activeOpacity={0.7}>
                {member.profile_image ? (
                  <Image
                    source={{ uri: member.profile_image }}
                    style={settingStyles.memberAvatarImage}
                  />
                ) : (
                  <View style={settingStyles.memberAvatar}>
                    <Text style={settingStyles.memberAvatarText}>{getInitials(member?.name)}</Text>
                  </View>
                )}
                <View style={settingStyles.memberInfo}>
                  <Text style={settingStyles.memberName}>{member.name}</Text>
                  {member.relation ? (
                    <Text style={settingStyles.memberRelation}>{capitalize(member.relation)}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>

              {member.relation === 'Self' ? (
                <View style={settingStyles.youBadge}>
                  <Text style={settingStyles.youBadgeText}>You</Text>
                </View>
              ) : (
                <View style={settingStyles.memberActions}>
                  <TouchableOpacity
                    style={settingStyles.memberActionBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    onPress={() => {
                      handleNewMember('edit', {
                        userId: Number(member?.user_id),
                      });
                    }}
                  >
                    <Text style={settingStyles.memberEditText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={settingStyles.memberActionBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    onPress={() => handleDelete(Number(member?.user_id))}
                  >
                    <Text style={settingStyles.memberDeleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}

              {active ? <View style={settingStyles.memberActiveDot} /> : null}
            </View>
          );
        })
      )}

      <TouchableOpacity
        style={[
          settingStyles.addMemberRow,
          memberLists && memberLists?.length > 0 && settingStyles.memberRowBorderTop,
        ]}
        activeOpacity={0.7}
        onPress={() => {
          handleNewMember('new');
        }}
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
