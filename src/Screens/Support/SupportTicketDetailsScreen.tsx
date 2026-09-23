import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { AttachmentPreviewModal } from '../../components/Modules/Support';
import SupportTicketDetailSkeleton from '../../components/Skeletons/SupportTicketDetailSkeleton';
import AppHeader from '../../components/ui/AppHeader';
import { CheckIcon, FileTextIcon, MailIcon, TrashIcon } from '../../components/ui/icons';
import { SupportTicketQueryKeys } from '../../hooks/react-query/query.keys';
import {
  useDeleteSupportTicket,
  useGetSupportTicketDetails,
} from '../../hooks/react-query/support-tickets/support-tickets.hooks';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import { formatDate, getInitials } from '../../lib/common/common.utils';
import { showErrorToast, showSuccessToast } from '../../lib/common/toast.utils';
import { supportStyles, SupportTicketDetailsStyled } from '../../styled/SupportScreen.styled';
import { theme } from '../../styled/theme.styled';
import { useAlertStore } from '../../zustand/stores/useAlertStore';
import { useLoadingStore } from '../../zustand/stores/useLoadingStore';

export const SupportTicketDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const queryClient = useQueryClient();

  const ticketId: string = route.params?.ticketId || '';

  const { showLoader, hideLoader } = useLoadingStore();
  const showConfirm = useAlertStore(state => state.showConfirm);
  const { mutate: deleteTicket } = useDeleteSupportTicket();

  const {
    data: ticketInfo,
    isFetching: ticketLoading,
    isError,
    error,
    refetch,
  } = useGetSupportTicketDetails(ticketId);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const { hasAttachments, isClosed } = useMemo(() => {
    const isClosed = ticketInfo?.status === 'closed';
    const hasAttachments = ticketInfo?.attachments && ticketInfo.attachments.length > 0;
    return {
      isClosed,
      hasAttachments,
    };
  }, [ticketInfo]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const handleDeleteTicket = useCallback(() => {
    if (!ticketInfo?.id) return;

    showConfirm({
      title: 'Delete Ticket',
      message: `Are you sure you want to delete ticket #${ticketInfo.ticket_no || ticketInfo.id}? This action cannot be undone.`,
      buttonText: 'Yes, Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        showLoader('Deleting ticket...');
        deleteTicket(ticketInfo.id, {
          onSuccess: res => {
            if (res?.success) {
              showSuccessToast(res?.message || 'Support ticket deleted successfully');
              queryClient.invalidateQueries({
                queryKey: [SupportTicketQueryKeys.GET_MY_TICKETS],
              });
              navigation.goBack();
            } else {
              showErrorToast(res?.message || 'Failed to delete ticket');
            }
          },
          onError: (err: any) => {
            showErrorToast(err?.message || 'Failed to delete ticket. Please try again.');
          },
          onSettled: () => {
            hideLoader();
          },
        });
      },
    });
  }, [deleteTicket, hideLoader, navigation, queryClient, showConfirm, showLoader, ticketInfo]);

  if (ticketLoading) {
    return (
      <SafeAreaWrapper style={supportStyles.screen} showBottomBar isPathClear>
        <AppHeader title="Ticket Details" showBack={true} />
        <SupportTicketDetailSkeleton />
      </SafeAreaWrapper>
    );
  }

  if (isError || !ticketInfo) {
    return (
      <SafeAreaWrapper style={supportStyles.screen} showBottomBar isPathClear>
        <AppHeader title="Ticket Details" showBack={true} />
        <View style={SupportTicketDetailsStyled.errorContainer}>
          <Text style={SupportTicketDetailsStyled.errorTitle}>
            Unable to load ticketInfo details
          </Text>
          <Text style={SupportTicketDetailsStyled.errorSub}>
            {(error as any)?.message ||
              'We encountered an issue fetching this ticketInfo. Please check your connection and try again.'}
          </Text>
          <View style={SupportTicketDetailsStyled.btnRow}>
            <TouchableOpacity
              style={SupportTicketDetailsStyled.retryBtn}
              onPress={() => refetch()}
              activeOpacity={0.85}
            >
              <Text style={SupportTicketDetailsStyled.retryBtnTxt}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={SupportTicketDetailsStyled.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.85}
            >
              <Text style={SupportTicketDetailsStyled.backBtnTxt}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper style={supportStyles.screen} showBottomBar isPathClear>
      <AppHeader
        title={ticketInfo?.ticket_no ? `#${ticketInfo.ticket_no}` : 'Ticket Details'}
        showBack={true}
        right={
          <TouchableOpacity
            style={supportStyles.hdrDeleteBtn}
            onPress={handleDeleteTicket}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <TrashIcon size={18} color={theme.colors.danger} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={supportStyles.scroll}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={supportStyles.overviewCard}>
          <View style={supportStyles.overviewTop}>
            <View style={supportStyles.avatar}>
              <Text style={supportStyles.avatarTxt}>
                {getInitials(ticketInfo.ticket_no || ticketInfo.subject)}
              </Text>
            </View>
            <View style={supportStyles.overviewMeta}>
              <Text style={supportStyles.ticketNo}>#{ticketInfo.ticket_no}</Text>
              <Text style={supportStyles.dateTxt}>
                CREATED ON {formatDate(ticketInfo.created_at, 'DD MMM YYYY')}
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
            <Text style={supportStyles.subjectVal}>{ticketInfo.subject}</Text>
          </View>

          {ticketInfo.email ? (
            <View style={supportStyles.emailRow}>
              <MailIcon size={14} color={theme.colors.textSecondary} />
              <Text style={supportStyles.emailTxt}>{ticketInfo.email}</Text>
            </View>
          ) : null}
        </View>
        <View style={supportStyles.sectionCard}>
          <View style={supportStyles.sectionHeader}>
            <FileTextIcon size={18} color={theme.colors.primary} />
            <Text style={supportStyles.sectionTitle}>Issue Description</Text>
          </View>
          <View style={supportStyles.messageBox}>
            <Text style={supportStyles.messageTxt}>
              {ticketInfo.message || 'No description provided.'}
            </Text>
          </View>
        </View>
        {hasAttachments && (
          <View style={supportStyles.sectionCard}>
            <View style={supportStyles.sectionHeader}>
              <Text style={supportStyles.sectionTitle}>
                Attachments ({ticketInfo.attachments!.length})
              </Text>
            </View>
            <View style={supportStyles.attachmentsGrid}>
              {ticketInfo.attachments!.map(att => {
                return (
                  <TouchableOpacity
                    key={String(att.id || att.file_name)}
                    style={supportStyles.attItem}
                    onPress={() => setPreviewImage(att.file_url)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: att.file_url }}
                      style={supportStyles.attThumb}
                      resizeMode="cover"
                    />
                    <View style={supportStyles.attInfo}>
                      <Text style={supportStyles.attName} numberOfLines={1}>
                        {att.file_name || 'Attachment'}
                      </Text>
                      <Text style={supportStyles.attSize}>{att.file_size}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
        <View style={supportStyles.sectionCard}>
          <View style={supportStyles.sectionHeader}>
            <Text style={supportStyles.sectionTitle}>Admin Replies</Text>
          </View>

          {ticketInfo.admin_description ? (
            <View style={supportStyles.replyCard}>
              <View style={supportStyles.replyHeader}>
                <Text style={supportStyles.replySender}>Support Team</Text>
                <Text style={supportStyles.replyDate}>
                  {formatDate(ticketInfo.updated_at || ticketInfo.created_at, 'DD MMM YYYY')}
                </Text>
              </View>
              <Text style={supportStyles.replyMsg}>{ticketInfo.admin_description}</Text>
            </View>
          ) : (
            <View style={supportStyles.noRepliesBox}>
              <Text style={supportStyles.noRepliesTitle}>No replies yet</Text>
              <Text style={supportStyles.noRepliesSub}>
                Our support team is reviewing your ticketInfo and will respond shortly.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      <AttachmentPreviewModal
        visible={!!previewImage}
        imageUri={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </SafeAreaWrapper>
  );
};

export default SupportTicketDetailsScreen;
