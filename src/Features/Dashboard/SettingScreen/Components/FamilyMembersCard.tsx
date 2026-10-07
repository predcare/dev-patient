import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import { queryClient } from '../../../../components/providers/ReactQueryProvider';
import { AlertIcon } from '../../../../components/ui/icons';
import {
  fetchProfileQuery,
  useGetFamilyMembers,
  useRevokeFamilyMember,
  useSwitchAccount,
} from '../../../../hooks/react-query/profile/profile.hooks';
import { setItem, STORAGE_KEYS } from '../../../../lib/common/asyncStorage';
import { capitalize, getInitials } from '../../../../lib/common/common.utils';
import { resetAndNavigate } from '../../../../lib/common/navigation.utils';
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from '../../../../lib/common/toast.utils';
import { AppRoute } from '../../../../route';
import settingStyles from '../../../../styled/SettingScreen.styled';
import theme from '../../../../styled/theme.styled';
import { useAlertStore } from '../../../../zustand/stores/useAlertStore';
import { useAuthStore } from '../../../../zustand/stores/useAuthStore';
import { useLoadingStore } from '../../../../zustand/stores/useLoadingStore';
import FamilyMembersSkeleton from '../Skeletons/FamilyMembersSkeleton';

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
  const { t } = useTranslation();
  const setUserData = useAuthStore(state => state.setUserData);
  const currentUserId = useAuthStore(state => state.userData?.id);
  const { hideLoader, showLoader } = useLoadingStore(state => state);
  const { showConfirm } = useAlertStore(state => state);
  const {
    data: memberLists,
    isPending: familyPending,
    isError: isFamilyError,
    isFetching: isFamilyFetching,
    refetch: refetchFamilyMembers,
  } = useGetFamilyMembers();
  const { mutate: revokeMember } = useRevokeFamilyMember();
  const { mutate: switchAccount } = useSwitchAccount();

  const handleNewMember = (type: string, options?: { userId: number }) => {
    if (type === 'new') {
      navigation.navigate(AppRoute.ADD_NEW_MEMBER);
    } else if (type === 'edit' && options?.userId) {
      navigation.navigate(AppRoute.ADD_NEW_MEMBER, { memberId: Number(options?.userId) });
    } else {
      showInfoToast('Invalid action');
    }
  };

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
              showSuccessToast(res?.message || 'Member deleted successfully');
              await refetchFamilyMembers();
              hideLoader();
            }
          },
          onError: () => {
            hideLoader();
          },
        });
      },
    });
  };

  const handleSwitchAccount = (id: string, name?: string) => {
    if (!id) return showErrorToast('Invalid member ID');
    if (String(id) === String(currentUserId)) {
      return;
    }

    showConfirm({
      title: `Switch to ${name ? capitalize(name) : 'this account'}`,
      message: `Are you sure you want to switch to ${name ? name : 'this account'}?`,
      buttonText: 'Switch',
      cancelText: 'Cancel',
      onConfirm: () => {
        showLoader('Switching account...');
        switchAccount(
          { target_user_id: String(id) },
          {
            onSuccess: async res => {
              if (res?.success && res?.data?.token) {
                try {
                  const token = res.data.token;
                  await setItem(STORAGE_KEYS.AUTH_TOKEN, token);
                  queryClient.clear();
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
            onSettled: () => {
              hideLoader();
            },
          }
        );
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
            onPress={() => refetchFamilyMembers()}
            disabled={isFamilyFetching}
            activeOpacity={0.8}
          >
            {isFamilyFetching ? (
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
              <TouchableOpacity
                style={settingStyles.memberMainPress}
                activeOpacity={active ? 1 : 0.7}
                onPress={() => {
                  if (active) return;
                  handleSwitchAccount(String(member?.user_id), member?.name);
                }}
              >
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
        <Text style={settingStyles.addMemberLabel}>{t('settingScreen.addNewMember')}</Text>
        <Text style={settingStyles.rowArrow}>›</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FamilyMembersCard;
