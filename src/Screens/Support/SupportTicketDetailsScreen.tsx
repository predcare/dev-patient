import { useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { AttachmentPreviewModal } from '../../components/Modules/Support';
import AppHeader from '../../components/ui/AppHeader';
import { CheckIcon, FileTextIcon, MailIcon } from '../../components/ui/icons';
import { useSupportTicketDetails } from '../../hooks/react-query/support/support.hooks';
import { supportStyles } from '../../styled/SupportScreen.styled';
import { theme } from '../../styled/theme.styled';
import { ISupportTicket } from '../../typescripts/interfaces/support.interfaces';

import { SupportDetailsSkeleton } from '../../components/Skeletons';

export const SupportTicketDetailsScreen: React.FC = () => {
  const route = useRoute<any>();

  const routeTicket: ISupportTicket | undefined = route.params?.initialTicket;
  const ticketId: string = route.params?.ticketId || routeTicket?.id || '';

  const { data: ticketDetailResponse, isFetching: detailsPending } = useSupportTicketDetails(
    ticketId,
    {
      enabled: !!ticketId,
    }
  );

  const ticket: ISupportTicket | undefined = ticketDetailResponse?.data || routeTicket;
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const isClosed = (ticket?.status || '').toLowerCase() === 'closed';

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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <SafeAreaView style={supportStyles.screen}>
      <AppHeader
        title={ticket?.ticket_no ? `#${ticket.ticket_no}` : 'Ticket Details'}
        showBack={true}
      />

      <ScrollView contentContainerStyle={supportStyles.scroll} showsVerticalScrollIndicator={false}>
        {detailsPending ? (
          <SupportDetailsSkeleton />
        ) : ticket ? (
          <>
            {/* Overview Card */}
            <View style={supportStyles.overviewCard}>
              <View style={supportStyles.overviewTop}>
                <View style={supportStyles.avatar}>
                  <Text style={supportStyles.avatarTxt}>
                    {(ticket.subject || 'T').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={supportStyles.overviewMeta}>
                  <Text style={supportStyles.ticketNo}>{ticket.ticket_no}</Text>
                  <Text style={supportStyles.dateTxt}>
                    CREATED ON {formatTicketDate(ticket.created_at)}
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

              {ticket.email ? (
                <View style={supportStyles.emailRow}>
                  <MailIcon size={14} color={theme.colors.textSecondary} />
                  <Text style={supportStyles.emailTxt}>{ticket.email}</Text>
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

            {/* Admin Response / Notes Section (if present) */}
            {ticket.admin_description ? (
              <View style={supportStyles.sectionCard}>
                <View style={supportStyles.sectionHeader}>
                  <Text style={supportStyles.sectionTitle}>Admin Response</Text>
                </View>
                <View style={supportStyles.replyCard}>
                  <Text style={supportStyles.replyMsg}>{ticket.admin_description}</Text>
                </View>
              </View>
            ) : null}

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
                      key={String(att.id || att.file_path || att.file_url)}
                      style={supportStyles.attItem}
                      onPress={() => setPreviewImage(att.file_url)}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: att.file_url }} style={supportStyles.attThumb} />
                      <View style={supportStyles.attInfo}>
                        <Text style={supportStyles.attName} numberOfLines={1}>
                          {att.original_name || 'Attachment'}
                        </Text>
                        {att.file_size ? (
                          <Text style={supportStyles.attSize}>{formatFileSize(att.file_size)}</Text>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={supportStyles.empty}>
            <Text style={supportStyles.emptyTitle}>Ticket not found</Text>
            <Text style={supportStyles.emptySub}>
              Could not fetch ticket details. Please try again later.
            </Text>
          </View>
        )}
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
