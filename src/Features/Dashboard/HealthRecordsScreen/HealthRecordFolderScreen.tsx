import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Keyboard,
  Linking,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as RNFSModule from 'react-native-fs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CommonErrorCard from '../../../components/commons/CommonErrorCard/CommonErrorCard';
import { getBottomBarHeight } from '../../../components/commons/CustomBottomBar/CustomBottomBar';
import {
  BrainIcon,
  CircleXIcon,
  DropletIcon,
  FolderIcon,
  HeartIcon,
  LabFlaskIcon,
  MicroscopeIcon,
  PlusIcon,
  PrescriptionIcon,
  SearchIcon,
  UltrasoundIcon,
  XRayIcon,
} from '../../../components/ui/icons';
import { useDebounce } from '../../../hooks/commons/useDebounce';
import { useDeleteEMR, useGetCatWiseEmrs } from '../../../hooks/react-query/emr/emr.hooks';
import Header from '../../../Layout/Header';
import SafeAreaWrapper from '../../../Layout/SafeAreaWrapper';
import { formatDate, getFileType } from '../../../lib/common/common.utils';
import { sanitizeFilename } from '../../../lib/common/file.utils';
import { showErrorToast, showInfoToast, showSuccessToast } from '../../../lib/common/toast.utils';
import { AppRoute } from '../../../route';
import { healthRecordsStyles } from '../../../styled/HealthRecordsScreen.styled';
import theme from '../../../styled/theme.styled';
import { IEmrListDoc } from '../../../typescripts/interfaces/emr.interfaces';
import { useAlertStore } from '../../../zustand/stores/useAlertStore';
import { useAuthStore } from '../../../zustand/stores/useAuthStore';
import { useLoadingStore } from '../../../zustand/stores/useLoadingStore';
import HealthRecordItemCard from './Components/HealthRecordItemCard';
import EmrDetailsModal from './Modals/EmrDetailsModal';
import ShareEMRModals from './Modals/ShareEMRModals';
import HealthRecordFolderSkeleton from './Skeletons/HealthRecordFolderSkeleton';

const getRNFS = (): any => {
  return (RNFSModule as any)?.default || RNFSModule;
};

const getCategoryVisualConfig = (idOrName: string = '') => {
  const normalized = idOrName.toLowerCase().replace(/[\s_]+/g, '-');

  if (normalized.includes('mri')) {
    return {
      iconBgColor: '#FDF2F4',
      renderIcon: () => <BrainIcon size={24} color={theme.colors.primary} />,
    };
  }
  if (normalized.includes('ct-scan') || normalized.includes('ct')) {
    return {
      iconBgColor: '#F0FDF4',
      renderIcon: () => <MicroscopeIcon size={24} color={theme.colors.primary} />,
    };
  }
  if (normalized.includes('ultrasound')) {
    return {
      iconBgColor: '#FEFCE8',
      renderIcon: () => <UltrasoundIcon size={24} color={theme.colors.primary} />,
    };
  }
  if (normalized.includes('ecg') || normalized.includes('heart') || normalized.includes('cardio')) {
    return {
      iconBgColor: '#FDF2F4',
      renderIcon: () => <HeartIcon size={24} color={theme.colors.primary} />,
    };
  }
  if (normalized.includes('blood')) {
    return {
      iconBgColor: '#FDF2F4',
      renderIcon: () => <DropletIcon size={24} color={theme.colors.primary} />,
    };
  }
  if (normalized.includes('lab') || normalized.includes('pathology')) {
    return {
      iconBgColor: '#CCFBF1',
      renderIcon: () => <LabFlaskIcon size={24} color={theme.colors.primary} />,
    };
  }
  if (normalized.includes('x-ray') || normalized.includes('xray')) {
    return {
      iconBgColor: '#E0F2FE',
      renderIcon: () => <XRayIcon size={24} color={theme.colors.primary} />,
    };
  }
  if (normalized.includes('prescription') || normalized.includes('rx')) {
    return {
      iconBgColor: '#F0FDFA',
      renderIcon: () => <PrescriptionIcon size={24} color={theme.colors.primary} />,
    };
  }
  return {
    iconBgColor: '#F1F5F9',
    renderIcon: () => <FolderIcon size={24} color={theme.colors.primary} />,
  };
};

export const HealthRecordFolderScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const userData = useAuthStore(state => state.userData);
  const folderName = route.params?.folderName || '';
  const patinentId = route.params?.patientId || userData?.id || 0;
  const insets = useSafeAreaInsets();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [shareDoc, setShareDoc] = useState<IEmrListDoc | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<IEmrListDoc | null>(null);
  const showLoader = useLoadingStore(state => state.showLoader);
  const hideLoader = useLoadingStore(state => state.hideLoader);
  const { showConfirm } = useAlertStore();
  const debounceSearch = useDebounce(search.trim(), 500);

  const {
    data: catWiseEmrs,
    isLoading,
    isError,
    refetch,
  } = useGetCatWiseEmrs({
    document_type: folderName,
    patient_id: patinentId,
    search: debounceSearch || undefined,
  });

  const { mutate: deleteMutate } = useDeleteEMR();

  const visualConfig = useMemo(() => getCategoryVisualConfig(folderName), [folderName]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleToggleSearch = useCallback(() => {
    setIsSearchOpen(prev => {
      const next = !prev;
      if (!next) {
        setSearch('');
      }
      return next;
    });
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearch('');
  }, []);

  const handleNavigateUpload = useCallback(() => {
    navigation.navigate(AppRoute.UPLOAD_HEALTH_RECORD, {
      initialCategory: folderName,
    });
  }, [folderName, navigation]);

  const handleOpenDocument = useCallback((doc: IEmrListDoc) => {
    const fullUrl = doc.document_url;
    if (!fullUrl) {
      showErrorToast('No Document Found');
      return;
    }
    showInfoToast(`Opening "${doc.title || 'Document'}"...`, 'Opening Document');
    Linking.openURL(fullUrl).catch(error => {
      console.error('File Open Error', error);
      showErrorToast('Could not open document', 'Open Document');
    });
  }, []);

  const handleSaveToDevice = useCallback((doc: IEmrListDoc) => {
    const fullUrl = doc.document_url;
    if (fullUrl) {
      Linking.openURL(fullUrl).catch(() => {
        showInfoToast('Could not download document', 'Download Document');
      });
    } else {
      showSuccessToast(
        `"${doc.title || 'Document'}" downloaded to your device downloads folder`,
        'Saved to Device'
      );
    }
  }, []);

  const handleDownloadDocument = useCallback(async (doc: IEmrListDoc) => {
    const url = doc.document_url;
    if (!url) {
      showErrorToast('Document file is not available', 'Download Document');
      return;
    }

    const RNFS = getRNFS();
    const cleanPath = url.split('?')[0] || '';
    const ext = (cleanPath.split('.').pop() || 'jpg').toLowerCase();
    const baseName = (doc.title || doc.document_type || 'Document').replace(/[^A-Za-z0-9_-]/g, '_');
    const filename = sanitizeFilename(`${baseName}.${ext}`, `Document.${ext}`);
    const folders = [RNFS.DownloadDirectoryPath, RNFS.DocumentDirectoryPath].filter(Boolean);

    showLoader('Downloading document');
    try {
      let savedPath = '';
      let lastError: unknown = null;

      for (const dir of folders) {
        try {
          if (!(await RNFS.exists(dir))) {
            await RNFS.mkdir(dir);
          }
          const destPath = `${dir}/${filename}`;
          if (await RNFS.exists(destPath)) {
            await RNFS.unlink(destPath);
          }
          const result = await RNFS.downloadFile({ fromUrl: url, toFile: destPath }).promise;
          if (result.statusCode >= 200 && result.statusCode < 300) {
            savedPath = destPath;
            break;
          }
          lastError = new Error('Could not download document');
        } catch (error) {
          lastError = error;
        }
      }

      if (!savedPath) {
        const message =
          lastError instanceof Error ? lastError.message : 'Could not download document';
        showErrorToast(message, 'Download Document');
        return;
      }

      showSuccessToast(`${filename} saved to Downloads`, 'Download Document');
    } finally {
      hideLoader();
    }
  }, [hideLoader, showLoader]);

  const handleDeleteEmr = useCallback((id: number) => {
    if (!id) return showErrorToast('Invalid Id');
    showConfirm({
      title: 'Delete',
      message: `Are you sure you want to delete this health record?`,
      buttonText: 'Yes, Delete',
      cancelText: 'No, Keep',
      onConfirm: () => {
        showLoader('Deleting health record...');
        deleteMutate(id, {
          onSuccess: async res => {
            if (res?.success) {
              showSuccessToast(res?.message || 'Health record deleted successfully');
              await refetch();
            }
          },
          onError: () => {
            hideLoader();
          },
          onSettled: () => {
            hideLoader();
          },
        });
      },
    });
  }, [deleteMutate, hideLoader, showConfirm, showLoader]);

  const records = !isLoading && !isError ? catWiseEmrs ?? [] : [];

  const recordKeyExtractor = useCallback(
    (doc: IEmrListDoc) => `${doc.id}-${doc?.document_path}`,
    []
  );

  const renderRecord = useCallback(
    ({ item: doc }: { item: IEmrListDoc }) => (
      <HealthRecordItemCard
        title={doc?.title}
        date={formatDate(doc?.created_at, 'DD MMM YYYY')}
        fileSize={doc?.file_size || 'N/A'}
        format={getFileType(doc?.document_path) || ''}
        isAllowDelete={Boolean(doc?.created_by == userData?.id)}
        onDelete={() => {
          handleDeleteEmr(Number(doc?.id));
        }}
        onShare={() => {
          setShareDoc(doc);
        }}
        onView={() => {
          setSelectedDoc(doc);
        }}
      />
    ),
    [handleDeleteEmr, userData?.id]
  );

  return (
    <SafeAreaWrapper
      showBottomBar={true}
      header={
        <Header
          isBackBtn={true}
          title={folderName}
          onBackPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate(AppRoute.HEALTH_RECORDS);
            }
          }}
          rightAction={
            <TouchableOpacity
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={handleToggleSearch}
            >
              <SearchIcon
                size={22}
                color={isSearchOpen ? theme.colors.primaryDark : theme.colors.primary}
              />
            </TouchableOpacity>
          }
        />
      }
    >
      <FlatList
        data={records}
        keyExtractor={recordKeyExtractor}
        renderItem={renderRecord}
        initialNumToRender={8}
        windowSize={5}
        removeClippedSubviews
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
        ListHeaderComponent={
          <>
            {isSearchOpen && (
              <View style={healthRecordsStyles.folderSearchRow}>
                <View style={healthRecordsStyles.folderSearchBox}>
                  <SearchIcon size={18} color={theme.colors.textMuted} />
                  <TextInput
                    style={healthRecordsStyles.folderSearchInput}
                    placeholder="Search by document name..."
                    placeholderTextColor={theme.colors.textMuted}
                    value={search}
                    onChangeText={setSearch}
                    returnKeyType="search"
                    autoCorrect={false}
                    autoCapitalize="none"
                    autoFocus
                    onSubmitEditing={() => Keyboard.dismiss()}
                    selectionColor={theme.colors.primary}
                  />
                  {search.length > 0 && (
                    <TouchableOpacity
                      style={healthRecordsStyles.folderSearchClearBtn}
                      onPress={handleClearSearch}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <CircleXIcon size={16} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity
                  style={healthRecordsStyles.folderSearchCancelBtn}
                  onPress={handleToggleSearch}
                  activeOpacity={0.7}
                >
                  <Text style={healthRecordsStyles.folderSearchCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
            {!isLoading && !isError ? (
              <View style={healthRecordsStyles.folderHeaderBanner}>
                <View
                  style={[
                    healthRecordsStyles.folderBannerIconWrap,
                    { backgroundColor: visualConfig.iconBgColor },
                  ]}
                >
                  {visualConfig.renderIcon()}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={healthRecordsStyles.folderBannerTitle}>{folderName}</Text>
                  <Text style={healthRecordsStyles.folderBannerSubtitle}>
                    {catWiseEmrs?.length || 0} {catWiseEmrs?.length === 1 ? 'document' : 'documents'}{' '}
                    {search.trim().length > 0 ? 'found' : 'in this folder'}
                  </Text>
                </View>
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={
          isLoading && !refreshing ? (
            <HealthRecordFolderSkeleton />
          ) : isError ? (
            <CommonErrorCard
              title="Unable to Load Documents"
              message="Something went wrong while fetching your health records for this folder."
              onRetry={refetch}
            />
          ) : search.trim().length > 0 ? (
            <View style={healthRecordsStyles.emptySearchWrap}>
              <View style={healthRecordsStyles.emptySearchIcon}>
                <SearchIcon size={28} color={theme.colors.primary} />
              </View>
              <Text style={healthRecordsStyles.emptySearchTitle}>No Documents Found</Text>
              <Text style={healthRecordsStyles.emptySearchSubtitle}>
                No documents match &quot;{search.trim()}&quot; in this folder.
              </Text>
              <TouchableOpacity
                style={healthRecordsStyles.emptySearchBtn}
                onPress={handleClearSearch}
                activeOpacity={0.8}
              >
                <Text style={healthRecordsStyles.emptySearchBtnText}>Clear Search</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={healthRecordsStyles.emptyWrap}>
              <View style={healthRecordsStyles.emptyIcon}>
                <FolderIcon size={34} color={theme.colors.primary} />
              </View>
              <Text style={healthRecordsStyles.emptyTitle}>No Documents Yet</Text>
              <Text style={healthRecordsStyles.emptySubtitle}>
                You haven&apos;t uploaded any documents in this category yet.
              </Text>
              <TouchableOpacity
                style={healthRecordsStyles.emptyBtn}
                onPress={handleNavigateUpload}
                activeOpacity={0.8}
              >
                <Text style={healthRecordsStyles.emptyBtnText}>Upload Document</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />

      <TouchableOpacity
        style={[healthRecordsStyles.fabButton, { bottom: getBottomBarHeight(insets.bottom) + 16 }]}
        onPress={handleNavigateUpload}
        activeOpacity={0.85}
      >
        <PlusIcon size={28} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>

      <EmrDetailsModal
        visible={Boolean(selectedDoc)}
        document={selectedDoc}
        onOpenDocument={handleOpenDocument}
        onSaveToDevice={handleSaveToDevice}
        onDownload={handleDownloadDocument}
        onClose={() => setSelectedDoc(null)}
      />

      <ShareEMRModals
        visible={Boolean(shareDoc)}
        document={shareDoc}
        onClose={() => setShareDoc(null)}
      />
    </SafeAreaWrapper>
  );
};

export default HealthRecordFolderScreen;
