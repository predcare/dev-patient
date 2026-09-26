import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useInfiniteNotifications } from '../../../hooks/react-query/notifications/notifications.hooks';
import { formatActionTitle, formatTimeAgo } from '../../../lib/common/common.utils';
import { theme } from '../../../styled/theme.styled';
import { IMetadata } from '../../../typescripts/interfaces/notification.interfaces';
import { BellIcon, CircleXIcon } from '../../ui/icons';

export interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  fetching?: boolean;
  onRefresh?: () => void;
}

const parseMetadata = (metadata: any): IMetadata => {
  if (!metadata) return {};
  if (typeof metadata === 'object') return metadata;
  try {
    return JSON.parse(metadata);
  } catch {
    return {};
  }
};

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
  fetching: propsFetching,
  onRefresh: propsOnRefresh,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    data: infiniteData,
    isLoading: isQueryLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteNotifications(15);

  const notificationsList = useMemo(() => {
    const pages = infiniteData?.pages || [];
    return pages.flatMap(page => (Array.isArray(page?.data) ? page.data : []));
  }, [infiniteData]);

  const isLoading = propsFetching !== undefined ? propsFetching : isQueryLoading;

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    if (propsOnRefresh) {
      propsOnRefresh();
    } else {
      refetch();
    }
    setIsRefreshing(false);
  }, [propsOnRefresh, refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  console.log('notificationsList', notificationsList)

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={NotifificationModalStyles.overlay}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View style={NotifificationModalStyles.container}>
              <View style={NotifificationModalStyles.handle} />
              <View style={NotifificationModalStyles.header}>
                <View style={NotifificationModalStyles.headerTitleRow}>
                  <BellIcon size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                  <Text style={NotifificationModalStyles.headerTitle}>Notifications</Text>
                  {notificationsList.length > 0 && (
                    <View style={NotifificationModalStyles.badge}>
                      <Text style={NotifificationModalStyles.badgeText}>
                        {notificationsList.length}
                      </Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  activeOpacity={0.7}
                  style={NotifificationModalStyles.closeBtn}
                >
                  <CircleXIcon size={22} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>
              {isLoading && notificationsList.length === 0 ? (
                <View style={NotifificationModalStyles.loadingState}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={NotifificationModalStyles.loadingText}>
                    Loading notifications...
                  </Text>
                </View>
              ) : notificationsList.length === 0 ? (
                <View style={NotifificationModalStyles.emptyState}>
                  <View style={NotifificationModalStyles.emptyIconCircle}>
                    <BellIcon size={32} color={theme.colors.primary} />
                  </View>
                  <Text style={NotifificationModalStyles.emptyTitle}>No New Notifications</Text>
                  <Text style={NotifificationModalStyles.emptySubtitle}>
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
                      <View style={NotifificationModalStyles.footerLoader}>
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                      </View>
                    ) : (
                      <View style={{ height: 20 }} />
                    )
                  }
                  contentContainerStyle={NotifificationModalStyles.listContent}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => {
                    const meta = parseMetadata(item.metadata);
                    const title = formatActionTitle(item.event_action, item.event_category);
                    const appointmentRef = meta.appointment_id;
                    const changedBy = meta.changed_by || meta.doctor_name;
                    const newStatus = meta.new_status;
                    return (
                      <TouchableOpacity
                        style={[NotifificationModalStyles.notifCard]}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            NotifificationModalStyles.iconCircle,
                            { backgroundColor: theme.colors.primary },
                          ]}
                        >
                          {<BellIcon size={18} color="white" />}
                        </View>

                        <View style={NotifificationModalStyles.notifBody}>
                          <View style={NotifificationModalStyles.notifHeaderRow}>
                            <Text style={NotifificationModalStyles.notifTitle} numberOfLines={1}>
                              {title}
                            </Text>
                          </View>

                          <Text style={NotifificationModalStyles.notifDesc} numberOfLines={3}>
                            {item.description}
                          </Text>
                          {(appointmentRef || changedBy || newStatus) && (
                            <View style={NotifificationModalStyles.chipsContainer}>
                              {appointmentRef && (
                                <View style={NotifificationModalStyles.chipPill}>
                                  <Text style={NotifificationModalStyles.chipText}>
                                    #{appointmentRef}
                                  </Text>
                                </View>
                              )}
                              {newStatus && (
                                <View
                                  style={[
                                    NotifificationModalStyles.chipPill,
                                    newStatus === 'completed'
                                      ? NotifificationModalStyles.successChip
                                      : newStatus === 'cancelled'
                                      ? NotifificationModalStyles.dangerChip
                                      : NotifificationModalStyles.accentChip,
                                  ]}
                                >
                                  <Text
                                    style={[
                                      NotifificationModalStyles.chipText,
                                      newStatus === 'completed'
                                        ? NotifificationModalStyles.successChipText
                                        : newStatus === 'cancelled'
                                        ? NotifificationModalStyles.dangerChipText
                                        : NotifificationModalStyles.accentChipText,
                                    ]}
                                  >
                                    {newStatus.replace('_', ' ')}
                                  </Text>
                                </View>
                              )}
                              {changedBy && (
                                <View style={NotifificationModalStyles.chipPill}>
                                  <Text
                                    style={NotifificationModalStyles.chipText}
                                    numberOfLines={1}
                                  >
                                    By {changedBy}
                                  </Text>
                                </View>
                              )}
                            </View>
                          )}

                          <Text style={NotifificationModalStyles.notifTime}>
                            {formatTimeAgo(item.created_at)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export const NotifificationModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    maxHeight: '85%',
    minHeight: '50%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.surfaceBorder,
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  badge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.surface,
  },
  closeBtn: {
    padding: 4,
  },
  loadingState: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: theme.colors.textSlate,
    textAlign: 'center',
    lineHeight: 18,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 36,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.background,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  unreadCard: {
    borderColor: theme.colors.primary + '35',
    backgroundColor: theme.colors.surface,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notifBody: {
    flex: 1,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginLeft: 6,
  },
  notifDesc: {
    fontSize: 12,
    color: theme.colors.textSlate,
    lineHeight: 17,
    marginBottom: 6,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  chipPill: {
    backgroundColor: theme.colors.surfaceBorder + '50',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  successChip: {
    backgroundColor: '#ECFDF5',
  },
  successChipText: {
    color: '#059669',
  },
  dangerChip: {
    backgroundColor: '#FEF2F2',
  },
  dangerChipText: {
    color: '#DC2626',
  },
  accentChip: {
    backgroundColor: theme.colors.primarySoft,
  },
  accentChipText: {
    color: theme.colors.primary,
  },
  notifTime: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  footerLoader: {
    paddingVertical: 12,
    alignItems: 'center',
  },
});

export default NotificationModal;
