import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { RxDateFilter } from '../../../hooks/react-query/prescriptions/prescriptions.funcs';
import { formatDate } from '../../../lib/common/common.utils';
import { prescriptionsStyles } from '../../../styled/PrescriptionsScreen.styled';
import { theme } from '../../../styled/theme.styled';
import { PredDatePickerModal } from '../../commons/PredDatePickerModal/PredDatePickerModal';
import { CalendarIcon, CircleXIcon, SearchIcon } from '../../ui/icons';

export type RxDatePreset = RxDateFilter | null;

export interface PrescriptionFilterValues {
  doctorQuery: string;
  datePreset: RxDatePreset;
  customFrom: string;
  customTo: string;
}

export const defaultPrescriptionFilters: PrescriptionFilterValues = {
  doctorQuery: '',
  datePreset: null,
  customFrom: '',
  customTo: '',
};

const DATE_PRESETS: { key: RxDatePreset; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'this_week', label: 'This Week' },
  { key: 'current_month', label: 'This Month' },
  { key: 'current_year', label: 'This Year' },
];

export interface PrescriptionFilterModalProps {
  visible: boolean;
  initialValues?: PrescriptionFilterValues;
  onClose: () => void;
  onApply: (values: PrescriptionFilterValues) => void;
}

export const PrescriptionFilterModal: React.FC<PrescriptionFilterModalProps> = ({
  visible,
  initialValues = defaultPrescriptionFilters,
  onClose,
  onApply,
}) => {
  const [filters, setFilters] = useState<PrescriptionFilterValues>(initialValues);
  const [datePickerTarget, setDatePickerTarget] = useState<'from' | 'to' | null>(null);

  const reset = () => {
    setFilters(defaultPrescriptionFilters);
  };

  const selectPreset = (preset: RxDatePreset) => {
    setFilters(prev => ({
      ...prev,
      datePreset: prev.datePreset === preset ? null : preset,
      customFrom: '',
      customTo: '',
    }));
  };

  useEffect(() => {
    if (visible) {
      setFilters(initialValues);
    }
  }, [visible, initialValues]);

  const currentPickerValue = useMemo(() => {
    if (datePickerTarget === 'from' && filters.customFrom) {
      const parsed = new Date(filters.customFrom);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    if (datePickerTarget === 'to' && filters.customTo) {
      const parsed = new Date(filters.customTo);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  }, [datePickerTarget, filters.customFrom, filters.customTo]);

  const handleConfirmDate = useCallback(
    (selectedDate: Date) => {
      const formatted = formatDate(selectedDate, 'YYYY-MM-DD');
      setFilters(prev => ({
        ...prev,
        datePreset: 'custom',
        ...(datePickerTarget === 'from' ? { customFrom: formatted } : { customTo: formatted }),
      }));
      setDatePickerTarget(null);
    },
    [datePickerTarget]
  );

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={prescriptionsStyles.modalOverlay}>
            <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
              <View style={prescriptionsStyles.filterModalContent}>
                <View style={prescriptionsStyles.filterHeader}>
                  <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                    <CircleXIcon size={22} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                  <Text style={prescriptionsStyles.filterTitle}>Filter Prescriptions</Text>
                  <TouchableOpacity onPress={reset} activeOpacity={0.7}>
                    <Text style={prescriptionsStyles.filterResetLink}>Reset</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={prescriptionsStyles.filterScroll}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <Text style={prescriptionsStyles.filterSectionLabel}>DOCTOR NAME</Text>
                  <View style={prescriptionsStyles.filterSearchBox}>
                    <SearchIcon size={18} color={theme.colors.textMuted} />
                    <TextInput
                      style={prescriptionsStyles.searchInput}
                      placeholder="Search doctor..."
                      placeholderTextColor={theme.colors.textMuted}
                      value={filters.doctorQuery}
                      onChangeText={text => setFilters(prev => ({ ...prev, doctorQuery: text }))}
                    />
                    {filters.doctorQuery ? (
                      <TouchableOpacity
                        onPress={() => setFilters(prev => ({ ...prev, doctorQuery: '' }))}
                      >
                        <CircleXIcon size={16} color={theme.colors.textMuted} />
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <Text style={prescriptionsStyles.filterSectionLabel}>DATE PRESETS</Text>
                  {DATE_PRESETS.map(opt => {
                    const selected = filters.datePreset === opt.key;
                    return (
                      <TouchableOpacity
                        key={opt.key}
                        style={[
                          prescriptionsStyles.radioRow,
                          selected && prescriptionsStyles.radioRowSelected,
                        ]}
                        onPress={() => selectPreset(opt.key)}
                        activeOpacity={0.75}
                      >
                        <Text
                          style={[
                            prescriptionsStyles.radioLabel,
                            selected && prescriptionsStyles.radioLabelSelected,
                          ]}
                        >
                          {opt.label}
                        </Text>
                        <View
                          style={[
                            prescriptionsStyles.radioOuter,
                            selected && prescriptionsStyles.radioOuterSelected,
                          ]}
                        >
                          {selected ? <View style={prescriptionsStyles.radioInner} /> : null}
                        </View>
                      </TouchableOpacity>
                    );
                  })}

                  <View style={prescriptionsStyles.customCard}>
                    <Text style={prescriptionsStyles.customTitle}>Custom Range</Text>
                    <Text style={prescriptionsStyles.customSub}>Specify date window</Text>
                    <View style={prescriptionsStyles.dateRow}>
                      <TouchableOpacity
                        style={prescriptionsStyles.dateField}
                        onPress={() => setDatePickerTarget('from')}
                        activeOpacity={0.75}
                      >
                        <Text style={prescriptionsStyles.dateFieldLabel}>FROM</Text>
                        <View style={prescriptionsStyles.dateFieldValue}>
                          <CalendarIcon size={14} color={theme.colors.textMuted} />
                          <Text style={prescriptionsStyles.dateFieldText}>
                            {filters.customFrom || 'Select Date'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={prescriptionsStyles.dateField}
                        onPress={() => setDatePickerTarget('to')}
                        activeOpacity={0.75}
                      >
                        <Text style={prescriptionsStyles.dateFieldLabel}>TO</Text>
                        <View style={prescriptionsStyles.dateFieldValue}>
                          <CalendarIcon size={14} color={theme.colors.textMuted} />
                          <Text style={prescriptionsStyles.dateFieldText}>
                            {filters.customTo || 'Select Date'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>

                <View style={prescriptionsStyles.filterFooter}>
                  <TouchableOpacity
                    style={prescriptionsStyles.applyBtn}
                    activeOpacity={0.85}
                    onPress={() => onApply(filters)}
                  >
                    <Text style={prescriptionsStyles.applyBtnText}>Apply Filters</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <PredDatePickerModal
        visible={datePickerTarget !== null}
        title={datePickerTarget === 'from' ? 'Select Start Date' : 'Select End Date'}
        value={currentPickerValue}
        onConfirm={handleConfirmDate}
        onCancel={() => setDatePickerTarget(null)}
      />
    </>
  );
};

export default PrescriptionFilterModal;
