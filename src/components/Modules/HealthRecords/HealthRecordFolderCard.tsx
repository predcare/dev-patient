import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ChevronRightIcon } from '../../ui/icons';
import { healthRecordsStyles } from '../../../styled/HealthRecordsScreen.styled';

export interface HealthRecordFolderProps {
  id: string;
  name: string;
  filesCount: number;
  updatedAtText: string;
  iconBgColor?: string;
  renderIcon: () => React.ReactNode;
  onPress?: () => void;
}

export const HealthRecordFolderCard: React.FC<HealthRecordFolderProps> = ({
  name,
  filesCount,
  updatedAtText,
  iconBgColor = '#FDF2F4',
  renderIcon,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={healthRecordsStyles.folderCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[healthRecordsStyles.folderIconWrap, { backgroundColor: iconBgColor }]}>
        {renderIcon()}
      </View>

      <View style={healthRecordsStyles.folderInfo}>
        <Text style={healthRecordsStyles.folderName}>{name}</Text>
        <Text style={healthRecordsStyles.folderMeta}>
          {filesCount} {filesCount === 1 ? 'file' : 'files'} • Updated {updatedAtText}
        </Text>
      </View>

      <ChevronRightIcon size={20} color="#CBD5E1" />
    </TouchableOpacity>
  );
};

export default HealthRecordFolderCard;
