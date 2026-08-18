import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { PrescriptionDetailData } from '../../../resources/mockData';
import { prescriptionsStyles } from '../../../styled/PrescriptionsScreen.styled';
import { theme } from '../../../styled/theme.styled';
import { FileTextIcon, UploadIcon } from '../../ui/icons';

export interface PrescriptionCardProps {
  item: PrescriptionDetailData;
  onPressDetail: (item: PrescriptionDetailData) => void;
  onDownloadPdf: (item: PrescriptionDetailData) => void;
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({
  item,
  onPressDetail,
  onDownloadPdf,
}) => {
  return (
    <TouchableOpacity
      style={prescriptionsStyles.card}
      onPress={() => onPressDetail(item)}
      activeOpacity={0.85}
    >
      {/* Left Date Column */}
      <View style={prescriptionsStyles.dateCol}>
        <Text style={prescriptionsStyles.dateDay}>{item.day}</Text>
        <Text style={prescriptionsStyles.dateMonth}>{item.month}</Text>
      </View>

      {/* Mid Info Column */}
      <View style={prescriptionsStyles.cardMid}>
        <Text style={prescriptionsStyles.doctorName} numberOfLines={1}>
          {item.doctor_name}
        </Text>
        <Text style={prescriptionsStyles.rxId} numberOfLines={1}>
          {item.rx_number} • {item.consultation_date_label}
        </Text>
      </View>

      {/* Right Action Icons */}
      <View style={prescriptionsStyles.cardActions}>
        <TouchableOpacity
          style={prescriptionsStyles.iconBtn}
          onPress={() => onPressDetail(item)}
          activeOpacity={0.7}
        >
          <FileTextIcon size={18} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={prescriptionsStyles.iconBtn}
          onPress={() => onDownloadPdf(item)}
          activeOpacity={0.7}
        >
          <UploadIcon size={18} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default PrescriptionCard;
