import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      title: t('support.deleteTicketTitle'),
      message: t('support.deleteTicketConfirm', {
        ticketNo: ticketInfo.ticket_no || ticketInfo.id,
      }),
      buttonText: t('support.yesDelete'),
      cancelText: t('commons.cancel'),
      onConfirm: () => {
        showLoader(t('support.deletingTicket'));
        deleteTicket(ticketInfo.id, {
          onSuccess: res => {
            if (res?.success) {
              showSuccessToast(res?.message || t('support.ticketDeletedSuccess'));
              queryClient.invalidateQueries({
                queryKey: [SupportTicketQueryKeys.GET_MY_TICKETS],
              });
              navigation.goBack();
            } else {
              showErrorToast(res?.message || t('support.ticketDeleteFailed'));
            }
          },
          onError: (err: any) => {
            showErrorToast(err?.message || t('support.ticketDeleteFailed'));
          },
          onSettled: () => {
            hideLoader();
          },
        });
      },
    });
  }, [deleteTicket, hideLoader, navigation, queryClient, showConfirm, showLoader, t, ticketInfo]);

  if (ticketLoading) {
    return (
      <SafeAreaWrapper style={supportStyles.screen} showBottomBar isPathClear>
        <AppHeader title={t('support.ticketDetails')} showBack={true} />
        <SupportTicketDetailSkeleton />
      </SafeAreaWrapper>
    );
  }

  if (isError || !ticketInfo) {
    return (
      <SafeAreaWrapper style={supportStyles.screen} showBottomBar isPathClear>
        <AppHeader title={t('support.ticketDetails')} showBack={true} />
        <View style={SupportTicketDetailsStyled.errorContainer}>
          <Text style={SupportTicketDetailsStyled.errorTitle}>
            {t('support.unableToLoadTicketDetails')}
          </Text>
          <Text style={SupportTicketDetailsStyled.errorSub}>
            {(error as any)?.message ||
              t('support.errorLoadingTicketDetails')}
          </Text>
          <View style={SupportTicketDetailsStyled.btnRow}>
            <TouchableOpacity
              style={SupportTicketDetailsStyled.retryBtn}
              onPress={() => refetch()}
              activeOpacity={0.85}
            >
              <Text style={SupportTicketDetailsStyled.retryBtnTxt}>{t('support.tryAgain')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={SupportTicketDetailsStyled.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.85}
            >
              <Text style={SupportTicketDetailsStyled.backBtnTxt}>{t('support.goBack')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper style={supportStyles.screen} showBottomBar isPathClear>
      <AppHeader
        title={ticketInfo?.ticket_no ? `#${ticketInfo.ticket_no}` : t('support.ticketDetails')}
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
                {t('support.createdOn', {
                  date: formatDate(ticketInfo.created_at, 'DD MMM YYYY'),
                })}
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
                {!isClosed ? t('support.open') : t('support.closed')}
              </Text>
            </View>
          </View>

          <View style={supportStyles.divider} />

          <View style={supportStyles.subjectRow}>
            <Text style={supportStyles.subjectLabel}>{t('support.subject')}</Text>
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
            <Text style={supportStyles.sectionTitle}>{t('support.issueDescription')}</Text>
          </View>
          <View style={supportStyles.messageBox}>
            <Text style={supportStyles.messageTxt}>
              {ticketInfo.message || t('support.noDescriptionProvided')}
            </Text>
          </View>
        </View>
        {hasAttachments && (
          <View style={supportStyles.sectionCard}>
            <View style={supportStyles.sectionHeader}>
              <Text style={supportStyles.sectionTitle}>
                {t('support.attachmentsTitle', {
                  count: ticketInfo.attachments!.length,
                })}
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
                        {att.file_name || t('support.attachment')}
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
            <Text style={supportStyles.sectionTitle}>{t('support.adminReplies')}</Text>
          </View>

          {ticketInfo.admin_description ? (
            <View style={supportStyles.replyCard}>
              <View style={supportStyles.replyHeader}>
                <Text style={supportStyles.replySender}>{t('support.supportTeam')}</Text>
                <Text style={supportStyles.replyDate}>
                  {formatDate(ticketInfo.updated_at || ticketInfo.created_at, 'DD MMM YYYY')}
                </Text>
              </View>
              <Text style={supportStyles.replyMsg}>{ticketInfo.admin_description}</Text>
            </View>
          ) : (
            <View style={supportStyles.noRepliesBox}>
              <Text style={supportStyles.noRepliesTitle}>{t('support.noRepliesYetTitle')}</Text>
              <Text style={supportStyles.noRepliesSub}>
                {t('support.noRepliesYetDesc')}
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
