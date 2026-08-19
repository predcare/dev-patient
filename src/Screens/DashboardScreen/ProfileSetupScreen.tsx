import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { mediaPaths } from '../../api/endpoints';
import { UploadOptionsModal } from '../../components/commons/UploadOptionsModal/UploadOptionsModal';
import { DropdownPickerModal } from '../../components/Modules/MemberManagement';
import { queryClient } from '../../components/providers/ReactQueryProvider';
import { ProfileSetupSkeleton } from '../../components/Skeletons';
import AppHeader from '../../components/ui/AppHeader';
import { CalendarIcon, ChevronDownIcon, EditIcon, UploadIcon } from '../../components/ui/icons';
import WheelDatePickerModal from '../../components/ui/WheelDatePickerModal';
import {
  useGetCities,
  useGetCountries,
  useGetStates,
} from '../../hooks/react-query/common/common.hooks';
import { useProfile, useUpdateProfile } from '../../hooks/react-query/profile/profile.hooks';
import { UserQueryEnum } from '../../hooks/react-query/query.keys';
import useDevicePermissions from '../../hooks/useDevicePermissions';
import { extractLocationValue } from '../../lib/common/common.utils';
import { showSuccessToast } from '../../lib/common/toast.utils';
import { profileSchema, ProfileSchemaType } from '../../lib/schemas/profile.schema';
import { memberStyles } from '../../styled/MemberScreen.styled';
import { theme } from '../../styled/theme.styled';

export const ProfileSetupScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showCountryPicker, setShowCountryPicker] = useState<boolean>(false);
  const [showStatePicker, setShowStatePicker] = useState<boolean>(false);
  const [showCityPicker, setShowCityPicker] = useState<boolean>(false);
  const [showPhotoModal, setShowPhotoModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [selectedPhotoAsset, setSelectedPhotoAsset] = useState<any>(null);

  const isInitializedRef = useRef<boolean>(false);

  const {
    data: profileData,
    isPending: isProfilePending,
    isFetching: isProfileFetching,
    refetch,
  } = useProfile();
  const { mutate: updateProfileMutation, isPending: isUpdatingProfile } = useUpdateProfile();
  const { requestCameraPermission } = useDevicePermissions();

  const isProfileInitialLoading = isProfilePending || (isProfileFetching && !profileData);
  const isSubmitting = loading || isUpdatingProfile;

  // Form initialization with yup validation schema
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfileSchemaType>({
    resolver: yupResolver(profileSchema),
  });

  // Watch location names
  const selectedCountryName = watch('country_name');
  const selectedStateName = watch('state_name');
  const selectedCityName = watch('city_name');

  // React Query Hooks for Location Data
  const { data: countriesData, isPending: isCountriesLoading } = useGetCountries();

  // Find selected country and state objects to resolve IDs for location queries
  const selectedCountry = countriesData?.find(
    c =>
      c.name.toLowerCase() === selectedCountryName?.toLowerCase() ||
      String(c.id) === selectedCountryName
  );
  const { data: statesData, isPending: isStatesLoading } = useGetStates(
    selectedCountry?.id ? { country_id: selectedCountry.id } : undefined
  );

  const selectedState = statesData?.find(
    s =>
      s.name.toLowerCase() === selectedStateName?.toLowerCase() ||
      String(s.id) === selectedStateName
  );
  const { data: citiesData, isPending: isCitiesLoading } = useGetCities(
    selectedState?.id ? { state_id: selectedState.id } : undefined
  );

  // Location Options for Dropdowns (bound by name)
  const countryOptions = useMemo(() => {
    if (countriesData && Array.isArray(countriesData) && countriesData.length > 0) {
      return countriesData.map(c => ({ label: c.name, value: c.name }));
    }
    return [];
  }, [countriesData]);

  const stateOptions = useMemo(() => {
    if (statesData && Array.isArray(statesData) && statesData.length > 0) {
      return statesData.map(s => ({ label: s.name, value: s.name }));
    }
    return [];
  }, [statesData]);

  const cityOptions = useMemo(() => {
    if (citiesData && Array.isArray(citiesData) && citiesData.length > 0) {
      return citiesData.map(c => ({ label: c.name, value: c.name }));
    }
    return [];
  }, [citiesData]);

  const countryLabel = selectedCountryName || '';
  const stateLabel = selectedStateName || '';
  const cityLabel = selectedCityName || '';

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

  // Handle Take Photo from Camera
  const handleTakePhoto = async () => {
    setShowPhotoModal(false);
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
      cameraType: 'front',
    });
    if (result.assets && result.assets[0]?.uri) {
      setSelectedPhotoAsset(result.assets[0]);
      setProfilePic(result.assets[0].uri);
    }
  };

  // Handle Choose Photo from Library / System Files
  const handleChooseFromLibrary = async () => {
    setShowPhotoModal(false);
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    });
    if (result.assets && result.assets[0]?.uri) {
      setSelectedPhotoAsset(result.assets[0]);
      setProfilePic(result.assets[0].uri);
    }
  };

  const handleRemovePhoto = () => {
    setShowPhotoModal(false);
    setSelectedPhotoAsset(null);
    setProfilePic(null);
  };

  const handleSaveProfile = handleSubmit((data: ProfileSchemaType) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone_number', data.phoneNumber);
    formData.append('gender', data.gender);
    formData.append('date_of_birth', data.dobDate.toISOString().split('T')[0]);
    formData.append('address', data.address);
    formData.append('country_name', data.country_name);
    formData.append('state_name', data.state_name);
    formData.append('city_name', data.city_name);
    formData.append('country', data.country_name);
    formData.append('state', data.state_name);
    formData.append('city', data.city_name);

    if (selectedCountry?.id) {
      formData.append('country_id', String(selectedCountry.id));
    }
    if (selectedState?.id) {
      formData.append('state_id', String(selectedState.id));
    }
    const selectedCity = citiesData?.find(
      c => c.name.toLowerCase() === data.city_name.toLowerCase() || String(c.id) === data.city_name
    );
    if (selectedCity?.id) {
      formData.append('city_id', String(selectedCity.id));
    }
    formData.append('postal_code', data.postalCode);
    if (data.alternatePhone) {
      formData.append('alternate_number', data.alternatePhone);
    }

    if (selectedPhotoAsset && selectedPhotoAsset.uri) {
      const fileUri =
        Platform.OS === 'android'
          ? selectedPhotoAsset.uri
          : selectedPhotoAsset.uri.replace('file://', '');
      const fileName = selectedPhotoAsset.fileName || `photo_${Date.now()}.jpg`;
      const mimeType = selectedPhotoAsset.type || 'image/jpeg';

      formData.append('profile_image', {
        uri: fileUri,
        name: fileName,
        type: mimeType,
      } as any);
    }

    updateProfileMutation(formData, {
      onSuccess: async res => {
        if (res?.success) {
          showSuccessToast(res?.message);
          await queryClient.invalidateQueries({ queryKey: [UserQueryEnum.PROFILE] });
          await refetch();
          setLoading(false);
          navigation.goBack();
        }
      },
      onError: () => {
        setLoading(false);
      },
    });
  });

  useEffect(() => {
    if (profileData && !isInitializedRef.current) {
      isInitializedRef.current = true;
      const rawCountry = extractLocationValue(
        profileData.country || (profileData as any).country_name
      );
      const rawState = extractLocationValue(profileData.state || (profileData as any).state_name);
      const rawCity = extractLocationValue(profileData.city || (profileData as any).city_name);
      reset({
        name: profileData.name || '',
        email: profileData.email || '',
        phoneNumber: profileData.phone_number || '',
        gender: profileData.gender || '',
        dobDate: profileData.date_of_birth ? new Date(profileData.date_of_birth) : undefined,
        address: profileData.address || '',
        country_name: rawCountry || 'India',
        state_name: rawState || '',
        city_name: rawCity || '',
        postalCode: profileData.postal_code || '',
        alternatePhone: profileData.alternate_number || '',
      });

      setProfilePic(mediaPaths(profileData?.profile_image));
    }
  }, [profileData, reset]);

  return (
    <SafeAreaView style={memberStyles.screen}>
      <AppHeader title="Edit Profile" showBack={true} />

      {isProfileInitialLoading ? (
        <ProfileSetupSkeleton />
      ) : (
        <ScrollView
          contentContainerStyle={[memberStyles.scrollContent, { paddingHorizontal: 20 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Photo Section */}
          <View style={memberStyles.profilePicSection}>
            <TouchableOpacity
              style={memberStyles.profilePicContainer}
              onPress={() => setShowPhotoModal(true)}
              activeOpacity={0.85}
            >
              {profilePic ? (
                <Image source={{ uri: profilePic }} style={memberStyles.profileImage} />
              ) : (
                <View style={memberStyles.uploadCircle}>
                  <UploadIcon size={24} color={theme.colors.primaryDark} />
                  <Text style={memberStyles.uploadPhotoTxt}>Upload</Text>
                </View>
              )}
              <View style={memberStyles.editBadge}>
                <EditIcon size={16} color={theme.colors.surface} />
              </View>
            </TouchableOpacity>

            {profilePic ? (
              <TouchableOpacity style={memberStyles.removeImageButton} onPress={handleRemovePhoto}>
                <Text style={memberStyles.removeImageText}>Remove Photo</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Section: Personal Details */}
          <View style={memberStyles.formSection}>
            {/* Full Name */}
            <View style={memberStyles.inputWrapper}>
              <Text style={memberStyles.label}>
                FULL NAME <Text style={memberStyles.required}>*</Text>
              </Text>
              <TextInput
                style={memberStyles.input}
                placeholder="Enter full name"
                placeholderTextColor={theme.colors.textMuted}
                value={watch('name')}
                {...register('name')}
                onChangeText={val => setValue('name', val, { shouldValidate: true })}
              />
              {errors.name && <Text style={localStyles.errorText}>{errors.name.message}</Text>}
            </View>

            {/* Email Address */}
            <View style={memberStyles.inputWrapper}>
              <Text style={memberStyles.label}>
                EMAIL ADDRESS <Text style={memberStyles.required}>*</Text>
              </Text>
              <TextInput
                style={[memberStyles.input, memberStyles.inputDisabled]}
                value={watch('email')}
                editable={false}
                {...register('email')}
              />
              {errors.email && <Text style={localStyles.errorText}>{errors.email.message}</Text>}
            </View>

            {/* Phone Number */}
            <View style={memberStyles.inputWrapper}>
              <Text style={memberStyles.label}>
                PHONE NUMBER <Text style={memberStyles.required}>*</Text>
              </Text>
              <TextInput
                style={[memberStyles.input, memberStyles.inputDisabled]}
                value={watch('phoneNumber')}
                editable={false}
                {...register('phoneNumber')}
              />
              {errors.phoneNumber && (
                <Text style={localStyles.errorText}>{errors.phoneNumber.message}</Text>
              )}
            </View>

            {/* Gender (Using Controller) */}
            <View style={memberStyles.inputWrapper}>
              <Text style={memberStyles.label}>
                GENDER <Text style={memberStyles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="gender"
                render={({ field: { value, onChange } }) => (
                  <View style={memberStyles.genderContainer}>
                    {['male', 'female', 'others'].map(g => (
                      <TouchableOpacity
                        key={g}
                        style={[
                          memberStyles.genderButton,
                          value === g && memberStyles.genderButtonActive,
                        ]}
                        onPress={() => {
                          onChange(g);
                          setValue('gender', g, { shouldValidate: true });
                        }}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            memberStyles.genderButtonText,
                            value === g && memberStyles.genderButtonTextActive,
                          ]}
                        >
                          {g.charAt(0).toUpperCase() + g.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
              {errors.gender && <Text style={localStyles.errorText}>{errors.gender.message}</Text>}
            </View>

            {/* Date of Birth (Using Controller) */}
            <View style={memberStyles.inputWrapper}>
              <Text style={memberStyles.label}>
                DATE OF BIRTH <Text style={memberStyles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="dobDate"
                render={({ field: { value } }) => (
                  <TouchableOpacity
                    style={memberStyles.dropdownTrigger}
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={memberStyles.dropdownValue}>
                      {value ? formatDateLabel(value) : 'Select Date of Birth'}
                    </Text>
                    <CalendarIcon size={18} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                )}
              />
              {errors.dobDate && (
                <Text style={localStyles.errorText}>{errors.dobDate.message}</Text>
              )}
            </View>

            {/* Address */}
            <View style={memberStyles.inputWrapper}>
              <Text style={memberStyles.label}>
                ADDRESS <Text style={memberStyles.required}>*</Text>
              </Text>
              <TextInput
                style={memberStyles.input}
                placeholder="Enter street address"
                placeholderTextColor={theme.colors.textMuted}
                value={watch('address')}
                {...register('address')}
                onChangeText={val => setValue('address', val, { shouldValidate: true })}
                multiline
              />
              {errors.address && (
                <Text style={localStyles.errorText}>{errors.address.message}</Text>
              )}
            </View>

            {/* Country (Using Controller) */}
            <View style={memberStyles.inputWrapper}>
              <Text style={memberStyles.label}>
                COUNTRY <Text style={memberStyles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="country_name"
                render={() => (
                  <TouchableOpacity
                    style={memberStyles.dropdownTrigger}
                    onPress={() => setShowCountryPicker(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={memberStyles.dropdownValue}>
                      {isCountriesLoading
                        ? 'Loading Countries...'
                        : countryLabel || 'Select Country'}
                    </Text>
                    {isCountriesLoading ? (
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                      <ChevronDownIcon size={18} color={theme.colors.textMuted} />
                    )}
                  </TouchableOpacity>
                )}
              />
              {errors.country_name && (
                <Text style={localStyles.errorText}>{errors.country_name.message}</Text>
              )}
            </View>

            {/* State (Using Controller) */}
            <View style={memberStyles.inputWrapper}>
              <Text style={memberStyles.label}>
                STATE <Text style={memberStyles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="state_name"
                render={() => (
                  <TouchableOpacity
                    style={memberStyles.dropdownTrigger}
                    onPress={() => setShowStatePicker(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={memberStyles.dropdownValue}>
                      {isStatesLoading ? 'Loading States...' : stateLabel || 'Select State'}
                    </Text>
                    {isStatesLoading ? (
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                      <ChevronDownIcon size={18} color={theme.colors.textMuted} />
                    )}
                  </TouchableOpacity>
                )}
              />
              {errors.state_name && (
                <Text style={localStyles.errorText}>{errors.state_name.message}</Text>
              )}
            </View>

            {/* City (Using Controller) */}
            <View style={memberStyles.inputWrapper}>
              <Text style={memberStyles.label}>
                CITY <Text style={memberStyles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="city_name"
                render={() => (
                  <TouchableOpacity
                    style={memberStyles.dropdownTrigger}
                    onPress={() => setShowCityPicker(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={memberStyles.dropdownValue}>
                      {isCitiesLoading ? 'Loading Cities...' : cityLabel || 'Select City'}
                    </Text>
                    {isCitiesLoading ? (
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                      <ChevronDownIcon size={18} color={theme.colors.textMuted} />
                    )}
                  </TouchableOpacity>
                )}
              />
              {errors.city_name && (
                <Text style={localStyles.errorText}>{errors.city_name.message}</Text>
              )}
            </View>

            {/* Postal Code */}
            <View style={memberStyles.inputWrapper}>
              <Text style={memberStyles.label}>
                POSTAL CODE <Text style={memberStyles.required}>*</Text>
              </Text>
              <TextInput
                style={memberStyles.input}
                placeholder="Enter postal code"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="numeric"
                value={watch('postalCode')}
                {...register('postalCode')}
                onChangeText={val => setValue('postalCode', val, { shouldValidate: true })}
                maxLength={6}
              />
              {errors.postalCode && (
                <Text style={localStyles.errorText}>{errors.postalCode.message}</Text>
              )}
            </View>

            {/* Alternate Phone */}
            <View style={memberStyles.inputWrapper}>
              <Text style={memberStyles.label}>ALTERNATE PHONE</Text>
              <TextInput
                style={memberStyles.input}
                placeholder="Enter alternate phone"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="phone-pad"
                value={watch('alternatePhone')}
                {...register('alternatePhone')}
                onChangeText={val => setValue('alternatePhone', val, { shouldValidate: true })}
                maxLength={10}
              />
              {errors.alternatePhone && (
                <Text style={localStyles.errorText}>{errors.alternatePhone.message}</Text>
              )}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[memberStyles.saveButton, isSubmitting && memberStyles.saveButtonDisabled]}
            onPress={handleSaveProfile}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color={theme.colors.surface} size="small" />
            ) : (
              <Text style={memberStyles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Wheel Date Picker Modal */}
      <Controller
        control={control}
        name="dobDate"
        render={({ field: { value, onChange } }) => (
          <WheelDatePickerModal
            visible={showDatePicker}
            value={value || new Date(1995, 0, 1)}
            maximumDate={new Date()}
            title="Date of Birth"
            onCancel={() => setShowDatePicker(false)}
            onConfirm={date => {
              onChange(date);
              setValue('dobDate', date, { shouldValidate: true });
              setShowDatePicker(false);
            }}
          />
        )}
      />

      {/* Country Picker Modal */}
      <Controller
        control={control}
        name="country_name"
        render={({ field: { value, onChange } }) => (
          <DropdownPickerModal
            visible={showCountryPicker}
            title="Select Country"
            options={countryOptions}
            selectedValue={value}
            onSelect={val => {
              onChange(val);
              setValue('country_name', val, { shouldValidate: true });
              setValue('state_name', '', { shouldValidate: true });
              setValue('city_name', '', { shouldValidate: true });
            }}
            onClose={() => setShowCountryPicker(false)}
          />
        )}
      />

      {/* State Picker Modal */}
      <Controller
        control={control}
        name="state_name"
        render={({ field: { value, onChange } }) => (
          <DropdownPickerModal
            visible={showStatePicker}
            title="Select State"
            options={stateOptions}
            selectedValue={value}
            onSelect={val => {
              onChange(val);
              setValue('state_name', val, { shouldValidate: true });
              setValue('city_name', '', { shouldValidate: true });
            }}
            onClose={() => setShowStatePicker(false)}
          />
        )}
      />

      {/* City Picker Modal */}
      <Controller
        control={control}
        name="city_name"
        render={({ field: { value, onChange } }) => (
          <DropdownPickerModal
            visible={showCityPicker}
            title="Select City"
            options={cityOptions}
            selectedValue={value}
            onSelect={val => {
              onChange(val);
              setValue('city_name', val, { shouldValidate: true });
            }}
            onClose={() => setShowCityPicker(false)}
          />
        )}
      />

      {/* Profile Photo Source Upload Options Modal */}
      <UploadOptionsModal
        visible={showPhotoModal}
        title="Profile Photo"
        subtitle="Select photo from camera or library"
        type="logo"
        enableCamera={false}
        enableGallery={true}
        onSelectCamera={handleTakePhoto}
        onSelectGallery={handleChooseFromLibrary}
        onClose={() => setShowPhotoModal(false)}
      />
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  errorText: {
    color: theme.colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
});

export default ProfileSetupScreen;
