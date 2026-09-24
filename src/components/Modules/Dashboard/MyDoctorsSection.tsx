import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGetMyDoctors } from '../../../hooks/react-query/doctors/doctor.hooks';
import { getInitials } from '../../../lib/common/common.utils';
import { AppRoute } from '../../../route';
import { theme } from '../../../styled/theme.styled';
import CommonEmptyCard from '../../commons/CommonEmptyCard/CommonEmptyCard';
import CommonErrorCard from '../../commons/CommonErrorCard/CommonErrorCard';
import { StethoscopeIcon } from '../../ui/icons';

const SkeletonRows: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.card}>
      {[1, 2].map((key, idx) => (
        <Animated.View
          key={key}
          style={[styles.docRow, idx === 0 && styles.divider, { opacity: pulseAnim }]}
        >
          <View style={styles.skeletonAvatar} />
          <View style={styles.docInfo}>
            <View style={styles.skeletonLineLong} />
            <View style={styles.skeletonLineShort} />
          </View>
          <View style={styles.skeletonBtn} />
        </Animated.View>
      ))}
    </View>
  );
};

export const MyDoctorsSection: React.FC = () => {
  const naviagtion = useNavigation<any>();
  const { t } = useTranslation();
  const {
    data: myDoctorsData,
    isFetching: isPendingMyDoctors,
    isError: isErrorMyDoctors,
    refetch: refetchMyDoctors,
  } = useGetMyDoctors();

  const handleSeeAll = () => {
    naviagtion.navigate(AppRoute.DOCTORS);
  };

  const handleDoctorPress = (doctorId: number, clinicId: number) => {
    naviagtion.navigate(AppRoute.BOOK_APPOINTMENT, {
      doctorId: doctorId,
      clinicId: clinicId,
    });
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('commons.myDoctors')}</Text>
        <TouchableOpacity onPress={handleSeeAll} activeOpacity={0.7}>
          <Text style={styles.seeAllText}>{t('commons.seeAll')}</Text>
        </TouchableOpacity>
      </View>

      {isPendingMyDoctors ? (
        <SkeletonRows />
      ) : isErrorMyDoctors ? (
        <View style={styles.card}>
          <CommonErrorCard
            title={t('dashboard.failedToLoadDoctors')}
            message={t('dashboard.failedToLoadDoctorsMsg')}
            onRetry={refetchMyDoctors}
            retryText={t('dashboard.retry')}
          />
        </View>
      ) : myDoctorsData?.data?.length == 0 ? (
        <CommonEmptyCard
          title={t('dashboard.noDoctorsAddedYet')}
          message={t('dashboard.noDoctorsAddedMsg')}
          icon={<StethoscopeIcon size={28} color={theme.colors.primaryDark} />}
        />
      ) : (
        <View style={styles.card}>
          {myDoctorsData?.data?.map((doc, idx: number) => {
            const showDivider = idx < myDoctorsData?.data?.length - 1;
            return (
              <TouchableOpacity
                key={String(doc.doctor_id || doc.user_id || idx)}
                style={[styles.docRow, showDivider && styles.divider]}
                onPress={() => handleDoctorPress(Number(doc?.user_id), Number(doc?.clinic?.id))}
                activeOpacity={0.75}
              >
                {doc.profile_image ? (
                  <Image source={{ uri: doc.profile_image }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{getInitials(doc?.name || '')}</Text>
                  </View>
                )}

                <View style={styles.docInfo}>
                  <Text style={styles.docName} numberOfLines={1}>
                    {doc?.name || ''}
                  </Text>
                  <Text style={styles.docSpec} numberOfLines={1}>
                    {doc.specialization}
                  </Text>
                  {doc?.clinic?.name ? (
                    <Text style={styles.clinicName} numberOfLines={1}>
                      {doc.clinic.name}
                    </Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  style={styles.consultBtn}
                  onPress={() => handleDoctorPress(Number(doc?.user_id), Number(doc?.clinic?.id))}
                  activeOpacity={0.85}
                >
                  <Text style={styles.consultBtnText}>{t('commons.consult')}</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
    marginBottom: 17,
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  card: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    overflow: 'hidden',
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#D97706',
  },
  docInfo: {
    flex: 1,
    marginRight: 12,
  },
  docName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  docSpec: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  clinicName: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primaryDark,
    marginTop: 2,
  },
  consultBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consultBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.surface,
  },
  emptyCard: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    padding: 24,
    alignItems: 'center',
  },
  emptyIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  emptyBtn: {
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.surface,
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
    marginRight: 14,
  },
  skeletonLineLong: {
    width: '60%',
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginBottom: 6,
  },
  skeletonLineShort: {
    width: '40%',
    height: 11,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  skeletonBtn: {
    width: 76,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
});

export default MyDoctorsSection;
