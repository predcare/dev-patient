import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getBottomBarHeight } from '../../components/commons/CustomBottomBar/CustomBottomBar';
import { SupportTicketCard } from '../../components/Modules/Support';
import SupportTicketsSkeleton from '../../components/Skeletons/SupportTicketsSkeleton';
import AppHeader from '../../components/ui/AppHeader';
import CustomTabs from '../../components/ui/CustomTabs/CustomTabs';
import { CheckBadgeIcon, FileTextIcon, PlusIcon } from '../../components/ui/icons';
import { SupportTicketQueryKeys } from '../../hooks/react-query/query.keys';
import {
  useDeleteSupportTicket,
  useGetMySupportTicketsInfinite,
} from '../../hooks/react-query/support-tickets/support-tickets.hooks';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import { showErrorToast, showSuccessToast } from '../../lib/common/toast.utils';
import { AppRoute } from '../../route';
import { SupportScreenlocalStyles, supportStyles } from '../../styled/SupportScreen.styled';
import { theme } from '../../styled/theme.styled';
import { ISupportTicket } from '../../typescripts/interfaces/support-tickets.interfaces';
import { useAlertStore } from '../../zustand/stores/useAlertStore';
import { useLoadingStore } from '../../zustand/stores/useLoadingStore';

type TicketTabKey = 'open' | 'closed';

export const SupportScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList<ISupportTicket>>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { showLoader, hideLoader } = useLoadingStore();
  const showConfirm = useAlertStore(state => state.showConfirm);
  const { mutate: deleteTicket } = useDeleteSupportTicket();

  const bottomBarHeight = getBottomBarHeight(insets.bottom);
  const fabBottom = bottomBarHeight + 16;

  const [tab, setTab] = useState<TicketTabKey>('open');

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

  const handleDeleteTicket = useCallback(
    (ticket: ISupportTicket) => {
      if (!ticket?.id) {
        showErrorToast('Invalid ticket ID');
        return;
      }

      showConfirm({
        title: 'Delete Ticket',
        message: `Are you sure you want to delete ticket #${
          ticket.ticket_no || ticket.id
        }? This action cannot be undone.`,
        buttonText: 'Yes, Delete',
        cancelText: 'Cancel',
        onConfirm: () => {
          showLoader('Deleting ticket...');
          deleteTicket(ticket.id, {
            onSuccess: async res => {
              if (res?.success) {
                showSuccessToast(res?.message || 'Support ticket deleted successfully');
                await queryClient.invalidateQueries({
                  queryKey: [SupportTicketQueryKeys.GET_MY_TICKETS],
                });
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
    },
    [deleteTicket, hideLoader, queryClient, showConfirm, showLoader]
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <SafeAreaWrapper style={supportStyles.screen} showBottomBar isPathClear>
      <AppHeader title="Support Tickets" showBack={true} />
      <View style={supportStyles.tabsWrap}>
        <CustomTabs<TicketTabKey>
          tabs={[
            { key: 'open', label: 'Open' },
            { key: 'closed', label: 'Closed' },
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
        keyExtractor={item => String(item.id || item.ticket_no)}
        renderItem={({ item }) => (
          <SupportTicketCard
            key={String(item.id || item.ticket_no)}
            ticketNo={item.ticket_no}
            subject={item.subject}
            createdAt={item.created_at}
            status={item.status}
            onPress={() => handleTicketPress(item)}
            onDelete={() => handleDeleteTicket(item)}
          />
        )}
        contentContainerStyle={[
          supportStyles.scroll,
          { paddingBottom: fabBottom + 64, flexGrow: 1 },
        ]}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          isLoading ? (
            <SupportTicketsSkeleton />
          ) : isError ? (
            <View style={SupportScreenlocalStyles.errorContainer}>
              <Text style={SupportScreenlocalStyles.errorTitle}>Unable to load tickets</Text>
              <Text style={SupportScreenlocalStyles.errorSub}>
                {(error as any)?.message || 'Something went wrong while fetching your tickets.'}
              </Text>
              <TouchableOpacity
                style={SupportScreenlocalStyles.retryBtn}
                onPress={() => refetch()}
                activeOpacity={0.85}
              >
                <Text style={SupportScreenlocalStyles.retryBtnTxt}>Try Again</Text>
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
                {tab === 'open' ? 'No Open Support Tickets' : 'No Resolved Tickets'}
              </Text>
              <Text style={SupportScreenlocalStyles.emptySub}>
                {tab === 'open'
                  ? 'Have a query or facing an issue? Raise a support ticket and our team will get back to you shortly.'
                  : 'All your resolved and closed support requests will be archived here.'}
              </Text>
              {tab === 'open' && (
                <TouchableOpacity
                  style={SupportScreenlocalStyles.emptyActionBtn}
                  onPress={openNew}
                  activeOpacity={0.85}
                >
                  <PlusIcon size={16} color={theme.colors.surface} />
                  <Text style={SupportScreenlocalStyles.emptyActionTxt}>Raise a Ticket</Text>
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
          ) : null
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
        style={[supportStyles.fab, { bottom: fabBottom }]}
        onPress={openNew}
        activeOpacity={0.85}
      >
        <PlusIcon size={26} color={theme.colors.surface} />
      </TouchableOpacity>
    </SafeAreaWrapper>
  );
};

export default SupportScreen;
