import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CitySelectModal,
  ClinicCard,
  DoctorFilterModal,
  DoctorFilterValues,
  DoctorSearchCard,
  SpecialtySelectModal,
} from '../../components/Modules/Doctors';
import DoctorSearchSkeleton from '../../components/Skeletons/DoctorSearchSkeleton';
import AppHeader from '../../components/ui/AppHeader';
import {
  CalendarIcon,
  ChevronDownIcon,
  FilterIcon,
  SearchIcon,
  StethoscopeIcon,
  VideoIcon,
} from '../../components/ui/icons';
import { useDebounce } from '../../hooks/commons/useDebounce';
import { useSpecializations } from '../../hooks/react-query/common/common.hooks';
import { useGetAllDoctorsInfinite } from '../../hooks/react-query/doctors/doctor.hooks';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import { MOCK_CITIES_LIST } from '../../resources/mockData';
import { AppRoute } from '../../route';
import { doctorSearchStyles } from '../../styled/DoctorSearchScreen.styled';
import { theme } from '../../styled/theme.styled';
import { IClinicDoc, IDoctorDoc } from '../../typescripts/interfaces/doctors.interfaces';

const experienceLabels: Record<string, string> = {
  '0-5': '0-5 yrs',
  '5-10': '5-10 yrs',
  '10-15': '10-15 yrs',
  '15+': '15+ yrs',
};

type ListItemType = { type: 'doctor'; data: IDoctorDoc } | { type: 'clinic'; data: IClinicDoc };

export interface IDoctorFilterStates {
  searchQuery: string;
  selectedSpecialty: string | null;
  selectedSubSpecialty: string | null;
  selectedCity: string | null;
  todayOnly: boolean;
  videoOnly: boolean;
  gender: string | null;
  experience: string | null;
  consultationType: 'video' | 'in_person' | 'both' | null;
  availability: 'today' | 'this_week' | 'this_month' | null;
  minFee: number | null;
  maxFee: number | null;
}

export const defaultFilterStates: IDoctorFilterStates = {
  searchQuery: '',
  selectedSpecialty: null,
  selectedSubSpecialty: null,
  selectedCity: null,
  todayOnly: false,
  videoOnly: false,
  gender: null,
  experience: null,
  consultationType: null,
  availability: null,
  minFee: null,
  maxFee: null,
};

export const DoctorSearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [filterStates, setFilterStates] = useState<IDoctorFilterStates>(defaultFilterStates);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const updateFilterState = (updates: Partial<IDoctorFilterStates>) => {
    setFilterStates(prev => ({ ...prev, ...updates }));
  };

  const debouncedSearch = useDebounce(filterStates.searchQuery, 500);

  const specializationsQuery = useSpecializations();

  const specialtiesList = useMemo(() => {
    if (Array.isArray(specializationsQuery.data) && specializationsQuery.data.length > 0) {
      return specializationsQuery.data
        .map((item: any) => item.specialization || item.name)
        .filter(Boolean);
    }
    return [];
  }, [specializationsQuery.data]);

  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      limit: 20,
    };
    if (debouncedSearch.trim().length >= 3) params.search = debouncedSearch.trim();
    if (filterStates.selectedSpecialty) params.specialization = filterStates.selectedSpecialty;
    if (filterStates.selectedSubSpecialty)
      params.sub_specialization = filterStates.selectedSubSpecialty;
    if (filterStates.selectedCity) params.city = filterStates.selectedCity;
    if (filterStates.gender) params.gender = filterStates.gender;
    if (filterStates.experience) params.experience = filterStates.experience;

    if (filterStates.videoOnly) {
      params.consultation_type = 'video';
    } else if (filterStates.consultationType) {
      params.consultation_type = filterStates.consultationType;
    }

    if (filterStates.todayOnly) {
      params.availability = 'today';
    } else if (filterStates.availability) {
      params.availability = filterStates.availability;
    }

    if (filterStates.minFee != null) params.min_fee = filterStates.minFee;
    if (filterStates.maxFee != null) params.max_fee = filterStates.maxFee;

    return params;
  }, [debouncedSearch, filterStates]);

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    refetch,
  } = useGetAllDoctorsInfinite(queryParams);

  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [showSpecialtyModal, setShowSpecialtyModal] = useState<boolean>(false);
  const [showCityModal, setShowCityModal] = useState<boolean>(false);

  const hasActiveFilters = useMemo(() => {
    return (
      !!filterStates.searchQuery ||
      !!filterStates.selectedSpecialty ||
      !!filterStates.selectedSubSpecialty ||
      !!filterStates.selectedCity ||
      filterStates.todayOnly ||
      filterStates.videoOnly ||
      !!filterStates.gender ||
      !!filterStates.experience ||
      !!filterStates.consultationType ||
      !!filterStates.availability ||
      filterStates.minFee != null ||
      filterStates.maxFee != null
    );
  }, [filterStates]);

  const handleResetFilters = () => {
    setFilterStates(defaultFilterStates);
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [filterStates]);

  const combinedList: ListItemType[] = useMemo(() => {
    if (!infiniteData?.pages) return [];
    const clinics = infiniteData.pages.flatMap(
      page => page.data?.clinics?.map(c => ({ type: 'clinic' as const, data: c })) || []
    );
    const doctors = infiniteData.pages.flatMap(
      page => page.data?.doctors?.map(d => ({ type: 'doctor' as const, data: d })) || []
    );
    return [...doctors, ...clinics];
  }, [infiniteData]);

  const handleProfilePress = (doctorId: number) => {
    navigation.navigate('DoctorDetails', { doctorId: doctorId });
  };

  const handleBookPress = (doctorId: number, clinicId: number) => {
    navigation.navigate('BookAppointment', { doctorId, clinicId });
  };

  const handleClinicPress = (clinicId: number) => {
    navigation.navigate(AppRoute.CLINIC_DETAILS, { clinicId });
  };

  const handleApplyFilters = (filters: DoctorFilterValues) => {
    const updates: Partial<IDoctorFilterStates> = {};

    if (filters.specialtyQuery) {
      updates.searchQuery = filters.specialtyQuery;
    }
    if (filters.gender) {
      updates.gender = filters.gender;
    }
    if (filters.experience) {
      updates.experience = filters.experience;
    }
    if (filters.consultationType) {
      const mapped =
        filters.consultationType === 'in-person' ? 'in_person' : filters.consultationType;
      updates.consultationType = mapped as any;
      if (filters.consultationType === 'video') {
        updates.videoOnly = true;
      }
    }
    if (filters.availability) {
      const availMap: Record<string, any> = {
        today: 'today',
        week: 'this_week',
        month: 'this_month',
      };
      updates.availability = availMap[filters.availability] || null;
      if (filters.availability === 'today') {
        updates.todayOnly = true;
      }
    }
    if (filters.fee) {
      if (filters.fee === 'under500') {
        updates.maxFee = 500;
      } else if (filters.fee === '500to1000') {
        updates.minFee = 500;
        updates.maxFee = 1000;
      } else if (filters.fee === '1000plus') {
        updates.minFee = 1000;
      }
    }

    updateFilterState(updates);
  };

  return (
    <SafeAreaWrapper style={doctorSearchStyles.container}>
      <AppHeader title="Find a Specialist" showBack={true} />
      <View style={doctorSearchStyles.searchChrome}>
        <View style={doctorSearchStyles.searchBox}>
          <SearchIcon size={18} color={theme.colors.textMuted} />
          <TextInput
            style={doctorSearchStyles.searchInput}
            placeholder="Search doctors, clinics..."
            placeholderTextColor={theme.colors.textMuted}
            value={filterStates.searchQuery}
            onChangeText={searchQuery => updateFilterState({ searchQuery })}
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

        <View style={doctorSearchStyles.pillRow}>
          <TouchableOpacity
            style={[
              doctorSearchStyles.pill,
              !!filterStates.selectedSpecialty && doctorSearchStyles.pillActive,
            ]}
            onPress={() => setShowSpecialtyModal(true)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                doctorSearchStyles.pillText,
                !!filterStates.selectedSpecialty && doctorSearchStyles.pillTextActive,
              ]}
              numberOfLines={1}
            >
              {filterStates.selectedSpecialty || 'Specility'}
            </Text>
            <ChevronDownIcon
              size={14}
              color={
                filterStates.selectedSpecialty ? theme.colors.primaryDark : theme.colors.textMuted
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              doctorSearchStyles.pill,
              !!filterStates.selectedCity && doctorSearchStyles.pillActive,
            ]}
            onPress={() => setShowCityModal(true)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                doctorSearchStyles.pillText,
                !!filterStates.selectedCity && doctorSearchStyles.pillTextActive,
              ]}
              numberOfLines={1}
            >
              {filterStates.selectedCity || 'City'}
            </Text>
            <ChevronDownIcon
              size={16}
              color={
                filterStates.selectedCity ? theme.colors.primaryDark : theme.colors.textSecondary
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              doctorSearchStyles.pill,
              !!filterStates.experience && doctorSearchStyles.pillActive,
            ]}
            onPress={() => setShowFilterModal(true)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                doctorSearchStyles.pillText,
                !!filterStates.experience && doctorSearchStyles.pillTextActive,
              ]}
              numberOfLines={1}
            >
              {filterStates.experience
                ? experienceLabels[filterStates.experience] || filterStates.experience
                : 'Experience'}
            </Text>
            <ChevronDownIcon
              size={14}
              color={filterStates.experience ? theme.colors.primaryDark : theme.colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        <View style={doctorSearchStyles.toggleRow}>
          <View style={doctorSearchStyles.toggleCard}>
            <CalendarIcon size={18} color={theme.colors.primary} />
            <Text style={doctorSearchStyles.toggleLabel}>Today</Text>
            <Switch
              value={filterStates.todayOnly}
              onValueChange={todayOnly =>
                updateFilterState({ todayOnly, availability: todayOnly ? 'today' : null })
              }
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
              value={filterStates.videoOnly}
              onValueChange={videoOnly =>
                updateFilterState({ videoOnly, consultationType: videoOnly ? 'video' : null })
              }
              trackColor={{
                false: theme.colors.surfaceBorder,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.surface}
            />
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <Text style={[doctorSearchStyles.sectionTitle, { marginBottom: 0 }]}>
            Specialists & Clinics for you
          </Text>
          {hasActiveFilters && (
            <TouchableOpacity
              onPress={handleResetFilters}
              activeOpacity={0.7}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
                backgroundColor: theme.colors.primary || '#FEE2E2',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.surface }}>
                Clear All
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isPending && !isFetchingNextPage ? (
        <View style={{ flex: 1 }}>
          <DoctorSearchSkeleton cardOnly={true} />
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={combinedList}
          keyExtractor={item =>
            item.type === 'clinic' ? `clinic-${item.data.id}` : `doctor-${item.data.id}`
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={doctorSearchStyles.listContent}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
            />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : null
          }
          renderItem={({ item }) =>
            item.type === 'doctor' ? (
              <DoctorSearchCard
                id={item.data.id}
                doctorId={item.data.doctor_id}
                name={item.data.name}
                profileImage={item.data.profile_image}
                specialization={item.data.specialization}
                experienceYears={item.data.experience_years}
                city={item.data.city}
                clinicName={item.data.clinic?.name}
                nextAvailableDate={item.data.next_available_date}
                offersInPerson={item.data.offers_in_person}
                offersVideo={item.data.offers_video}
                onProfilePress={() => handleProfilePress(Number(item.data?.user_id))}
                onBookPress={() =>
                  handleBookPress(Number(item?.data?.user_id), Number(item?.data?.clinic?.id))
                }
              />
            ) : (
              <ClinicCard
                id={item.data.id}
                name={item.data.name}
                location={item.data.location}
                city={item.data.city}
                state={item.data.state}
                specialities={item.data.specialities}
                availableDoctorsCount={item.data.available_doctors_count}
                onPress={() => handleClinicPress(Number(item.data?.id))}
              />
            )
          }
          ListEmptyComponent={
            <View style={doctorSearchStyles.emptyBox}>
              <StethoscopeIcon size={36} color={theme.colors.primaryDark} />
              <Text style={doctorSearchStyles.emptyTitle}>
                {hasActiveFilters ? 'No Results Found' : 'Search for Doctors'}
              </Text>
              <Text style={doctorSearchStyles.emptySubtitle}>
                {hasActiveFilters
                  ? 'Try adjusting your search terms or filter criteria.'
                  : 'Search for doctors by name, specialization, or clinic.'}
              </Text>
            </View>
          }
        />
      )}

      <DoctorFilterModal
        visible={showFilterModal}
        initialValues={{
          specialtyQuery: filterStates.searchQuery,
          gender: filterStates.gender as any,
          experience: filterStates.experience as any,
        }}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
      />

      <SpecialtySelectModal
        visible={showSpecialtyModal}
        specialties={specialtiesList}
        selectedSpecialty={filterStates.selectedSpecialty}
        onSelect={selectedSpecialty => {
          updateFilterState({ selectedSpecialty });
          setShowSpecialtyModal(false);
        }}
        onClose={() => setShowSpecialtyModal(false)}
      />

      <CitySelectModal
        visible={showCityModal}
        cities={MOCK_CITIES_LIST}
        selectedCity={filterStates.selectedCity}
        onSelect={selectedCity => {
          updateFilterState({ selectedCity });
          setShowCityModal(false);
        }}
        onClose={() => setShowCityModal(false)}
      />
    </SafeAreaWrapper>
  );
};

export default DoctorSearchScreen;
