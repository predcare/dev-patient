import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategorySelectModal } from '../../components/Modules/Support';
import AppHeader from '../../components/ui/AppHeader';
import {
  BellIcon,
  ChevronDownIcon,
  CircleXIcon,
  HelpIcon,
  UploadIcon,
} from '../../components/ui/icons';
import { MOCK_SUPPORT_CATEGORIES, SupportCategory } from '../../resources/mockData';
import { supportStyles } from '../../styled/SupportScreen.styled';
import { theme } from '../../styled/theme.styled';

interface SelectedImage {
  id: string;
  uri: string;
}

const MAX_IMAGES = 5;

export const NewSupportTicketScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [categories] = useState<SupportCategory[]>(MOCK_SUPPORT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<SupportCategory | null>(
    MOCK_SUPPORT_CATEGORIES[0]
  );
  const [message, setMessage] = useState<string>('');
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [showCatModal, setShowCatModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const pickImages = () => {
    if (images.length >= MAX_IMAGES) return;
    const mockUris = [
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500',
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500',
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500',
    ];
    const newImage: SelectedImage = {
      id: String(Date.now()),
      uri: mockUris[images.length % mockUris.length],
    };
    setImages(prev => [...prev, newImage].slice(0, MAX_IMAGES));
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const submit = () => {
    if (!message.trim()) {
      setMessage('I need help regarding my consultation appointments.');
    }
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      const generatedTicketId = `TK-${Math.floor(10000 + Math.random() * 90000)}`;
      navigation.navigate('SupportTicketSuccess', {
        ticketId: generatedTicketId,
        category: selectedCategory?.name || 'Appointments & Booking',
        createdAt: new Date().toISOString(),
      });
    }, 600);
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
          How can we help you today? Our support team typically responds within 2 hours
          during business hours.
        </Text>

        <View style={supportStyles.formCard}>
          {/* Category Select */}
          <Text style={supportStyles.label}>CATEGORY</Text>
          <TouchableOpacity
            style={supportStyles.select}
            onPress={() => setShowCatModal(true)}
            activeOpacity={0.85}
          >
            <Text
              style={[
                supportStyles.selectTxt,
                !selectedCategory && supportStyles.placeholder,
              ]}
            >
              {selectedCategory ? selectedCategory.name : 'Select a category'}
            </Text>
            <ChevronDownIcon size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>

          {/* Message Input */}
          <Text style={supportStyles.label}>MESSAGE</Text>
          <TextInput
            style={supportStyles.message}
            placeholder="Describe your issue here..."
            placeholderTextColor={theme.colors.textMuted}
            value={message}
            onChangeText={setMessage}
            multiline
            textAlignVertical="top"
          />

          {/* Attachments Box */}
          <TouchableOpacity
            style={supportStyles.attachBox}
            onPress={pickImages}
            activeOpacity={0.85}
          >
            <UploadIcon size={28} color={theme.colors.primary} />
            <Text style={supportStyles.attachTxt}>
              Attach screenshots or documents (optional)
            </Text>
            <Text style={supportStyles.attachHint}>
              Up to {MAX_IMAGES} images • {images.length}/{MAX_IMAGES} selected
            </Text>
          </TouchableOpacity>

          {/* Attached Images Preview Row */}
          {images.length > 0 && (
            <View style={supportStyles.previewRow}>
              {images.map((img, index) => (
                <View key={img.id} style={supportStyles.previewItem}>
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
            Please ensure you do not include sensitive medical information such as full
            prescription details or passwords.
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[supportStyles.submitBtn, submitting && supportStyles.submitDis]}
          onPress={submit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
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
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
        onClose={() => setShowCatModal(false)}
      />
    </SafeAreaView>
  );
};

export default NewSupportTicketScreen;
