import React, { useRef } from 'react';
import {
  Animated,
  PanResponder,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { formatDate, getInitials } from '../../../lib/common/common.utils';
import { supportStyles } from '../../../styled/SupportScreen.styled';
import { theme } from '../../../styled/theme.styled';
import { CheckIcon, TrashIcon } from '../../ui/icons';

export interface SupportTicketCardProps {
  ticketNo?: string;
  subject?: string;
  createdAt?: string;
  status?: 'open' | 'closed' | string;
  onPress?: () => void;
  onDelete?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

const ACTION_BUTTON_WIDTH = 84;

export const SupportTicketCard: React.FC<SupportTicketCardProps> = ({
  ticketNo = '',
  subject = '',
  createdAt,
  status = 'open',
  onPress,
  onDelete,
  style,
  disabled = false,
}) => {
  const isOpenStatus = status?.toLowerCase() === 'open';
  const translateX = useRef(new Animated.Value(0)).current;
  const currentOffset = useRef(0);
  const isOpenSwipe = useRef(false);

  const snapTo = (toValue: number) => {
    isOpenSwipe.current = toValue !== 0;
    currentOffset.current = toValue;
    Animated.spring(translateX, {
      toValue,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const close = () => {
    snapTo(0);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (disabled || !onDelete) return false;
        return (
          Math.abs(gestureState.dx) > 10 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
        );
      },
      onPanResponderGrant: () => {
        translateX.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        let newX = currentOffset.current + gestureState.dx;
        if (newX > 0) newX = 0;
        if (newX < -ACTION_BUTTON_WIDTH - 20) newX = -ACTION_BUTTON_WIDTH - 20;
        translateX.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        const finalX = currentOffset.current + gestureState.dx;

        // If swiping right to close or fast velocity towards right
        if (gestureState.vx > 0.3 || gestureState.dx > 25) {
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
    onPress?.();
  };

  const handleDeletePress = () => {
    close();
    onDelete?.();
  };

  return (
    <View style={[styles.container, style]}>
      {/* Background Delete Action */}
      {!!onDelete && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeletePress}
            activeOpacity={0.8}
          >
            <View style={styles.deleteIconWrap}>
              <TrashIcon size={20} color={theme.colors.surface} />
            </View>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Foreground Ticket Card */}
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            transform: [{ translateX }],
          },
        ]}
        {...(onDelete ? panResponder.panHandlers : {})}
      >
        <TouchableOpacity
          style={[supportStyles.card, styles.cardInner]}
          onPress={handleCardPress}
          activeOpacity={0.85}
        >
          <View style={supportStyles.avatar}>
            <Text style={supportStyles.avatarTxt}>{getInitials(ticketNo || subject)}</Text>
          </View>

          <View style={supportStyles.cardBody}>
            <Text style={supportStyles.ticketId} numberOfLines={1}>
              {ticketNo ? (ticketNo.startsWith('#') ? ticketNo : `#${ticketNo}`) : '--'}
            </Text>
            <Text style={supportStyles.subject} numberOfLines={1}>
              {subject || 'No Subject'}
            </Text>
            <Text style={supportStyles.created}>
              Created on {createdAt ? formatDate(createdAt, 'DD MMM YYYY') : '--'}
            </Text>
          </View>

          <View
            style={[
              supportStyles.statusPill,
              isOpenStatus ? supportStyles.statusOpen : supportStyles.statusClosed,
            ]}
          >
            <View
              style={[
                supportStyles.statusDot,
                isOpenStatus ? supportStyles.dotOpen : supportStyles.dotClosed,
              ]}
            >
              {isOpenStatus && <CheckIcon size={10} color={theme.colors.surface} />}
            </View>
            <Text
              style={[
                supportStyles.statusTxt,
                isOpenStatus ? supportStyles.statusTxtOpen : supportStyles.statusTxtClosed,
              ]}
            >
              {isOpenStatus ? 'Open' : 'Closed'}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 12,
  },
  cardInner: {
    marginBottom: 0,
  },
  actionsContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: ACTION_BUTTON_WIDTH,
    justifyContent: 'center',
    alignItems: 'flex-end',
    zIndex: 1,
  },
  deleteButton: {
    width: ACTION_BUTTON_WIDTH - 6,
    height: '100%',
    backgroundColor: theme.colors.danger,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  deleteIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: theme.colors.surface,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cardWrapper: {
    zIndex: 2,
    backgroundColor: 'transparent',
  },
});

export default SupportTicketCard;
