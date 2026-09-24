import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation, useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import CustomDropDownPicker from '../../components/commons/CustomDropDownPicker/CustomDropDownPicker';
import PredDatePickerModal from '../../components/commons/PredDatePickerModal/PredDatePickerModal';
import { queryClient } from '../../components/providers/ReactQueryProvider';
import AppHeader from '../../components/ui/AppHeader';
import {
  BuildingIcon,
  CalendarIcon,
  ChevronDownIcon,
  CircleXIcon,
  InfoCircleIcon,
  MailIcon,
  PhoneIcon,
  ShieldIcon,
} from '../../components/ui/icons';
import { FamilyRelations, GenderOptions } from '../../config/constants';
import {
  useAddFamilyMember,
  useEditFamilyMember,
  useGetFamilyMemberInfo,
} from '../../hooks/react-query/profile/profile.hooks';
import { ProfileQueryKeys } from '../../hooks/react-query/query.keys';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import { showSuccessToast } from '../../lib/common/toast.utils';
import { AddFamilySchema, TAddFamilySchemaType } from '../../lib/schemas/profile.schemas';
import { memberStyles } from '../../styled/MemberScreen.styled';
import { theme } from '../../styled/theme.styled';
import { useAuthStore } from '../../zustand/stores/useAuthStore';
import { useLoadingStore } from '../../zustand/stores/useLoadingStore';

export const AddNewMemberScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const router = useRoute<any>();
  const memberId = router.params?.memberId;
  const { userData } = useAuthStore(state => state);
  const { mutate: addFamilyMemberMutation, isPending } = useAddFamilyMember();
  const { mutate: editFamilyMemberMutation, isPending: editFamilyMemberLoading } =
    useEditFamilyMember();
  const [showDOBPicker, setShowDOBPicker] = useState<boolean>(false);
  const [showRelationPicker, setShowRelationPicker] = useState<boolean>(false);
  const [showGenderPicker, setShowGenderPicker] = useState<boolean>(false);
  const { hideLoader, showLoader } = useLoadingStore(state => state);
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TAddFamilySchemaType>({
    resolver: yupResolver(AddFamilySchema),
    defaultValues: {
      name: '',
      gender: '',
      date_of_birth: '',
      relation: '',
    },
  });

  const { data: getFamilyMemberInfoData, isLoading: isGetFamilyMemberInfoLoading } =
    useGetFamilyMemberInfo(memberId);

  const currentRelation = watch('relation');
  const currentGender = watch('gender');
  const currentDateOfBirth = watch('date_of_birth');

  const { selectedRelationLabel, selectedGenderLabel, formattedDobDisplay } = useMemo(() => {
    return {
      selectedRelationLabel: FamilyRelations.find(o => o.value === currentRelation)?.label,
      selectedGenderLabel: GenderOptions.find(o => o.value === currentGender)?.label,
      formattedDobDisplay: currentDateOfBirth
        ? dayjs(currentDateOfBirth).format('DD MMM YYYY')
        : '',
    };
  }, [currentRelation, currentGender, currentDateOfBirth]);

  const onSubmit = (data: TAddFamilySchemaType) => {
    if (memberId) {
      const payload = {
        id: memberId,
        body: data,
      };
      showLoader(t('addNewMember.editingMember'));
      editFamilyMemberMutation(payload, {
        onSuccess: async res => {
          if (res?.success) {
            showSuccessToast(res?.message || t('addNewMember.memberEditedSuccess'));
            reset();
            await queryClient.invalidateQueries({
              queryKey: [ProfileQueryKeys.FAMILY_MEMBER_LIST],
            });
            hideLoader();
            navigation.goBack();
          } else {
            hideLoader();
            navigation.goBack();
          }
        },
        onError: () => {
          hideLoader();
        },
      });
    } else {
      showLoader(t('addNewMember.addingMember'));
      addFamilyMemberMutation(data, {
        onSuccess: async res => {
          if (res?.success) {
            showSuccessToast(res?.message || t('addNewMember.memberAddedSuccess'));
            reset();
            await queryClient.invalidateQueries({
              queryKey: [ProfileQueryKeys.FAMILY_MEMBER_LIST],
            });
            hideLoader();
            navigation.goBack();
          } else {
            hideLoader();
            navigation.goBack();
          }
        },
        onError: () => {
          hideLoader();
        },
      });
    }
  };

  useEffect(() => {
    if (getFamilyMemberInfoData && memberId) {
      setValue('date_of_birth', getFamilyMemberInfoData?.date_of_birth);
      setValue('gender', getFamilyMemberInfoData?.gender);
      setValue('name', getFamilyMemberInfoData?.name);
      setValue('relation', getFamilyMemberInfoData?.relation);
    }
  }, [getFamilyMemberInfoData, memberId, setValue]);

  return (
    <SafeAreaWrapper style={memberStyles.screen}>
      <AppHeader
        title={
          memberId
            ? t('addNewMember.editFamilyMemberTitle')
            : t('addNewMember.addFamilyMemberTitle')
        }
        showBack={true}
      />
      <ScrollView
        contentContainerStyle={memberStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={memberStyles.inheritedBanner}>
          <InfoCircleIcon size={18} color={theme.colors.primaryDark} />
          <Text style={memberStyles.inheritedText}>
            {t('addNewMember.inheritedInfoBanner')}
          </Text>
        </View>

        <View style={memberStyles.section}>
          <Text style={memberStyles.sectionTitle}>{t('addNewMember.memberDetailsHeader')}</Text>
          <Text style={memberStyles.sectionSubtitle}>{t('addNewMember.memberDetailsSub')}</Text>
          <View style={memberStyles.fieldWrapper}>
            <Text style={memberStyles.fieldLabel}>
              {t('addNewMember.fullName')}<Text style={memberStyles.required}> *</Text>
            </Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[memberStyles.textInput, errors.name ? memberStyles.fieldError : null]}
                  placeholder={t('addNewMember.enterFullName')}
                  placeholderTextColor={theme.colors.textMuted}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {!!errors.name && <Text style={memberStyles.errorText}>{errors.name.message}</Text>}
          </View>
          <View style={memberStyles.fieldWrapper}>
            <Text style={memberStyles.fieldLabel}>
              {t('addNewMember.relation')}<Text style={memberStyles.required}> *</Text>
            </Text>
            <TouchableOpacity
              style={[
                memberStyles.dropdownTrigger,
                errors.relation ? memberStyles.fieldError : null,
              ]}
              onPress={() => setShowRelationPicker(true)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  memberStyles.dropdownValue,
                  !selectedRelationLabel && memberStyles.dropdownPlaceholder,
                ]}
              >
                {selectedRelationLabel || t('addNewMember.selectRelation')}
              </Text>
              <ChevronDownIcon size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
            {!!errors.relation && (
              <Text style={memberStyles.errorText}>{errors.relation.message}</Text>
            )}
          </View>
          <View style={memberStyles.fieldWrapper}>
            <Text style={memberStyles.fieldLabel}>
              {t('addNewMember.gender')}<Text style={memberStyles.required}> *</Text>
            </Text>
            <TouchableOpacity
              style={[memberStyles.dropdownTrigger, errors.gender ? memberStyles.fieldError : null]}
              onPress={() => setShowGenderPicker(true)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  memberStyles.dropdownValue,
                  !selectedGenderLabel && memberStyles.dropdownPlaceholder,
                ]}
              >
                {selectedGenderLabel || t('addNewMember.selectGender')}
              </Text>
              <ChevronDownIcon size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
            {!!errors.gender && <Text style={memberStyles.errorText}>{errors.gender.message}</Text>}
          </View>
          <View style={memberStyles.fieldWrapper}>
            <Text style={memberStyles.fieldLabel}>
              {t('addNewMember.dateOfBirth')}<Text style={memberStyles.required}> *</Text>
            </Text>
            <TouchableOpacity
              style={[
                memberStyles.dropdownTrigger,
                errors.date_of_birth ? memberStyles.fieldError : null,
              ]}
              onPress={() => setShowDOBPicker(true)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  memberStyles.dropdownValue,
                  !formattedDobDisplay && memberStyles.dropdownPlaceholder,
                ]}
              >
                {formattedDobDisplay || t('addNewMember.selectDateOfBirth')}
              </Text>
              {currentDateOfBirth ? (
                <TouchableOpacity
                  onPress={e => {
                    e.stopPropagation();
                    setValue('date_of_birth', '', { shouldValidate: true });
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  activeOpacity={0.7}
                >
                  <CircleXIcon size={18} color={theme.colors.errorRed || '#EF4444'} />
                </TouchableOpacity>
              ) : (
                <CalendarIcon size={18} color={theme.colors.textMuted} />
              )}
            </TouchableOpacity>
            {!!errors.date_of_birth && (
              <Text style={memberStyles.errorText}>{errors.date_of_birth.message}</Text>
            )}
          </View>
        </View>

        <View style={memberStyles.section}>
          <Text style={memberStyles.sectionTitle}>{t('addNewMember.contactInfoLinkedHeader')}</Text>
          <Text style={memberStyles.sectionSubtitle}>
            {t('addNewMember.contactInfoSub')}
          </Text>
          <View style={memberStyles.fieldWrapper}>
            <Text style={memberStyles.fieldLabel}>{t('addNewMember.phoneNumber')}</Text>
            <View style={memberStyles.readOnlyField}>
              <PhoneIcon size={16} color={theme.colors.textMuted} />
              <Text style={memberStyles.readOnlyValue} numberOfLines={2}>
                {userData?.phone_number || t('addNewMember.notSet')}
              </Text>
              <View style={memberStyles.lockedBadge}>
                <ShieldIcon size={12} color={theme.colors.textMuted} />
              </View>
            </View>
            <Text style={memberStyles.readOnlyHint}>{t('addNewMember.inheritedFromPrimary')}</Text>
          </View>
          <View style={memberStyles.fieldWrapper}>
            <Text style={memberStyles.fieldLabel}>{t('addNewMember.emailAddress')}</Text>
            <View style={memberStyles.readOnlyField}>
              <MailIcon size={16} color={theme.colors.textMuted} />
              <Text style={memberStyles.readOnlyValue} numberOfLines={2}>
                {userData?.email || t('addNewMember.notSet')}
              </Text>
              <View style={memberStyles.lockedBadge}>
                <ShieldIcon size={12} color={theme.colors.textMuted} />
              </View>
            </View>
            <Text style={memberStyles.readOnlyHint}>{t('addNewMember.inheritedFromPrimary')}</Text>
          </View>
          <View style={memberStyles.fieldWrapper}>
            <Text style={memberStyles.fieldLabel}>{t('addNewMember.address')}</Text>
            <View style={memberStyles.readOnlyField}>
              <BuildingIcon size={16} color={theme.colors.textMuted} />
              <Text style={memberStyles.readOnlyValue} numberOfLines={2}>
                {[userData?.address, userData?.city, userData?.state].filter(Boolean).join(', ') ||
                  t('addNewMember.notSet')}
              </Text>
              <View style={memberStyles.lockedBadge}>
                <ShieldIcon size={12} color={theme.colors.textMuted} />
              </View>
            </View>
            <Text style={memberStyles.readOnlyHint}>{t('addNewMember.inheritedFromPrimary')}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            memberStyles.submitBtn,
            (isPending || editFamilyMemberLoading) && memberStyles.submitBtnDisabled,
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={isPending || editFamilyMemberLoading}
          activeOpacity={0.85}
        >
          {isPending || editFamilyMemberLoading ? (
            <ActivityIndicator color={theme.colors.surface} size="small" />
          ) : (
            <Text style={memberStyles.submitBtnText}>
              {memberId
                ? t('addNewMember.editFamilyMemberTitle')
                : t('addNewMember.addFamilyMemberTitle')}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      <CustomDropDownPicker
        visible={showRelationPicker}
        title={t('addNewMember.relation')}
        options={FamilyRelations}
        selectedValue={currentRelation}
        onSelect={val => {
          setValue('relation', val, { shouldValidate: true });
          setShowRelationPicker(false);
        }}
        onClose={() => setShowRelationPicker(false)}
      />
      <CustomDropDownPicker
        visible={showGenderPicker}
        title={t('addNewMember.gender')}
        options={GenderOptions}
        selectedValue={currentGender}
        onSelect={val => {
          setValue('gender', val, { shouldValidate: true });
          setShowGenderPicker(false);
        }}
        onClose={() => setShowGenderPicker(false)}
      />
      <PredDatePickerModal
        visible={showDOBPicker}
        value={currentDateOfBirth ? new Date(currentDateOfBirth) : new Date(2000, 0, 1)}
        maxYear={new Date().getFullYear()}
        title={t('addNewMember.dateOfBirth')}
        onCancel={() => setShowDOBPicker(false)}
        onConfirm={date => {
          const formatted = dayjs(date).format('YYYY-MM-DD');
          setValue('date_of_birth', formatted, { shouldValidate: true });
          setShowDOBPicker(false);
        }}
      />
    </SafeAreaWrapper>
  );
};

export default AddNewMemberScreen;
