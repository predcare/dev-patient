import dayjs from 'dayjs';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { doctorDetailsStyles } from '../../../styled/DoctorDetailsScreen.styled';

export interface ClinicBookingCardProps {
  id: string;
  name: string;
  address?: string;
  availableDates?: string[];
  onBookAppointment?: (clinicId: string, clinicName: string, selectedDate: string) => void;
}

export const ClinicBookingCard: React.FC<ClinicBookingCardProps> = ({
  id,
  name,
  address,
  availableDates = [],
  onBookAppointment,
}) => {
  return (
    <View style={doctorDetailsStyles.clinicCard}>
      <Text style={doctorDetailsStyles.clinicName}>{name}</Text>
      {address ? <Text style={doctorDetailsStyles.clinicAddress}>{address}</Text> : null}

      <Text style={doctorDetailsStyles.nextAvailableLabel}>NEXT AVAILABLE</Text>
      {availableDates.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={doctorDetailsStyles.dateChipsRow}
        >
          {availableDates.map(date => (
            <View key={date} style={doctorDetailsStyles.dateChip}>
              <Text style={doctorDetailsStyles.dateChipText}>{dayjs(date).format('MMM D')}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={{ fontSize: 13, color: '#94a3b8', marginBottom: 14 }}>No upcoming dates</Text>
      )}

      <TouchableOpacity
        style={doctorDetailsStyles.bookBtn}
        activeOpacity={0.85}
        onPress={() => onBookAppointment?.(id, name, availableDates[0] || '')}
      >
        <Text style={doctorDetailsStyles.bookBtnText}>Book Appointment</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ClinicBookingCard;
