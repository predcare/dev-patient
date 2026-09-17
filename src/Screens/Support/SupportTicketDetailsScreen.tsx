import { useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { AttachmentPreviewModal } from '../../components/Modules/Support';
import AppHeader from '../../components/ui/AppHeader';
import { CheckIcon, FileTextIcon, MailIcon } from '../../components/ui/icons';
import { MOCK_SUPPORT_TICKETS, SupportTicket } from '../../resources/mockData';
import { supportStyles } from '../../styled/SupportScreen.styled';
import { theme } from '../../styled/theme.styled';

export const SupportTicketDetailsScreen: React.FC = () => {
  const route = useRoute<any>();

  const routeTicket: SupportTicket | undefined = route.params?.initialTicket;
  const ticketId: string = route.params?.ticketId || 'tk-1';

  const ticket: SupportTicket =
    routeTicket ||
    MOCK_SUPPORT_TICKETS.find(t => t.id === ticketId || t.ticketNo === ticketId) ||
    MOCK_SUPPORT_TICKETS[0];

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const isClosed = ticket.status === 'closed';

  const formatTicketDate = (dateStr?: string) => {
    if (!dateStr) return '';
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

  const replyCount = ticket.replies?.length || 0;

  return (
    <SafeAreaView style={supportStyles.screen}>
      <AppHeader
        title={ticket?.ticketNo ? `#${ticket.ticketNo}` : 'Ticket Details'}
        showBack={true}
      />

      <ScrollView
        contentContainerStyle={supportStyles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview Card */}
        <View style={supportStyles.overviewCard}>
          <View style={supportStyles.overviewTop}>
            <View style={supportStyles.avatar}>
              <Text style={supportStyles.avatarTxt}>
                {(ticket.subject || ticket.category || 'T').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={supportStyles.overviewMeta}>
              <Text style={supportStyles.ticketNo}>{ticket.ticketNo}</Text>
              <Text style={supportStyles.dateTxt}>
                CREATED ON {formatTicketDate(ticket.createdAt)}
              </Text>
            </View>
            <View
              style={[
                supportStyles.statusPill,
                !isClosed ? supportStyles.statusOpen : supportStyles.statusClosed,
              ]}
            >
              <View
                style={[
                  supportStyles.statusDot,
                  !isClosed ? supportStyles.dotOpen : supportStyles.dotClosed,
                ]}
              >
                {!isClosed && <CheckIcon size={10} color={theme.colors.surface} />}
              </View>
              <Text
                style={[
                  supportStyles.statusTxt,
                  !isClosed ? supportStyles.statusTxtOpen : supportStyles.statusTxtClosed,
                ]}
              >
                {!isClosed ? 'Open' : 'Closed'}
              </Text>
            </View>
          </View>

          <View style={supportStyles.divider} />

          <View style={supportStyles.subjectRow}>
            <Text style={supportStyles.subjectLabel}>Subject</Text>
            <Text style={supportStyles.subjectVal}>{ticket.subject}</Text>
          </View>

          {ticket.userEmail ? (
            <View style={supportStyles.emailRow}>
              <MailIcon size={14} color={theme.colors.textSecondary} />
              <Text style={supportStyles.emailTxt}>{ticket.userEmail}</Text>
            </View>
          ) : null}
        </View>

        {/* Issue Description Section */}
        <View style={supportStyles.sectionCard}>
          <View style={supportStyles.sectionHeader}>
            <FileTextIcon size={18} color={theme.colors.primary} />
            <Text style={supportStyles.sectionTitle}>Issue Description</Text>
          </View>
          <View style={supportStyles.messageBox}>
            <Text style={supportStyles.messageTxt}>
              {ticket.message || 'No description provided.'}
            </Text>
          </View>
        </View>

        {/* Attachments Section */}
        {ticket.attachments && ticket.attachments.length > 0 && (
          <View style={supportStyles.sectionCard}>
            <View style={supportStyles.sectionHeader}>
              <Text style={supportStyles.sectionTitle}>
                Attachments ({ticket.attachments.length})
              </Text>
            </View>
            <View style={supportStyles.attachmentsGrid}>
              {ticket.attachments.map(att => (
                <TouchableOpacity
                  key={att.id || att.name}
                  style={supportStyles.attItem}
                  onPress={() => setPreviewImage(att.uri)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: att.uri }} style={supportStyles.attThumb} />
                  <View style={supportStyles.attInfo}>
                    <Text style={supportStyles.attName} numberOfLines={1}>
                      {att.name || 'Attachment'}
                    </Text>
                    <Text style={supportStyles.attSize}>{att.size}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Replies & Updates Section */}
        <View style={supportStyles.sectionCard}>
          <View style={supportStyles.sectionHeader}>
            <Text style={supportStyles.sectionTitle}>
              Replies & Updates {replyCount > 0 ? `(${replyCount})` : ''}
            </Text>
          </View>

          {ticket.replies && ticket.replies.length > 0 ? (
            ticket.replies.map(reply => (
              <View key={reply.id} style={supportStyles.replyCard}>
                <View style={supportStyles.replyHeader}>
                  <Text style={supportStyles.replySender}>
                    {reply.sender_name ||
                      (reply.created_by_type === 'patient' ? 'You' : 'Support Agent')}
                  </Text>
                  <Text style={supportStyles.replyDate}>
                    {formatTicketDate(reply.created_at)}
                  </Text>
                </View>
                <Text style={supportStyles.replyMsg}>{reply.message}</Text>
              </View>
            ))
          ) : (
            <View style={supportStyles.noRepliesBox}>
              <Text style={supportStyles.noRepliesTitle}>No replies yet</Text>
              <Text style={supportStyles.noRepliesSub}>
                Our support team is reviewing your ticket and will respond shortly.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modular Attachment Preview Modal */}
      <AttachmentPreviewModal
        visible={!!previewImage}
        imageUri={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </SafeAreaView>
  );
};

export default SupportTicketDetailsScreen;
