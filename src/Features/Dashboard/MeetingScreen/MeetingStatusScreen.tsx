import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Header from '../../../Layout/Header';
import SafeAreaWrapper from '../../../Layout/SafeAreaWrapper';
import {
    CalendarIcon,
    CheckBadgeIcon,
    CheckIcon,
    ClockIcon,
    HomeIcon,
    ProfileIcon,
    VideoIcon
} from '../../../components/ui/icons';
import { AppRoute, ConsultationCompletedScreenNavigationProp } from '../../../route';
import consultationCompletedStyles from '../../../styled/ConsultationCompletedScreen.styled';
import theme from '../../../styled/theme.styled';

const STATIC_CONSULTATION = {
    appointmentId: '#PRD-89421',
    doctorName: 'Dr. Sahil Mallick',
    doctorSpecialty: 'Cardiologist • MD',
    doctorClinic: 'Cardiology Clinic • Main Branch',
    doctorInitial: 'S',
    patientName: 'Sahil Mallick',
    patientRole: 'Self (Patient)',
    patientInitial: 'S',
    consultationType: 'Video Consultation',
    dateLabel: '26 Aug 2026',
    timeSlot: '10:30 AM - 11:00 AM',
    durationLabel: '24m 15s',
    status: 'Completed',
    doctorNotes:
        'Blood pressure stable (120/80 mmHg). Continue current medication regimen and low-sodium diet.',
    followUp: 'After 4 Weeks (23 Sep 2026)',
    rxNumber: 'RX-78210',
    medicinesCount: '3 Medicines Prescribed',
};

export const ConsultationCompletedScreen: React.FC = () => {
    const navigation = useNavigation<ConsultationCompletedScreenNavigationProp>();

    const handleGoHome = () => {
        navigation.navigate(AppRoute.HOME);
    };

    const handleViewAppointments = () => {
        navigation.navigate(AppRoute.SCHEDULE);
    };

    const handleViewPrescriptions = () => {
        navigation.navigate(AppRoute.PRESCRIPTIONS_LIST);
    };

    return (
        <SafeAreaWrapper
            header={
                <Header
                    title="Visit Summary"
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
            >
                <View style={consultationCompletedStyles.heroSection}>
                    <View style={consultationCompletedStyles.checkCircleOuter}>
                        <View style={consultationCompletedStyles.checkCircleInner}>
                            <CheckIcon size={26} color={theme.colors.surface} />
                        </View>
                    </View>
                    <Text style={consultationCompletedStyles.heading}>Consultation Completed!</Text>
                    <Text style={consultationCompletedStyles.subheading}>
                        Your video session has concluded and your visit details are saved.
                    </Text>
                </View>
                <View style={consultationCompletedStyles.card}>
                    <View style={consultationCompletedStyles.doctorRow}>
                        <View style={consultationCompletedStyles.doctorAvatarWrap}>
                            <View style={consultationCompletedStyles.doctorAvatar}>
                                <Text style={consultationCompletedStyles.doctorAvatarTxt}>
                                    {STATIC_CONSULTATION.doctorInitial}
                                </Text>
                            </View>
                            <View style={consultationCompletedStyles.verifiedBadge}>
                                <CheckBadgeIcon size={16} color={theme.colors.primary} />
                            </View>
                        </View>

                        <View style={consultationCompletedStyles.doctorDetails}>
                            <Text style={consultationCompletedStyles.doctorName}>
                                {STATIC_CONSULTATION.doctorName}
                            </Text>
                            <Text style={consultationCompletedStyles.doctorSpecialty}>
                                {STATIC_CONSULTATION.doctorSpecialty}
                            </Text>
                            <Text style={consultationCompletedStyles.doctorClinic}>
                                {STATIC_CONSULTATION.doctorClinic}
                            </Text>
                        </View>
                        <View style={consultationCompletedStyles.statusBadge}>
                            <View style={consultationCompletedStyles.statusDot} />
                            <Text style={consultationCompletedStyles.statusBadgeText}>
                                {STATIC_CONSULTATION.status}
                            </Text>
                        </View>
                    </View>
                    <View style={consultationCompletedStyles.cardDivider} />

                    <View style={consultationCompletedStyles.cardMetaRow}>
                        <View style={consultationCompletedStyles.typePill}>
                            <VideoIcon size={14} color={theme.colors.primary} />
                            <Text style={consultationCompletedStyles.typePillText}>
                                {STATIC_CONSULTATION.consultationType}
                            </Text>
                        </View>
                        <View style={consultationCompletedStyles.refIdContainer}>
                            <Text style={consultationCompletedStyles.refIdLabel}>Ref: </Text>
                            <Text style={consultationCompletedStyles.refIdValue}>
                                {STATIC_CONSULTATION.appointmentId}
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
                            {STATIC_CONSULTATION.dateLabel}
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
                            {STATIC_CONSULTATION.timeSlot}
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
                            {STATIC_CONSULTATION.durationLabel}
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
                            {STATIC_CONSULTATION.patientName}
                        </Text>
                    </View>
                </View>
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

export default ConsultationCompletedScreen;
