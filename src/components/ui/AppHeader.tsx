import { useNavigation } from '@react-navigation/native';
import React, { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { theme } from '../../styled/theme.styled';
import { BackIcon } from './icons';

export type AppHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
  right?: ReactNode;
  border?: boolean;
  backgroundColor?: string;
  titleColor?: string;
  style?: ViewStyle;
};

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  onBack,
  showBack = true,
  right,
  border = true,
  backgroundColor = theme.colors.surface,
  titleColor = theme.colors.textPrimary,
  style,
}) => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor,
          borderBottomWidth: border ? 1 : 0,
          borderBottomColor: border ? theme.colors.surfaceBorder : 'transparent',
        },
        style,
      ]}
    >
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <BackIcon size={24} color={titleColor} />
          </TouchableOpacity>
        ) : (
          <View style={styles.sideSlot} />
        )}

        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.sideSlot}>{right}</View>
      </View>
    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.colors.surface,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 52,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideSlot: {
    minWidth: 40,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  titleBlock: {
    flex: 1,
    marginLeft: 4,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
});
