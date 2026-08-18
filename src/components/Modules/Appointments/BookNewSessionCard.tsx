import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { appointmentsStyles } from '../../../styled/AppointmentsScreen.styled';
import { theme } from '../../../styled/theme.styled';

export interface BookNewSessionCardProps {
  onPress: () => void;
}

export const BookNewSessionCard: React.FC<BookNewSessionCardProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={appointmentsStyles.bookCard}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={appointmentsStyles.bookPlus}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.primary }}>+</Text>
      </View>
      <Text style={appointmentsStyles.bookTitle}>Book New Session</Text>
      <Text style={appointmentsStyles.bookSub}>
        Need specialized care? Find the right expert for your health journey.
      </Text>
      <Text style={appointmentsStyles.bookLink}>Find a Specialist →</Text>
    </TouchableOpacity>
  );
};

export default BookNewSessionCard;
