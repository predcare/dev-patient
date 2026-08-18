import React from 'react';
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
import { theme } from '../../../styled/theme.styled';
import { BellIcon, CircleXIcon } from '../../ui/icons';

export interface NotificationItem {
  id: number | string;
  user_id?: number;
  user_type?: string;
  title?: string;
  description: string;
  event_category?: 'appointment' | 'payment' | 'emr' | 'prescription' | string;
  event_action?: string;
  created_at?: string;
  read?: boolean;
}

export interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  notifications?: NotificationItem[];
  fetching?: boolean;
  onRefresh?: () => void;
  onNotificationPress?: (item: any) => void;
}

const getNotifCategoryIcon = (category?: string, action?: string) => {
  if (category === 'payment') return '💳';
  if (category === 'appointment') return '📅';
  if (category === 'emr') return '📄';
  if (category === 'prescription') return '💊';
  if (action?.includes('cancelled')) return '❌';
  if (action?.includes('confirmed')) return '✅';
  return '🔔';
};

const formatTimeAgo = (dateString?: string) => {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
  notifications = [],
  fetching = false,
  onRefresh,
  onNotificationPress,
}) => {
  const handleItemPress = (item: NotificationItem) => {
    onClose();
    if (onNotificationPress) {
      onNotificationPress(item);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View style={styles.container}>
              <View style={styles.handle} />

              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <BellIcon size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                  <Text style={styles.headerTitle}>Notifications</Text>
                  {notifications.length > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{notifications.length}</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeBtn}>
                  <CircleXIcon size={22} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Notifications Content */}
              {fetching ? (
                <View style={styles.loadingState}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={styles.loadingText}>Loading notifications...</Text>
                </View>
              ) : notifications.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconCircle}>
                    <Text style={{ fontSize: 32 }}>🔔</Text>
                  </View>
                  <Text style={styles.emptyTitle}>No New Notifications</Text>
                  <Text style={styles.emptySubtitle}>
                    You're all caught up! Updates about your consultations, prescriptions, and payments will appear here.
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={notifications}
                  keyExtractor={item => String(item.id)}
                  refreshControl={
                    onRefresh ? (
                      <RefreshControl
                        refreshing={fetching}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary}
                        colors={[theme.colors.primary]}
                      />
                    ) : undefined
                  }
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.notifCard}
                      activeOpacity={0.8}
                      onPress={() => handleItemPress(item)}
                    >
                      <View style={styles.iconCircle}>
                        <Text style={{ fontSize: 18 }}>
                          {getNotifCategoryIcon(item.event_category, item.event_action)}
                        </Text>
                      </View>

                      <View style={styles.notifBody}>
                        <Text style={styles.notifTitle} numberOfLines={1}>
                          {item.title ||
                            (item.event_action ? item.event_action.replace(/_/g, ' ') : 'Notification')}
                        </Text>
                        <Text style={styles.notifDesc} numberOfLines={2}>
                          {item.description}
                        </Text>
                        <Text style={styles.notifTime}>
                          {formatTimeAgo(item.created_at)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    minHeight: '45%',
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
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  notifBody: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  notifDesc: {
    fontSize: 12,
    color: theme.colors.textSlate,
    lineHeight: 16,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
});

export default NotificationModal;
