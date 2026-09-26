import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import CommonErrorCard from '../../components/commons/CommonErrorCard/CommonErrorCard';
import ReportsSkeleton from '../../components/Skeletons/ReportsSkeleton';
import { AppHeader } from '../../components/ui/AppHeader';
import {
  BriefcaseIcon,
  CalendarIcon,
  CheckCircleIcon,
  CircleXIcon,
  ClinicIcon,
  ClockIcon,
  FileTextIcon,
  VideoIcon,
} from '../../components/ui/icons';
import { useGetStats } from '../../hooks/react-query/stats/stats.hooks';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import { formatCurrency } from '../../lib/common/common.utils';
import { canGoBack, goBack, navigate } from '../../navigation/navigationRef';
import { AppRoute } from '../../route';
import { reportsStyles } from '../../styled/ReportsScreen.styled';
import { theme } from '../../styled/theme.styled';

interface ReportStatItem {
  id: string;
  label: string;
  value: number | string;
  badgeBg: string;
  iconColor: string;
  renderIcon: (color: string) => React.ReactNode;
  onPress?: () => void;
}

export const ReportsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const { data: statsData, isFetching: statsLoading, isError: statsError, refetch } = useGetStats();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const primaryStats: ReportStatItem[] = useMemo(
    () => [
      {
        id: 'amount-spent',
        label: 'TOTAL AMOUNT SPENT',
        value: formatCurrency(statsData?.total_amount_paid, statsData?.currency),
        badgeBg: '#EEF4FF',
        iconColor: '#3B82F6',
        renderIcon: color => <BriefcaseIcon size={20} color={color} strokeWidth={2} />,
      },
      {
        id: 'total-appointments',
        label: 'TOTAL APPOINTMENTS',
        value: (statsData?.total_appointments_booked ?? 0).toString(),
        badgeBg: '#CCFBF1',
        iconColor: '#0D9488',
        renderIcon: color => <CalendarIcon size={20} color={color} strokeWidth={2} />,
        onPress: () => navigation.navigate(AppRoute.SCHEDULE),
      },
      {
        id: 'video-consultations',
        label: 'VIDEO CONSULTATIONS',
        value: (statsData?.total_video_consultations ?? 0).toString(),
        badgeBg: '#E0F2FE',
        iconColor: '#0284C7',
        renderIcon: color => <VideoIcon size={20} color={color} strokeWidth={2} />,
        onPress: () => navigation.navigate(AppRoute.SCHEDULE),
      },
      {
        id: 'prescriptions',
        label: 'PRESCRIPTIONS',
        value: (statsData?.total_prescriptions ?? 0).toString(),
        badgeBg: '#F1F5F9',
        iconColor: '#64748B',
        renderIcon: color => <FileTextIcon size={20} color={color} strokeWidth={2} />,
        onPress: () => navigation.navigate(AppRoute.PRESCRIPTIONS_LIST),
      },
    ],
    [
      statsData?.currency,
      statsData?.total_amount_paid,
      statsData?.total_appointments_booked,
      statsData?.total_video_consultations,
      statsData?.total_prescriptions,
      navigation,
    ]
  );

  const summaryStats: ReportStatItem[] = useMemo(
    () => [
      {
        id: 'completed-appointments',
        label: t('reportsScreen.completed'),
        value: (statsData?.summary?.completed_appointments ?? 0).toString(),
        badgeBg: '#DCFCE7',
        iconColor: '#16A34A',
        renderIcon: color => <CheckCircleIcon size={20} color={color} strokeWidth={2.2} />,
        onPress: () => navigation.navigate(AppRoute.SCHEDULE),
      },
      {
        id: 'in-person-consultations',
        label: t('reportsScreen.inPerson'),
        value: (statsData?.summary?.in_person_consultations ?? 0).toString(),
        badgeBg: '#F3E8FF',
        iconColor: '#9333EA',
        renderIcon: color => <ClinicIcon size={20} color={color} strokeWidth={2} />,
        onPress: () => navigation.navigate(AppRoute.SCHEDULE),
      },
      {
        id: 'upcoming-appointments',
        label: t('reportsScreen.upcoming'),
        value: (statsData?.summary?.upcoming_appointments ?? 0).toString(),
        badgeBg: '#FEF3C7',
        iconColor: '#D97706',
        renderIcon: color => <ClockIcon size={20} color={color} strokeWidth={2} />,
        onPress: () => navigation.navigate(AppRoute.SCHEDULE),
      },
      {
        id: 'cancelled-appointments',
        label: t('reportsScreen.cancelled'),
        value: (statsData?.summary?.cancelled_appointments ?? 0).toString(),
        badgeBg: '#FEE2E2',
        iconColor: '#DC2626',
        renderIcon: color => <CircleXIcon size={20} color={color} strokeWidth={2} />,
        onPress: () => navigation.navigate(AppRoute.SCHEDULE),
      },
    ],
    [
      statsData?.summary?.completed_appointments,
      statsData?.summary?.in_person_consultations,
      statsData?.summary?.upcoming_appointments,
      statsData?.summary?.cancelled_appointments,
      navigation,
      t,
    ]
  );

  return (
    <SafeAreaWrapper
      style={reportsStyles.container}
      showBottomBar={true}
      activeBottomTab="Reports"
      isPathClear={true}
    >
      <AppHeader
        title={t('reportsScreen.title')}
        titleColor={theme.colors.primary}
        showBack={true}
        border={false}
        onBack={() => {
          if (canGoBack()) {
            goBack();
          } else {
            navigate(AppRoute.HOME);
          }
        }}
      />

      <ScrollView
        style={reportsStyles.scrollView}
        contentContainerStyle={reportsStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {statsLoading && !statsData ? (
          <ReportsSkeleton />
        ) : statsError && !statsData ? (
          <CommonErrorCard
            title={t('reportsScreen.unableToLoadReports')}
            message={t('reportsScreen.unableToLoadReportsMessage')}
            onRetry={refetch}
          />
        ) : (
          <>
            <Text style={reportsStyles.sectionTitle}>Overview</Text>
            {primaryStats.map(stat => (
              <TouchableOpacity
                key={stat.id}
                style={reportsStyles.card}
                activeOpacity={stat.onPress ? 0.8 : 1}
                onPress={stat.onPress}
                disabled={!stat.onPress}
              >
                <View style={reportsStyles.cardHeader}>
                  <Text style={reportsStyles.label}>{stat.label}</Text>
                  <View style={[reportsStyles.iconBadge, { backgroundColor: stat.badgeBg }]}>
                    {stat.renderIcon(stat.iconColor)}
                  </View>
                </View>
                <View style={reportsStyles.valueWrap}>
                  <Text style={reportsStyles.valueText}>{stat.value}</Text>
                </View>
              </TouchableOpacity>
            ))}

            <Text style={[reportsStyles.sectionTitle, reportsStyles.sectionTitleSecondary]}>
              {t('reportsScreen.appointmentBreakdown')}
            </Text>
            <View style={reportsStyles.gridContainer}>
              {summaryStats.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={reportsStyles.gridCard}
                  activeOpacity={item.onPress ? 0.8 : 1}
                  onPress={item.onPress}
                  disabled={!item.onPress}
                >
                  <View style={reportsStyles.gridCardTop}>
                    <View style={[reportsStyles.gridIconBadge, { backgroundColor: item.badgeBg }]}>
                      {item.renderIcon(item.iconColor)}
                    </View>
                  </View>
                  <View>
                    <Text style={reportsStyles.gridCardLabel}>{item.label}</Text>
                    <Text style={reportsStyles.gridCardValue}>{item.value}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaWrapper>
  );
};

export default ReportsScreen;
