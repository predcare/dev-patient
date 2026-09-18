import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import {
  DropdownPickerModal,
  DropdownPickerOption,
} from '../../components/Modules/MemberManagement';
import AppHeader from '../../components/ui/AppHeader';
import {
  BuildingIcon,
  CalendarIcon,
  ChevronDownIcon,
  InfoCircleIcon,
  MailIcon,
  PhoneIcon,
  ShieldIcon,
} from '../../components/ui/icons';
import WheelDatePickerModal from '../../components/ui/WheelDatePickerModal';
import {
  MOCK_GENDER_OPTIONS,
  MOCK_RELATION_OPTIONS,
  MOCK_USER_PROFILE,
} from '../../resources/mockData';
import { memberStyles } from '../../styled/MemberScreen.styled';
import { theme } from '../../styled/theme.styled';

interface DropdownFieldProps {
  label: string;
  placeholder: string;
  options: DropdownPickerOption[];
  value: string;
  onChange: (val: string) => void;
  error?: string;
  required?: boolean;
}

const DropdownField: React.FC<DropdownFieldProps> = ({
  label,
  placeholder,
  options,
  value,
  onChange,
  error,
  required,
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <View style={memberStyles.fieldWrapper}>
      <Text style={memberStyles.fieldLabel}>
        {label}
        {required && <Text style={memberStyles.required}> *</Text>}
      </Text>

      <TouchableOpacity
        style={[memberStyles.dropdownTrigger, error ? memberStyles.fieldError : null]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            memberStyles.dropdownValue,
            !selected && memberStyles.dropdownPlaceholder,
          ]}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <ChevronDownIcon size={18} color={theme.colors.textMuted} />
      </TouchableOpacity>

      {!!error && <Text style={memberStyles.errorText}>{error}</Text>}

      <DropdownPickerModal
        visible={open}
        title={label}
        options={options}
        selectedValue={value}
        onSelect={onChange}
        onClose={() => setOpen(false)}
      />
    </View>
  );
};

const ReadOnlyField: React.FC<{
  label: string;
  value: string;
  icon?: React.ReactNode;
  hint?: string;
}> = ({ label, value, icon, hint }) => (
  <View style={memberStyles.fieldWrapper}>
    <Text style={memberStyles.fieldLabel}>{label}</Text>
    <View style={memberStyles.readOnlyField}>
      {icon}
      <Text style={memberStyles.readOnlyValue} numberOfLines={2}>
        {value || 'Not set'}
      </Text>
      <View style={memberStyles.lockedBadge}>
        <ShieldIcon size={12} color={theme.colors.textMuted} />
      </View>
    </View>
    {hint ? <Text style={memberStyles.readOnlyHint}>{hint}</Text> : null}
  </View>
);

export const AddNewMemberScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [name, setName] = useState<string>('');
  const [relation, setRelation] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDOBPicker, setShowDOBPicker] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [nameError, setNameError] = useState<string>('');
  const [relationError, setRelationError] = useState<string>('');
  const [genderError, setGenderError] = useState<string>('');

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

  const handleSubmit = () => {
    let valid = true;
    setNameError('');
    setRelationError('');
    setGenderError('');

    if (!name.trim()) {
      setNameError('Full name is required');
      valid = false;
    }
    if (!relation) {
      setRelationError('Relation is required');
      valid = false;
    }
    if (!gender) {
      setGenderError('Gender is required');
      valid = false;
    }

    if (!valid) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.goBack();
    }, 600);
  };

  return (
    <SafeAreaWrapper style={memberStyles.screen}>
      <AppHeader title="Add Family Member" showBack={true} />

      <ScrollView
        contentContainerStyle={memberStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Inherited info banner */}
        <View style={memberStyles.inheritedBanner}>
          <InfoCircleIcon size={18} color={theme.colors.primaryDark} />
          <Text style={memberStyles.inheritedText}>
            Inherited Contact Info: Phone, Email, and Address will be automatically linked
            from your primary account.
          </Text>
        </View>

        {/* Section 1: Member Details */}
        <View style={memberStyles.section}>
          <Text style={memberStyles.sectionTitle}>MEMBER DETAILS</Text>
          <Text style={memberStyles.sectionSubtitle}>Enter member personal details</Text>

          {/* Full Name */}
          <View style={memberStyles.fieldWrapper}>
            <Text style={memberStyles.fieldLabel}>
              Full Name<Text style={memberStyles.required}> *</Text>
            </Text>
            <TextInput
              style={[memberStyles.textInput, nameError ? memberStyles.fieldError : null]}
              placeholder="Enter member full name"
              placeholderTextColor={theme.colors.textMuted}
              value={name}
              onChangeText={val => {
                setName(val);
                if (nameError) setNameError('');
              }}
            />
            {!!nameError && <Text style={memberStyles.errorText}>{nameError}</Text>}
          </View>

          {/* Relation Dropdown */}
          <DropdownField
            label="Relation"
            placeholder="Select Relation"
            options={MOCK_RELATION_OPTIONS}
            value={relation}
            onChange={val => {
              setRelation(val);
              if (relationError) setRelationError('');
            }}
            error={relationError}
            required
          />

          {/* Gender Dropdown */}
          <DropdownField
            label="Gender"
            placeholder="Select Gender"
            options={MOCK_GENDER_OPTIONS}
            value={gender}
            onChange={val => {
              setGender(val);
              if (genderError) setGenderError('');
            }}
            error={genderError}
            required
          />

          {/* Date of Birth */}
          <View style={memberStyles.fieldWrapper}>
            <Text style={memberStyles.fieldLabel}>Date of Birth</Text>
            <TouchableOpacity
              style={memberStyles.dropdownTrigger}
              onPress={() => setShowDOBPicker(true)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  memberStyles.dropdownValue,
                  !dateOfBirth && memberStyles.dropdownPlaceholder,
                ]}
              >
                {dateOfBirth ? formatDateLabel(dateOfBirth) : 'Select Date of Birth'}
              </Text>
              <CalendarIcon size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
            {dateOfBirth && (
              <TouchableOpacity
                onPress={() => setDateOfBirth(null)}
                style={memberStyles.clearDobBtn}
              >
                <Text style={memberStyles.clearDobText}>Clear Date</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Section 2: Contact Info (Read-only) */}
        <View style={memberStyles.section}>
          <Text style={memberStyles.sectionTitle}>CONTACT INFO (LINKED)</Text>
          <Text style={memberStyles.sectionSubtitle}>
            Contact details inherited from primary account
          </Text>

          <ReadOnlyField
            label="Phone Number"
            value={MOCK_USER_PROFILE.phone}
            icon={<PhoneIcon size={16} color={theme.colors.textMuted} />}
            hint="Inherited from primary account"
          />
          <ReadOnlyField
            label="Email Address"
            value={MOCK_USER_PROFILE.email}
            icon={<MailIcon size={16} color={theme.colors.textMuted} />}
            hint="Inherited from primary account"
          />
          <ReadOnlyField
            label="Address"
            value={`${MOCK_USER_PROFILE.address}, ${MOCK_USER_PROFILE.city}, ${MOCK_USER_PROFILE.state}`}
            icon={<BuildingIcon size={16} color={theme.colors.textMuted} />}
            hint="Inherited from primary account"
          />
        </View>

        {/* Submit button */}
        <TouchableOpacity
          style={[memberStyles.submitBtn, loading && memberStyles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.surface} size="small" />
          ) : (
            <Text style={memberStyles.submitBtnText}>Add Family Member</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Wheel Date Picker Modal */}
      <WheelDatePickerModal
        visible={showDOBPicker}
        value={dateOfBirth || new Date(2000, 0, 1)}
        maximumDate={new Date()}
        title="Date of Birth"
        onCancel={() => setShowDOBPicker(false)}
        onConfirm={date => {
          setDateOfBirth(date);
          setShowDOBPicker(false);
        }}
      />
    </SafeAreaWrapper>
  );
};

export default AddNewMemberScreen;
