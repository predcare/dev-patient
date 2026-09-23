import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import CommonErrorCard from '../../components/commons/CommonErrorCard/CommonErrorCard';
import { HealthRecordFolderCard } from '../../components/Modules/HealthRecords';
import HealthRecordsSkeleton from '../../components/Skeletons/HealthRecordsSkeleton';
import { AppHeader } from '../../components/ui/AppHeader';
import {
  BrainIcon,
  DropletIcon,
  FolderIcon,
  HeartIcon,
  LabFlaskIcon,
  MicroscopeIcon,
  PlusIcon,
  PrescriptionIcon,
  UltrasoundIcon,
  XRayIcon,
} from '../../components/ui/icons';
import { useGetEMRCats } from '../../hooks/react-query/emr/emr.hooks';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import { AppRoute } from '../../route';
import { healthRecordsStyles } from '../../styled/HealthRecordsScreen.styled';
import { theme } from '../../styled/theme.styled';
import { IEMRCatsList } from '../../typescripts/interfaces/emr.interfaces';
import { useAuthStore } from '../../zustand/stores/useAuthStore';

const getCategoryVisualConfig = (idOrName: string = '') => {
  const normalized = idOrName.toLowerCase().replace(/[\s_]+/g, '-');

  if (normalized.includes('mri')) {
    return {
      iconBgColor: '#FDF2F4',
      renderIcon: () => <BrainIcon size={22} color={theme.colors.primary} />,
    };
  }
  if (normalized.includes('ct-scan') || normalized.includes('ct')) {
    return {
      iconBgColor: '#F0FDF4',
      renderIcon: () => <MicroscopeIcon size={22} color={theme.colors.primary} />,
    };
  }
  if (normalized.includes('ultrasound')) {
    return {
      iconBgColor: '#FEFCE8',
      renderIcon: () => <UltrasoundIcon size={22} color={theme.colors.primary} />,
    };
  }
  if (normalized.includes('ecg') || normalized.includes('heart') || normalized.includes('cardio')) {
    return {
      iconBgColor: '#FDF2F4',
      renderIcon: () => <HeartIcon size={22} color={theme.colors.primary} />,
    };
  }
  if (normalized.includes('blood')) {
    return {
      iconBgColor: '#FDF2F4',
      renderIcon: () => <DropletIcon size={22} color={theme.colors.primary} />,
    };
  }
  if (normalized.includes('lab') || normalized.includes('pathology')) {
    return {
      iconBgColor: '#CCFBF1',
      renderIcon: () => <LabFlaskIcon size={22} color={theme.colors.primary} />,
    };
  }
  if (normalized.includes('x-ray') || normalized.includes('xray')) {
    return {
      iconBgColor: '#E0F2FE',
      renderIcon: () => <XRayIcon size={22} color={theme.colors.primary} />,
    };
  }
  if (normalized.includes('prescription') || normalized.includes('rx')) {
    return {
      iconBgColor: '#F0FDFA',
      renderIcon: () => <PrescriptionIcon size={22} color={theme.colors.primary} />,
    };
  }
  return {
    iconBgColor: '#F1F5F9',
    renderIcon: () => <FolderIcon size={22} color={theme.colors.primary} />,
  };
};

export const HealthRecordsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { userData } = useAuthStore(state => state);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: emrCatsRes,
    isPending: catsLoading,
    isError: catsIsError,
    refetch: refetchCats,
  } = useGetEMRCats();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchCats();
    setRefreshing(false);
  }, [refetchCats]);

  const handleFolderPress = (folder: IEMRCatsList) => {
    navigation.navigate(AppRoute.HEALTH_RECORD_FOLDER, {
      patinentId: userData?.id,
      folderName: folder.documentType,
    });
  };

  const handleNavigateUpload = () => {
    navigation.navigate(AppRoute.UPLOAD_HEALTH_RECORD);
  };

  return (
    <SafeAreaWrapper showBottomBar isPathClear>
      <View style={healthRecordsStyles.container}>
        <AppHeader
          title="Health Records"
          subtitle="My health Records"
          titleColor={theme.colors.primary}
          showBack={true}
          border={false}
        />

        <ScrollView
          contentContainerStyle={healthRecordsStyles.contentScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        >
          {catsLoading && !refreshing ? (
            <HealthRecordsSkeleton />
          ) : catsIsError ? (
            <CommonErrorCard
              title="Unable to Load Records"
              message="Something went wrong while fetching your health record categories."
              onRetry={refetchCats}
            />
          ) : (
            <>
              <View style={healthRecordsStyles.summaryRow}>
                <View style={healthRecordsStyles.summaryCard}>
                  <Text style={healthRecordsStyles.summaryLabel}>DOCUMENTS</Text>
                  <Text style={healthRecordsStyles.summaryValue}>
                    {emrCatsRes?.total_documents}
                  </Text>
                </View>
                <View style={healthRecordsStyles.summaryCard}>
                  <Text style={healthRecordsStyles.summaryLabel}>STORAGE</Text>
                  <Text style={healthRecordsStyles.summaryValue}>
                    {emrCatsRes?.total_file_size}
                  </Text>
                </View>
              </View>
              <Text style={healthRecordsStyles.sectionTitle}>My Documents</Text>
              {emrCatsRes?.categories?.length === 0 ? (
                <View style={healthRecordsStyles.emptyWrap}>
                  <View style={healthRecordsStyles.emptyIcon}>
                    <FolderIcon size={34} color={theme.colors.primary} />
                  </View>
                  <Text style={healthRecordsStyles.emptyTitle}>No Health Records Yet</Text>
                  <Text style={healthRecordsStyles.emptySubtitle}>
                    Upload your medical reports, scans, and prescriptions to keep them organized.
                  </Text>
                  <TouchableOpacity
                    style={healthRecordsStyles.emptyBtn}
                    onPress={handleNavigateUpload}
                    activeOpacity={0.8}
                  >
                    <Text style={healthRecordsStyles.emptyBtnText}>Upload New Document</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={healthRecordsStyles.folderList}>
                  {emrCatsRes?.categories?.map(folder => {
                    const visualConfig = getCategoryVisualConfig(folder.id || folder.name);
                    return (
                      <HealthRecordFolderCard
                        key={folder.id}
                        id={folder.id}
                        name={folder.name}
                        filesCount={folder.filesCount || 0}
                        updatedAtText={folder.updatedAtText || 'Recently'}
                        iconBgColor={visualConfig.iconBgColor}
                        renderIcon={visualConfig.renderIcon}
                        onPress={() => handleFolderPress(folder)}
                      />
                    );
                  })}
                </View>
              )}
            </>
          )}
        </ScrollView>
        <TouchableOpacity
          style={healthRecordsStyles.fabButton}
          onPress={handleNavigateUpload}
          activeOpacity={0.85}
        >
          <PlusIcon size={28} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </SafeAreaWrapper>
  );
};

export default HealthRecordsScreen;
