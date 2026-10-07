import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { queryClient } from '../../../../components/providers/ReactQueryProvider';
import { CheckIcon, CircleXIcon } from '../../../../components/ui/icons';
import { useGetMyDoctors } from '../../../../hooks/react-query/doctors/doctor.hooks';
import { useShareToDoctor } from '../../../../hooks/react-query/emr/emr.hooks';
import { EMRQuerykeys } from '../../../../hooks/react-query/query.keys';
import { getInitials } from '../../../../lib/common/common.utils';
import { healthRecordsStyles as styles } from '../../../../styled/HealthRecordsScreen.styled';
import theme from '../../../../styled/theme.styled';
import { IEmrListDoc } from '../../../../typescripts/interfaces/emr.interfaces';

export interface ShareEMRModalsProps {
  visible: boolean;
  document: IEmrListDoc | null;
  onClose: () => void;
}

export const ShareEMRModals: React.FC<ShareEMRModalsProps> = ({ visible, document, onClose }) => {
  const insets = useSafeAreaInsets();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data: myDoctorsData, isLoading, isError, refetch } = useGetMyDoctors();
  const { mutate: shareToDoctor } = useShareToDoctor();
  const [isPending, setIsPending] = useState<boolean>(false);

  const toggleDoctor = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  };

  const handleClose = () => {
    setSelectedIds([])
    setIsPending(false);
    onClose();
  }

  const handleShare = () => {
    const payload = {
      document_id: Number(document?.id),
      user_ids: selectedIds,
    };
    setIsPending(true);
    shareToDoctor(payload, {
      onSuccess: async res => {
        if (res?.success) {
          await queryClient.invalidateQueries({ queryKey: [EMRQuerykeys.CAT_WISE_EMRS] });
          await queryClient.invalidateQueries({ queryKey: [EMRQuerykeys.EMR_CATS] });
          handleClose();
        }
      },
      onSettled: () => {
        setIsPending(false);
      },
    });
  };

  useEffect(() => {
    if (!visible) return;
    const initialIds = (document?.shared_doctors ?? []).map(doctor => String(doctor.user_id));
    setSelectedIds(initialIds);
  }, [visible, document]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={[styles.shareModalScreen, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.shareModalHeader}>
          <TouchableOpacity
            style={styles.shareModalCloseBtn}
            onPress={handleClose}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <CircleXIcon size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.shareModalTitleWrap}>
            <Text style={styles.shareModalTitle}>Share Document</Text>
            <Text style={styles.shareModalSubtitle} numberOfLines={1}>
              {document?.title || 'Health record'}
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.shareModalList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {isLoading ? (
            <View style={styles.shareModalStateWrap}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : isError ? (
            <View style={styles.shareModalStateWrap}>
              <Text style={styles.shareModalErrorText}>Failed to load connected doctors</Text>
              <TouchableOpacity onPress={() => refetch()} activeOpacity={0.7}>
                <Text style={styles.shareModalRetryText}>Tap to retry</Text>
              </TouchableOpacity>
            </View>
          ) : myDoctorsData?.data?.length === 0 ? (
            <View style={styles.shareModalStateWrap}>
              <Text style={styles.shareModalStateText}>No connected doctors found.</Text>
            </View>
          ) : (
            myDoctorsData?.data?.map(doctor => {
              const userId = String(doctor.user_id);
              const isSelected = selectedIds.includes(userId);
              return (
                <TouchableOpacity
                  key={doctor.user_id || userId}
                  style={[styles.shareDoctorCard, isSelected && styles.shareDoctorCardSelected]}
                  onPress={() => toggleDoctor(userId)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.shareDoctorAvatar,
                      isSelected && styles.shareDoctorAvatarSelected,
                    ]}
                  >
                    <Text style={styles.shareDoctorAvatarText}>{getInitials(doctor.name)}</Text>
                  </View>
                  <View style={styles.shareDoctorInfo}>
                    <Text style={styles.shareDoctorName} numberOfLines={1}>
                      {doctor.name}
                    </Text>
                    <Text style={styles.shareDoctorSpecialty} numberOfLines={1}>
                      {doctor.specialization}
                    </Text>
                  </View>
                  <View
                    style={[styles.shareDoctorCheck, isSelected && styles.shareDoctorCheckSelected]}
                  >
                    {isSelected ? <CheckIcon size={14} color="#FFFFFF" strokeWidth={3} /> : null}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        <View style={[styles.shareModalFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Text style={styles.shareModalCount}>
            {myDoctorsData?.data?.length} {myDoctorsData?.data?.length === 1 ? 'doctor' : 'doctors'}{' '}
            selected
          </Text>
          <TouchableOpacity
            style={[styles.shareModalShareBtn, isPending && { opacity: 0.5 }]}
            activeOpacity={1}
            onPress={handleShare}
            disabled={isPending}
          >
            <Text style={[styles.shareModalShareBtnText]}>{isPending ? 'Sharing...' : 'Share'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ShareEMRModals;
