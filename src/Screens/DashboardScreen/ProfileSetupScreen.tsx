import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  PermissionsAndroid,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { mediaPaths } from '../../api/endpoints';
import UploadOptionsModal from '../../components/commons/UploadOptionsModal/UploadOptionsModal';
import { safeLaunchCamera, safeLaunchImageLibrary } from '../../lib/common/imagePicker.utils';
import { DropdownPickerModal } from '../../components/Modules/MemberManagement';
import { queryClient } from '../../components/providers/ReactQueryProvider';
import AppHeader from '../../components/ui/AppHeader';
import { CalendarIcon, ChevronDownIcon, EditIcon, UploadIcon } from '../../components/ui/icons';
import WheelDatePickerModal from '../../components/ui/WheelDatePickerModal';
import {
  useCitiesBySId,
  useCountries,
  useStatesByCId,
} from '../../hooks/react-query/common/common.hooks';
import { useProfile, useUpdateProfile } from '../../hooks/react-query/profile/profile.hooks';
import { ProfileQueryKeys } from '../../hooks/react-query/query.keys';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import { showInfoToast, showSuccessToast } from '../../lib/common/toast.utils';
import { ProfileSetupSchema, TProfileSetupSchemaType } from '../../lib/schemas/profile.schemas';
import { memberStyles } from '../../styled/MemberScreen.styled';
import { theme } from '../../styled/theme.styled';
import { useLoadingStore } from '../../zustand/stores/useLoadingStore';

export const ProfileSetupScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showCountryPicker, setShowCountryPicker] = useState<boolean>(false);
  const [showStatePicker, setShowStatePicker] = useState<boolean>(false);
  const [showCityPicker, setShowCityPicker] = useState<boolean>(false);
  const [showUploadOptions, setShowUploadOptions] = useState<boolean>(false);

  const { data: profileData } = useProfile();
  const { mutate: updateProfileMutation, isPending } = useUpdateProfile();
  const { showLoader, hideLoader } = useLoadingStore(state => state);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TProfileSetupSchemaType>({
    resolver: yupResolver(ProfileSetupSchema),
  });

  const currentProfilePic = watch('profilePic');
  const currentDob = watch('dob');
  const currentCountry = watch('country');
  const currentState = watch('state');
  const currentCity = watch('city');
  const currentGender = watch('gender');

  // Location API Integration
  const { data: countriesData } = useCountries();

  const selectedCountryId = useMemo(() => {
    if (!countriesData || !countriesData.length) return undefined;
    if (currentCountry) {
      const match = countriesData.find(
        (c: any) => c.name?.toLowerCase() === currentCountry.toLowerCase()
      );
      if (match) return match.id;
    }
    const defaultMatch = countriesData.find(
      (c: any) => c.name?.toLowerCase() === 'india' || c.code?.toLowerCase() === 'in'
    );
    return defaultMatch ? defaultMatch.id : countriesData[0]?.id;
  }, [countriesData, currentCountry]);

  const countryOptions = useMemo(
    () => (countriesData || []).map((c: any) => ({ label: c.name, value: c.name })),
    [countriesData]
  );

  const { data: statesData } = useStatesByCId({ cId: selectedCountryId });

  const selectedStateId = useMemo(() => {
    if (!statesData || !statesData.length || !currentState) return undefined;
    const match = statesData.find((s: any) => s.name?.toLowerCase() === currentState.toLowerCase());
    return match ? match.id : undefined;
  }, [statesData, currentState]);

  const { data: citiesData } = useCitiesBySId({ sId: selectedStateId });

  const stateOptions = useMemo(
    () => (statesData || []).map((s: any) => ({ label: s.name, value: s.name })),
    [statesData]
  );

  const cityOptions = useMemo(
    () => (citiesData || []).map((c: any) => ({ label: c.name, value: c.name })),
    [citiesData]
  );

  const formatDateLabel = (date: Date | null) => {
    if (!date) return '';
    try {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const handleCamera = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: 'Camera Permission Required',
          message: 'App requires access to your camera to take profile photos.',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        });
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          showInfoToast('Camera permission is required to capture photos', 'Camera Permission');
          return;
        }
      }

      setShowUploadOptions(false);

      safeLaunchCamera(
        {
          mediaType: 'photo',
          quality: 0.8,
          saveToPhotos: false,
          includeBase64: false,
        },
        res => {
          if (res.didCancel) return;
          if (res.errorCode) {
            console.warn('launchCamera errorCode:', res.errorCode, res.errorMessage);
            showInfoToast(
              res.errorMessage || `Camera Error: ${res.errorCode}`,
              'Camera Failure'
            );
            return;
          }
          if (res.assets && res.assets[0]) {
            const asset = res.assets[0];
            const fileObj = {
              uri: asset.uri || '',
              name: asset.fileName || `profile_${Date.now()}.jpg`,
              type: asset.type || 'image/jpeg',
            };
            setValue('profilePic', fileObj, { shouldValidate: true });
            showInfoToast('Photo captured successfully', 'Camera');
          }
        }
      );
    } catch (err: any) {
      console.warn('handleCamera error:', err);
      showInfoToast('Could not open camera', 'Camera Error');
    }
  };

  const handleGallery = () => {
    try {
      setShowUploadOptions(false);

      safeLaunchImageLibrary(
        {
          mediaType: 'photo',
          quality: 0.8,
          selectionLimit: 1,
          includeBase64: false,
        },
        res => {
          if (res.didCancel) return;
          if (res.errorCode) {
            console.warn('launchImageLibrary errorCode:', res.errorCode, res.errorMessage);
            showInfoToast(
              res.errorMessage || `Gallery Error: ${res.errorCode}`,
              'Gallery Failure'
            );
            return;
          }
          if (res.assets && res.assets[0]) {
            const asset = res.assets[0];
            const fileObj = {
              uri: asset.uri || '',
              name: asset.fileName || `profile_${Date.now()}.png`,
              type: asset.type || 'image/png',
            };
            setValue('profilePic', fileObj, { shouldValidate: true });
            showInfoToast('Image selected from gallery', 'Gallery');
          }
        }
      );
    } catch (err: any) {
      console.warn('handleGallery error:', err);
      showInfoToast('Could not open gallery', 'Gallery Error');
    }
  };

  const onSubmit = (data: TProfileSetupSchemaType) => {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.email) formData.append('email', data.email);
    if (data.phoneNumber) formData.append('phone_number', data.phoneNumber);
    if (data.alternatePhone) formData.append('alternate_number', data.alternatePhone);
    if (data.gender) formData.append('gender', data.gender);
    if (data.dob) {
      formData.append('date_of_birth', dayjs(data.dob).format('YYYY-MM-DD'));
    }
    if (data.address) formData.append('address', data.address);
    if (data.country) formData.append('country', data.country);
    if (data.state) formData.append('state', data.state);
    if (data.city) formData.append('city', data.city);
    if (data.postalCode) formData.append('postal_code', data.postalCode);

    if (data.profilePic && typeof data.profilePic === 'object' && (data.profilePic as any).uri) {
      const picObj = data.profilePic as any;
      formData.append('profile_image', {
        uri: picObj.uri,
        name: picObj.name || `profile_${Date.now()}.jpg`,
        type: picObj.type || 'image/jpeg',
      } as any);
    }
    showLoader('Please Wait...');

    updateProfileMutation(formData, {
      onSuccess: async res => {
        if (res?.success) {
          await queryClient.invalidateQueries({ queryKey: [ProfileQueryKeys.Profile] });
          showSuccessToast(
            t('profileSetup.profileUpdatedSuccess'),
            t('profileSetup.profileUpdateTitle')
          );
          navigation.goBack();
        }
      },
      onSettled: () => {
        hideLoader();
      },
      onError: () => {
        hideLoader();
      },
    });
  };

  useEffect(() => {
    if (profileData) {
      reset({
        name: profileData.name || '',
        email: profileData.email || '',
        phoneNumber: profileData.phone_number || '',
        gender: profileData.gender || '',
        dob: profileData.date_of_birth ? new Date(profileData.date_of_birth) : undefined,
        address: profileData.address || '',
        country: profileData.country || 'India',
        state: profileData.state || '',
        city: profileData.city || '',
        postalCode: profileData.postal_code || '',
        alternatePhone: profileData.alternate_number || '',
        profilePic: profileData.profile_image ? mediaPaths(profileData?.profile_image) : '',
      });
    }
  }, [profileData, reset]);

  const profileImageUri =
    typeof currentProfilePic === 'string'
      ? currentProfilePic
      : currentProfilePic && typeof currentProfilePic === 'object'
      ? (currentProfilePic as any).uri
      : null;

  return (
    <SafeAreaWrapper style={memberStyles.screen}>
      <AppHeader title={t('profileSetup.editProfileTitle')} showBack={true} />

      <ScrollView
        contentContainerStyle={[memberStyles.scrollContent, { paddingHorizontal: 20 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={memberStyles.profilePicSection}>
          <TouchableOpacity
            style={memberStyles.profilePicContainer}
            onPress={() => setShowUploadOptions(true)}
            activeOpacity={0.85}
          >
            {profileImageUri ? (
              <Image source={{ uri: profileImageUri }} style={memberStyles.profileImage} />
            ) : (
              <View style={memberStyles.uploadCircle}>
                <UploadIcon size={24} color={theme.colors.primaryDark} />
                <Text style={memberStyles.uploadPhotoTxt}>{t('profileSetup.upload')}</Text>
              </View>
            )}
            <View style={memberStyles.editBadge}>
              <EditIcon size={16} color={theme.colors.surface} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={memberStyles.formSection}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <View style={memberStyles.inputWrapper}>
                <Text style={memberStyles.label}>
                  {t('profileSetup.fullName')} <Text style={memberStyles.required}>*</Text>
                </Text>
                <TextInput
                  style={memberStyles.input}
                  placeholder={t('profileSetup.enterFullName')}
                  placeholderTextColor={theme.colors.textMuted}
                  value={value}
                  onChangeText={onChange}
                />
                {errors.name && (
                  <Text style={{ color: theme.colors.errorRed, fontSize: 12, marginTop: 4 }}>
                    {errors.name.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { value } }) => (
              <View style={memberStyles.inputWrapper}>
                <Text style={memberStyles.label}>{t('profileSetup.emailAddress')}</Text>
                <TextInput
                  style={[memberStyles.input, memberStyles.inputDisabled]}
                  value={value || ''}
                  editable={false}
                />
              </View>
            )}
          />

          <Controller
            control={control}
            name="phoneNumber"
            render={({ field: { value } }) => (
              <View style={memberStyles.inputWrapper}>
                <Text style={memberStyles.label}>{t('profileSetup.phoneNumber')}</Text>
                <TextInput
                  style={[memberStyles.input, memberStyles.inputDisabled]}
                  value={value || ''}
                  editable={false}
                />
              </View>
            )}
          />

          <Controller
            control={control}
            name="gender"
            render={({ field: { onChange } }) => (
              <View style={memberStyles.inputWrapper}>
                <Text style={memberStyles.label}>
                  {t('profileSetup.gender')} <Text style={memberStyles.required}>*</Text>
                </Text>
                <View style={memberStyles.genderContainer}>
                  {[
                    { key: 'male', label: t('profileSetup.male') },
                    { key: 'female', label: t('profileSetup.female') },
                    { key: 'others', label: t('profileSetup.others') },
                  ].map(g => (
                    <TouchableOpacity
                      key={g.key}
                      style={[
                        memberStyles.genderButton,
                        currentGender === g.key && memberStyles.genderButtonActive,
                      ]}
                      onPress={() => onChange(g.key)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          memberStyles.genderButtonText,
                          currentGender === g.key && memberStyles.genderButtonTextActive,
                        ]}
                      >
                        {g.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.gender && (
                  <Text style={{ color: theme.colors.errorRed, fontSize: 12, marginTop: 4 }}>
                    {errors.gender.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="dob"
            render={() => (
              <View style={memberStyles.inputWrapper}>
                <Text style={memberStyles.label}>
                  {t('profileSetup.dateOfBirth')} <Text style={memberStyles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={memberStyles.dropdownTrigger}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.8}
                >
                  <Text style={memberStyles.dropdownValue}>
                    {currentDob ? formatDateLabel(currentDob) : t('profileSetup.selectDateOfBirth')}
                  </Text>
                  <CalendarIcon size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
                {errors.dob && (
                  <Text style={{ color: theme.colors.errorRed, fontSize: 12, marginTop: 4 }}>
                    {errors.dob.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, value } }) => (
              <View style={memberStyles.inputWrapper}>
                <Text style={memberStyles.label}>
                  {t('profileSetup.address')} <Text style={memberStyles.required}>*</Text>
                </Text>
                <TextInput
                  style={memberStyles.input}
                  placeholder={t('profileSetup.enterStreetAddress')}
                  placeholderTextColor={theme.colors.textMuted}
                  value={value}
                  onChangeText={onChange}
                  multiline
                />
                {errors.address && (
                  <Text style={{ color: theme.colors.errorRed, fontSize: 12, marginTop: 4 }}>
                    {errors.address.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="country"
            render={() => (
              <View style={memberStyles.inputWrapper}>
                <Text style={memberStyles.label}>
                  {t('profileSetup.country')} <Text style={memberStyles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={memberStyles.dropdownTrigger}
                  onPress={() => setShowCountryPicker(true)}
                  activeOpacity={0.8}
                >
                  <Text style={memberStyles.dropdownValue}>
                    {currentCountry || t('profileSetup.selectCountry')}
                  </Text>
                  <ChevronDownIcon size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
                {errors.country && (
                  <Text style={{ color: theme.colors.errorRed, fontSize: 12, marginTop: 4 }}>
                    {errors.country.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="state"
            render={() => (
              <View style={memberStyles.inputWrapper}>
                <Text style={memberStyles.label}>
                  {t('profileSetup.state')} <Text style={memberStyles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={memberStyles.dropdownTrigger}
                  onPress={() => setShowStatePicker(true)}
                  activeOpacity={0.8}
                >
                  <Text style={memberStyles.dropdownValue}>
                    {currentState || t('profileSetup.selectState')}
                  </Text>
                  <ChevronDownIcon size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
                {errors.state && (
                  <Text style={{ color: theme.colors.errorRed, fontSize: 12, marginTop: 4 }}>
                    {errors.state.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="city"
            render={() => (
              <View style={memberStyles.inputWrapper}>
                <Text style={memberStyles.label}>
                  {t('profileSetup.city')} <Text style={memberStyles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={memberStyles.dropdownTrigger}
                  onPress={() => setShowCityPicker(true)}
                  activeOpacity={0.8}
                >
                  <Text style={memberStyles.dropdownValue}>
                    {currentCity || t('profileSetup.selectCity')}
                  </Text>
                  <ChevronDownIcon size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
                {errors.city && (
                  <Text style={{ color: theme.colors.errorRed, fontSize: 12, marginTop: 4 }}>
                    {errors.city.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="postalCode"
            render={({ field: { onChange, value } }) => (
              <View style={memberStyles.inputWrapper}>
                <Text style={memberStyles.label}>
                  {t('profileSetup.postalCode')} <Text style={memberStyles.required}>*</Text>
                </Text>
                <TextInput
                  style={memberStyles.input}
                  placeholder={t('profileSetup.enterPostalCode')}
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                  maxLength={6}
                />
                {errors.postalCode && (
                  <Text style={{ color: theme.colors.errorRed, fontSize: 12, marginTop: 4 }}>
                    {errors.postalCode.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="alternatePhone"
            render={({ field: { onChange, value } }) => (
              <View style={memberStyles.inputWrapper}>
                <Text style={memberStyles.label}>{t('profileSetup.alternatePhoneNumber')}</Text>
                <TextInput
                  style={memberStyles.input}
                  placeholder={t('profileSetup.enterAlternatePhoneNumber')}
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="phone-pad"
                  value={value || ''}
                  onChangeText={onChange}
                  maxLength={10}
                />
                {errors.alternatePhone && (
                  <Text style={{ color: theme.colors.errorRed, fontSize: 12, marginTop: 4 }}>
                    {errors.alternatePhone.message}
                  </Text>
                )}
              </View>
            )}
          />
        </View>

        <TouchableOpacity
          style={[memberStyles.saveButton, isPending && memberStyles.saveButtonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
          activeOpacity={0.85}
        >
          {isPending ? (
            <ActivityIndicator color={theme.colors.surface} size="small" />
          ) : (
            <Text style={memberStyles.saveButtonText}>{t('profileSetup.updateProfile')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      <WheelDatePickerModal
        visible={showDatePicker}
        value={currentDob || new Date(1988, 7, 15)}
        maximumDate={new Date()}
        title={t('profileSetup.dateOfBirth')}
        onCancel={() => setShowDatePicker(false)}
        onConfirm={date => {
          setValue('dob', date, { shouldValidate: true });
          setShowDatePicker(false);
        }}
      />

      <DropdownPickerModal
        visible={showCountryPicker}
        title={t('profileSetup.selectCountry')}
        options={countryOptions}
        selectedValue={currentCountry}
        onSelect={val => {
          setValue('country', val, { shouldValidate: true });
          setValue('state', '', { shouldValidate: true });
          setValue('city', '', { shouldValidate: true });
          setShowCountryPicker(false);
        }}
        onClose={() => setShowCountryPicker(false)}
      />

      <DropdownPickerModal
        visible={showStatePicker}
        title={t('profileSetup.selectState')}
        options={stateOptions}
        selectedValue={currentState}
        onSelect={val => {
          setValue('state', val, { shouldValidate: true });
          setValue('city', '', { shouldValidate: true });
          setShowStatePicker(false);
        }}
        onClose={() => setShowStatePicker(false)}
      />
      <DropdownPickerModal
        visible={showCityPicker}
        title={t('profileSetup.selectCity')}
        options={cityOptions}
        selectedValue={currentCity}
        onSelect={val => {
          setValue('city', val, { shouldValidate: true });
          setShowCityPicker(false);
        }}
        onClose={() => setShowCityPicker(false)}
      />
      <UploadOptionsModal
        visible={showUploadOptions}
        title="Upload Profile Picture"
        subtitle="Choose a source to attach your photo"
        onClose={() => setShowUploadOptions(false)}
        onSelectCamera={handleCamera}
        onSelectGallery={handleGallery}
      />
    </SafeAreaWrapper>
  );
};

export default ProfileSetupScreen;
