import React, { useRef } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { formatActionTitle, formatTimeAgo } from '../../../lib/common/common.utils';
import { theme } from '../../../styled/theme.styled';
import { IMetadata } from '../../../typescripts/interfaces/notification.interfaces';
import { BellIcon, TrashIcon } from '../../ui/icons';

export interface NotificationCardProps {
  item: any;
  onPress: (item: any) => void;
  onDelete: (id: string | number) => void;
}

const ACTION_BUTTON_WIDTH = 76;

const parseMetadata = (metadata: any): IMetadata => {
  if (!metadata) return {};
  if (typeof metadata === 'object') return metadata;
  try {
    return JSON.parse(metadata);
  } catch {
    return {};
  }
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  item,
  onPress,
  onDelete,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const currentOffset = useRef(0);
  const isOpenSwipe = useRef(false);

  const snapTo = (toValue: number, onEnd?: () => void) => {
    isOpenSwipe.current = toValue !== 0;
    currentOffset.current = toValue;
    Animated.spring(translateX, {
      toValue,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start(() => {
      onEnd?.();
    });
  };

  const close = () => {
    snapTo(0);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dx) > 12 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5
        );
      },
      onPanResponderGrant: () => {
        translateX.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        let newX = currentOffset.current + gestureState.dx;
        if (newX > 0) newX = 0;
        if (newX < -ACTION_BUTTON_WIDTH - 30) newX = -ACTION_BUTTON_WIDTH - 30;
        translateX.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        const finalX = currentOffset.current + gestureState.dx;
        if (finalX < -ACTION_BUTTON_WIDTH * 2) {
          snapTo(-ACTION_BUTTON_WIDTH, () => {
            onDelete(item.id);
          });
        } else if (gestureState.vx > 0.3 || gestureState.dx > 25) {
          snapTo(0);
        } else if (gestureState.vx < -0.3 || finalX < -ACTION_BUTTON_WIDTH / 2) {
          snapTo(-ACTION_BUTTON_WIDTH);
        } else {
          snapTo(0);
        }
      },
      onPanResponderTerminate: () => {
        snapTo(0);
      },
    })
  ).current;

  const handleCardPress = () => {
    if (isOpenSwipe.current) {
      close();
      return;
    }
    onPress(item);
  };

  const handleDeletePress = () => {
    close();
    onDelete(item.id);
  };

  const meta = parseMetadata(item.metadata);
  const title = formatActionTitle(item.event_action, item.event_category);
  const appointmentRef = meta.appointment_ref;
  const changedBy = meta.changed_by || meta.doctor_name;
  const newStatus = meta.new_status;

  return (
    <View style={styles.swipeContainer}>
      <View style={styles.deleteActionWrapper}>
        <TouchableOpacity
          style={styles.deleteActionBtn}
          onPress={handleDeletePress}
          activeOpacity={0.8}
        >
          <TrashIcon size={20} color={theme.colors.surface} />
          <Text style={styles.deleteActionText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.cardWrapper,
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.notifCard}
          activeOpacity={0.7}
          onPress={handleCardPress}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <BellIcon size={18} color="white" />
          </View>

          <View style={styles.notifBody}>
            <View style={styles.notifHeaderRow}>
              <Text style={styles.notifTitle} numberOfLines={1}>
                {title}
              </Text>
            </View>

            <Text style={styles.notifDesc} numberOfLines={3}>
              {item.description}
            </Text>
            {(appointmentRef || changedBy || newStatus) && (
              <View style={styles.chipsContainer}>
                {appointmentRef && (
                  <View style={styles.chipPill}>
                    <Text style={styles.chipText}>#{appointmentRef}</Text>
                  </View>
                )}
                {newStatus && (
                  <View
                    style={[
                      styles.chipPill,
                      newStatus === 'completed'
                        ? styles.successChip
                        : newStatus === 'cancelled'
                          ? styles.dangerChip
                          : styles.accentChip,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        newStatus === 'completed'
                          ? styles.successChipText
                          : newStatus === 'cancelled'
                            ? styles.dangerChipText
                            : styles.accentChipText,
                      ]}
                    >
                      {newStatus.replace('_', ' ')}
                    </Text>
                  </View>
                )}
                {changedBy && (
                  <View style={styles.chipPill}>
                    <Text style={styles.chipText} numberOfLines={1}>
                      By {changedBy}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <Text style={styles.notifTime}>
              {formatTimeAgo(item.created_at)}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  swipeContainer: {
    position: 'relative',
    marginBottom: 10,
    borderRadius: 14,
    overflow: 'hidden',
  },
  deleteActionWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: ACTION_BUTTON_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.danger,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    zIndex: 1,
  },
  deleteActionBtn: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  deleteActionText: {
    color: theme.colors.surface,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cardWrapper: {
    zIndex: 2,
    backgroundColor: theme.colors.surface,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.background,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
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
});

export default React.memo(NotificationCard);
