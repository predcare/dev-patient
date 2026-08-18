import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import AppHeader from '../../components/ui/AppHeader';
import { CheckIcon, ShieldIcon } from '../../components/ui/icons';
import { supportStyles } from '../../styled/SupportScreen.styled';
import { theme } from '../../styled/theme.styled';

export const SupportTicketSuccessScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const ticketId: string = route.params?.ticketId || 'TK-00000';
  const category: string = route.params?.category || 'Support';
  const createdAt: string = route.params?.createdAt || new Date().toISOString();

  const formattedDate = (() => {
    try {
      return new Date(createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return createdAt;
    }
  })();

  const handleBackToSupport = () => {
    navigation.navigate('Support');
  };

  return (
    <SafeAreaView style={supportStyles.screen}>
      <AppHeader title="Support Ticket" showBack={true} />

      <View style={supportStyles.successBody}>
        {/* Success Check Circle */}
        <View style={supportStyles.successCircle}>
          <CheckIcon size={36} color={theme.colors.surface} />
        </View>

        <Text style={supportStyles.successTitle}>Ticket Created Successfully</Text>
        <Text style={supportStyles.successSub}>
          Thank you for reaching out. Our support team has received your request and will
          get back to you within 2 business hours during business hours.
        </Text>

        {/* Ticket Details Card */}
        <View style={supportStyles.successCard}>
          <View style={supportStyles.successRow}>
            <Text style={supportStyles.successLbl}>TICKET ID</Text>
            <Text style={supportStyles.successIdVal}>#{ticketId}</Text>
          </View>

          <View style={supportStyles.divider} />

          <View style={supportStyles.successRow}>
            <Text style={supportStyles.successLbl}>CATEGORY</Text>
            <View style={supportStyles.catPill}>
              <Text style={supportStyles.catPillTxt}>{category}</Text>
            </View>
          </View>

          <View style={supportStyles.divider} />

          <View style={supportStyles.successRow}>
            <Text style={supportStyles.successLbl}>DATE SUBMITTED</Text>
            <Text style={supportStyles.dateVal}>{formattedDate}</Text>
          </View>
        </View>
      </View>

      {/* Footer Actions */}
      <View style={supportStyles.successFooter}>
        <TouchableOpacity
          style={supportStyles.successBtn}
          onPress={handleBackToSupport}
          activeOpacity={0.85}
        >
          <Text style={supportStyles.successBtnTxt}>Back to Support</Text>
        </TouchableOpacity>

        <View style={supportStyles.secureRow}>
          <ShieldIcon size={14} color={theme.colors.textMuted} />
          <Text style={supportStyles.secureTxt}>Secure Healthcare Transaction</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SupportTicketSuccessScreen;
