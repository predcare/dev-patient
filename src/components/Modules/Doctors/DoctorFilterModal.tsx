import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDebounce } from '../../../hooks/commons/useDebounce';
import { useAllCities, useSpecializations } from '../../../hooks/react-query/common/common.hooks';
import { theme } from '../../../styled/theme.styled';
import {
  CheckIcon,
  ChevronDownIcon,
  CircleXIcon,
  MapPinIcon,
  StethoscopeIcon,
} from '../../ui/icons';
import { SpecialtySelectModal } from './SpecialtySelectModal';

export interface DoctorFilterValues {
  specialtyQuery: string;
  selectedSpecialty: string | null;
  selectedCity: string | null;
  availability: 'today' | 'week' | 'month' | null;
  consultationType: 'in-person' | 'video' | 'both' | null;
  gender: 'male' | 'female' | null;
  language: string | null;
  fee: 'under500' | '500to1000' | '1000plus' | null;
  experience: '0-5' | '5-10' | '10-15' | '15+' | null;
}

export const defaultDoctorFilters: DoctorFilterValues = {
  specialtyQuery: '',
  selectedSpecialty: null,
  selectedCity: null,
  availability: null,
  consultationType: null,
  gender: null,
  language: null,
  fee: null,
  experience: null,
};

export interface DoctorFilterModalProps {
  visible: boolean;
  initialValues?: Partial<DoctorFilterValues>;
  onClose: () => void;
  onApply: (values: DoctorFilterValues) => void;
}

const LANGUAGES_LIST = ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Marathi', 'Bengali'];

export const DoctorFilterModal: React.FC<DoctorFilterModalProps> = ({
  visible,
  initialValues,
  onClose,
  onApply,
}) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<DoctorFilterValues>({
    ...defaultDoctorFilters,
    ...initialValues,
  });

  const [cityInput, setCityInput] = useState<string>(initialValues?.selectedCity || '');
  const [showCitySuggestions, setShowCitySuggestions] = useState<boolean>(false);
  const [showSpecialtyModal, setShowSpecialtyModal] = useState<boolean>(false);

  const { data: specializationsQuery } = useSpecializations();

  const specialtiesList = useMemo(() => {
    if (Array.isArray(specializationsQuery) && specializationsQuery.length > 0) {
      return specializationsQuery
        .map((item: any) => item.specialization || item.name)
        .filter(Boolean);
    }
    return [];
  }, [specializationsQuery]);

  const debouncedCity = useDebounce(cityInput, 350);
  const { data: citiesQuery, isFetching: isCityFetching } = useAllCities({ search: debouncedCity });

  const reset = () => {
    setFilters({ ...defaultDoctorFilters });
    setCityInput('');
    setShowCitySuggestions(false);
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleSelectCity = (cityName: string) => {
    setCityInput(cityName);
    setFilters(f => ({ ...f, selectedCity: cityName }));
    setShowCitySuggestions(false);
  };

  const handleClearCity = () => {
    setCityInput('');
    setFilters(f => ({ ...f, selectedCity: null }));
    setShowCitySuggestions(false);
  };

  const RowChip = ({
    label,
    selected,
    onPress,
  }: {
    label: string;
    selected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.rowChip, selected && styles.rowChipSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.rowChipText, selected && styles.rowChipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );

  const PillChip = ({
    label,
    selected,
    onPress,
  }: {
    label: string;
    selected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.pillChip, selected && styles.pillChipSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.pillChipText, selected && styles.pillChipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    if (visible) {
      setFilters({
        ...defaultDoctorFilters,
        ...initialValues,
      });
      setCityInput(initialValues?.selectedCity || '');
      setShowCitySuggestions(false);
    }
  }, [visible, initialValues]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn} activeOpacity={0.7}>
            <CircleXIcon size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('doctorFilterModal.filterDoctors')}</Text>
          <TouchableOpacity onPress={reset} activeOpacity={0.7}>
            <Text style={styles.resetTop}>{t('commons.reset')}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* City Section with Autocomplete */}
          <Text style={styles.sectionTitle}>{t('commons.city') || 'City'}</Text>
          <View style={styles.searchBox}>
            <MapPinIcon size={18} color={theme.colors.primaryDark} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('commons.searchCity') || 'Search city (min 3 chars)...'}
              placeholderTextColor={theme.colors.textMuted}
              value={cityInput}
              onChangeText={text => {
                setCityInput(text);
                setShowCitySuggestions(true);
                if (!text) {
                  setFilters(f => ({ ...f, selectedCity: null }));
                }
              }}
              onFocus={() => {
                if (cityInput.trim().length >= 3) {
                  setShowCitySuggestions(true);
                }
              }}
              autoCapitalize="words"
            />
            {isCityFetching ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : cityInput.length > 0 ? (
              <TouchableOpacity
                onPress={handleClearCity}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <CircleXIcon size={16} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>
          {showCitySuggestions && debouncedCity.trim().length >= 3 && (
            <View style={styles.suggestionsContainer}>
              {isCityFetching && (!citiesQuery || citiesQuery?.length === 0) ? (
                <View style={styles.suggestionStateBox}>
                  <Text style={styles.suggestionStateText}>Searching cities...</Text>
                </View>
              ) : citiesQuery && citiesQuery?.length > 0 ? (
                citiesQuery?.map((city: { id: number | string; name: string }) => {
                  const isSelected =
                    filters.selectedCity?.toLowerCase() === city.name.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={city.id}
                      style={[styles.suggestionItem, isSelected && styles.suggestionItemSelected]}
                      onPress={() => handleSelectCity(city.name)}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                        <MapPinIcon
                          size={14}
                          color={isSelected ? theme.colors.primary : theme.colors.textMuted}
                        />
                        <Text
                          style={[
                            styles.suggestionText,
                            isSelected && styles.suggestionTextSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {city.name}
                        </Text>
                      </View>
                      {isSelected && <CheckIcon size={14} color={theme.colors.primary} />}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.suggestionStateBox}>
                  <Text style={styles.suggestionStateText}>No cities found</Text>
                </View>
              )}
            </View>
          )}

          {!!filters.selectedCity && (
            <View style={styles.selectedBadgeRow}>
              <View style={styles.selectedBadge}>
                <MapPinIcon size={12} color={theme.colors.primaryDark} />
                <Text style={styles.selectedBadgeText}>{filters.selectedCity}</Text>
                <TouchableOpacity
                  onPress={handleClearCity}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <CircleXIcon size={14} color={theme.colors.primaryDark} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Specialty Section */}
          <Text style={styles.sectionTitle}>{t('commons.specialty') || 'Specialty'}</Text>
          <TouchableOpacity
            style={[
              styles.selectPickerBtn,
              !!filters.selectedSpecialty && styles.selectPickerBtnActive,
            ]}
            onPress={() => setShowSpecialtyModal(true)}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <StethoscopeIcon
                size={18}
                color={
                  filters.selectedSpecialty ? theme.colors.primaryDark : theme.colors.textMuted
                }
              />
              <Text
                style={[
                  styles.selectPickerText,
                  !!filters.selectedSpecialty && styles.selectPickerTextActive,
                ]}
                numberOfLines={1}
              >
                {filters.selectedSpecialty || t('commons.selectSpecialty') || 'Select Specialty'}
              </Text>
            </View>
            {filters.selectedSpecialty ? (
              <TouchableOpacity
                onPress={() => setFilters(f => ({ ...f, selectedSpecialty: null }))}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <CircleXIcon size={16} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ) : (
              <ChevronDownIcon size={16} color={theme.colors.textMuted} />
            )}
          </TouchableOpacity>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t('doctorFilterModal.availability')}</Text>
            <Text style={styles.selectOne}>{t('doctorFilterModal.selectOne')}</Text>
          </View>
          {(
            [
              ['today', t('doctorFilterModal.today')],
              ['week', t('doctorFilterModal.thisWeek')],
              ['month', t('doctorFilterModal.thisMonth')],
            ] as const
          ).map(([key, label]) => {
            const selected = filters.availability === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.radioRow, selected && styles.radioRowSelected]}
                onPress={() =>
                  setFilters(f => ({
                    ...f,
                    availability: f.availability === key ? null : key,
                  }))
                }
                activeOpacity={0.8}
              >
                <Text style={styles.radioLabel}>{label}</Text>
                <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                  {selected ? <View style={styles.radioInner} /> : null}
                </View>
              </TouchableOpacity>
            );
          })}
          <Text style={styles.sectionTitle}>{t('doctorFilterModal.consultationType')}</Text>
          <View style={styles.row}>
            <RowChip
              label="In-person"
              selected={filters.consultationType === 'in-person'}
              onPress={() =>
                setFilters(f => ({
                  ...f,
                  consultationType: f.consultationType === 'in-person' ? null : 'in-person',
                }))
              }
            />
            <RowChip
              label="Video"
              selected={filters.consultationType === 'video'}
              onPress={() =>
                setFilters(f => ({
                  ...f,
                  consultationType: f.consultationType === 'video' ? null : 'video',
                }))
              }
            />
            <RowChip
              label="Both"
              selected={filters.consultationType === 'both'}
              onPress={() =>
                setFilters(f => ({
                  ...f,
                  consultationType: f.consultationType === 'both' ? null : 'both',
                }))
              }
            />
          </View>
          <Text style={styles.sectionTitle}>{t('doctorFilterModal.gender')}</Text>
          <View style={styles.row}>
            <RowChip
              label="Male"
              selected={filters.gender === 'male'}
              onPress={() =>
                setFilters(f => ({ ...f, gender: f.gender === 'male' ? null : 'male' }))
              }
            />
            <RowChip
              label="Female"
              selected={filters.gender === 'female'}
              onPress={() =>
                setFilters(f => ({ ...f, gender: f.gender === 'female' ? null : 'female' }))
              }
            />
          </View>
          <Text style={styles.sectionTitle}>{t('doctorFilterModal.language')}</Text>
          <View style={styles.wrap}>
            {LANGUAGES_LIST.map(lang => (
              <PillChip
                key={lang}
                label={lang}
                selected={filters.language === lang}
                onPress={() =>
                  setFilters(f => ({
                    ...f,
                    language: f.language === lang ? null : lang,
                  }))
                }
              />
            ))}
          </View>
          <Text style={styles.sectionTitle}>{t('doctorFilterModal.consultationFee')}</Text>
          <View style={styles.row}>
            <RowChip
              label="Under ₹500"
              selected={filters.fee === 'under500'}
              onPress={() =>
                setFilters(f => ({ ...f, fee: f.fee === 'under500' ? null : 'under500' }))
              }
            />
            <RowChip
              label="₹500 - ₹1,000"
              selected={filters.fee === '500to1000'}
              onPress={() =>
                setFilters(f => ({ ...f, fee: f.fee === '500to1000' ? null : '500to1000' }))
              }
            />
            <RowChip
              label="₹1,000+"
              selected={filters.fee === '1000plus'}
              onPress={() =>
                setFilters(f => ({ ...f, fee: f.fee === '1000plus' ? null : '1000plus' }))
              }
            />
          </View>
          <Text style={styles.sectionTitle}>{t('doctorFilterModal.experience')}</Text>
          <View style={styles.wrap}>
            {(
              [
                ['0-5', '0-5 yrs'],
                ['5-10', '5-10 yrs'],
                ['10-15', '10-15 yrs'],
                ['15+', '15+ yrs'],
              ] as const
            ).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[styles.chipWide, filters.experience === key && styles.chipWideSelected]}
                onPress={() =>
                  setFilters(f => ({
                    ...f,
                    experience: f.experience === key ? null : key,
                  }))
                }
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.chipWideText,
                    filters.experience === key && styles.chipWideTextSelected,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={reset} style={styles.resetBottom} activeOpacity={0.7}>
            <Text style={styles.resetBottomText}>{t('doctorFilterModal.resetFilters')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} activeOpacity={0.85} onPress={handleApply}>
            <Text style={styles.applyText}>{t('doctorFilterModal.applyFilters')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <SpecialtySelectModal
        visible={showSpecialtyModal}
        specialties={specialtiesList}
        selectedSpecialty={filters.selectedSpecialty}
        onSelect={selectedSpecialty => {
          setFilters(f => ({ ...f, selectedSpecialty }));
          setShowSpecialtyModal(false);
        }}
        onClose={() => setShowSpecialtyModal(false)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  resetTop: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primaryDark,
    marginTop: 18,
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 8,
  },
  selectOne: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
    paddingVertical: 0,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  radioRowSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  radioLabel: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: theme.colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primaryDark,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  rowChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  rowChipSelected: {
    backgroundColor: theme.colors.primaryDark,
    borderColor: theme.colors.primaryDark,
  },
  rowChipText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  rowChipTextSelected: {
    color: theme.colors.surface,
  },
  pillChip: {
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  pillChipSelected: {
    backgroundColor: theme.colors.primaryDark,
    borderColor: theme.colors.primaryDark,
  },
  pillChipText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  pillChipTextSelected: {
    color: theme.colors.surface,
  },
  chipWide: {
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.colors.surface,
    width: '48%',
    alignItems: 'center',
  },
  chipWideSelected: {
    backgroundColor: theme.colors.primaryDark,
    borderColor: theme.colors.primaryDark,
  },
  chipWideText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  chipWideTextSelected: {
    color: theme.colors.surface,
  },
  resetBottom: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 14,
  },
  resetBottomText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  applyBtn: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginBottom: 20,
  },
  applyText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.surface,
  },
  suggestionsContainer: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    maxHeight: 200,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  suggestionItemSelected: {
    backgroundColor: theme.colors.primarySoft,
  },
  suggestionText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  suggestionTextSelected: {
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  suggestionStateBox: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  suggestionStateText: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  selectedBadgeRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  selectedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  selectPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    backgroundColor: theme.colors.surface,
  },
  selectPickerBtnActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  selectPickerText: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  selectPickerTextActive: {
    color: theme.colors.primaryDark,
    fontWeight: '600',
  },
});

export default DoctorFilterModal;
