import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import { ConsultationPeopleCard } from '../../components/Modules/Appointments';
import { BellIcon, CalendarIcon, CheckIcon, PrescriptionIcon } from '../../components/ui/icons';
import { Header } from '../../Layout/Header';
import { consultationCompletedStyles } from '../../styled/ConsultationCompletedScreen.styled';
import { theme } from '../../styled/theme.styled';

export const ConsultationCompletedScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const params = route.params || {};
  const doctorName = params.doctorName || 'Dr. Sarah Jenkins';
  const doctorSpecialty = params.doctorSpecialization || 'Cardiologist • MD';
  const patientName = params.patientName || 'Sahil Mallick';
  const dateLabel = params.appointmentDate || '24 Aug';
  const durationLabel = params.durationLabel || '14m 30s';
  const typeLabel = params.consultationType || 'Video';

  const handleDownloadRx = () => {
    navigation.navigate('PrescriptionsList');
  };

  const handleBookFollowUp = () => {
    navigation.navigate('DoctorSearch');
  };

  const goHome = () => {
    navigation.navigate('MainTabs', { screen: 'Dashboard' });
  };

  return (
    <SafeAreaWrapper style={consultationCompletedStyles.screen}>
      <Header greeting="Consultation Ended" userName="Visit Summary" unreadCount={1} />

      <ScrollView
        contentContainerStyle={consultationCompletedStyles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Checkmark Hero */}
        <View style={consultationCompletedStyles.checkCircle}>
          <CheckIcon size={36} color={theme.colors.surface} />
        </View>
        <Text style={consultationCompletedStyles.heading}>Consultation Completed</Text>
        <Text style={consultationCompletedStyles.subtext}>
          Thank you for choosing PredCare. Your session details and prescription summary are updated below.
        </Text>

        {/* Doctor vs Patient Comparison Card */}
        <ConsultationPeopleCard
          doctorName={doctorName}
          doctorSpecialty={doctorSpecialty}
          patientName={patientName}
          dateLabel={dateLabel}
          durationLabel={durationLabel}
          typeLabel={typeLabel}
          doctorInitial={doctorName.replace(/^Dr\.?\s*/i, '')[0] || 'S'}
          patientInitial={patientName[0] || 'P'}
        />

        {/* Download Prescription (RX) Button */}
        <TouchableOpacity
          style={consultationCompletedStyles.primaryBtn}
          onPress={handleDownloadRx}
          activeOpacity={0.85}
        >
          <PrescriptionIcon size={18} color={theme.colors.surface} />
          <Text style={consultationCompletedStyles.primaryBtnTxt}>Download Prescription (RX)</Text>
        </TouchableOpacity>

        {/* Book Follow-up Button */}
        <TouchableOpacity
          style={consultationCompletedStyles.secondaryBtn}
          onPress={handleBookFollowUp}
          activeOpacity={0.85}
        >
          <CalendarIcon size={18} color={theme.colors.primary} />
          <Text style={consultationCompletedStyles.secondaryBtnTxt}>Book Follow-up</Text>
        </TouchableOpacity>

        {/* Back to Home Link */}
        <TouchableOpacity style={consultationCompletedStyles.homeLink} onPress={goHome} activeOpacity={0.7}>
          <Text style={consultationCompletedStyles.homeLinkTxt}>BACK TO HOME →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

export default ConsultationCompletedScreen;
