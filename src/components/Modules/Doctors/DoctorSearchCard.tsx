import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { getInitials } from '../../../lib/common/common.utils';
import { doctorSearchStyles } from '../../../styled/DoctorSearchScreen.styled';
import { theme } from '../../../styled/theme.styled';
import { CalendarIcon, VideoIcon } from '../../ui/icons';

export interface DoctorSearchCardProps {
  id: string;
  doctorId?: string;
  name: string;
  profileImage?: string | null;
  specialization?: string;
  experienceYears?: number;
  city?: string;
  clinicName?: string;
  nextAvailableDate?: string;
  offersInPerson?: boolean;
  offersVideo?: boolean;
  onProfilePress?: () => void;
  onBookPress?: () => void;
}

export const DoctorSearchCard: React.FC<DoctorSearchCardProps> = ({
  id,
  doctorId,
  name,
  profileImage,
  specialization,
  experienceYears = 0,
  city,
  clinicName,
  nextAvailableDate,
  offersInPerson,
  offersVideo,
  onProfilePress,
  onBookPress,
}) => {
  const navigation = useNavigation<any>();
  const rootNav = navigation.getParent() || navigation;

  const handleProfile = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      rootNav.navigate('DoctorDetails', { doctorId: doctorId || id });
    }
  };

  const handleBook = () => {
    if (onBookPress) {
      onBookPress();
    } else {
      rootNav.navigate('BookAppointment', { doctorId: doctorId || id });
    }
  };

  return (
    <View style={doctorSearchStyles.card}>
      <View style={doctorSearchStyles.cardTop}>
        {profileImage ? (
          <Image
            source={{ uri: profileImage }}
            style={{ width: 56, height: 56, borderRadius: 28, marginRight: 12 }}
          />
        ) : (
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: theme.colors.primaryDark,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Text style={{ color: theme.colors.surface, fontWeight: '700', fontSize: 16 }}>
              {getInitials(name)}
            </Text>
          </View>
        )}

        <View style={doctorSearchStyles.cardInfo}>
          <Text style={doctorSearchStyles.doctorName}>{name}</Text>
          <Text style={doctorSearchStyles.doctorMeta} numberOfLines={1}>
            {[specialization, `${experienceYears} yrs exp`, city].filter(Boolean).join(' • ')}
          </Text>
          {clinicName ? (
            <TouchableOpacity
              activeOpacity={0.7}
              style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center' }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.colors.primary }}>
                🏥 {clinicName} →
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={doctorSearchStyles.cardIcons}>
          {offersInPerson ? <CalendarIcon size={16} color={theme.colors.primary} /> : null}
          {offersVideo ? <VideoIcon size={16} color={theme.colors.primary} /> : null}
        </View>
      </View>

      <View style={doctorSearchStyles.dateRow}>
        <View style={doctorSearchStyles.dateChip}>
          <Text style={doctorSearchStyles.dateChipText}>Next Available: {nextAvailableDate}</Text>
        </View>
      </View>

      <View style={doctorSearchStyles.actionRow}>
        <TouchableOpacity
          style={doctorSearchStyles.profileBtn}
          onPress={handleProfile}
          activeOpacity={0.85}
        >
          <Text style={doctorSearchStyles.profileBtnText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={doctorSearchStyles.bookBtn}
          onPress={handleBook}
          activeOpacity={0.85}
        >
          <Text style={doctorSearchStyles.bookBtnText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DoctorSearchCard;
