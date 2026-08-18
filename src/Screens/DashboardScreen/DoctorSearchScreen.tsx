import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import PopupAlert, { AlertType } from '../../components/commons/PopupAlert/PopupAlert';
import {
  CitySelectModal,
  ClinicCard,
  defaultDoctorFilters,
  DoctorFilterModal,
  DoctorFilterValues,
  DoctorSearchCard,
  SpecialtySelectModal,
} from '../../components/Modules/Doctors';
import AppHeader from '../../components/ui/AppHeader';
import {
  CalendarIcon,
  ChevronDownIcon,
  FilterIcon,
  SearchIcon,
  StethoscopeIcon,
  VideoIcon,
} from '../../components/ui/icons';
import {
  MOCK_CITIES_LIST,
  MOCK_CLINICS,
  MOCK_SEARCH_DOCTORS,
  MOCK_SPECIALTIES,
  MockClinicItem,
  SearchDoctorData,
} from '../../resources/mockData';
import { doctorSearchStyles } from '../../styled/DoctorSearchScreen.styled';
import { theme } from '../../styled/theme.styled';

const experienceLabels: Record<string, string> = {
  '0-5': '0-5 yrs',
  '5-10': '5-10 yrs',
  '10-15': '10-15 yrs',
  '15+': '15+ yrs',
};

type ListItemType =
  | { type: 'doctor'; data: SearchDoctorData }
  | { type: 'clinic'; data: MockClinicItem };

export const DoctorSearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [todayOnly, setTodayOnly] = useState<boolean>(false);
  const [videoOnly, setVideoOnly] = useState<boolean>(false);

  const [activeFilters, setActiveFilters] = useState<DoctorFilterValues>(defaultDoctorFilters);

  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [showSpecialtyModal, setShowSpecialtyModal] = useState<boolean>(false);
  const [showCityModal, setShowCityModal] = useState<boolean>(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type?: AlertType;
    title?: string;
    message?: string;
    onPress?: () => void;
  }>({ visible: false });

  // Filtered doctors list
  const filteredDoctors = MOCK_SEARCH_DOCTORS.filter(doc => {
    const effectiveQuery = searchQuery || activeFilters.specialtyQuery;
    if (
      effectiveQuery.trim() &&
      !doc.doctor_name.toLowerCase().includes(effectiveQuery.toLowerCase()) &&
      !doc.specialization.toLowerCase().includes(effectiveQuery.toLowerCase())
    ) {
      return false;
    }

    if (selectedSpecialty && doc.specialization !== selectedSpecialty) {
      return false;
    }

    if (selectedCity && doc.city !== selectedCity) {
      return false;
    }

    if (todayOnly && !doc.next_available_dates.includes('2026-08-19')) {
      return false;
    }

    if (videoOnly && !doc.min_video_fee) {
      return false;
    }

    if (activeFilters.gender && doc.gender !== activeFilters.gender) {
      return false;
    }

    if (
      activeFilters.language &&
      !doc.languages.some(l => l.toLowerCase() === activeFilters.language?.toLowerCase())
    ) {
      return false;
    }

    if (activeFilters.experience === '0-5' && doc.years_of_experience > 5) return false;
    if (
      activeFilters.experience === '5-10' &&
      (doc.years_of_experience < 5 || doc.years_of_experience > 10)
    )
      return false;
    if (
      activeFilters.experience === '10-15' &&
      (doc.years_of_experience < 10 || doc.years_of_experience > 15)
    )
      return false;
    if (activeFilters.experience === '15+' && doc.years_of_experience < 15) return false;

    return true;
  });

  // Filtered clinics list
  const filteredClinics = MOCK_CLINICS.filter(clinic => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const nameMatch = clinic.clinic_name.toLowerCase().includes(query);
      const specMatch = clinic.specialities?.some(s => s.toLowerCase().includes(query));
      const cityMatch = clinic.city?.toLowerCase().includes(query);
      if (!nameMatch && !specMatch && !cityMatch) return false;
    }
    if (selectedCity && clinic.city !== selectedCity) {
      return false;
    }
    if (selectedSpecialty && !clinic.specialities?.includes(selectedSpecialty)) {
      return false;
    }
    return true;
  });

  // Unified Feed (Clinics + Doctors combined without tabs)
  const combinedList: ListItemType[] = [
    ...filteredClinics.map(c => ({ type: 'clinic' as const, data: c })),
    ...filteredDoctors.map(d => ({ type: 'doctor' as const, data: d })),
  ];

  const handleProfilePress = (doctor: SearchDoctorData) => {
    navigation.navigate('DoctorDetails', { doctorId: doctor.doctor_id, doctor });
  };

  const handleBookPress = (doctor: SearchDoctorData) => {
    navigation.navigate('BookAppointment', { doctorId: doctor.doctor_id, doctor });
  };

  const handleClinicPress = (clinic: MockClinicItem) => {
    navigation.navigate('ClinicDetails', { clinicId: clinic.clinic_id, clinic });
  };

  const handleApplyFilters = (filters: DoctorFilterValues) => {
    setActiveFilters(filters);
    if (filters.specialtyQuery) {
      setSearchQuery(filters.specialtyQuery);
    }
    if (filters.consultationType === 'video') {
      setVideoOnly(true);
    }
    if (filters.availability === 'today') {
      setTodayOnly(true);
    }
  };

  const specialtyLabel = selectedSpecialty || activeFilters.specialtyQuery || 'Speciality';
  const cityLabel = selectedCity || 'City';
  const experienceLabel = activeFilters.experience
    ? experienceLabels[activeFilters.experience]
    : 'Experience';

  const hasSearchQuery = searchQuery.trim().length > 0;

  return (
    <SafeAreaView style={doctorSearchStyles.container}>
      <AppHeader title="Find a Specialist" showBack={true} />

      <FlatList
        data={combinedList}
        keyExtractor={(item, index) =>
          item.type === 'clinic' ? `clinic-${item.data.clinic_id}` : `doctor-${item.data.doctor_id}`
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={doctorSearchStyles.listContent}
        ListHeaderComponent={
          <View style={doctorSearchStyles.searchChrome}>
            {/* Search Box with Filter Icon at the Right End */}
            <View style={doctorSearchStyles.searchBox}>
              <SearchIcon size={18} color={theme.colors.textMuted} />
              <TextInput
                style={doctorSearchStyles.searchInput}
                placeholder="Search doctors, clinics..."
                placeholderTextColor={theme.colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowFilterModal(true)}
                activeOpacity={0.7}
                style={{ paddingLeft: 8 }}
              >
                <FilterIcon size={20} color={theme.colors.primaryDark} />
              </TouchableOpacity>
            </View>

            {/* Filter Pills Row: Speciality, City, Experience */}
            <View style={doctorSearchStyles.pillRow}>
              <TouchableOpacity
                style={[
                  doctorSearchStyles.pill,
                  !!selectedSpecialty && doctorSearchStyles.pillActive,
                ]}
                onPress={() => setShowSpecialtyModal(true)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    doctorSearchStyles.pillText,
                    !!selectedSpecialty && doctorSearchStyles.pillTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {specialtyLabel}
                </Text>
                <ChevronDownIcon
                  size={16}
                  color={selectedSpecialty ? theme.colors.primaryDark : theme.colors.textSecondary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[doctorSearchStyles.pill, !!selectedCity && doctorSearchStyles.pillActive]}
                onPress={() => setShowCityModal(true)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    doctorSearchStyles.pillText,
                    !!selectedCity && doctorSearchStyles.pillTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {cityLabel}
                </Text>
                <ChevronDownIcon
                  size={16}
                  color={selectedCity ? theme.colors.primaryDark : theme.colors.textSecondary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  doctorSearchStyles.pill,
                  !!activeFilters.experience && doctorSearchStyles.pillActive,
                ]}
                onPress={() => setShowFilterModal(true)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    doctorSearchStyles.pillText,
                    !!activeFilters.experience && doctorSearchStyles.pillTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {experienceLabel}
                </Text>
                <ChevronDownIcon
                  size={16}
                  color={
                    activeFilters.experience ? theme.colors.primaryDark : theme.colors.textSecondary
                  }
                />
              </TouchableOpacity>
            </View>

            {/* Toggle Cards Row: Today, Video */}
            <View style={doctorSearchStyles.toggleRow}>
              <View style={doctorSearchStyles.toggleCard}>
                <CalendarIcon size={18} color={theme.colors.primary} />
                <Text style={doctorSearchStyles.toggleLabel}>Today</Text>
                <Switch
                  value={todayOnly}
                  onValueChange={setTodayOnly}
                  trackColor={{
                    false: theme.colors.surfaceBorder,
                    true: theme.colors.primary,
                  }}
                  thumbColor={theme.colors.surface}
                />
              </View>

              <View style={doctorSearchStyles.toggleCard}>
                <VideoIcon size={18} color={theme.colors.primary} />
                <Text style={doctorSearchStyles.toggleLabel}>Video</Text>
                <Switch
                  value={videoOnly}
                  onValueChange={setVideoOnly}
                  trackColor={{
                    false: theme.colors.surfaceBorder,
                    true: theme.colors.primary,
                  }}
                  thumbColor={theme.colors.surface}
                />
              </View>
            </View>

            {/* Section Title */}
            <Text style={doctorSearchStyles.sectionTitle}>
              {hasSearchQuery ? 'Specialists & Clinics for you' : 'Search specialists & clinics'}
            </Text>
          </View>
        }
        renderItem={({ item }) =>
          item.type === 'clinic' ? (
            <ClinicCard clinic={item.data} onPress={handleClinicPress} />
          ) : (
            <DoctorSearchCard
              doctor={item.data}
              onProfilePress={handleProfilePress}
              onBookPress={handleBookPress}
            />
          )
        }
        ListEmptyComponent={
          <View style={doctorSearchStyles.emptyBox}>
            <StethoscopeIcon size={36} color={theme.colors.primaryDark} />
            <Text style={doctorSearchStyles.emptyTitle}>No Results Found</Text>
            <Text style={doctorSearchStyles.emptySubtitle}>
              Try adjusting your search terms or filter criteria.
            </Text>
          </View>
        }
      />

      {/* Filter Modal */}
      <DoctorFilterModal
        visible={showFilterModal}
        initialValues={activeFilters}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
      />

      {/* Specialty Picker Modal */}
      <SpecialtySelectModal
        visible={showSpecialtyModal}
        specialties={MOCK_SPECIALTIES}
        selectedSpecialty={selectedSpecialty}
        onSelect={val => {
          setSelectedSpecialty(val);
          setShowSpecialtyModal(false);
        }}
        onClose={() => setShowSpecialtyModal(false)}
      />

      {/* City Picker Modal */}
      <CitySelectModal
        visible={showCityModal}
        cities={MOCK_CITIES_LIST}
        selectedCity={selectedCity}
        onSelect={val => {
          setSelectedCity(val);
          setShowCityModal(false);
        }}
        onClose={() => setShowCityModal(false)}
      />

      {/* Popup Alert */}
      <PopupAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onPress={alertConfig.onPress || (() => setAlertConfig({ visible: false }))}
      />
    </SafeAreaView>
  );
};

export default DoctorSearchScreen;
