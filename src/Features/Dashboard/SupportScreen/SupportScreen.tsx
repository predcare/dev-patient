import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getBottomBarHeight } from '../../../components/commons/CustomBottomBar/CustomBottomBar';
import CustomTabs from '../../../components/ui/CustomTabs/CustomTabs';
import { CheckBadgeIcon, FileTextIcon, PlusIcon } from '../../../components/ui/icons';
import { SupportTicketQueryKeys } from '../../../hooks/react-query/query.keys';
import {
  useDeleteSupportTicket,
  useGetMySupportTicketsInfinite,
} from '../../../hooks/react-query/support-tickets/support-tickets.hooks';
import Header from '../../../Layout/Header';
import SafeAreaWrapper from '../../../Layout/SafeAreaWrapper';
import { showErrorToast, showSuccessToast } from '../../../lib/common/toast.utils';
import { AppRoute } from '../../../route';
import supportStyles, { SupportScreenlocalStyles } from '../../../styled/SupportScreen.styled';
import theme from '../../../styled/theme.styled';
import { ISupportTicket } from '../../../typescripts/interfaces/support-tickets.interfaces';
import { useAlertStore } from '../../../zustand/stores/useAlertStore';
import { useLoadingStore } from '../../../zustand/stores/useLoadingStore';
import SupportTicketCard from './Components/SupportTicketCard';
import SupportTicketsSkeleton from './Skeletons/SupportTicketsSkeleton';

type TicketTabKey = 'open' | 'closed';

export const SupportScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList<ISupportTicket>>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tab, setTab] = useState<TicketTabKey>('open');

  const { showLoader, hideLoader } = useLoadingStore();
  const showConfirm = useAlertStore(state => state.showConfirm);
  const { mutate: deleteTicket } = useDeleteSupportTicket();

  const queryParams = useMemo(
    () => ({
      status: tab,
      limit: 10,
    }),
    [tab]
  );

  const {
    data,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useGetMySupportTicketsInfinite(queryParams);

  const tickets: ISupportTicket[] = useMemo(() => {
    return data?.pages?.flatMap(page => page?.data || []) || [];
  }, [data]);

  const handleTabChange = useCallback((newTab: TicketTabKey) => {
    setTab(newTab);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, []);

  const openNew = () => {
    navigation.navigate(AppRoute.NEW_SUPPORT_TICKET);
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const handleTicketPress = (ticket: ISupportTicket) => {
    navigation.navigate(AppRoute.SUPPORT_TICKET_DETAILS, {
      ticketId: String(ticket.id),
    });
  };

  const handleDeleteTicket = useCallback((ticketId: number) => {
    if (!ticketId) {
      showErrorToast(t('support.invalidTicketId'));
      return;
    }
    showConfirm({
      title: t('support.deleteTicketTitle'),
      message: t('support.deleteTicketConfirm', {
        ticketNo: ticketId,
      }),
      buttonText: t('support.yesDelete'),
      cancelText: t('commons.cancel'),
      onConfirm: () => {
        showLoader(t('support.deletingTicket'));
        deleteTicket(ticketId, {
          onSuccess: async res => {
            if (res?.success) {
              showSuccessToast(res?.message || t('support.ticketDeletedSuccess'));
              await queryClient.invalidateQueries({
                queryKey: [SupportTicketQueryKeys.GET_MY_TICKETS],
              });
            }
          },
          onSettled: () => {
            hideLoader();
          },
        });
      },
    });
  },
    [deleteTicket, hideLoader, queryClient, showConfirm, showLoader, t]
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <SafeAreaWrapper
      style={supportStyles.screen}
      headerBackgroundColor={theme.colors.surface}
      showBottomBar={true}
      activeBottomTab="Account"
      isPathClear={true}
      header={
        <Header
          isBackBtn={true}
          title={t('support.supportTickets')}
          onBackPress={() => navigation.goBack()}
        />
      }
    >
      <View style={supportStyles.tabsWrap}>
        <CustomTabs<TicketTabKey>
          tabs={[
            { key: 'open', label: t('support.tabOpen') },
            { key: 'closed', label: t('support.tabClosed') },
          ]}
          activeTab={tab}
          onTabChange={handleTabChange}
          activeColor={theme.colors.primary}
        />
      </View>

      <FlatList
        ref={flatListRef}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        data={tickets}
        keyExtractor={item => String(item.ticket_no)}
        renderItem={({ item }) => (
          <SupportTicketCard
            key={String(item.ticket_no)}
            ticketNo={item.ticket_no}
            subject={item.subject}
            createdAt={item.created_at}
            status={item.status}
            onPress={() => handleTicketPress(item)}
            onDelete={() => handleDeleteTicket(item.id as number)}
          />
        )}
        contentContainerStyle={[supportStyles.scroll]}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          isLoading ? (
            <SupportTicketsSkeleton />
          ) : isError ? (
            <View style={SupportScreenlocalStyles.errorContainer}>
              <Text style={SupportScreenlocalStyles.errorTitle}>
                {t('support.unableToLoadTickets')}
              </Text>
              <Text style={SupportScreenlocalStyles.errorSub}>
                {(error as any)?.message || t('support.errorLoadingTickets')}
              </Text>
              <TouchableOpacity
                style={SupportScreenlocalStyles.retryBtn}
                onPress={() => refetch()}
                activeOpacity={0.85}
              >
                <Text style={SupportScreenlocalStyles.retryBtnTxt}>{t('support.tryAgain')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={SupportScreenlocalStyles.emptyContainer}>
              <View
                style={[
                  SupportScreenlocalStyles.emptyIconWrap,
                  tab === 'closed' && SupportScreenlocalStyles.emptyIconWrapClosed,
                ]}
              >
                {tab === 'open' ? (
                  <FileTextIcon size={32} color={theme.colors.primary} />
                ) : (
                  <CheckBadgeIcon size={32} color={theme.colors.success} />
                )}
              </View>
              <Text style={SupportScreenlocalStyles.emptyTitle}>
                {tab === 'open'
                  ? t('support.noOpenTicketsTitle')
                  : t('support.noResolvedTicketsTitle')}
              </Text>
              <Text style={SupportScreenlocalStyles.emptySub}>
                {tab === 'open'
                  ? t('support.noOpenTicketsDesc')
                  : t('support.noResolvedTicketsDesc')}
              </Text>
              {tab === 'open' && (
                <TouchableOpacity
                  style={SupportScreenlocalStyles.emptyActionBtn}
                  onPress={openNew}
                  activeOpacity={0.85}
                >
                  <PlusIcon size={16} color={theme.colors.surface} />
                  <Text style={SupportScreenlocalStyles.emptyActionTxt}>
                    {t('support.raiseTicket')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={SupportScreenlocalStyles.footerLoader}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : (
            <></>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />

      <TouchableOpacity
        style={[supportStyles.fab, { bottom: getBottomBarHeight(insets.bottom) + 16 }]}
        onPress={openNew}
        activeOpacity={0.85}
      >
        <PlusIcon size={26} color={theme.colors.surface} />
      </TouchableOpacity>
    </SafeAreaWrapper>
  );
};

export default SupportScreen;
