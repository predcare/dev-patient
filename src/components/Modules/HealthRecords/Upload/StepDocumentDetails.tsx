import React from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import {
  ActivityIndicator,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useGetMyDoctors } from '../../../../hooks/react-query/doctors/doctor.hooks';
import { getInitials } from '../../../../lib/common/common.utils';
import { TUploadHealthRecordFormSchemaType } from '../../../../lib/schemas/emr.schema';
import { uploadRecordStyles } from '../../../../styled/UploadHealthRecordScreen.styled';
import { theme } from '../../../../styled/theme.styled';
import { CheckIcon, EditIcon, FileTextIcon, LabFlaskIcon, ShieldIcon } from '../../../ui/icons';

export interface StepDocumentDetailsProps {
  control: Control<TUploadHealthRecordFormSchemaType>;
  errors: FieldErrors<TUploadHealthRecordFormSchemaType>;
  selectedCategory: string;
  file: any;
  shareDoctorIds: number[];
  onToggleDoctor: (id: number) => void;
  onChangeCategoryPress: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

const formatFileSize = (sizeBytes?: number | string) => {
  if (!sizeBytes) return 'Ready to upload';
  const bytes = Number(sizeBytes);
  if (isNaN(bytes) || bytes <= 0) return 'Ready to upload';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const StepDocumentDetails: React.FC<StepDocumentDetailsProps> = ({
  control,
  errors,
  selectedCategory,
  file,
  shareDoctorIds,
  onToggleDoctor,
  onChangeCategoryPress,
  onSubmit,
  isSubmitting = false,
}) => {
  const {
    data: myDoctorsData,
    isLoading: isLoadingMyDoctors,
    isError: isErrorMyDoctors,
    refetch: refetchMyDoctors,
  } = useGetMyDoctors();

  const fileName = file?.name || 'Selected Document';
  const fileMeta = `${formatFileSize(file?.size)} • Ready to upload`;

  return (
    <ScrollView
      contentContainerStyle={uploadRecordStyles.step3Scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={uploadRecordStyles.filePreviewCard}>
        <View style={uploadRecordStyles.filePreviewIconBox}>
          <FileTextIcon size={22} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={uploadRecordStyles.filePreviewName} numberOfLines={1}>
            {fileName}
          </Text>
          <Text style={uploadRecordStyles.filePreviewMeta}>{fileMeta}</Text>
        </View>
        <View style={uploadRecordStyles.fileSuccessCheck}>
          <CheckIcon size={14} color="#FFFFFF" strokeWidth={3} />
        </View>
      </View>

      <View style={uploadRecordStyles.formGroup}>
        <Text style={uploadRecordStyles.fieldLabel}>DOCUMENT CATEGORY</Text>
        <View style={uploadRecordStyles.categoryValueCard}>
          <View style={uploadRecordStyles.categoryValueLeft}>
            <LabFlaskIcon size={20} color={theme.colors.primary} />
            <Text style={uploadRecordStyles.categoryValueText}>{selectedCategory}</Text>
          </View>
          <TouchableOpacity
            style={uploadRecordStyles.categoryChangeBtn}
            onPress={onChangeCategoryPress}
            activeOpacity={0.7}
          >
            <EditIcon size={16} color={theme.colors.primary} />
            <Text style={uploadRecordStyles.categoryChangeText}>Change</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={uploadRecordStyles.formGroup}>
        <Text style={uploadRecordStyles.fieldLabel}>DOCUMENT TITLE *</Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                uploadRecordStyles.inputBox,
                errors.title ? uploadRecordStyles.inputError : undefined,
              ]}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Enter document title"
              placeholderTextColor="#94A3B8"
            />
          )}
        />
        {errors.title?.message ? (
          <Text style={uploadRecordStyles.errorText}>{errors.title.message}</Text>
        ) : null}
      </View>

      <View style={uploadRecordStyles.formGroup}>
        <Text style={uploadRecordStyles.fieldLabel}>NOTES (OPTIONAL)</Text>
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                uploadRecordStyles.textAreaBox,
                errors.notes ? uploadRecordStyles.inputError : undefined,
              ]}
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Any additional details or observations..."
              placeholderTextColor="#94A3B8"
              multiline={true}
              numberOfLines={4}
            />
          )}
        />
        {errors.notes?.message ? (
          <Text style={uploadRecordStyles.errorText}>{errors.notes.message}</Text>
        ) : null}
      </View>

      <View style={uploadRecordStyles.formGroup}>
        <Text style={uploadRecordStyles.fieldLabel}>DOCTOR VISIBILITY</Text>
        <View style={uploadRecordStyles.doctorVisibilityCard}>
          {isLoadingMyDoctors ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : isErrorMyDoctors ? (
            <View style={{ padding: 16, alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 13, color: '#EF4444' }}>
                Failed to load connected doctors
              </Text>
              <TouchableOpacity onPress={() => refetchMyDoctors()} activeOpacity={0.7}>
                <Text style={{ fontSize: 13, color: theme.colors.primary, fontWeight: '600' }}>
                  Tap to retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : !myDoctorsData?.data || myDoctorsData.data.length === 0 ? (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: '#94A3B8' }}>No connected doctors found.</Text>
            </View>
          ) : (
            myDoctorsData?.data?.map((doc, idx) => {
              const docId = Number(doc.user_id);
              const isShared = shareDoctorIds.includes(docId);
              const isLast = idx === myDoctorsData?.data?.length - 1;
              return (
                <View
                  key={doc.doctor_id}
                  style={[uploadRecordStyles.doctorRow, isLast && uploadRecordStyles.doctorRowLast]}
                >
                  <View style={uploadRecordStyles.doctorAvatar}>
                    <Text style={uploadRecordStyles.doctorAvatarText}>
                      {getInitials(doc?.name)}
                    </Text>
                  </View>
                  <View style={uploadRecordStyles.doctorInfo}>
                    <Text style={uploadRecordStyles.doctorName} numberOfLines={1}>
                      {doc.name}
                    </Text>
                    <Text style={uploadRecordStyles.doctorSpecialty} numberOfLines={1}>
                      {doc.specialization}
                    </Text>
                    <View
                      style={
                        isShared
                          ? uploadRecordStyles.doctorSharedBadge
                          : uploadRecordStyles.doctorHiddenBadge
                      }
                    >
                      <Text
                        style={
                          isShared
                            ? uploadRecordStyles.doctorSharedBadgeText
                            : uploadRecordStyles.doctorHiddenBadgeText
                        }
                      >
                        {isShared ? 'SHARED' : 'HIDDEN'}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={isShared}
                    onValueChange={() => onToggleDoctor(docId)}
                    trackColor={{ false: '#E2E8F0', true: theme.colors.primaryLight }}
                    thumbColor={isShared ? theme.colors.primary : '#FFFFFF'}
                  />
                </View>
              );
            })
          )}
        </View>
      </View>
      <View style={uploadRecordStyles.securityNoteRow}>
        <ShieldIcon size={16} color="#64748B" />
        <Text style={uploadRecordStyles.securityNoteText}>
          Shared documents are encrypted and only accessible to authorized medical staff
        </Text>
      </View>
      <TouchableOpacity
        style={[uploadRecordStyles.submitBtn, isSubmitting && { opacity: 0.7 }]}
        onPress={onSubmit}
        activeOpacity={0.85}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={uploadRecordStyles.submitBtnText}>Submit</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default StepDocumentDetails;
