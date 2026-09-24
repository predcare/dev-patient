import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [filters, setFilters] = useState<PrescriptionFilterValues>(initialValues);
  const [datePickerTarget, setDatePickerTarget] = useState<'from' | 'to' | null>(null);

  const datePresets = useMemo(
    (): { key: RxDatePreset; label: string }[] => [
      { key: 'today', label: t('prescriptionFilterModal.today') },
      { key: 'this_week', label: t('prescriptionFilterModal.thisWeek') },
      { key: 'current_month', label: t('prescriptionFilterModal.thisMonth') },
      { key: 'current_year', label: t('prescriptionFilterModal.thisYear') },
    ],
    [t]
  );

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

  useEffect(() => {
    if (visible) {
      setFilters(initialValues);
    }
  }, [visible, initialValues]);

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
                  <Text style={prescriptionsStyles.filterTitle}>
                    {t('prescriptionFilterModal.filterTitle')}
                  </Text>
                  <TouchableOpacity onPress={reset} activeOpacity={0.7}>
                    <Text style={prescriptionsStyles.filterResetLink}>
                      {t('prescriptionFilterModal.reset')}
                    </Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={prescriptionsStyles.filterScroll}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <Text style={prescriptionsStyles.filterSectionLabel}>
                    {t('prescriptionFilterModal.doctorNameLabel')}
                  </Text>
                  <View style={prescriptionsStyles.filterSearchBox}>
                    <SearchIcon size={18} color={theme.colors.textMuted} />
                    <TextInput
                      style={prescriptionsStyles.searchInput}
                      placeholder={t('prescriptionFilterModal.searchDoctorPlaceholder')}
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

                  <Text style={prescriptionsStyles.filterSectionLabel}>
                    {t('prescriptionFilterModal.datePresetsLabel')}
                  </Text>
                  {datePresets.map(opt => {
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
                    <Text style={prescriptionsStyles.customTitle}>
                      {t('prescriptionFilterModal.customRange')}
                    </Text>
                    <Text style={prescriptionsStyles.customSub}>
                      {t('prescriptionFilterModal.specifyDateWindow')}
                    </Text>
                    <View style={prescriptionsStyles.dateRow}>
                      <TouchableOpacity
                        style={prescriptionsStyles.dateField}
                        onPress={() => setDatePickerTarget('from')}
                        activeOpacity={0.75}
                      >
                        <Text style={prescriptionsStyles.dateFieldLabel}>
                          {t('prescriptionFilterModal.fromLabel')}
                        </Text>
                        <View style={prescriptionsStyles.dateFieldValue}>
                          <CalendarIcon size={14} color={theme.colors.textMuted} />
                          <Text style={prescriptionsStyles.dateFieldText}>
                            {filters.customFrom || t('prescriptionFilterModal.selectDate')}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={prescriptionsStyles.dateField}
                        onPress={() => setDatePickerTarget('to')}
                        activeOpacity={0.75}
                      >
                        <Text style={prescriptionsStyles.dateFieldLabel}>
                          {t('prescriptionFilterModal.toLabel')}
                        </Text>
                        <View style={prescriptionsStyles.dateFieldValue}>
                          <CalendarIcon size={14} color={theme.colors.textMuted} />
                          <Text style={prescriptionsStyles.dateFieldText}>
                            {filters.customTo || t('prescriptionFilterModal.selectDate')}
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
                    <Text style={prescriptionsStyles.applyBtnText}>
                      {t('prescriptionFilterModal.applyFilters')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <PredDatePickerModal
        visible={datePickerTarget !== null}
        title={
          datePickerTarget === 'from'
            ? t('prescriptionFilterModal.selectStartDate')
            : t('prescriptionFilterModal.selectEndDate')
        }
        value={currentPickerValue}
        onConfirm={handleConfirmDate}
        onCancel={() => setDatePickerTarget(null)}
      />
    </>
  );
};

export default PrescriptionFilterModal;
