import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useDeleteNotification,
  useInfiniteNotifications,
  useMarkNoShowNotifications,
} from '../../../hooks/react-query/notifications/notifications.hooks';
import { NotificationQueryKeys } from '../../../hooks/react-query/query.keys';
import { resolveNotificationModalNavigation } from '../../../lib/common/notificationModal.utils';
import { showSuccessToast } from '../../../lib/common/toast.utils';
import notificationModalStyles, {
  NotifificationModalStyles,
} from '../../../styled/NotificationModal.styled';
import { theme } from '../../../styled/theme.styled';
import { queryClient } from '../../providers/ReactQueryProvider';
import { BellIcon, CircleXIcon, TrashIcon } from '../../ui/icons';
import NotificationCard from './NotificationCard';
import NotificationModalSkeleton from './Skeletons/NotificationModalSkeleton';

export interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  fetching?: boolean;
  onRefresh?: () => void;
}

interface ConfirmDialogState {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  loading: boolean;
  onConfirm: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
  fetching: propsFetching,
  onRefresh: propsOnRefresh,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    visible: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    loading: false,
    onConfirm: () => { },
  });

  const {
    data: infiniteData,
    isLoading: isQueryLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteNotifications(15);
  const { mutate: deleteNotificationMutate } = useDeleteNotification();
  const { mutate: mutateNotificationClear } = useMarkNoShowNotifications();

  const notificationsList = useMemo(() => {
    const pages = infiniteData?.pages || [];
    return pages
      .flatMap(page => (Array.isArray(page?.data) ? page.data : []))
      .filter(item => !deletedIds.has(String(item.id)));
  }, [infiniteData, deletedIds]);

  const isLoading = propsFetching !== undefined ? propsFetching : isQueryLoading;

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    if (propsOnRefresh) {
      propsOnRefresh();
    } else {
      await refetch();
    }
    setIsRefreshing(false);
  }, [propsOnRefresh, refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleNotificationPress = useCallback(
    (item: any) => {
      onClose();
      const target = resolveNotificationModalNavigation(item);
      if (target?.name) {
        navigation.navigate(target.name, target.params);
      }
    },
    [navigation, onClose]
  );

  const handleDeleteNotification = useCallback(
    (notificationId: string | number) => {
      setConfirmDialog({
        visible: true,
        title: 'Delete Notification',
        message: 'Are you sure you want to delete this notification? This action cannot be undone.',
        confirmText: 'Delete',
        loading: false,
        onConfirm: () => {
          setConfirmDialog(prev => ({ ...prev, loading: true }));
          const idStr = String(notificationId);
          deleteNotificationMutate(notificationId, {
            onSuccess: async res => {
              if (res?.success) {
                setDeletedIds(prev => new Set(prev).add(idStr));
                await queryClient.invalidateQueries({
                  queryKey: [NotificationQueryKeys.NotificationCount],
                });
                await refetch();
                showSuccessToast('Notification deleted successfully');
              }
            },
            onSettled: () => {
              setConfirmDialog(prev => ({ ...prev, visible: false, loading: false }));
            },
          });
        },
      });
    },
    [deleteNotificationMutate, refetch]
  );

  const handleClearAll = useCallback(() => {
    setConfirmDialog({
      visible: true,
      title: 'Clear All Notifications',
      message: 'Are you sure you want to clear all notifications? This action cannot be undone.',
      confirmText: 'Clear All',
      loading: false,
      onConfirm: () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        mutateNotificationClear(undefined, {
          onSuccess: async res => {
            if (res?.success) {
              await queryClient.invalidateQueries({
                queryKey: [NotificationQueryKeys.NotificationCount],
              });
              await refetch();
              showSuccessToast('All notifications cleared');
            }
          },
          onSettled: () => {
            setConfirmDialog(prev => ({ ...prev, visible: false, loading: false }));
          },
        });
      },
    });
  }, [mutateNotificationClear, refetch]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        style={[
          notificationModalStyles.container,
          { paddingTop: Math.max(insets.top, 16) },
        ]}
      >
        <View style={notificationModalStyles.header}>
          <View style={notificationModalStyles.headerTitleRow}>
            <BellIcon size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
            <Text style={notificationModalStyles.headerTitle}>Notifications</Text>
            {notificationsList.length > 0 && (
              <View style={notificationModalStyles.badge}>
                <Text style={notificationModalStyles.badgeText}>
                  {notificationsList.length}
                </Text>
              </View>
            )}
          </View>
          <View style={notificationModalStyles.headerActionsRow}>
            {notificationsList.length > 0 && (
              <TouchableOpacity
                onPress={handleClearAll}
                activeOpacity={0.7}
                style={notificationModalStyles.clearAllBtn}
              >
                <Text style={notificationModalStyles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              style={notificationModalStyles.closeBtn}
            >
              <CircleXIcon size={22} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {isLoading && notificationsList.length === 0 ? (
          <NotificationModalSkeleton />
        ) : notificationsList.length === 0 ? (
          <View style={notificationModalStyles.emptyState}>
            <View style={notificationModalStyles.emptyIconCircle}>
              <BellIcon size={32} color={theme.colors.primary} />
            </View>
            <Text style={notificationModalStyles.emptyTitle}>No New Notifications</Text>
            <Text style={notificationModalStyles.emptySubtitle}>
              You're all caught up! Updates about your consultations, prescriptions, and
              appointments will appear here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={notificationsList}
            keyExtractor={(item, index) => String(item.id || index)}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary]}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={notificationModalStyles.footerLoader}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                </View>
              ) : (
                <View style={{ height: 20 }} />
              )
            }
            contentContainerStyle={[
              notificationModalStyles.listContent,
              { paddingBottom: Math.max(insets.bottom + 20, 36) },
            ]}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <NotificationCard
                item={item}
                onPress={handleNotificationPress}
                onDelete={handleDeleteNotification}
              />
            )}
          />
        )}

        {/* Local Confirmation Modal (renders on top of this native modal) */}
        {confirmDialog.visible && (
          <View style={notificationModalStyles.confirmBackdrop}>
            <View style={notificationModalStyles.confirmBox}>
              <View style={notificationModalStyles.confirmIconCircle}>
                <TrashIcon size={26} color={theme.colors.danger} />
              </View>
              <Text style={notificationModalStyles.confirmTitle}>
                {confirmDialog.title}
              </Text>
              <Text style={notificationModalStyles.confirmMessage}>
                {confirmDialog.message}
              </Text>
              <View style={notificationModalStyles.confirmBtnRow}>
                <TouchableOpacity
                  style={notificationModalStyles.confirmCancelBtn}
                  onPress={() => setConfirmDialog(prev => ({ ...prev, visible: false }))}
                  activeOpacity={0.7}
                  disabled={confirmDialog.loading}
                >
                  <Text style={notificationModalStyles.confirmCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={notificationModalStyles.confirmDeleteBtn}
                  onPress={confirmDialog.onConfirm}
                  activeOpacity={0.7}
                  disabled={confirmDialog.loading}
                >
                  {confirmDialog.loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={notificationModalStyles.confirmDeleteText}>
                      {confirmDialog.confirmText}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

export { notificationModalStyles, NotifificationModalStyles };
export default NotificationModal;
