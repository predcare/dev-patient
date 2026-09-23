import { useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import {
  HealthRecordDocItem,
  HealthRecordItemCard,
  UploadRecordModal,
} from '../../components/Modules/HealthRecords';
import { AppHeader } from '../../components/ui/AppHeader';
import {
  BrainIcon,
  PlusIcon,
  SearchIcon,
  UploadIcon,
} from '../../components/ui/icons';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import { showSuccessToast } from '../../lib/common/toast.utils';
import { healthRecordsStyles } from '../../styled/HealthRecordsScreen.styled';
import { theme } from '../../styled/theme.styled';

const STATIC_DOCUMENTS: HealthRecordDocItem[] = [
  {
    id: 'doc-1',
    title: 'MRI Scan',
    date: '29 Aug 2026',
    size: '103.03 KB',
    format: 'JPG',
  },
  {
    id: 'doc-2',
    title: 'MRI Scan',
    date: '26 Aug 2026',
    size: '111.49 KB',
    format: 'JPG',
  },
  {
    id: 'doc-3',
    title: 'MRI Scan',
    date: '24 Aug 2026',
    size: '66.42 KB',
    format: 'JPG',
  },
];

export const HealthRecordFolderScreen: React.FC = () => {
  const route = useRoute<any>();
  const folderName = route.params?.folderName || 'MRI Scan';
  const filesCount = route.params?.filesCount || 3;

  const [documents, setDocuments] = useState<HealthRecordDocItem[]>(STATIC_DOCUMENTS);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  const handleViewDoc = (item: HealthRecordDocItem) => {
    showSuccessToast(`Opening ${item.title} (${item.date})`);
  };

  const handleShareDoc = (item: HealthRecordDocItem) => {
    showSuccessToast(`Sharing link generated for ${item.title}`);
  };

  const handleDeleteDoc = (item: HealthRecordDocItem) => {
    setDocuments(prev => prev.filter(d => d.id !== item.id));
    showSuccessToast(`${item.title} deleted successfully`);
  };

  return (
    <SafeAreaWrapper showBottomBar={true}>
      <View style={healthRecordsStyles.container}>
        {/* Top Header */}
        <AppHeader
          title={folderName}
          titleColor={theme.colors.primary}
          showBack={true}
          border={false}
          right={
            <TouchableOpacity
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <SearchIcon size={22} color={theme.colors.primary} />
            </TouchableOpacity>
          }
        />

        <ScrollView
          contentContainerStyle={healthRecordsStyles.contentScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Category Info Banner */}
          <View style={healthRecordsStyles.folderHeaderBanner}>
            <View style={healthRecordsStyles.folderBannerIconWrap}>
              <BrainIcon size={24} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={healthRecordsStyles.folderBannerTitle}>{folderName}</Text>
              <Text style={healthRecordsStyles.folderBannerSubtitle}>
                {documents.length} {documents.length === 1 ? 'document' : 'documents'} in this folder
              </Text>
            </View>
          </View>

          {/* Upload New Report Dashed Box */}
          <TouchableOpacity
            style={healthRecordsStyles.uploadDashedBox}
            onPress={() => setUploadModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={healthRecordsStyles.uploadDashedIconCircle}>
              <UploadIcon size={22} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={healthRecordsStyles.uploadDashedTitle}>UPLOAD NEW REPORT</Text>
              <Text style={healthRecordsStyles.uploadDashedSubtitle}>
                PDF, JPG, or PNG (Max 10MB)
              </Text>
            </View>
          </TouchableOpacity>

          {/* Documents List */}
          <View>
            {documents.map(doc => (
              <HealthRecordItemCard
                key={doc.id}
                item={doc}
                onView={handleViewDoc}
                onShare={handleShareDoc}
                onDelete={handleDeleteDoc}
              />
            ))}
          </View>
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity
          style={healthRecordsStyles.fabButton}
          onPress={() => setUploadModalVisible(true)}
          activeOpacity={0.85}
        >
          <PlusIcon size={28} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>

        {/* 3-Step Upload Modal */}
        <UploadRecordModal
          visible={uploadModalVisible}
          onClose={() => setUploadModalVisible(false)}
          initialCategory={folderName}
        />
      </View>
    </SafeAreaWrapper>
  );
};

export default HealthRecordFolderScreen;
