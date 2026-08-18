import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { settingStyles } from '../../../styled/SettingScreen.styled';

export interface SettingsRowItemProps {
  icon?: React.ReactNode;
  iconText?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightContent?: React.ReactNode;
  danger?: boolean;
}

export const SettingsRowItem: React.FC<SettingsRowItemProps> = ({
  icon,
  iconText,
  title,
  subtitle,
  onPress,
  rightContent,
  danger = false,
}) => {
  return (
    <TouchableOpacity
      style={[settingStyles.settingsRow, danger && settingStyles.settingsRowDanger]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={[settingStyles.rowIcon, danger && settingStyles.rowIconDanger]}>
        {icon ?? <Text style={{ fontSize: 18 }}>{iconText ?? '⚙️'}</Text>}
      </View>
      <View style={settingStyles.rowBody}>
        <Text style={[settingStyles.rowTitle, danger && settingStyles.rowTitleDanger]}>
          {title}
        </Text>
        {subtitle ? <Text style={settingStyles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={settingStyles.rowRight}>
        {rightContent ?? (onPress ? <Text style={settingStyles.rowArrow}>›</Text> : null)}
      </View>
    </TouchableOpacity>
  );
};

export default SettingsRowItem;
