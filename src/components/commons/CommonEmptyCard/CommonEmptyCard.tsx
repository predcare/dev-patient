import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export interface CommonEmptyCardProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

const DefaultEmptyIcon = () => (
  <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
    <Rect
      x="3"
      y="4"
      width="18"
      height="16"
      rx="3"
      stroke="#0F766E"
      strokeWidth="1.8"
      strokeDasharray="3 3"
    />
    <Path d="M8 12H16M10 16H14" stroke="#0F766E" strokeWidth="1.8" strokeLinecap="round" />
    <Circle cx="12" cy="8" r="1.5" fill="#0F766E" />
  </Svg>
);

export default function CommonEmptyCard({
  title = 'No Data Found',
  message = 'There are no items to display right now.',
  icon,
  actionText,
  onAction,
  containerStyle,
}: CommonEmptyCardProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.iconCircle}>{icon ? icon : <DefaultEmptyIcon />}</View>

      <Text style={styles.titleText}>{title}</Text>

      {message ? <Text style={styles.messageText}>{message}</Text> : null}

      {onAction && actionText ? (
        <TouchableOpacity style={styles.actionButton} onPress={onAction} activeOpacity={0.8}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    margin: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  titleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 4,
    maxWidth: 280,
  },
  actionButton: {
    marginTop: 16,
    backgroundColor: '#0F766E',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
