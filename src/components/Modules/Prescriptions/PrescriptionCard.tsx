import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { prescriptionsStyles } from '../../../styled/PrescriptionsScreen.styled';
import { theme } from '../../../styled/theme.styled';
import { FileTextIcon, UploadIcon } from '../../ui/icons';
interface IRxCardProps {
  doctorName: string;
  rxNumber: string;
  consultationDate: string;
  consultationDateLabel: string;
  date: string;
  isDownloading?: boolean;
  downloadProgress?: number;
  onView?: () => void;
  onDownload?: () => void;
}

export const PrescriptionCard: React.FC<IRxCardProps> = ({
  doctorName,
  rxNumber,
  consultationDate,
  consultationDateLabel,
  date,
  isDownloading,
  downloadProgress = 0,
  onView,
  onDownload,
}) => {
  return (
    <TouchableOpacity style={prescriptionsStyles.card} activeOpacity={0.85} onPress={onView}>
      <View style={prescriptionsStyles.dateCol}>
        <Text style={prescriptionsStyles.dateDay}>{consultationDate}</Text>
        <Text style={prescriptionsStyles.dateMonth}>{consultationDateLabel}</Text>
      </View>
      <View style={prescriptionsStyles.cardMid}>
        <Text style={prescriptionsStyles.doctorName} numberOfLines={1}>
          {doctorName}
        </Text>
        <Text style={prescriptionsStyles.rxId} numberOfLines={1}>
          {rxNumber} • {date}
        </Text>
      </View>
      <View style={prescriptionsStyles.cardActions}>
        <TouchableOpacity style={prescriptionsStyles.iconBtn} activeOpacity={0.7} onPress={onView}>
          <FileTextIcon size={18} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={prescriptionsStyles.iconBtn}
          activeOpacity={0.7}
          onPress={onDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <Text
              style={{
                fontSize: 10,
                fontWeight: '700',
                color: theme.colors.primary,
              }}
            >
              {downloadProgress > 0 ? `${downloadProgress}%` : '0%'}
            </Text>
          ) : (
            <UploadIcon size={18} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default PrescriptionCard;
