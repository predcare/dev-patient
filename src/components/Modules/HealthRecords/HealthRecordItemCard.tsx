import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { healthRecordsStyles } from '../../../styled/HealthRecordsScreen.styled';
import { theme } from '../../../styled/theme.styled';
import { GalleryIcon, ShareIcon, TrashIcon } from '../../ui/icons';

export interface HealthRecordItemCardProps {
  title: string;
  date: string;
  fileSize: string;
  isAllowDelete: boolean;
  format: string;
  onView?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
}

export const HealthRecordItemCard: React.FC<HealthRecordItemCardProps> = ({
  date,
  title,
  fileSize,
  format,
  onView,
  onShare,
  onDelete,
  isAllowDelete,
}) => {
  return (
    <View style={healthRecordsStyles.docItemCard}>
      <View style={healthRecordsStyles.docItemTopRow}>
        <View style={healthRecordsStyles.docItemIconBox}>
          <GalleryIcon size={22} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={healthRecordsStyles.docItemTitle}>{title}</Text>
          <Text style={healthRecordsStyles.docItemMeta}>
            {date} • {fileSize} • {format}
          </Text>
        </View>
      </View>
      <View style={healthRecordsStyles.docItemActionsRow}>
        <TouchableOpacity
          style={healthRecordsStyles.docItemViewBtn}
          onPress={onView}
          activeOpacity={0.8}
        >
          <Text style={healthRecordsStyles.docItemViewBtnText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[healthRecordsStyles.docItemCircleBtn, healthRecordsStyles.docItemShareBtn]}
          onPress={onShare}
          activeOpacity={0.7}
        >
          <ShareIcon size={18} color={theme.colors.primary} />
        </TouchableOpacity>
        {isAllowDelete && (
          <TouchableOpacity
            style={[healthRecordsStyles.docItemCircleBtn, healthRecordsStyles.docItemDeleteBtn]}
            onPress={onDelete}
            activeOpacity={0.7}
          >
            <TrashIcon size={18} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default HealthRecordItemCard;
