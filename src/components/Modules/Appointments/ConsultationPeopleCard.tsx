import React from 'react';
import { Text, View } from 'react-native';
import { consultationCompletedStyles } from '../../../styled/ConsultationCompletedScreen.styled';
import { VideoIcon } from '../../ui/icons';

export interface ConsultationPeopleCardProps {
  doctorName: string;
  doctorSpecialty: string;
  patientName: string;
  dateLabel: string;
  durationLabel: string;
  typeLabel: string;
  doctorInitial?: string;
  patientInitial?: string;
}

export const ConsultationPeopleCard: React.FC<ConsultationPeopleCardProps> = ({
  doctorName,
  doctorSpecialty,
  patientName,
  dateLabel,
  durationLabel,
  typeLabel,
  doctorInitial = 'S',
  patientInitial = 'P',
}) => {
  return (
    <View style={consultationCompletedStyles.card}>
      <View style={consultationCompletedStyles.peopleRow}>
        {/* Doctor Column */}
        <View style={consultationCompletedStyles.personCol}>
          <View style={[consultationCompletedStyles.avatar, consultationCompletedStyles.avatarDoctor]}>
            <Text style={consultationCompletedStyles.avatarTxt}>{doctorInitial}</Text>
          </View>
          <Text style={consultationCompletedStyles.personName} numberOfLines={1}>
            {doctorName}
          </Text>
          <Text style={consultationCompletedStyles.personRole} numberOfLines={1}>
            {doctorSpecialty}
          </Text>
        </View>

        {/* Center Divider Icon */}
        <View style={consultationCompletedStyles.midCol}>
          <View style={consultationCompletedStyles.midLine} />
          <View style={consultationCompletedStyles.midIcon}>
            <VideoIcon size={18} color="#64748B" />
          </View>
          <View style={consultationCompletedStyles.midLine} />
        </View>

        {/* Patient Column */}
        <View style={consultationCompletedStyles.personCol}>
          <View style={[consultationCompletedStyles.avatar, consultationCompletedStyles.avatarPatient]}>
            <Text style={consultationCompletedStyles.avatarTxt}>{patientInitial}</Text>
          </View>
          <Text style={consultationCompletedStyles.personName} numberOfLines={1}>
            {patientName}
          </Text>
          <Text style={consultationCompletedStyles.personRole}>Patient</Text>
        </View>
      </View>

      {/* 3-Box Metadata Grid */}
      <View style={consultationCompletedStyles.metaRow}>
        <View style={consultationCompletedStyles.metaBox}>
          <Text style={consultationCompletedStyles.metaLbl}>DATE</Text>
          <Text style={consultationCompletedStyles.metaVal}>{dateLabel}</Text>
        </View>
        <View style={consultationCompletedStyles.metaBox}>
          <Text style={consultationCompletedStyles.metaLbl}>DURATION</Text>
          <Text style={consultationCompletedStyles.metaVal}>{durationLabel}</Text>
        </View>
        <View style={consultationCompletedStyles.metaBox}>
          <Text style={consultationCompletedStyles.metaLbl}>TYPE</Text>
          <Text style={consultationCompletedStyles.metaVal}>{typeLabel}</Text>
        </View>
      </View>
    </View>
  );
};

export default ConsultationPeopleCard;
