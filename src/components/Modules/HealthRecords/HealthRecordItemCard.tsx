import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { healthRecordsStyles } from '../../../styled/HealthRecordsScreen.styled';
import { theme } from '../../../styled/theme.styled';
import { GalleryIcon, ShareIcon, TrashIcon } from '../../ui/icons';

export interface HealthRecordDocItem {
  id: string;
  title: string;
  date: string;
  size: string;
  format: string;
  url?: string;
}

export interface HealthRecordItemCardProps {
  item: HealthRecordDocItem;
  onView?: (item: HealthRecordDocItem) => void;
  onShare?: (item: HealthRecordDocItem) => void;
  onDelete?: (item: HealthRecordDocItem) => void;
}

export const HealthRecordItemCard: React.FC<HealthRecordItemCardProps> = ({
  item,
  onView,
  onShare,
  onDelete,
}) => {
  return (
    <View style={healthRecordsStyles.docItemCard}>
      <View style={healthRecordsStyles.docItemTopRow}>
        <View style={healthRecordsStyles.docItemIconBox}>
          <GalleryIcon size={22} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={healthRecordsStyles.docItemTitle}>{item.title}</Text>
          <Text style={healthRecordsStyles.docItemMeta}>
            {item.date} • {item.size} • {item.format}
          </Text>
        </View>
      </View>
      <View style={healthRecordsStyles.docItemActionsRow}>
        <TouchableOpacity
          style={healthRecordsStyles.docItemViewBtn}
          onPress={() => onView?.(item)}
          activeOpacity={0.8}
        >
          <Text style={healthRecordsStyles.docItemViewBtnText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[healthRecordsStyles.docItemCircleBtn, healthRecordsStyles.docItemShareBtn]}
          onPress={() => onShare?.(item)}
          activeOpacity={0.7}
        >
          <ShareIcon size={18} color={theme.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[healthRecordsStyles.docItemCircleBtn, healthRecordsStyles.docItemDeleteBtn]}
          onPress={() => onDelete?.(item)}
          activeOpacity={0.7}
        >
          <TrashIcon size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HealthRecordItemCard;
