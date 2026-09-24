import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { getInitials } from '../../../lib/common/common.utils';
import { doctorStyles } from '../../../styled/DoctorScreen.styled';

export interface DoctorCardProps {
  onProfilePress?: () => void;
  onBookPress?: () => void;
  name: string;
  clinicName: string;
  specialization: string;
  profile_image: string;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  clinicName,
  name,
  profile_image,
  specialization,
  onBookPress,
  onProfilePress,
}) => {
  const { t } = useTranslation();

  return (
    <View style={doctorStyles.doctorCard}>
      <View style={doctorStyles.doctorMainInfo}>
        {profile_image ? (
          <Image source={{ uri: profile_image }} style={doctorStyles.doctorAvatarImage} />
        ) : (
          <View style={doctorStyles.doctorAvatar}>
            <Text style={doctorStyles.doctorAvatarText}>{getInitials(name || '')}</Text>
          </View>
        )}

        <View style={doctorStyles.doctorDetails}>
          <Text style={doctorStyles.doctorName} numberOfLines={1}>
            {name}
          </Text>
          <Text style={doctorStyles.doctorSpecialization} numberOfLines={1}>
            {specialization}
          </Text>
          {clinicName ? (
            <Text style={doctorStyles.clinicName} numberOfLines={1}>
              {clinicName}
            </Text>
          ) : null}
        </View>
      </View>
      {/* <View style={doctorStyles.scheduledBox}>
        <Text style={doctorStyles.sectionLabel}>UPCOMING APPOINTMENT</Text>
        <View style={doctorStyles.upcomingList}>
          <View style={doctorStyles.upcomingRow}>
            <View style={doctorStyles.upcomingMeta}>
              <Text style={doctorStyles.typeBadge}>VIDEO CONSULTATION</Text>
              <View style={doctorStyles.scheduledRow}>
                <View style={doctorStyles.scheduledCol}>
                  <View style={doctorStyles.metaIconRow}>
                    <CalendarIcon size={12} color={theme.colors.primaryDark} />
                    <Text style={doctorStyles.metaLbl}>DATE</Text>
                  </View>
                  <Text style={doctorStyles.metaVal}>Mon, 26 Aug 2920</Text>
                </View>

                <View style={doctorStyles.scheduledCol}>
                  <View style={doctorStyles.metaIconRow}>
                    <ClockIcon size={12} color={theme.colors.primaryDark} />
                    <Text style={doctorStyles.metaLbl}>TIME</Text>
                  </View>
                  <Text style={doctorStyles.metaVal}>10:30 AM</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={doctorStyles.pastBox}>
        <Text style={doctorStyles.sectionLabel}>PAST VISITS</Text>
        <View style={doctorStyles.pastList}>
          <View style={doctorStyles.pastRow}>
            <ClockIcon size={14} color={theme.colors.primaryDark} />
            <Text style={doctorStyles.pastDate}>18 May 2026</Text>
            <Text style={doctorStyles.lastVisit}>LAST VISIT</Text>
          </View>
        </View>
      </View> */}
      <View style={doctorStyles.actionButtons}>
        <TouchableOpacity
          style={doctorStyles.profileBtn}
          onPress={onProfilePress}
          activeOpacity={0.85}
        >
          <Text style={doctorStyles.profileBtnTxt}>{t('commons.profile')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={doctorStyles.bookBtn} onPress={onBookPress} activeOpacity={0.85}>
          <Text style={doctorStyles.bookBtnTxt}>{t('commons.bookNow')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DoctorCard;
