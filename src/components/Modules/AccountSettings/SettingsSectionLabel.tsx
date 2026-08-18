import React from 'react';
import { Text } from 'react-native';
import { settingStyles } from '../../../styled/SettingScreen.styled';

export interface SettingsSectionLabelProps {
  title: string;
}

export const SettingsSectionLabel: React.FC<SettingsSectionLabelProps> = ({ title }) => {
  return <Text style={settingStyles.sectionHeader}>{title}</Text>;
};

export default SettingsSectionLabel;
