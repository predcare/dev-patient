import { useNavigation, useRoute } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CommonErrorCard from '../../../components/commons/CommonErrorCard/CommonErrorCard';
import {
    BriefcaseIcon,
    CalendarIcon,
    CheckBadgeIcon,
    ClinicIcon,
    StethoscopeIcon,
    VideoIcon,
} from '../../../components/ui/icons';
import {
    useGetApptInfo,
    useRescheduleMyAppt,
} from '../../../hooks/react-query/appointments/appointments.hooks';
import { IRescheduleAppointment } from '../../../hooks/react-query/appointments/payload.interfaces';
import {
    useDoctorClinicSummary,
    useDoctorRescheduledAvailDates,
    useDoctorTimingsByDate,
} from '../../../hooks/react-query/doctors/doctor.hooks';
import { AppointmemntQueryKey } from '../../../hooks/react-query/query.keys';
import Header from '../../../Layout/Header';
import SafeAreaWrapper from '../../../Layout/SafeAreaWrapper';
import { getInitials } from '../../../lib/common/common.utils';
import { showErrorToast, showSuccessToast } from '../../../lib/common/toast.utils';
import { replace } from '../../../navigation/navigationRef';
import { AppRoute } from '../../../route';
import rescheduleAppointmentStyles from '../../../styled/BookAppointmentScreen.styled';
import theme from '../../../styled/theme.styled';
import { ITimeSlotsDoc } from '../../../typescripts/interfaces/doctors.interfaces';
import { useAuthStore } from '../../../zustand/stores/useAuthStore';
import { useLoadingStore } from '../../../zustand/stores/useLoadingStore';
import CalendarDatePickerModal from '../DoctorScreen/Components/CalendarDatePickerModal';
import TimeSlotPicker from './Components/TimeSlotPicker';
import BookingCardSkeleton from './Skeletons/BookingCardSkeleton';
import BookingSlotsSkeleton from './Skeletons/BookingSlotsSkeleton';

const formatDateChip = (dateStr: string) => {
    if (!dateStr) return { labelTop: '', labelBottom: '', full: '' };
    const d = dayjs(dateStr);
    if (!d.isValid()) return { labelTop: '', labelBottom: dateStr, full: dateStr };
    return {
        labelTop: d.format('ddd'),
        labelBottom: d.format('MMM D'),
        full: d.format('ddd, D MMM YYYY'),
    };
};

const formatTime12h = (timeStr: string): string => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1] || '00';
    if (isNaN(hours)) return timeStr;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
    return `${formattedHours}:${minutes} ${ampm}`;
};

interface IFormStates {
    selectedDate: string;
    consultationType: 'in-person' | 'video';
    appointmentType: 'regular';
    selectedSlot: ITimeSlotsDoc | null;
    selectedSlots: ITimeSlotsDoc[];
    reason: string;
    showCalendarModal: boolean;
}

export const RescheduledScreen: React.FC = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const router = useRoute();
    const { doctorId, clinicId, appointmentId } = (router.params || {}) as {
        doctorId?: number;
        clinicId?: number;
        appointmentId?: number;
    };
    const { userData } = useAuthStore(state => state);
    const queryClient = useQueryClient();
    const { showLoader, hideLoader } = useLoadingStore(state => state);
    const { mutate: rescheduleAppt } = useRescheduleMyAppt();

    const {
        data: apptInfo,
        isFetching: apptInfoIsPending,
        isError: apptInfoIsError,
        refetch: refetchApptInfo,
    } = useGetApptInfo(appointmentId as number);

    const effectiveDoctorId = Number(
        doctorId || apptInfo?.doctor_id || apptInfo?.doctor?.doctor_id || apptInfo?.doctor?.id || 0
    );
    const effectiveClinicId = Number(clinicId || apptInfo?.clinic_id || apptInfo?.clinic?.id || 0);
    const slotDuration = Number(apptInfo?.appointment_duration || 0);

    const [formStates, setFormStates] = useState<IFormStates>({
        selectedDate: '',
        consultationType: 'in-person',
        appointmentType: 'regular',
        selectedSlot: null,
        selectedSlots: [],
        reason: '',
        showCalendarModal: false,
    });
    const [isRefreshing, setIsRefreshing] = useState(false);



    const { data: docSummary, isFetching: isSummaryPending } = useDoctorClinicSummary({
        doctorId: effectiveDoctorId,
        clinicId: effectiveClinicId,
    });

    const { data: availableDatesRes, refetch: refetchAvailableDates, isFetching: isAvailableDatesPending } =
        useDoctorRescheduledAvailDates({
            doctorId: effectiveDoctorId,
            consultation_type: formStates?.consultationType,
            clinicId: effectiveClinicId,
            slot_duration: slotDuration,
        });

    const { data: slotsRes, isFetching: isSlotsPending } = useDoctorTimingsByDate({
        doctorId: effectiveDoctorId,
        date: formStates.selectedDate,
        clinicId: effectiveClinicId,
        consultation_type: formStates.consultationType,
    });

    const updateForm = <K extends keyof IFormStates>(key: K, value: IFormStates[K]) => {
        setFormStates(prev => ({ ...prev, [key]: value }));
    };

    const handleDateChange = (date: string) => {
        setFormStates(prev => ({
            ...prev,
            selectedDate: date,
            selectedSlot: null,
            selectedSlots: [],
        }));
    };

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await refetchApptInfo();
        await refetchAvailableDates();
        setIsRefreshing(false);
    }, [refetchApptInfo, refetchAvailableDates, setIsRefreshing]);

    const handleSlotSelect = (slots: ITimeSlotsDoc[]) => {
        const singleSlot = slots.length > 0 ? [slots[slots.length - 1]] : [];
        setFormStates(prev => ({
            ...prev,
            selectedSlots: singleSlot,
            selectedSlot: singleSlot[0] || null,
        }));
    };

    const handleProceed = () => {
        if (!appointmentId) return showErrorToast(t('appointments.noApptId'));
        if (!formStates?.selectedDate)
            return showErrorToast(t('bookAppointmentScreen.selectDateError'));
        if (formStates?.selectedSlots.length === 0)
            return showErrorToast(t('bookAppointmentScreen.selectSlotsError'));

        const firstSlot = formStates.selectedSlots[0];
        const lastSlot = formStates.selectedSlots[formStates.selectedSlots.length - 1];

        const rawStartTime = firstSlot.from;
        const rawEndTime = lastSlot.to;
        const startTimeNorm = rawStartTime.length === 5 ? `${rawStartTime}:00` : rawStartTime;
        const endTimeNorm = rawEndTime.length === 5 ? `${rawEndTime}:00` : rawEndTime;

        const payload: IRescheduleAppointment = {
            appointment_id: appointmentId,
            appointment_date: formStates.selectedDate,
            start_time: startTimeNorm,
            end_time: endTimeNorm,
            availability_id: formStates.selectedSlots.map(slot => String(slot.availability_id)),
            clinic_id: String(effectiveClinicId),
            appointment_duration: slotDuration,
            reason: formStates.reason.trim(),
            appointment_slot_time: formStates.selectedSlots.map(s => ({
                start: s.from,
                end: s.to,
            })),
        };

        showLoader('Rescheduling appointment...');
        rescheduleAppt(payload, {
            onSuccess: async res => {
                if (res?.success) {
                    showSuccessToast(res?.message || 'Appointment rescheduled successfully');
                    await queryClient.invalidateQueries({
                        queryKey: [AppointmemntQueryKey.ALL_APPOINTMENTS],
                    });
                    await queryClient.invalidateQueries({
                        queryKey: [AppointmemntQueryKey.INFO, appointmentId],
                    });
                    replace(AppRoute.SCHEDULE);
                }
            },
            onSettled: () => {
                hideLoader();
            },
        });
    };

    useEffect(() => {
        if (apptInfo) {
            setFormStates(prev => ({
                ...prev,
                consultationType: apptInfo.consultation_type === 'video' ? 'video' : 'in-person',
                reason: prev.reason || (typeof apptInfo.reason === 'string' ? apptInfo.reason : ''),
            }));
        }
    }, [apptInfo]);

    return (
        <SafeAreaWrapper
            header={
                <Header
                    isBackBtn={true}
                    title={t('rescheduleScreen.title', { defaultValue: 'Reschedule Appointment' })}
                    onBackPress={() => navigation.goBack()}
                    isNotifyShow={false}
                    isLang={false}
                />
            }
        >
            {apptInfoIsError ? (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <CommonErrorCard
                        title={'Appointment Details Not Found'}
                        message={t('bookAppointmentScreen.noApptId')}
                        onRetry={appointmentId ? () => refetchApptInfo() : undefined}
                    />
                </View>
            ) : (
                <>
                    <ScrollView
                        style={rescheduleAppointmentStyles.scroll}
                        contentContainerStyle={rescheduleAppointmentStyles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
                    >
                        {isSummaryPending || apptInfoIsPending ? (
                            <BookingCardSkeleton />
                        ) : (
                            <View style={rescheduleAppointmentStyles.doctorCard}>
                                <View style={rescheduleAppointmentStyles.doctorCardHeader}>
                                    <View style={rescheduleAppointmentStyles.cardHeaderLeft}>
                                        <View style={rescheduleAppointmentStyles.cardHeaderIconBadge}>
                                            <StethoscopeIcon size={13} color={theme.colors.primary} />
                                        </View>
                                        <Text style={rescheduleAppointmentStyles.cardHeaderTitle}>
                                            {t('doctorDetailsScreen.title', { defaultValue: 'Doctor Profile' })}
                                        </Text>
                                    </View>
                                    <View style={rescheduleAppointmentStyles.verifiedBadge}>
                                        <CheckBadgeIcon size={11} color={theme.colors.primary} />
                                        <Text style={rescheduleAppointmentStyles.verifiedBadgeText}>
                                            {t('doctorDetailsScreen.verified', { defaultValue: 'Verified' })}
                                        </Text>
                                    </View>
                                </View>

                                <View style={rescheduleAppointmentStyles.doctorContentRow}>
                                    <View style={rescheduleAppointmentStyles.doctorAvatarWrapper}>
                                        {docSummary?.doctor?.profile_image ? (
                                            <Image
                                                source={{ uri: docSummary.doctor.profile_image }}
                                                style={rescheduleAppointmentStyles.doctorAvatarImage}
                                            />
                                        ) : (
                                            <View style={rescheduleAppointmentStyles.doctorAvatar}>
                                                <Text style={rescheduleAppointmentStyles.doctorAvatarText}>
                                                    {getInitials(docSummary?.doctor?.name || '')}
                                                </Text>
                                            </View>
                                        )}
                                        <View style={rescheduleAppointmentStyles.avatarVerifiedBadge}>
                                            <CheckBadgeIcon size={8} color={theme.colors.surface} />
                                        </View>
                                    </View>

                                    <View style={rescheduleAppointmentStyles.doctorDetails}>
                                        <Text style={rescheduleAppointmentStyles.doctorName} numberOfLines={1}>
                                            {docSummary?.doctor?.name || 'Doctor'}
                                        </Text>
                                        {docSummary?.doctor?.specialization ? (
                                            <View style={rescheduleAppointmentStyles.doctorSpecializationRow}>
                                                <StethoscopeIcon size={11} color={theme.colors.primaryDark} />
                                                <Text style={rescheduleAppointmentStyles.doctorSpecialization} numberOfLines={1}>
                                                    {docSummary.doctor.specialization}
                                                </Text>
                                            </View>
                                        ) : null}
                                        <View style={rescheduleAppointmentStyles.doctorMetaRow}>
                                            {docSummary?.doctor?.experience_years ? (
                                                <View style={rescheduleAppointmentStyles.doctorMetaBadge}>
                                                    <BriefcaseIcon size={11} color={theme.colors.textMuted} />
                                                    <Text style={rescheduleAppointmentStyles.doctorMetaText}>
                                                        {docSummary.doctor.experience_years} Yrs Exp
                                                    </Text>
                                                </View>
                                            ) : null}
                                            {docSummary?.clinic?.name ? (
                                                <View style={rescheduleAppointmentStyles.doctorMetaBadge}>
                                                    <ClinicIcon size={11} color={theme.colors.textMuted} />
                                                    <Text style={rescheduleAppointmentStyles.doctorMetaText} numberOfLines={1}>
                                                        {docSummary.clinic.name}
                                                    </Text>
                                                </View>
                                            ) : null}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}
                        <Text style={rescheduleAppointmentStyles.sectionLabel}>
                            {t('bookAppointmentScreen.patientInfoLabel')}
                        </Text>
                        <View style={rescheduleAppointmentStyles.patientCard}>
                            <View style={rescheduleAppointmentStyles.patientAvatarWrapper}>
                                <View style={rescheduleAppointmentStyles.patientAvatar}>
                                    <Text style={rescheduleAppointmentStyles.patientAvatarText}>
                                        {getInitials(userData?.name || '')}
                                    </Text>
                                </View>
                            </View>
                            <View style={rescheduleAppointmentStyles.patientDetails}>
                                <Text style={rescheduleAppointmentStyles.patientName} numberOfLines={1}>
                                    {userData?.name || 'Patient'}
                                </Text>
                                <View style={rescheduleAppointmentStyles.patientIdBadge}>
                                    <Text style={rescheduleAppointmentStyles.patientId} numberOfLines={1}>
                                        Patient ID • {userData?.patient_id || 'N/A'}
                                    </Text>
                                </View>
                            </View>
                            <View style={rescheduleAppointmentStyles.patientActiveBadge}>
                                <CheckBadgeIcon size={10} color={theme.colors.primary} />
                                <Text style={rescheduleAppointmentStyles.patientActiveText}>Active</Text>
                            </View>
                        </View>
                        <Text style={rescheduleAppointmentStyles.sectionLabel}>
                            {t('bookAppointmentScreen.consultationTypeLabel')}
                        </Text>
                        <View style={rescheduleAppointmentStyles.consultationRow}>
                            <TouchableOpacity
                                style={[
                                    rescheduleAppointmentStyles.consultationChip,
                                    formStates.consultationType === 'in-person' &&
                                    rescheduleAppointmentStyles.consultationChipActive,
                                ]}
                                disabled
                                activeOpacity={0.8}
                            >
                                <CalendarIcon
                                    size={18}
                                    color={
                                        formStates.consultationType === 'in-person'
                                            ? theme.colors.primaryDark
                                            : theme.colors.textSecondary
                                    }
                                />
                                <Text
                                    style={[
                                        rescheduleAppointmentStyles.consultationChipText,
                                        formStates.consultationType === 'in-person' &&
                                        rescheduleAppointmentStyles.consultationChipTextActive,
                                    ]}
                                >
                                    In-Person
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    rescheduleAppointmentStyles.consultationChip,
                                    formStates.consultationType === 'video' &&
                                    rescheduleAppointmentStyles.consultationChipActive,
                                ]}
                                disabled
                                activeOpacity={0.5}
                            >
                                <VideoIcon
                                    size={18}
                                    color={
                                        formStates.consultationType === 'video'
                                            ? theme.colors.primaryDark
                                            : theme.colors.textSecondary
                                    }
                                />
                                <Text
                                    style={[
                                        rescheduleAppointmentStyles.consultationChipText,
                                        formStates.consultationType === 'video' &&
                                        rescheduleAppointmentStyles.consultationChipTextActive,
                                    ]}
                                >
                                    Video Consult
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={rescheduleAppointmentStyles.fieldLabel}>
                            Reason for Visit <Text style={rescheduleAppointmentStyles.optionalHint}>(optional)</Text>
                        </Text>
                        <TextInput
                            placeholder={t('bookAppointmentScreen.reasonPlaceholder')}
                            placeholderTextColor={theme.colors.textMuted}
                            style={rescheduleAppointmentStyles.reasonInput}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            value={formStates.reason}
                            onChangeText={text => updateForm('reason', text)}
                        />
                        {apptInfo?.appointment_date ? (
                            <View style={rescheduleAppointmentStyles.summaryBox}>
                                <Text style={rescheduleAppointmentStyles.summaryTitle}>Current Appointment</Text>
                                <View style={rescheduleAppointmentStyles.summaryRow}>
                                    <Text style={rescheduleAppointmentStyles.summaryLabel}>Date</Text>
                                    <Text style={rescheduleAppointmentStyles.summaryValue}>
                                        {formatDateChip(apptInfo.appointment_date).full}
                                    </Text>
                                </View>
                                <View style={rescheduleAppointmentStyles.summaryRow}>
                                    <Text style={rescheduleAppointmentStyles.summaryLabel}>Time</Text>
                                    <Text style={rescheduleAppointmentStyles.summaryValue}>
                                        {apptInfo.start_time
                                            ? `${formatTime12h(apptInfo.start_time)}${apptInfo.end_time ? ` - ${formatTime12h(apptInfo.end_time)}` : ''
                                            }`
                                            : 'N/A'}
                                    </Text>
                                </View>
                            </View>
                        ) : null}
                        <Text style={rescheduleAppointmentStyles.sectionLabel}>
                            {t('bookAppointmentScreen.selectDateLabel')}
                        </Text>
                        {isAvailableDatesPending || apptInfoIsPending ? (
                            <BookingSlotsSkeleton datesOnly />
                        ) : !availableDatesRes || availableDatesRes?.length === 0 ? (
                            <Text
                                style={{
                                    fontSize: 13,
                                    color: theme.colors.textMuted,
                                    fontStyle: 'italic',
                                    marginBottom: 12,
                                }}
                            >
                                {t('bookAppointmentScreen.noDatesFound')}
                            </Text>
                        ) : (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={rescheduleAppointmentStyles.dateRow}
                            >
                                {availableDatesRes &&
                                    availableDatesRes?.slice(0, 3)?.map((dateStr, idx) => {
                                        const active = dateStr === formStates.selectedDate;
                                        const formatted = formatDateChip(dateStr as string);
                                        return (
                                            <TouchableOpacity
                                                key={`${dateStr}-${idx}`}
                                                style={[
                                                    rescheduleAppointmentStyles.dateChipCard,
                                                    active && rescheduleAppointmentStyles.dateChipCardActive,
                                                ]}
                                                onPress={() => handleDateChange(dateStr)}
                                                activeOpacity={0.8}
                                            >
                                                <Text
                                                    style={[
                                                        rescheduleAppointmentStyles.dateChipTopText,
                                                        active && rescheduleAppointmentStyles.dateChipTopTextActive,
                                                    ]}
                                                >
                                                    {formatted.labelTop}
                                                </Text>
                                                <Text
                                                    style={[
                                                        rescheduleAppointmentStyles.dateChipBottomText,
                                                        active && rescheduleAppointmentStyles.dateChipBottomTextActive,
                                                    ]}
                                                >
                                                    {formatted.labelBottom}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                <TouchableOpacity
                                    style={rescheduleAppointmentStyles.calendarIconBtn}
                                    onPress={() => updateForm('showCalendarModal', true)}
                                    activeOpacity={0.8}
                                >
                                    <CalendarIcon size={22} color={theme.colors.primaryDark} />
                                </TouchableOpacity>
                            </ScrollView>
                        )}

                        {formStates.selectedDate && (
                            <>
                                <Text style={rescheduleAppointmentStyles.sectionLabel}>
                                    {t('bookAppointmentScreen.selectTimeLabel')}
                                </Text>
                                <TimeSlotPicker
                                    availSlots={slotsRes?.slots || []}
                                    selectedSlots={formStates.selectedSlots}
                                    multiSelect={false}
                                    onSelectSlots={handleSlotSelect}
                                    isLoading={isSlotsPending}
                                />
                            </>
                        )}

                        <View style={rescheduleAppointmentStyles.summaryBox}>
                            <Text style={rescheduleAppointmentStyles.summaryTitle}>
                                {t('bookAppointmentScreen.appointmentSummary')}
                            </Text>

                            <View style={rescheduleAppointmentStyles.summaryRow}>
                                <Text style={rescheduleAppointmentStyles.summaryLabel}>
                                    {t('bookAppointmentScreen.doctorLabel')}
                                </Text>
                                <Text style={rescheduleAppointmentStyles.summaryValue}>
                                    {docSummary?.doctor?.name || 'N/A'}
                                </Text>
                            </View>

                            <View style={rescheduleAppointmentStyles.summaryRow}>
                                <Text style={rescheduleAppointmentStyles.summaryLabel}>
                                    {t('bookAppointmentScreen.clinicLabel')}
                                </Text>
                                <Text style={rescheduleAppointmentStyles.summaryValue}>
                                    {docSummary?.clinic?.name || 'N/A'}
                                </Text>
                            </View>

                            <View style={rescheduleAppointmentStyles.summaryRow}>
                                <Text style={rescheduleAppointmentStyles.summaryLabel}>
                                    {t('bookAppointmentScreen.consultationLabel')}
                                </Text>
                                <Text style={rescheduleAppointmentStyles.summaryValue}>
                                    {formStates.consultationType === 'in-person' ? 'In-Person' : 'Video Call'}
                                </Text>
                            </View>

                            <View style={rescheduleAppointmentStyles.summaryRow}>
                                <Text style={rescheduleAppointmentStyles.summaryLabel}>Previous Date</Text>
                                <Text style={rescheduleAppointmentStyles.summaryValue}>
                                    {apptInfo?.appointment_date
                                        ? formatDateChip(apptInfo.appointment_date).full
                                        : 'N/A'}
                                </Text>
                            </View>

                            <View style={rescheduleAppointmentStyles.summaryRow}>
                                <Text style={rescheduleAppointmentStyles.summaryLabel}>Previous Time</Text>
                                <Text style={rescheduleAppointmentStyles.summaryValue}>
                                    {apptInfo?.start_time
                                        ? `${formatTime12h(apptInfo.start_time)}${apptInfo.end_time ? ` - ${formatTime12h(apptInfo.end_time)}` : ''
                                        }`
                                        : 'N/A'}
                                </Text>
                            </View>

                            <View style={rescheduleAppointmentStyles.summaryRow}>
                                <Text style={rescheduleAppointmentStyles.summaryLabel}>New Date</Text>
                                <Text style={rescheduleAppointmentStyles.summaryValue}>
                                    {formStates.selectedDate
                                        ? formatDateChip(formStates.selectedDate).full
                                        : t('bookAppointmentScreen.notSelected')}
                                </Text>
                            </View>

                            <View style={rescheduleAppointmentStyles.summaryRow}>
                                <Text style={rescheduleAppointmentStyles.summaryLabel}>New Time</Text>
                                <Text style={rescheduleAppointmentStyles.summaryValue}>
                                    {formStates.selectedSlots.length > 0
                                        ? `${formatTime12h(formStates.selectedSlots[0].from)} - ${formatTime12h(
                                            formStates.selectedSlots[formStates.selectedSlots.length - 1].to
                                        )}${formStates.selectedSlots.length > 1
                                            ? ` (${formStates.selectedSlots.length} slots)`
                                            : ''
                                        }`
                                        : t('bookAppointmentScreen.notSelected')}
                                </Text>
                            </View>
                        </View>
                    </ScrollView>

                    <View style={rescheduleAppointmentStyles.footer}>
                        <TouchableOpacity
                            style={[
                                rescheduleAppointmentStyles.proceedBtn,
                                (!formStates.selectedDate || formStates.selectedSlots.length === 0) && {
                                    opacity: 0.6,
                                },
                            ]}
                            disabled={!formStates.selectedDate || formStates.selectedSlots.length === 0}
                            activeOpacity={0.85}
                            onPress={handleProceed}
                        >
                            <Text style={rescheduleAppointmentStyles.proceedBtnText}>Reschedule</Text>
                        </TouchableOpacity>
                    </View>
                    <CalendarDatePickerModal
                        visible={formStates.showCalendarModal}
                        availableDates={availableDatesRes || []}
                        onSelectDate={d => {
                            const yyyy = d.getFullYear();
                            const mm = String(d.getMonth() + 1).padStart(2, '0');
                            const dd = String(d.getDate()).padStart(2, '0');
                            handleDateChange(`${yyyy}-${mm}-${dd}`);
                        }}
                        onClose={() => updateForm('showCalendarModal', false)}
                    />
                </>
            )}
        </SafeAreaWrapper>
    );
};

export default RescheduledScreen;
