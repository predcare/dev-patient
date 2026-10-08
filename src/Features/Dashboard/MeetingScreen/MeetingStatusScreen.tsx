import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    BackHandler,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import CommonErrorCard from '../../../components/commons/CommonErrorCard/CommonErrorCard';
import {
    CalendarIcon,
    CheckIcon,
    ClockIcon,
    HomeIcon,
    ProfileIcon,
    StethoscopeIcon,
    VideoIcon,
} from '../../../components/ui/icons';
import { useGetApptInfo } from '../../../hooks/react-query/appointments/appointments.hooks';
import Header from '../../../Layout/Header';
import SafeAreaWrapper from '../../../Layout/SafeAreaWrapper';
import { _formatTime, formatDate, getDuration } from '../../../lib/common/common.utils';
import {
    AppRoute,
    ConsultationCompletedScreenNavigationProp,
    ConsultationCompletedScreenRouteProp,
} from '../../../route';
import consultationCompletedStyles from '../../../styled/ConsultationCompletedScreen.styled';
import theme from '../../../styled/theme.styled';

const formatCallDuration = (seconds: unknown): string => {
    const total = Number(seconds);
    if (!Number.isFinite(total) || total <= 0) return '';
    const minutes = Math.floor(total / 60);
    const remainder = Math.floor(total % 60);
    if (minutes <= 0) return `${remainder}s`;
    if (remainder === 0) return `${minutes}m`;
    return `${minutes}m ${remainder}s`;
};

const SUMMARY_TIMEOUT_SECONDS = 20;

const formatStatusLabel = (status?: string | null): string => {
    if (!status) return '';
    return status
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
};

export const MeetingStatusScreen: React.FC = () => {
    const navigation = useNavigation<ConsultationCompletedScreenNavigationProp>();
    const route = useRoute<ConsultationCompletedScreenRouteProp>();
    const appointmentId = route.params?.appointmentId;
    const hasAppointmentId = appointmentId !== undefined && appointmentId !== null && `${appointmentId}` !== '';
    const hasLeftRef = useRef(false);
    const [secondsLeft, setSecondsLeft] = useState(SUMMARY_TIMEOUT_SECONDS);

    const {
        data: apptInfo,
        isFetching: apptInfoIsPending,
        isError: apptInfoIsError,
        refetch: refetchApptInfo,
    } = useGetApptInfo(hasAppointmentId ? appointmentId : '');

    const handleGoHome = useCallback(() => {
        if (hasLeftRef.current) return;
        hasLeftRef.current = true;
        navigation.reset({
            index: 0,
            routes: [{ name: AppRoute.HOME }],
        });
    }, [navigation]);

    const handleViewAppointments = () => {
        if (hasLeftRef.current) return;
        hasLeftRef.current = true;
        navigation.reset({
            index: 0,
            routes: [{ name: AppRoute.SCHEDULE }],
        });
    };

    useEffect(() => {
        const endsAt = Date.now() + SUMMARY_TIMEOUT_SECONDS * 1000;
        const timer = setInterval(() => {
            const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
            setSecondsLeft(remaining);
            if (remaining === 0) {
                clearInterval(timer);
                handleGoHome();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [handleGoHome]);

    useEffect(() => {
        navigation.setOptions({
            gestureEnabled: false,
        });

        const unsubscribeBeforeRemove = navigation.addListener('beforeRemove', (e: any) => {
            if (e.data.action.type === 'GO_BACK') {
                e.preventDefault();
                handleGoHome();
            }
        });

        const onBackPress = () => {
            handleGoHome();
            return true;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => {
            unsubscribeBeforeRemove();
            subscription.remove();
        };
    }, [navigation, handleGoHome]);

    const isVideo = (apptInfo?.consultation_type || '').toLowerCase() === 'video';
    const doctorName = apptInfo?.doctor?.name || '';
    const doctorSpecialty = [apptInfo?.doctor?.specialization, apptInfo?.doctor?.qualifications]
        .filter(Boolean)
        .join(' • ');
    const clinicName = apptInfo?.clinic?.name || '';
    const statusLabel = formatStatusLabel(apptInfo?.appointment_status);
    const timeSlot = [_formatTime(apptInfo?.start_time), _formatTime(apptInfo?.end_time)]
        .filter(Boolean)
        .join(' - ');
    const durationLabel =
        formatCallDuration(apptInfo?.call_duration_seconds) ||
        getDuration(apptInfo?.start_time, apptInfo?.end_time);
    const showLoader = hasAppointmentId && apptInfoIsPending && !apptInfo;
    const showError = !hasAppointmentId || apptInfoIsError;

    return (
        <SafeAreaWrapper
            header={
                <Header
                    title="Call Summary"
                    isBackBtn={true}
                    onBackPress={handleGoHome}
                    isNotifyShow={false}
                    isLang={false}
                />
            }
        >
            <ScrollView
                contentContainerStyle={consultationCompletedStyles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={consultationCompletedStyles.heroSection}>
                    <View style={consultationCompletedStyles.checkCircleOuter}>
                        <View style={consultationCompletedStyles.checkCircleInner}>
                            <CheckIcon size={26} color={theme.colors.surface} />
                        </View>
                    </View>
                    <Text style={consultationCompletedStyles.heading}>Call Ended!</Text>
                    <Text style={consultationCompletedStyles.subheading}>
                        Your video session has concluded and your visit details are saved.
                    </Text>
                    <Text style={consultationCompletedStyles.autoLeaveNote}>
                        Returning home in {secondsLeft}s
                    </Text>
                </View>
                {showLoader ? (
                    <ActivityIndicator color={theme.colors.primary} style={consultationCompletedStyles.loader} />
                ) : showError ? (
                    <CommonErrorCard
                        title={hasAppointmentId ? 'Unable to load visit' : 'Visit unavailable'}
                        message={
                            hasAppointmentId
                                ? 'We could not load this appointment. Please try again.'
                                : 'This visit could not be opened because the appointment id is missing.'
                        }
                        onRetry={hasAppointmentId ? () => refetchApptInfo() : undefined}
                    />
                ) : (
                    <>
                        <View style={consultationCompletedStyles.card}>
                            <View style={consultationCompletedStyles.doctorRow}>
                                <View style={consultationCompletedStyles.doctorDetails}>
                                    <Text style={consultationCompletedStyles.doctorName}>
                                        {doctorName}
                                    </Text>
                                    {doctorSpecialty ? (
                                        <Text style={consultationCompletedStyles.doctorSpecialty}>
                                            {doctorSpecialty}
                                        </Text>
                                    ) : null}
                                    {clinicName ? (
                                        <Text style={consultationCompletedStyles.doctorClinic}>
                                            {clinicName}
                                        </Text>
                                    ) : null}
                                </View>
                                {statusLabel ? (
                                    <View style={consultationCompletedStyles.statusBadge}>
                                        <View style={consultationCompletedStyles.statusDot} />
                                        <Text style={consultationCompletedStyles.statusBadgeText}>
                                            {statusLabel}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                            <View style={consultationCompletedStyles.cardDivider} />

                            <View style={consultationCompletedStyles.cardMetaRow}>
                                <View style={consultationCompletedStyles.typePill}>
                                    {isVideo ? (
                                        <VideoIcon size={14} color={theme.colors.primary} />
                                    ) : (
                                        <StethoscopeIcon size={14} color={theme.colors.primary} />
                                    )}
                                    <Text style={consultationCompletedStyles.typePillText}>
                                        {isVideo ? 'Video Consultation' : 'In-Person Visit'}
                                    </Text>
                                </View>
                                <View style={consultationCompletedStyles.refIdContainer}>
                                    <Text style={consultationCompletedStyles.refIdLabel}>Ref: </Text>
                                    <Text style={consultationCompletedStyles.refIdValue}>
                                        {apptInfo?.appointment_id || ''}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View style={consultationCompletedStyles.gridRow}>
                            <View style={consultationCompletedStyles.gridCell}>
                                <View style={consultationCompletedStyles.gridCellHeader}>
                                    <View style={consultationCompletedStyles.gridIconWrap}>
                                        <CalendarIcon size={14} color={theme.colors.primary} />
                                    </View>
                                    <Text style={consultationCompletedStyles.gridLabel}>DATE</Text>
                                </View>
                                <Text style={consultationCompletedStyles.gridValue}>
                                    {formatDate(apptInfo?.appointment_date, 'DD MMM YYYY')}
                                </Text>
                            </View>
                            <View style={consultationCompletedStyles.gridCell}>
                                <View style={consultationCompletedStyles.gridCellHeader}>
                                    <View style={consultationCompletedStyles.gridIconWrap}>
                                        <ClockIcon size={14} color={theme.colors.primary} />
                                    </View>
                                    <Text style={consultationCompletedStyles.gridLabel}>TIME SLOT</Text>
                                </View>
                                <Text style={consultationCompletedStyles.gridValue} numberOfLines={1}>
                                    {timeSlot}
                                </Text>
                            </View>
                        </View>
                        <View style={consultationCompletedStyles.gridRow}>
                            <View style={consultationCompletedStyles.gridCell}>
                                <View style={consultationCompletedStyles.gridCellHeader}>
                                    <View style={consultationCompletedStyles.gridIconWrap}>
                                        <ClockIcon size={14} color={theme.colors.primary} />
                                    </View>
                                    <Text style={consultationCompletedStyles.gridLabel}>DURATION</Text>
                                </View>
                                <Text style={consultationCompletedStyles.gridValue}>
                                    {durationLabel}
                                </Text>
                            </View>

                            <View style={consultationCompletedStyles.gridCell}>
                                <View style={consultationCompletedStyles.gridCellHeader}>
                                    <View style={consultationCompletedStyles.gridIconWrap}>
                                        <ProfileIcon size={14} color={theme.colors.primary} />
                                    </View>
                                    <Text style={consultationCompletedStyles.gridLabel}>PATIENT</Text>
                                </View>
                                <Text style={consultationCompletedStyles.gridValue} numberOfLines={1}>
                                    {apptInfo?.patient?.name || ''}
                                </Text>
                            </View>
                        </View>
                    </>
                )}
                <TouchableOpacity
                    style={consultationCompletedStyles.primaryBtn}
                    activeOpacity={0.8}
                    onPress={handleGoHome}
                >
                    <HomeIcon size={18} color={theme.colors.surface} />
                    <Text style={consultationCompletedStyles.primaryBtnTxt}>Back to Home</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={consultationCompletedStyles.secondaryBtn}
                    activeOpacity={0.8}
                    onPress={handleViewAppointments}
                >
                    <CalendarIcon size={18} color={theme.colors.primary} />
                    <Text style={consultationCompletedStyles.secondaryBtnTxt}>View Appointments</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaWrapper>
    );
};

export default MeetingStatusScreen;
