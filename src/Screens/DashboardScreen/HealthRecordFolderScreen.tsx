import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Linking,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import CommonErrorCard from '../../components/commons/CommonErrorCard/CommonErrorCard';
import { HealthRecordItemCard } from '../../components/Modules/HealthRecords';
import HealthRecordFolderSkeleton from '../../components/Skeletons/HealthRecordFolderSkeleton';
import { AppHeader } from '../../components/ui/AppHeader';
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
} from '../../components/ui/icons';
import { useDebounce } from '../../hooks/commons/useDebounce';
import { useDeleteEMR, useGetCatWiseEmrs } from '../../hooks/react-query/emr/emr.hooks';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import { formatDate, getFileType } from '../../lib/common/common.utils';
import { showErrorToast, showSuccessToast } from '../../lib/common/toast.utils';
import { AppRoute } from '../../route';
import { healthRecordsStyles } from '../../styled/HealthRecordsScreen.styled';
import { theme } from '../../styled/theme.styled';
import { useAlertStore } from '../../zustand/stores/useAlertStore';
import { useAuthStore } from '../../zustand/stores/useAuthStore';
import { useLoadingStore } from '../../zustand/stores/useLoadingStore';

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
  const folderName = route.params?.folderName || '';
  const patinentId = route.params?.patinentId || 0;

  const searchInputRef = useRef<TextInput>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { userData } = useAuthStore(state => state);
  const { showLoader, hideLoader } = useLoadingStore();
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
      if (next) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      } else {
        setSearch('');
      }
      return next;
    });
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearch('');
  }, []);

  const handleNavigateUpload = () => {
    navigation.navigate(AppRoute.UPLOAD_HEALTH_RECORD, {
      initialCategory: folderName,
    });
  };

  const handleView = async (url?: string) => {
    if (!url) return showErrorToast('No Document Found');
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('File Open Error', error);
      showErrorToast('Could not open document');
    }
  };

  const handleDeleteEmr = (id: number) => {
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
  };

  return (
    <SafeAreaWrapper showBottomBar={true} isPathClear>
      <View style={healthRecordsStyles.container}>
        <AppHeader
          title={folderName}
          titleColor={theme.colors.primary}
          showBack={true}
          border={false}
          right={
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
          {isSearchOpen && (
            <View style={healthRecordsStyles.folderSearchRow}>
              <View style={healthRecordsStyles.folderSearchBox}>
                <SearchIcon size={18} color={theme.colors.textMuted} />
                <TextInput
                  ref={searchInputRef}
                  style={healthRecordsStyles.folderSearchInput}
                  placeholder="Search by document name..."
                  placeholderTextColor={theme.colors.textMuted}
                  value={search}
                  onChangeText={setSearch}
                  returnKeyType="search"
                  autoCorrect={true}
                  autoFocus
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

          {isLoading && !refreshing ? (
            <HealthRecordFolderSkeleton />
          ) : isError ? (
            <CommonErrorCard
              title="Unable to Load Documents"
              message="Something went wrong while fetching your health records for this folder."
              onRetry={refetch}
            />
          ) : (
            <View>
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
                    {catWiseEmrs?.length || 0}{' '}
                    {catWiseEmrs?.length === 1 ? 'document' : 'documents'}{' '}
                    {search.trim().length > 0 ? 'found' : 'in this folder'}
                  </Text>
                </View>
              </View>
              {catWiseEmrs?.length === 0 ? (
                search.trim().length > 0 ? (
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
              ) : (
                <View>
                  {catWiseEmrs?.map(doc => (
                    <HealthRecordItemCard
                      key={`${doc.id}-${doc?.document_path}`}
                      title={doc?.title}
                      date={formatDate(doc?.created_at, 'DD MMM YYYY')}
                      fileSize={doc?.file_size || 'N/A'}
                      format={getFileType(doc?.document_path) || ''}
                      isAllowDelete={Boolean(doc?.created_by == userData?.id)}
                      onDelete={() => {
                        handleDeleteEmr(Number(doc?.id));
                      }}
                      onShare={() => {}}
                      onView={() => {
                        handleView(doc?.document_url);
                      }}
                    />
                  ))}
                </View>
              )}
            </View>
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

export default HealthRecordFolderScreen;
