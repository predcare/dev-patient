import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Image,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as yup from 'yup';
import { UploadOptionsModal } from '../../components/commons/UploadOptionsModal/UploadOptionsModal';
import { CategorySelectModal } from '../../components/Modules/Support';
import { queryClient } from '../../components/providers/ReactQueryProvider';
import AppHeader from '../../components/ui/AppHeader';
import {
  BellIcon,
  ChevronDownIcon,
  CircleXIcon,
  HelpIcon,
  UploadIcon,
} from '../../components/ui/icons';
import { SupportTicketQueryKeys } from '../../hooks/react-query/query.keys';
import {
  useCreateSupportTicket,
  useGetSupportCategories,
} from '../../hooks/react-query/support-tickets/support-tickets.hooks';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import { showInfoToast } from '../../lib/common/toast.utils';
import { AppRoute } from '../../route';
import { supportStyles } from '../../styled/SupportScreen.styled';
import { theme } from '../../styled/theme.styled';
import { UserRoles } from '../../typescripts/enums';
import { ISupportTicketCategory } from '../../typescripts/interfaces/support-tickets.interfaces';
import { useLoadingStore } from '../../zustand/stores/useLoadingStore';

const MAX_IMAGES = 5;

export const newSupportTicketSchema = yup.object().shape({
  subject: yup.string().trim().min(3, 'Please select a category').required('Category is required'),
  message: yup
    .string()
    .trim()
    .min(5, 'Message must be at least 5 characters')
    .required('Message is required'),
  attachments: yup
    .array()
    .of(
      yup.object().shape({
        uri: yup.string().required(),
        name: yup.string().required(),
        type: yup.string().required(),
        size: yup.number().optional(),
      })
    )
    .max(MAX_IMAGES, `Maximum ${MAX_IMAGES} attachments allowed`)
    .default([]),
});

export type TNewSupportTicketFormValues = yup.InferType<typeof newSupportTicketSchema>;

export const NewSupportTicketScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [showCatModal, setShowCatModal] = useState<boolean>(false);
  const [showUploadOptions, setShowUploadOptions] = useState<boolean>(false);

  const { showLoader, hideLoader } = useLoadingStore(state => state);

  const { data: categories, isLoading: isLoadingCategories } = useGetSupportCategories({
    audience: UserRoles.PATIENT,
  });
  const { mutate: createTicketMutation, isPending: isSubmitting } = useCreateSupportTicket();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TNewSupportTicketFormValues>({
    resolver: yupResolver(newSupportTicketSchema),
  });

  const selectedSubject = watch('subject');
  const currentAttachments = watch('attachments') || [];

  const handleCategorySelect = (category: ISupportTicketCategory) => {
    setValue('subject', category.name, { shouldValidate: true });
    setShowCatModal(false);
  };

  const handleCamera = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: 'Camera Permission Required',
          message: 'App requires access to your camera to take support photos.',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        });
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          showInfoToast('Camera permission is required to capture photos', 'Camera Permission');
          return;
        }
      }

      setShowUploadOptions(false);

      setTimeout(
        () => {
          launchCamera(
            {
              mediaType: 'photo',
              quality: 0.8,
              saveToPhotos: false,
              includeBase64: false,
            },
            res => {
              if (res.didCancel) return;
              if (res.errorCode) {
                console.warn('launchCamera errorCode:', res.errorCode, res.errorMessage);
                showInfoToast(
                  res.errorMessage || `Camera Error: ${res.errorCode}`,
                  'Camera Failure'
                );
                return;
              }
              if (res.assets && res.assets[0]) {
                const asset = res.assets[0];
                const fileObj = {
                  uri: asset.uri || '',
                  name: asset.fileName || `ticket_${Date.now()}.jpg`,
                  type: asset.type || 'image/jpeg',
                  size: asset.fileSize,
                };
                const updated = [...currentAttachments, fileObj].slice(0, MAX_IMAGES);
                setValue('attachments', updated, { shouldValidate: true });
                showInfoToast('Photo captured successfully', 'Camera');
              }
            }
          );
        },
        Platform.OS === 'android' ? 200 : 50
      );
    } catch (err: any) {
      console.warn('handleCamera error:', err);
      showInfoToast('Could not open camera', 'Camera Error');
    }
  };

  const handleGallery = () => {
    try {
      setShowUploadOptions(false);
      const remainingSlots = Math.max(1, MAX_IMAGES - currentAttachments.length);

      setTimeout(
        () => {
          launchImageLibrary(
            {
              mediaType: 'photo',
              quality: 0.8,
              selectionLimit: remainingSlots,
              includeBase64: false,
            },
            res => {
              if (res.didCancel) return;
              if (res.errorCode) {
                console.warn('launchImageLibrary errorCode:', res.errorCode, res.errorMessage);
                showInfoToast(
                  res.errorMessage || `Gallery Error: ${res.errorCode}`,
                  'Gallery Failure'
                );
                return;
              }
              if (res.assets && res.assets.length > 0) {
                const newFiles = res.assets.map((asset, index) => ({
                  uri: asset.uri || '',
                  name: asset.fileName || `ticket_${Date.now()}_${index}.jpg`,
                  type: asset.type || 'image/jpeg',
                  size: asset.fileSize,
                }));
                const updated = [...currentAttachments, ...newFiles].slice(0, MAX_IMAGES);
                setValue('attachments', updated, { shouldValidate: true });
                showInfoToast(
                  `${newFiles.length} image${newFiles.length > 1 ? 's' : ''} selected`,
                  'Gallery'
                );
              }
            }
          );
        },
        Platform.OS === 'android' ? 200 : 50
      );
    } catch (err: any) {
      console.warn('handleGallery error:', err);
      showInfoToast('Could not open gallery', 'Gallery Error');
    }
  };

  const removeImage = (index: number) => {
    const updated = currentAttachments.filter((_, i) => i !== index);
    setValue('attachments', updated, { shouldValidate: true });
  };

  const onSubmit = async (values: TNewSupportTicketFormValues) => {
    const formData = new FormData();
    formData.append('subject', values.subject.trim());
    formData.append('message', values.message.trim());
    if (values.attachments && values.attachments.length > 0) {
      values.attachments.forEach((file, index) => {
        formData.append('attachments', {
          uri: file.uri,
          name: file.name || `attachment_${index + 1}_${Date.now()}.jpg`,
          type: file.type || 'image/jpeg',
        } as any);
      });
    }
    showLoader('Creating ticket...');
    createTicketMutation(formData, {
      onSuccess: async res => {
        if (res?.success) {
          await queryClient.invalidateQueries({
            queryKey: [SupportTicketQueryKeys.GET_MY_TICKETS],
          });
          reset();
          navigation.navigate(AppRoute.SUPPORT);
          hideLoader();
        }
      },
      onError: () => {
        hideLoader();
      },
      onSettled: () => {
        hideLoader();
      },
    });
  };

  return (
    <SafeAreaWrapper style={supportStyles.screen}>
      <AppHeader
        title="New Ticket"
        showBack={true}
        right={
          <View style={supportStyles.hdrIcon}>
            <BellIcon size={22} color={theme.colors.textMuted} />
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={[
          supportStyles.scroll,
          { paddingBottom: Math.max(insets.bottom, 24) + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={supportStyles.intro}>
          How can we help you today? Our support team typically responds within 2 hours during
          business hours.
        </Text>

        <View style={supportStyles.formCard}>
          <Text style={supportStyles.label}>CATEGORY</Text>
          <TouchableOpacity
            style={[supportStyles.select, !!errors.subject && localStyles.inputErrorBorder]}
            onPress={() => setShowCatModal(true)}
            activeOpacity={0.85}
          >
            <Text style={[supportStyles.selectTxt, !selectedSubject && supportStyles.placeholder]}>
              {selectedSubject ||
                (isLoadingCategories ? 'Loading categories...' : 'Select a category')}
            </Text>
            <ChevronDownIcon size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
          {errors.subject && <Text style={localStyles.errorText}>{errors.subject.message}</Text>}
          <Text style={supportStyles.label}>MESSAGE</Text>
          <Controller
            control={control}
            name="message"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[supportStyles.message, !!errors.message && localStyles.inputErrorBorder]}
                placeholder="Describe your issue here..."
                placeholderTextColor={theme.colors.textMuted}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                textAlignVertical="top"
              />
            )}
          />
          {errors.message && <Text style={localStyles.errorText}>{errors.message.message}</Text>}
          <TouchableOpacity
            style={supportStyles.attachBox}
            onPress={() => {
              if (currentAttachments.length >= MAX_IMAGES) {
                showInfoToast(`You can only upload up to ${MAX_IMAGES} images`, 'Attachment Limit');
                return;
              }
              setShowUploadOptions(true);
            }}
            activeOpacity={0.85}
          >
            <UploadIcon size={28} color={theme.colors.primary} />
            <Text style={supportStyles.attachTxt}>Attach screenshots or documents (optional)</Text>
            <Text style={supportStyles.attachHint}>
              Up to {MAX_IMAGES} images • {currentAttachments.length}/{MAX_IMAGES} selected
            </Text>
          </TouchableOpacity>
          {errors.attachments && (
            <Text style={localStyles.errorText}>{errors.attachments.message}</Text>
          )}
          {currentAttachments.length > 0 && (
            <View style={supportStyles.previewRow}>
              {currentAttachments.map((img, index) => (
                <View key={`${img.uri}_${index}`} style={supportStyles.previewItem}>
                  <Image source={{ uri: img.uri }} style={supportStyles.previewImg} />
                  <TouchableOpacity
                    style={supportStyles.previewRemove}
                    onPress={() => removeImage(index)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <CircleXIcon size={12} color={theme.colors.surface} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
        <View style={supportStyles.infoRow}>
          <HelpIcon size={14} color={theme.colors.textMuted} />
          <Text style={supportStyles.infoTxt}>
            Please ensure you do not include sensitive medical information such as full prescription
            details or passwords.
          </Text>
        </View>
        <TouchableOpacity
          style={[supportStyles.submitBtn, isSubmitting && supportStyles.submitDis]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color={theme.colors.surface} />
          ) : (
            <Text style={supportStyles.submitTxt}>Submit Ticket</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      <CategorySelectModal
        visible={showCatModal}
        categories={categories || []}
        selectedCategoryName={selectedSubject}
        onSelect={handleCategorySelect}
        onClose={() => setShowCatModal(false)}
      />
      <UploadOptionsModal
        visible={showUploadOptions}
        title="Attach Screenshot / Image"
        subtitle="Choose a source to attach to your support ticket"
        onClose={() => setShowUploadOptions(false)}
        onSelectCamera={handleCamera}
        onSelectGallery={handleGallery}
      />
    </SafeAreaWrapper>
  );
};

export default NewSupportTicketScreen;

const localStyles = StyleSheet.create({
  inputErrorBorder: {
    borderColor: theme.colors.danger,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.danger,
    marginTop: -10,
    marginBottom: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
});
