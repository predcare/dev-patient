import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import UploadOptionsModal from '../../components/commons/UploadOptionsModal/UploadOptionsModal';
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
import { SupportQueryEnum } from '../../hooks/react-query/query.keys';
import { useCreateSupportTicket } from '../../hooks/react-query/support/support.hooks';
import { showSuccessToast } from '../../lib/common/toast.utils';
import { supportTicketSchema, SupportTicketSchemaType } from '../../lib/schemas/support.schema';
import { MOCK_SUPPORT_CATEGORIES, SupportCategory } from '../../resources/mockData';
import { supportStyles } from '../../styled/SupportScreen.styled';
import { theme } from '../../styled/theme.styled';

import { useLoadingStore } from '../../zustand/stores/useLoadingStore';

const MAX_IMAGES = 5;

export const NewSupportTicketScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [categories] = useState<SupportCategory[]>(MOCK_SUPPORT_CATEGORIES);
  const [showCatModal, setShowCatModal] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  const showLoader = useLoadingStore(state => state.showLoader);
  const hideLoader = useLoadingStore(state => state.hideLoader);

  const { mutate, isPending } = useCreateSupportTicket();
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<SupportTicketSchemaType>({
    resolver: yupResolver(supportTicketSchema),
    defaultValues: {
      subject: '',
      category: '',
      message: '',
      attachments: [],
    },
    mode: 'onBlur',
  });

  const selectedCategoryName = watch('category') || watch('subject');
  const attachments = watch('attachments') || [];

  const selectedCategoryObj = categories.find(cat => cat.name === selectedCategoryName) || null;

  const handleChooseGallery = async () => {
    setShowUploadModal(false);

    const remainingCount = MAX_IMAGES - attachments.length;
    if (remainingCount <= 0) return;

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: remainingCount,
      });

      if (result.assets && result.assets.length > 0) {
        const newItems = result.assets.map((asset, i) => ({
          id: String(Date.now() + i),
          uri: asset.uri || '',
          name: asset.fileName || `gallery_${attachments.length + i + 1}.jpg`,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize || 1.5 * 1024 * 1024,
        }));
        const updated = [...attachments, ...newItems].slice(0, MAX_IMAGES);
        setValue('attachments', updated, { shouldValidate: true });
      }
    } catch (err) {
      console.warn('Image library error:', err);
    }
  };

  const removeImage = (index: number) => {
    const updated = attachments.filter((_, i) => i !== index);
    setValue('attachments', updated, { shouldValidate: true });
  };

  const onSubmit = (data: SupportTicketSchemaType) => {
    showLoader('Submitting support ticket...');
    const formData = new FormData();

    formData.append('subject', data.category || data.subject);
    formData.append('message', data.message);

    data.attachments?.forEach(attachment => {
      formData.append('attachments', {
        uri: attachment.uri,
        type: attachment.type,
        name: attachment.name,
      });
    });

    mutate(formData, {
      onSuccess: async res => {
        try {
          if (res?.success) {
            showSuccessToast(res.message);
            reset();
            await queryClient.invalidateQueries({
              queryKey: [SupportQueryEnum.GET_SUPPORT_TICKETS],
            });
            navigation.goBack();
          }
        } finally {
          hideLoader();
        }
      },
      onError: () => {
        hideLoader();
      },
    });
  };

  return (
    <SafeAreaView style={supportStyles.screen}>
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
          {/* Category / Subject Select */}
          <Text style={supportStyles.label}>
            CATEGORY <Text style={localStyles.requiredStar}>*</Text>
          </Text>
          <Controller
            control={control}
            name="category"
            render={({ field: { value } }) => (
              <TouchableOpacity
                style={[
                  supportStyles.select,
                  (errors.category || errors.subject) && localStyles.inputError,
                ]}
                onPress={() => setShowCatModal(true)}
                activeOpacity={0.85}
              >
                <Text style={[supportStyles.selectTxt, !value && supportStyles.placeholder]}>
                  {value || 'Select a category'}
                </Text>
                <ChevronDownIcon size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            )}
          />
          {(errors.category?.message || errors.subject?.message) && (
            <Text style={localStyles.errorText}>
              {errors.category?.message || errors.subject?.message}
            </Text>
          )}

          {/* Message Input */}
          <Text style={supportStyles.label}>
            MESSAGE <Text style={localStyles.requiredStar}>*</Text>
          </Text>
          <Controller
            control={control}
            name="message"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[supportStyles.message, errors.message && localStyles.inputError]}
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
          {errors.message?.message && (
            <Text style={localStyles.errorText}>{errors.message.message}</Text>
          )}

          {/* Attachments Box */}
          <TouchableOpacity
            style={supportStyles.attachBox}
            onPress={() => {
              if (attachments.length >= MAX_IMAGES) return;
              setShowUploadModal(true);
            }}
            activeOpacity={0.85}
          >
            <UploadIcon size={28} color={theme.colors.primary} />
            <Text style={supportStyles.attachTxt}>Attach screenshots or documents (optional)</Text>
            <Text style={supportStyles.attachHint}>
              Up to {MAX_IMAGES} files (Images or PDFs, up to 10MB) • {attachments.length}/
              {MAX_IMAGES} selected
            </Text>
          </TouchableOpacity>
          {errors.attachments?.message && (
            <Text style={localStyles.errorText}>{errors.attachments.message}</Text>
          )}

          {/* Attached Images Preview Row */}
          {attachments.length > 0 && (
            <View style={supportStyles.previewRow}>
              {attachments.map((img, index) => (
                <View key={img.id || index} style={supportStyles.previewItem}>
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

        {/* Info Disclaimer */}
        <View style={supportStyles.infoRow}>
          <HelpIcon size={14} color={theme.colors.textMuted} />
          <Text style={supportStyles.infoTxt}>
            Please ensure you do not include sensitive medical information such as full prescription
            details or passwords.
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[supportStyles.submitBtn, isPending && supportStyles.submitDis]}
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
          activeOpacity={0.85}
        >
          {isPending ? (
            <ActivityIndicator color={theme.colors.surface} />
          ) : (
            <Text style={supportStyles.submitTxt}>Submit Ticket</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modular Category Select Modal */}
      <CategorySelectModal
        visible={showCatModal}
        categories={categories}
        selectedCategory={selectedCategoryObj}
        onSelect={cat => {
          setValue('category', cat.name, { shouldValidate: true });
          setValue('subject', cat.name, { shouldValidate: true });
          setShowCatModal(false);
        }}
        onClose={() => setShowCatModal(false)}
      />

      {/* Upload Options Modal for Camera / Multi-Gallery Selection */}
      <UploadOptionsModal
        visible={showUploadModal}
        title="Attach Screenshots or Files"
        subtitle="Select photo from camera or choose multiple from library"
        type="logo"
        enableCamera={false}
        enableGallery={true}
        onSelectCamera={() => {}}
        onSelectGallery={handleChooseGallery}
        onClose={() => setShowUploadModal(false)}
      />
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  textInput: {
    paddingVertical: 12,
  },
  requiredStar: {
    color: theme.colors.danger || '#E53E3E',
    fontWeight: '700',
  },
  inputError: {
    borderColor: theme.colors.danger || '#E53E3E',
  },
  errorText: {
    color: theme.colors.danger || '#E53E3E',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 12,
    marginLeft: 4,
  },
});

export default NewSupportTicketScreen;
