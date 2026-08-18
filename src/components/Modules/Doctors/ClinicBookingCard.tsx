import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ClinicLocationData } from '../../../resources/mockData';
import { doctorDetailsStyles } from '../../../styled/DoctorDetailsScreen.styled';

export interface ClinicBookingCardProps {
  clinic: ClinicLocationData;
  onBookAppointment?: (clinic: ClinicLocationData, selectedDate: string) => void;
}

export const ClinicBookingCard: React.FC<ClinicBookingCardProps> = ({
  clinic,
  onBookAppointment,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    clinic.upcomingDates[0] || '2026-08-19'
  );

  const formatDateLabel = (dateStr: string) => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        return `${months[monthIndex]} ${day}`;
      }
    } catch {
      return dateStr;
    }
    return dateStr;
  };

  return (
    <View style={doctorDetailsStyles.clinicCard}>
      <Text style={doctorDetailsStyles.clinicName}>{clinic.clinic_name}</Text>
      {clinic.address ? (
        <Text style={doctorDetailsStyles.clinicAddress}>{clinic.address}</Text>
      ) : null}

      <Text style={doctorDetailsStyles.nextAvailableLabel}>NEXT AVAILABLE</Text>
      {clinic.upcomingDates.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={doctorDetailsStyles.dateChipsRow}
        >
          {clinic.upcomingDates.map(date => {
            const active = date === selectedDate;
            return (
              <TouchableOpacity
                key={date}
                style={[
                  doctorDetailsStyles.dateChip,
                  active && doctorDetailsStyles.dateChipActive,
                ]}
                activeOpacity={0.85}
                onPress={() => setSelectedDate(date)}
              >
                <Text
                  style={[
                    doctorDetailsStyles.dateChipText,
                    active && doctorDetailsStyles.dateChipTextActive,
                  ]}
                >
                  {formatDateLabel(date)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <Text style={{ fontSize: 13, color: '#94a3b8', marginBottom: 14 }}>
          No upcoming dates
        </Text>
      )}

      <TouchableOpacity
        style={doctorDetailsStyles.bookBtn}
        activeOpacity={0.85}
        onPress={() => onBookAppointment?.(clinic, selectedDate)}
      >
        <Text style={doctorDetailsStyles.bookBtnText}>Book Appointment</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ClinicBookingCard;
