import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Header from '../../../Layout/Header';
import SafeAreaWrapper from '../../../Layout/SafeAreaWrapper';
import CommonErrorCard from '../../../components/commons/CommonErrorCard/CommonErrorCard';
import { CalendarIcon } from '../../../components/ui/icons';
import useMeetingPermissions from '../../../hooks/commons/meeting/useMeetingPermissions';
import useMeetingPip from '../../../hooks/commons/meeting/useMeetingPip';
import {
    useCancelMyAppt,
    useGetToken,
    useMyAppointmentsInfinite,
} from '../../../hooks/react-query/appointments/appointments.hooks';
import {
    _formatTime,
    formatDate,
    getDuration,
    openLocationOnMap
} from '../../../lib/common/common.utils';
import { showErrorToast, showSuccessToast } from '../../../lib/common/toast.utils';
import { AppRoute } from '../../../route';
import appointmentsStyles from '../../../styled/AppointmentsScreen.styled';
import theme from '../../../styled/theme.styled';
import { IMyAppointmentDoc } from '../../../typescripts/interfaces/appointments.interfaces';
import { useAlertStore } from '../../../zustand/stores/useAlertStore';
import { useLoadingStore } from '../../../zustand/stores/useLoadingStore';
import { useMeetingStore } from '../../../zustand/stores/useMeetingStore';
import AppointmentCard from './Components/AppointmentCard';
import BookNewSessionCard from './Components/BookNewSessionCard';
import AppointmentsSkeleton from './Skeletons/AppointmentsSkeleton';

export const AppointmentsScreen: React.FC = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const { restoreToMeeting } = useMeetingPip();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
    const [refreshing, setRefreshing] = useState(false);
    const { showLoader, hideLoader } = useLoadingStore(state => state);
    const { showConfirm } = useAlertStore(state => state);
    const { mutate: cancelAppt } = useCancelMyAppt();
    const { mutate: getToken } = useGetToken();
    const setCallInfo = useMeetingStore(state => state.setCallInfo);
    const activeMeetingId = useMeetingStore(state => state.callInfo?.meetingId);
    const activeCallAppointmentId = useMeetingStore(state => state.callInfo?.appointment?.id);

    const statusParam = useMemo(() => {
        return activeTab === 'upcoming'
            ? 'confirmed,pending,in_progress'
            : 'completed,cancelled,refunded,no_show';
    }, [activeTab]);

    const {
        data: infiniteData,
        isPending: allAppointmentIsPending,
        isError: allAppointmentIsError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch: appointmentRefetch,
    } = useMyAppointmentsInfinite({
        status: statusParam,
        limit: 10,
    });

    const appointments = useMemo(() => {
        if (!infiniteData?.pages) return [];
        return infiniteData.pages.flatMap(page => page?.data || []);
    }, [infiniteData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await appointmentRefetch();
        setRefreshing(false);
    }, [appointmentRefetch]);

    const handleCancelAppt = (apt: IMyAppointmentDoc) => {
        if (!apt?.id) return showErrorToast(t('appointments.noApptId'));
        const docName = apt.doctorInfo?.name || t('appointments.doctorDefault');
        const formattedDocName = docName.startsWith('Dr.') ? docName : `Dr. ${docName}`;
        const formattedDate = formatDate(apt.appointment_date) || t('appointments.scheduledDate');
        const formattedTime = _formatTime(apt?.start_time);
        const timeText = formattedTime ? ` at ${formattedTime}` : '';

        showConfirm({
            title: t('appointments.cancelAppointmentTitle'),
            message: t('appointments.cancelAppointmentConfirm', {
                doctorName: formattedDocName,
                date: formattedDate,
                time: timeText,
            }),
            buttonText: t('appointments.yesCancel'),
            cancelText: t('appointments.noKeep'),
            onConfirm: () => {
                showLoader(t('appointments.cancellingAppointment'));
                const payload = {
                    appointment_id: String(apt.id),
                    call_end_reason: 'Cancelled by patient',
                };
                cancelAppt(payload, {
                    onSuccess: async res => {
                        if (res?.success) {
                            showSuccessToast(res?.message || t('appointments.appointmentCancelledSuccess'));
                            await appointmentRefetch();
                        }
                    },
                    onSettled: () => {
                        hideLoader();
                    },
                });
            },
        });
    };

    const { requestPermissions } = useMeetingPermissions();

    const handleJoinVideoCall = async (apt: IMyAppointmentDoc) => {
        if (!apt?.id) return;
        if (activeMeetingId && String(activeCallAppointmentId) === String(apt.id)) {
            restoreToMeeting();
            return;
        }

        const hasPermissions = await requestPermissions();
        if (!hasPermissions) {
            showErrorToast(
                'Camera and microphone permissions are required to join the video consultation.'
            );
            return;
        }

        showLoader("Joining Video Call...");
        getToken(
            {
                appointmentId: String(apt.id),
            },
            {
                onSuccess: async res => {
                    const videoCallData = res?.data
                    if (res?.data && res?.success) {
                        setCallInfo({
                            token: videoCallData?.token,
                            meeting_id: videoCallData?.meeting_id,
                            appointment: videoCallData?.appointment,
                            doctorInfo: {
                                name: videoCallData?.doctor?.name,
                                doctorId: videoCallData?.doctor?.id
                            },
                        });
                        navigation.navigate(AppRoute.MEETING);
                    }
                },
                onSettled: () => {
                    hideLoader();
                },
            }
        );
    };

    return (
        <SafeAreaWrapper
            showBottomBar={true}
            activeBottomTab="Schedule"
            header={<Header title={t('appointments.title')} subTitle={t('appointments.subTitle')} />}
        >
            <View style={appointmentsStyles.segmentWrap}>
                <View style={appointmentsStyles.segmentTrack}>
                    {(['upcoming', 'completed'] as const).map(key => {
                        const active = activeTab === key;
                        return (
                            <TouchableOpacity
                                key={key}
                                style={[
                                    appointmentsStyles.segmentBtn,
                                    active && appointmentsStyles.segmentBtnActive,
                                ]}
                                onPress={() => setActiveTab(key)}
                                activeOpacity={2}
                            >
                                <Text
                                    style={[
                                        appointmentsStyles.segmentTxt,
                                        active && appointmentsStyles.segmentTxtActive,
                                    ]}
                                >
                                    {key === 'upcoming' ? t('appointments.upcoming') : t('appointments.completed')}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
            {allAppointmentIsPending ? (
                <AppointmentsSkeleton />
            ) : allAppointmentIsError ? (
                <CommonErrorCard
                    title={t('appointments.unableToLoadAppointments')}
                    message={t('appointments.errorLoadingAppointments')}
                    onRetry={appointmentRefetch}
                />
            ) : (
                <FlatList
                    data={appointments}
                    keyExtractor={(item, index) => String(item.id || item.appointment_id || index)}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item: apt }) => {
                        return (
                            <AppointmentCard
                                apptId={apt?.appointment_id || ''}
                                apptStatus={apt?.appointment_status || ''}
                                clinicAddress={apt.clinicInfo?.fulladdress || ''}
                                clinicName={apt.clinicInfo?.name || ''}
                                date={formatDate(apt.appointment_date)}
                                docImage={apt.doctorInfo?.profileImage}
                                doctorName={apt.doctorInfo?.name || ''}
                                duration={getDuration(apt?.start_time, apt?.end_time) || ''}
                                mode={apt?.consultation_type || ''}
                                time={_formatTime(apt?.start_time) || ''}
                                isCurrentCallActive={Boolean(
                                    activeMeetingId && String(activeCallAppointmentId) === String(apt.id)
                                )}
                                onCancelPress={() => handleCancelAppt(apt)}
                                onJoinVideo={() => {
                                    handleJoinVideoCall(apt);
                                }}
                                onReschedule={() =>
                                    navigation.navigate(AppRoute.RESCHEDULE_APPOINTMENT, {
                                        appointmentId: apt.id,
                                        doctorId: apt.doctor_id,
                                        clinicId: apt.clinic_id,
                                    })
                                }
                                onOpenDirections={() =>
                                    openLocationOnMap({
                                        address: apt.clinicInfo?.fulladdress,
                                        lat: apt.clinicInfo?.location?.lat,
                                        long: apt.clinicInfo?.location?.lng,
                                    })
                                }
                                onView={() =>
                                    navigation.navigate(AppRoute.APPOINTMENT_DETAILS, {
                                        appointmentId: apt.id,
                                    })
                                }
                            />
                        )
                    }}
                    onEndReached={() => {
                        if (hasNextPage && !isFetchingNextPage) {
                            fetchNextPage();
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={
                        <View style={appointmentsStyles.empty}>
                            <View style={appointmentsStyles.emptyIconWrap}>
                                <CalendarIcon size={32} color={theme.colors.primary} />
                            </View>
                            <Text style={appointmentsStyles.emptyH}>
                                {activeTab === 'upcoming'
                                    ? t('appointments.noUpcomingTitle')
                                    : t('appointments.noCompletedTitle')}
                            </Text>
                            <Text style={appointmentsStyles.emptyB}>
                                {activeTab === 'upcoming'
                                    ? t('appointments.noUpcomingSubtitle')
                                    : t('appointments.noCompletedSubtitle')}
                            </Text>
                        </View>
                    }
                    ListFooterComponent={
                        <View>
                            {isFetchingNextPage && (
                                <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                                    <ActivityIndicator size="small" color={theme.colors.primary} />
                                </View>
                            )}
                            <BookNewSessionCard onPress={() => navigation.navigate('DoctorSearch')} />
                        </View>
                    }
                    contentContainerStyle={[appointmentsStyles.scrollContent, { paddingBottom: 120 }]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                />
            )}
        </SafeAreaWrapper>
    );
};

export default AppointmentsScreen;
