import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Text, TouchableOpacity, View } from 'react-native';
import {
  CategoryOption,
  StepCategorySelect,
  StepDocumentDetails,
  StepUploadMethod,
  UploadStepper,
} from '../../components/Modules/HealthRecords/Upload';
import { queryClient } from '../../components/providers/ReactQueryProvider';
import { AppHeader } from '../../components/ui/AppHeader';
import { CircleXIcon } from '../../components/ui/icons';
import { useUploadEMR } from '../../hooks/react-query/emr/emr.hooks';
import { EMRQuerykeys } from '../../hooks/react-query/query.keys';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import {
  TUploadHealthRecordFormSchemaType,
  UploadHealthRecordSchema,
} from '../../lib/schemas/emr.schema';
import { AppRoute } from '../../route';
import { theme } from '../../styled/theme.styled';
import { uploadRecordStyles } from '../../styled/UploadHealthRecordScreen.styled';
import { useLoadingStore } from '../../zustand/stores/useLoadingStore';

export const UploadHealthRecordScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const { hideLoader, showLoader } = useLoadingStore();
  const { mutate: uploadEmrMutation, isPending: isUploading } = useUploadEMR();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<TUploadHealthRecordFormSchemaType>({
    resolver: yupResolver(UploadHealthRecordSchema),
    defaultValues: {
      category: '',
      file: null,
      title: '',
      notes: '',
      shareDoctorIds: [],
    },
    mode: 'onChange',
  });

  const selectedCategory = watch('category');
  const attachedFile = watch('file') as any;
  const shareDoctorIds = (watch('shareDoctorIds') || []) as number[];

  const handleSelectCategory = async (cat: CategoryOption) => {
    setValue('category', cat.name, { shouldValidate: true });
    if (!getValues('title') || getValues('title') === selectedCategory) {
      setValue('title', cat.name, { shouldValidate: true });
    }
    const isValid = await trigger('category');
    if (isValid) {
      setCurrentStep(2);
    }
  };

  const handleFileSelected = async (fileObj: any) => {
    setValue('file', fileObj, { shouldValidate: true });
    const isValid = await trigger('file');
    if (isValid) {
      setCurrentStep(3);
    }
  };

  const handleToggleDoctor = (id: number) => {
    const exists = shareDoctorIds.includes(id);
    const updated = exists ? shareDoctorIds.filter(docId => docId !== id) : [...shareDoctorIds, id];
    setValue('shareDoctorIds', updated, { shouldValidate: true });
  };

  const handleHeaderBack = () => {
    if (currentStep === 1) {
      navigation.goBack();
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      setCurrentStep(2);
    }
  };

  const onSubmit = (data: TUploadHealthRecordFormSchemaType) => {
    const formData = new FormData();
    formData.append('document_type', data.category);
    formData.append('title', data.title);
    if (data.notes) {
      formData.append('description', data.notes);
    }
    formData.append('visible_to_patient', `${true}`);
    formData.append('uploaded_during_call', `${false}`);
    formData.append('created_from', 'patient-app');
    if (data.shareDoctorIds && data.shareDoctorIds.length > 0) {
      formData.append('shareIds', JSON.stringify(data.shareDoctorIds));
    }
    if (data.file && typeof data.file === 'object' && (data.file as any).uri) {
      const fileObj = data.file as any;
      formData.append('file', {
        uri: fileObj.uri,
        name: fileObj.name || `emr_${Date.now()}.jpg`,
        type: fileObj.type || 'image/jpeg',
      } as any);
    }
    showLoader('Please Wait.. While uploading your report');
    uploadEmrMutation(formData, {
      onSuccess: async res => {
        if (res?.success) {
          await queryClient.invalidateQueries({ queryKey: [EMRQuerykeys.EMR_CATS] });
          hideLoader();
          navigation.navigate(AppRoute.HEALTH_RECORDS);
        } else {
          hideLoader();
        }
      },
      onError: () => {
        hideLoader();
      },
    });
  };

  const headerTitle = useMemo(() => {
    if (!currentStep || typeof currentStep !== 'number') return 'Document Details';
    return currentStep === 1
      ? 'Select Category'
      : currentStep === 2
      ? 'File Upload'
      : 'Document Details';
  }, [currentStep]);

  return (
    <SafeAreaWrapper showBottomBar={false} isPathClear>
      <View style={uploadRecordStyles.container}>
        <AppHeader
          title={headerTitle}
          titleColor={theme.colors.primary}
          showBack={true}
          border={false}
          onBack={handleHeaderBack}
          right={
            currentStep === 1 ? (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <CircleXIcon size={22} color={theme.colors.primary} />
              </TouchableOpacity>
            ) : (
              <View style={uploadRecordStyles.headerBadge}>
                <Text style={uploadRecordStyles.headerBadgeText}>Step {currentStep} of 3</Text>
              </View>
            )
          }
        />

        <UploadStepper currentStep={currentStep} />

        {currentStep === 1 && (
          <StepCategorySelect
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />
        )}

        {currentStep === 2 && (
          <StepUploadMethod
            onFileSelected={handleFileSelected}
            error={errors.file?.message as string | undefined}
          />
        )}
        {currentStep === 3 && (
          <StepDocumentDetails
            control={control}
            errors={errors}
            selectedCategory={selectedCategory}
            file={attachedFile}
            shareDoctorIds={shareDoctorIds}
            onToggleDoctor={handleToggleDoctor}
            onChangeCategoryPress={() => setCurrentStep(1)}
            onSubmit={handleSubmit(onSubmit)}
            isSubmitting={isUploading}
          />
        )}
      </View>
    </SafeAreaWrapper>
  );
};

export default UploadHealthRecordScreen;
