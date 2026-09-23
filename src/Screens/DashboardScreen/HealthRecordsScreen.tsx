import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { HealthRecordFolderCard, UploadRecordModal } from '../../components/Modules/HealthRecords';
import { AppHeader } from '../../components/ui/AppHeader';
import {
  BrainIcon,
  DropletIcon,
  HeartIcon,
  MicroscopeIcon,
  PlusIcon,
  ThreeDotsIcon,
  UltrasoundIcon,
} from '../../components/ui/icons';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import { AppRoute } from '../../route';
import { healthRecordsStyles } from '../../styled/HealthRecordsScreen.styled';
import { theme } from '../../styled/theme.styled';

interface FolderCategory {
  id: string;
  name: string;
  filesCount: number;
  updatedAtText: string;
  iconBgColor: string;
  iconColor: string;
  renderIcon: () => React.ReactNode;
}

const STATIC_FOLDERS: FolderCategory[] = [
  {
    id: 'mri-scan',
    name: 'MRI Scan',
    filesCount: 3,
    updatedAtText: '2 days ago',
    iconBgColor: '#FDF2F4',
    iconColor: '#0F766E',
    renderIcon: () => <BrainIcon size={22} color={theme.colors.primary} />,
  },
  {
    id: 'ct-scan',
    name: 'CT Scan',
    filesCount: 2,
    updatedAtText: '1 week ago',
    iconBgColor: '#F0FDF4',
    iconColor: '#0F766E',
    renderIcon: () => <MicroscopeIcon size={22} color={theme.colors.primary} />,
  },
  {
    id: 'ultrasound',
    name: 'Ultrasound',
    filesCount: 3,
    updatedAtText: '4 days ago',
    iconBgColor: '#FEFCE8',
    iconColor: '#0F766E',
    renderIcon: () => <UltrasoundIcon size={22} color={theme.colors.primary} />,
  },
  {
    id: 'ecg-report',
    name: 'ECG Report',
    filesCount: 3,
    updatedAtText: '2 days ago',
    iconBgColor: '#FDF2F4',
    iconColor: '#0F766E',
    renderIcon: () => <HeartIcon size={22} color={theme.colors.primary} />,
  },
  {
    id: 'blood-test',
    name: 'Blood Test',
    filesCount: 1,
    updatedAtText: '5 days ago',
    iconBgColor: '#FDF2F4',
    iconColor: '#0F766E',
    renderIcon: () => <DropletIcon size={22} color={theme.colors.primary} />,
  },
];

export const HealthRecordsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  const handleFolderPress = (folder: FolderCategory) => {
    navigation.navigate(AppRoute.HEALTH_RECORD_FOLDER, {
      folderId: folder.id,
      folderName: folder.name,
      filesCount: folder.filesCount,
    });
  };

  return (
    <SafeAreaWrapper showBottomBar={true}>
      <View style={healthRecordsStyles.container}>
        {/* Top Header */}
        <AppHeader
          title="Health Records"
          titleColor={theme.colors.primary}
          showBack={true}
          border={false}
          right={
            <TouchableOpacity
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ThreeDotsIcon size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          }
        />

        <ScrollView
          contentContainerStyle={healthRecordsStyles.contentScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Metric Cards */}
          <View style={healthRecordsStyles.summaryRow}>
            <View style={healthRecordsStyles.summaryCard}>
              <Text style={healthRecordsStyles.summaryLabel}>DOCUMENTS</Text>
              <Text style={healthRecordsStyles.summaryValue}>12</Text>
            </View>

            <View style={healthRecordsStyles.summaryCard}>
              <Text style={healthRecordsStyles.summaryLabel}>STORAGE</Text>
              <Text style={healthRecordsStyles.summaryValue}>2.3MB</Text>
            </View>
          </View>

          {/* Section: My Documents */}
          <Text style={healthRecordsStyles.sectionTitle}>My Documents</Text>

          {/* Folder Categories List */}
          <View style={healthRecordsStyles.folderList}>
            {STATIC_FOLDERS.map(folder => (
              <HealthRecordFolderCard
                key={folder.id}
                id={folder.id}
                name={folder.name}
                filesCount={folder.filesCount}
                updatedAtText={folder.updatedAtText}
                iconBgColor={folder.iconBgColor}
                renderIcon={folder.renderIcon}
                onPress={() => handleFolderPress(folder)}
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
        />
      </View>
    </SafeAreaWrapper>
  );
};

export default HealthRecordsScreen;
