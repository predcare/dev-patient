import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { appointmentsStyles } from '../../../styled/AppointmentsScreen.styled';
import { theme } from '../../../styled/theme.styled';

export interface BookNewSessionCardProps {
  onPress: () => void;
}

export const BookNewSessionCard: React.FC<BookNewSessionCardProps> = ({ onPress }) => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity style={appointmentsStyles.bookCard} activeOpacity={0.9} onPress={onPress}>
      <View style={appointmentsStyles.bookPlus}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.primary }}>+</Text>
      </View>
      <Text style={appointmentsStyles.bookTitle}>{t('appointments.bookNewSession')}</Text>
      <Text style={appointmentsStyles.bookSub}>{t('appointments.bookNewSessionSub')}</Text>
      <Text style={appointmentsStyles.bookLink}>{t('appointments.findSpecialistArrow')}</Text>
    </TouchableOpacity>
  );
};

export default BookNewSessionCard;
