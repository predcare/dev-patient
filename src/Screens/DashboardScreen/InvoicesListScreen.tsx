import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { InvoiceCard, InvoiceDetailsModal } from '../../components/Modules/Invoices';
import { InvoicesSkeleton } from '../../components/Skeletons/InvoicesSkeleton';
import { AppHeader } from '../../components/ui/AppHeader';
import { CircleXIcon, InvoiceIcon, SearchIcon } from '../../components/ui/icons';
import { useDebounce } from '../../hooks/commons/useDebounce';
import {
  useDownloadInvoicePdf,
  useGetAllInvoicesInfinite,
} from '../../hooks/react-query/invoices/invoices.hooks';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import { handleInvoicePdfAction } from '../../lib/common/file.utils';
import { showErrorToast } from '../../lib/common/toast.utils';
import { invoicesStyles } from '../../styled/InvoicesScreen.styled';
import { theme } from '../../styled/theme.styled';
import { useLoadingStore } from '../../zustand/stores/useLoadingStore';

export const InvoicesListScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceid] = useState<number | null>(null);
  const debouncedSearch = useDebounce(searchQuery.trim(), 500);
  const { hideLoader, showLoader } = useLoadingStore(state => state);

  const {
    data: invoicesPagesData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useGetAllInvoicesInfinite({
    search: debouncedSearch || undefined,
    limit: 10,
  });
  const { mutate: downloadPdf } = useDownloadInvoicePdf();

  const allInvoices = useMemo(() => {
    return invoicesPagesData?.pages?.flatMap(page => page?.data || []) || [];
  }, [invoicesPagesData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
  };

  const handleSavePDF = (id: number, genId: string) => {
    if (!id || !genId) {
      showErrorToast('Invoice ID is missing', 'Cannot Download PDF');
      return;
    }
    showLoader('Downloading invoice...');
    downloadPdf(Number(id), {
      onSuccess: bytes => {
        handleInvoicePdfAction({ id, invoice_number: genId }, 'save', bytes);
      },
      onSettled: () => {
        hideLoader();
      },
    });
  };

  return (
    <SafeAreaWrapper backgroundColor={theme.colors.background}>
      <AppHeader
        title={t('invoicesScreen.title', { defaultValue: 'Invoices & Billing' })}
        showBack
        onBack={() => navigation.goBack()}
      />
      <FlatList
        data={isLoading && !refreshing ? [] : allInvoices}
        keyExtractor={item => String(item.invoice_number)}
        renderItem={({ item }) => (
          <InvoiceCard
            onView={() => {
              setSelectedInvoiceid(Number(item.id));
            }}
            onDownload={() => {
              handleSavePDF(Number(item.id), item.invoice_number);
            }}
            invoiceNumber={item.invoice_number}
            date={item.created_at}
            paymentStatus={item.payment_status}
            category={item.category}
            grandTotal={item.grand_total}
            paymentMode={item.payment_mode}
          />
        )}
        ListHeaderComponent={() => {
          return (
            <View style={invoicesStyles.searchRow}>
              <View style={invoicesStyles.searchBox}>
                <SearchIcon size={18} color={theme.colors.textMuted} />
                <TextInput
                  style={invoicesStyles.searchInput}
                  placeholder={t('invoicesScreen.searchPlaceholder', {
                    defaultValue: 'Search by invoice #, appointment...',
                  })}
                  placeholderTextColor={theme.colors.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    style={invoicesStyles.clearBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <CircleXIcon size={16} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={() => {
          if (isLoading && !refreshing) {
            return <InvoicesSkeleton />;
          }
          return (
            <View style={invoicesStyles.emptyState}>
              <View style={invoicesStyles.emptyIconContainer}>
                <InvoiceIcon size={32} color={theme.colors.primary} />
              </View>
              <Text style={invoicesStyles.emptyTitle}>No Invoices Found</Text>
              <Text style={invoicesStyles.emptySubtitle}>
                No invoices match your current search or filter criteria.
              </Text>
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={invoicesStyles.emptyResetBtn}
                  onPress={handleResetFilters}
                  activeOpacity={0.8}
                >
                  <Text style={invoicesStyles.emptyResetBtnText}>Clear Search & Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={{ paddingVertical: 16, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : null
        }
        contentContainerStyle={invoicesStyles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />

      {/* Invoice Details Modal */}
      {selectedInvoiceId && (
        <InvoiceDetailsModal
          visible={Boolean(selectedInvoiceId)}
          invoiceId={selectedInvoiceId}
          onClose={() => {
            setSelectedInvoiceid(null);
          }}
        />
      )}
    </SafeAreaWrapper>
  );
};

export default InvoicesListScreen;
