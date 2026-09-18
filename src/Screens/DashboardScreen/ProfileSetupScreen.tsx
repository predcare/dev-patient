import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { DropdownPickerModal } from '../../components/Modules/MemberManagement';
import AppHeader from '../../components/ui/AppHeader';
import { CalendarIcon, ChevronDownIcon, EditIcon, UploadIcon } from '../../components/ui/icons';
import WheelDatePickerModal from '../../components/ui/WheelDatePickerModal';
import { useProfile } from '../../hooks/react-query/profile/profile.hooks';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import { MOCK_CITIES, MOCK_STATES, MOCK_USER_PROFILE } from '../../resources/mockData';
import { memberStyles } from '../../styled/MemberScreen.styled';
import { theme } from '../../styled/theme.styled';

export const ProfileSetupScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [name, setName] = useState<string>(MOCK_USER_PROFILE.name);
  const [email] = useState<string>(MOCK_USER_PROFILE.email);
  const [phoneNumber] = useState<string>(MOCK_USER_PROFILE.phone);
  const [gender, setGender] = useState<string>('male');
  const [dobDate, setDobDate] = useState<Date | null>(new Date(1988, 7, 15));
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [profilePic, setProfilePic] = useState<string | null>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500'
  );

  const [address, setAddress] = useState<string>(MOCK_USER_PROFILE.address);
  const [stateName, setStateName] = useState<string>(MOCK_USER_PROFILE.state);
  const [cityName, setCityName] = useState<string>(MOCK_USER_PROFILE.city);
  const [postalCode, setPostalCode] = useState<string>(MOCK_USER_PROFILE.postalCode);
  const [alternatePhone, setAlternatePhone] = useState<string>('9876543211');

  const [showStatePicker, setShowStatePicker] = useState<boolean>(false);
  const [showCityPicker, setShowCityPicker] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const { data: profileData, isPending: profilePending } = useProfile();

  const stateOptions = MOCK_STATES.map(s => ({ label: s.name, value: s.name }));
  const cityOptions = MOCK_CITIES.map(c => ({ label: c.name, value: c.name }));

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

  const handlePickPhoto = () => {
    setProfilePic('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500');
  };

  const handleRemovePhoto = () => {
    setProfilePic(null);
  };

  const handleSaveProfile = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.goBack();
    }, 600);
  };

  return (
    <SafeAreaWrapper style={memberStyles.screen}>
      <AppHeader title="Edit Profile" showBack={true} />

      <ScrollView
        contentContainerStyle={[memberStyles.scrollContent, { paddingHorizontal: 20 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Photo Section */}
        <View style={memberStyles.profilePicSection}>
          <TouchableOpacity
            style={memberStyles.profilePicContainer}
            onPress={handlePickPhoto}
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
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Email Address */}
          <View style={memberStyles.inputWrapper}>
            <Text style={memberStyles.label}>
              EMAIL ADDRESS <Text style={memberStyles.required}>*</Text>
            </Text>
            <TextInput
              style={[memberStyles.input, memberStyles.inputDisabled]}
              value={email}
              editable={false}
            />
          </View>

          {/* Phone Number */}
          <View style={memberStyles.inputWrapper}>
            <Text style={memberStyles.label}>
              PHONE NUMBER <Text style={memberStyles.required}>*</Text>
            </Text>
            <TextInput
              style={[memberStyles.input, memberStyles.inputDisabled]}
              value={phoneNumber}
              editable={false}
            />
          </View>

          {/* Gender */}
          <View style={memberStyles.inputWrapper}>
            <Text style={memberStyles.label}>
              GENDER <Text style={memberStyles.required}>*</Text>
            </Text>
            <View style={memberStyles.genderContainer}>
              {['male', 'female', 'others'].map(g => (
                <TouchableOpacity
                  key={g}
                  style={[
                    memberStyles.genderButton,
                    gender === g && memberStyles.genderButtonActive,
                  ]}
                  onPress={() => setGender(g)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      memberStyles.genderButtonText,
                      gender === g && memberStyles.genderButtonTextActive,
                    ]}
                  >
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date of Birth */}
          <View style={memberStyles.inputWrapper}>
            <Text style={memberStyles.label}>
              DATE OF BIRTH <Text style={memberStyles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={memberStyles.dropdownTrigger}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <Text style={memberStyles.dropdownValue}>
                {dobDate ? formatDateLabel(dobDate) : 'Select Date of Birth'}
              </Text>
              <CalendarIcon size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
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
              value={address}
              onChangeText={setAddress}
              multiline
            />
          </View>

          {/* State */}
          <View style={memberStyles.inputWrapper}>
            <Text style={memberStyles.label}>
              STATE <Text style={memberStyles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={memberStyles.dropdownTrigger}
              onPress={() => setShowStatePicker(true)}
              activeOpacity={0.8}
            >
              <Text style={memberStyles.dropdownValue}>{stateName || 'Select State'}</Text>
              <ChevronDownIcon size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* City */}
          <View style={memberStyles.inputWrapper}>
            <Text style={memberStyles.label}>
              CITY <Text style={memberStyles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={memberStyles.dropdownTrigger}
              onPress={() => setShowCityPicker(true)}
              activeOpacity={0.8}
            >
              <Text style={memberStyles.dropdownValue}>{cityName || 'Select City'}</Text>
              <ChevronDownIcon size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
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
              value={postalCode}
              onChangeText={setPostalCode}
              maxLength={6}
            />
          </View>

          {/* Alternate Phone */}
          <View style={memberStyles.inputWrapper}>
            <Text style={memberStyles.label}>ALTERNATE PHONE</Text>
            <TextInput
              style={memberStyles.input}
              placeholder="Enter alternate phone"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="phone-pad"
              value={alternatePhone}
              onChangeText={setAlternatePhone}
              maxLength={10}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[memberStyles.saveButton, loading && memberStyles.saveButtonDisabled]}
          onPress={handleSaveProfile}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.surface} size="small" />
          ) : (
            <Text style={memberStyles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Wheel Date Picker Modal */}
      <WheelDatePickerModal
        visible={showDatePicker}
        value={dobDate || new Date(1988, 7, 15)}
        maximumDate={new Date()}
        title="Date of Birth"
        onCancel={() => setShowDatePicker(false)}
        onConfirm={date => {
          setDobDate(date);
          setShowDatePicker(false);
        }}
      />

      {/* State Picker Modal */}
      <DropdownPickerModal
        visible={showStatePicker}
        title="Select State"
        options={stateOptions}
        selectedValue={stateName}
        onSelect={val => setStateName(val)}
        onClose={() => setShowStatePicker(false)}
      />

      {/* City Picker Modal */}
      <DropdownPickerModal
        visible={showCityPicker}
        title="Select City"
        options={cityOptions}
        selectedValue={cityName}
        onSelect={val => setCityName(val)}
        onClose={() => setShowCityPicker(false)}
      />
    </SafeAreaWrapper>
  );
};

export default ProfileSetupScreen;
