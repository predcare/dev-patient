import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FileViewer from 'react-native-file-viewer';
import {
  PrescriptionCard,
  PrescriptionFilterModal,
  PrescriptionFilterValues,
  RxDatePreset,
} from '../../components/Modules/Prescriptions';
import PrescriptionsSkeleton from '../../components/Skeletons/PrescriptionsSkeleton';
import { FilterIcon, PrescriptionIcon, SearchIcon } from '../../components/ui/icons';
import { useDebounce } from '../../hooks/commons/useDebounce';
import {
  IRxParamQuery,
  RxDateFilter,
  RxStatus,
} from '../../hooks/react-query/prescriptions/prescriptions.funcs';
import {
  useDownloadPrescriptionPdf,
  useGetPrescriptionsInfinite,
} from '../../hooks/react-query/prescriptions/prescriptions.hooks';
import { Header } from '../../Layout/Header';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import { formatDate } from '../../lib/common/common.utils';
import { showErrorToast } from '../../lib/common/toast.utils';
import { AppRoute } from '../../route';
import { prescriptionsStyles } from '../../styled/PrescriptionsScreen.styled';
import { theme } from '../../styled/theme.styled';

export interface IRxFilterState {
  limit: number;
  search: string;
  status?: RxStatus;
  date_filter?: RxDateFilter;
  from_date?: string;
  to_date?: string;
  doctorQuery?: string;
}

const DefualtFilterState: IRxFilterState = {
  limit: 10,
  search: '',
  status: 'sent',
  date_filter: undefined,
  from_date: undefined,
  to_date: undefined,
  doctorQuery: '',
};

export const PrescriptionsListScreen: React.FC = () => {
  const navigation = useNavigation();
  const flatListRef = React.useRef<FlatList>(null);
  const [filterStates, setFilterStates] = useState<IRxFilterState>(DefualtFilterState);
  const [filterVisible, setFilterVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingRxId, setDownloadingRxId] = useState<number | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const debounceSearch = useDebounce(filterStates.search?.trim(), 500);

  const queryParams = useMemo<Omit<IRxParamQuery, 'page'>>(
    () => ({
      limit: filterStates.limit,
      status: filterStates.status,
      search: debounceSearch || undefined,
      date_filter: filterStates.date_filter,
      from_date: filterStates.from_date,
      to_date: filterStates.to_date,
    }),
    [
      filterStates.limit,
      filterStates.status,
      filterStates.date_filter,
      filterStates.from_date,
      filterStates.to_date,
      debounceSearch,
    ]
  );

  const {
    data: rxPagesData,
    isLoading: allRxLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch: refetchAllRx,
  } = useGetPrescriptionsInfinite(queryParams);

  const allPrescriptions = useMemo(() => {
    return rxPagesData?.pages?.flatMap(page => page.data || []) || [];
  }, [rxPagesData]);

  const { mutate: downloadPdfMutation, isPending: downloadPdfLoading } =
    useDownloadPrescriptionPdf();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchAllRx();
    setRefreshing(false);
  }, [refetchAllRx]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleClearFilters = useCallback(() => {
    setFilterStates(DefualtFilterState);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const updateFilterStates = useCallback((patch: Partial<IRxFilterState>) => {
    setFilterStates(prev => ({
      ...prev,
      ...patch,
    }));
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const isFilterActive = Boolean(
    filterStates.date_filter ||
      filterStates.from_date ||
      filterStates.to_date ||
      filterStates.doctorQuery
  );

  const modalInitialValues = useMemo<PrescriptionFilterValues>(
    () => ({
      doctorQuery: filterStates.doctorQuery || '',
      datePreset: (filterStates.date_filter as RxDatePreset) || null,
      customFrom: filterStates.from_date || '',
      customTo: filterStates.to_date || '',
    }),
    [
      filterStates.doctorQuery,
      filterStates.date_filter,
      filterStates.from_date,
      filterStates.to_date,
    ]
  );

  const handleApplyModalFilters = useCallback(
    (values: PrescriptionFilterValues) => {
      updateFilterStates({
        doctorQuery: values.doctorQuery,
        search: values.doctorQuery ? values.doctorQuery : filterStates.search,
        date_filter: (values.datePreset as RxDateFilter) || undefined,
        from_date: values.customFrom || undefined,
        to_date: values.customTo || undefined,
      });
      setFilterVisible(false);
    },
    [filterStates.search, updateFilterStates]
  );

  const handleViewInfo = (rxId: number) => {
    if (!rxId) return showErrorToast('Something went wrong');
    navigation.navigate(AppRoute.PRESCRIPTION_DETAIL, {
      prescriptionId: rxId,
    });
  };

  const handleDownloadPDF = useCallback(
    (id: number) => {
      if (!id) {
        showErrorToast('Prescription ID is missing', 'Download Failed');
        return;
      }
      setDownloadingRxId(id);
      setDownloadProgress(0);
      downloadPdfMutation(
        {
          id: id,
          onProgress: setDownloadProgress,
        },
        {
          onSuccess: async localPath => {
            if (localPath) {
              try {
                await FileViewer.open(localPath, {
                  showOpenWithDialog: true,
                  showAppsSuggestions: true,
                });
              } catch (error) {
                console.error(error);
                showErrorToast('Failed to open PDF viewer');
              }
            }
            setDownloadingRxId(null);
            setDownloadProgress(0);
          },
          onError: err => {
            console.error(err);
            setDownloadingRxId(null);
            setDownloadProgress(0);
          },
        }
      );
    },
    [downloadPdfMutation]
  );

  return (
    <SafeAreaWrapper
      style={prescriptionsStyles.screen}
      showBottomBar={true}
      activeBottomTab="Reports"
      isPathClear={true}
    >
      <Header greeting="Rx Prescriptions" userName="My Medical Records" />
      <FlatList
        ref={flatListRef}
        data={allRxLoading && !refreshing ? [] : allPrescriptions}
        keyExtractor={item => String(item.prescription_id || item.id)}
        contentContainerStyle={prescriptionsStyles.listContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View style={prescriptionsStyles.searchRow}>
            <View style={prescriptionsStyles.searchBox}>
              <SearchIcon size={18} color={theme.colors.textMuted} />
              <TextInput
                style={prescriptionsStyles.searchInput}
                placeholder="Search prescriptions..."
                placeholderTextColor={theme.colors.textMuted}
                value={filterStates.search}
                onChangeText={text => updateFilterStates({ search: text })}
                returnKeyType="search"
                autoCorrect={false}
              />
            </View>
            <TouchableOpacity
              style={[
                prescriptionsStyles.filterBtn,
                isFilterActive && prescriptionsStyles.filterBtnActive,
              ]}
              onPress={() => setFilterVisible(true)}
              activeOpacity={0.8}
            >
              <FilterIcon
                size={20}
                color={isFilterActive ? theme.colors.surface : theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const itemId = Number(item.id);
          const isDownloading = downloadPdfLoading && downloadingRxId === itemId;

          return (
            <PrescriptionCard
              doctorName={item.doctor_info?.name || ''}
              rxNumber={item.prescription_id || ''}
              consultationDate={formatDate(item.email_sent_at, 'DD') || ''}
              consultationDateLabel={formatDate(item.email_sent_at, 'MMM') || ''}
              date={formatDate(item.email_sent_at, 'DD-MMM-YYYY') || ''}
              isDownloading={isDownloading}
              downloadProgress={isDownloading ? downloadProgress : 0}
              onView={() => handleViewInfo(itemId)}
              onDownload={() => {
                handleDownloadPDF(itemId);
              }}
            />
          );
        }}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={{ paddingVertical: 16, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          allRxLoading && !refreshing ? (
            <PrescriptionsSkeleton />
          ) : (
            <View style={prescriptionsStyles.emptyWrap}>
              <View style={prescriptionsStyles.emptyIcon}>
                <PrescriptionIcon size={32} color={theme.colors.primary} />
              </View>
              <Text style={prescriptionsStyles.emptyTitle}>No Matching Prescriptions</Text>
              <Text style={prescriptionsStyles.emptySubtitle}>
                Try another search query or clear active filters.
              </Text>
              <TouchableOpacity style={prescriptionsStyles.refreshBtn} onPress={handleClearFilters}>
                <Text style={prescriptionsStyles.refreshText}>Clear Filters</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
      <PrescriptionFilterModal
        visible={filterVisible}
        initialValues={modalInitialValues}
        onClose={() => setFilterVisible(false)}
        onApply={handleApplyModalFilters}
      />
    </SafeAreaWrapper>
  );
};

export default PrescriptionsListScreen;
