import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import AppHeader from '../../components/ui/AppHeader';
import CustomTabs from '../../components/ui/CustomTabs/CustomTabs';
import { BellIcon, CheckIcon, PlusIcon } from '../../components/ui/icons';
import { MOCK_SUPPORT_TICKETS, SupportTicket } from '../../resources/mockData';
import { supportStyles } from '../../styled/SupportScreen.styled';
import { theme } from '../../styled/theme.styled';

type TicketTabKey = 'open' | 'closed';

export const SupportScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [tab, setTab] = useState<TicketTabKey>('open');
  const [tickets] = useState<SupportTicket[]>(MOCK_SUPPORT_TICKETS);

  const filtered = tickets.filter(ticket => ticket.status === tab);
  const openCount = tickets.filter(t => t.status === 'open').length;
  const closedCount = tickets.filter(t => t.status === 'closed').length;

  const openNew = () => {
    navigation.navigate('NewSupportTicket');
  };

  const handleTicketPress = (ticket: SupportTicket) => {
    navigation.navigate('SupportTicketDetails', {
      ticketId: ticket.id,
      initialTicket: ticket,
    });
  };

  const formatTicketDate = (dateStr: string) => {
    try {
      return new Date(dateStr)
        .toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        .toUpperCase();
    } catch {
      return dateStr;
    }
  };

  return (
    <SafeAreaView style={supportStyles.screen}>
      <AppHeader
        title="Support"
        showBack={true}
        right={
          <View style={supportStyles.hdrIcon}>
            <BellIcon size={22} color={theme.colors.textMuted} />
          </View>
        }
      />
      <View style={supportStyles.tabsWrap}>
        <CustomTabs<TicketTabKey>
          tabs={[
            { key: 'open', label: 'Open' },
            { key: 'closed', label: 'Closed' },
          ]}
          activeTab={tab}
          onTabChange={setTab}
          activeColor={theme.colors.primary}
        />
      </View>

      <ScrollView contentContainerStyle={supportStyles.scroll} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={supportStyles.empty}>
            <Text style={supportStyles.emptyTitle}>
              No {tab === 'open' ? 'open' : 'closed'} tickets
            </Text>
            <Text style={supportStyles.emptySub}>
              {tab === 'open'
                ? 'Create a new ticket and our team will help you shortly.'
                : 'Closed tickets will appear here.'}
            </Text>
          </View>
        ) : (
          filtered.map(ticket => (
            <TouchableOpacity
              key={String(ticket.id || ticket.ticketNo)}
              style={supportStyles.card}
              onPress={() => handleTicketPress(ticket)}
              activeOpacity={0.85}
            >
              <View style={supportStyles.avatar}>
                <Text style={supportStyles.avatarTxt}>
                  {(ticket.subject || ticket.category || 'T').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={supportStyles.cardBody}>
                <Text style={supportStyles.ticketId} numberOfLines={1}>
                  {ticket.ticketNo}
                </Text>
                <Text style={supportStyles.subject} numberOfLines={1}>
                  {ticket.subject || ticket.category}
                </Text>
                <Text style={supportStyles.created}>
                  CREATED ON {formatTicketDate(ticket.createdAt)}
                </Text>
              </View>
              <View
                style={[
                  supportStyles.statusPill,
                  ticket.status === 'open' ? supportStyles.statusOpen : supportStyles.statusClosed,
                ]}
              >
                <View
                  style={[
                    supportStyles.statusDot,
                    ticket.status === 'open' ? supportStyles.dotOpen : supportStyles.dotClosed,
                  ]}
                >
                  {ticket.status === 'open' && <CheckIcon size={10} color={theme.colors.surface} />}
                </View>
                <Text
                  style={[
                    supportStyles.statusTxt,
                    ticket.status === 'open'
                      ? supportStyles.statusTxtOpen
                      : supportStyles.statusTxtClosed,
                  ]}
                >
                  {ticket.status === 'open' ? 'Open' : 'Closed'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={supportStyles.newWrap}>
          <TouchableOpacity style={supportStyles.newBtn} onPress={openNew} activeOpacity={0.85}>
            <Text style={supportStyles.newBtnTxt}>+ New Ticket</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={supportStyles.fab} onPress={openNew} activeOpacity={0.85}>
        <PlusIcon size={26} color={theme.colors.surface} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SupportScreen;
