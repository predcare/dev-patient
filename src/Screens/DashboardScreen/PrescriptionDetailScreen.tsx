import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AlertIcon,
  BackIcon,
  CalendarIcon,
  ClockIcon,
  PillIcon,
  StethoscopeIcon,
  UploadIcon,
} from '../../components/ui/icons';
import { MOCK_PRESCRIPTIONS, PrescriptionDetailData } from '../../resources/mockData';
import { prescriptionsStyles } from '../../styled/PrescriptionsScreen.styled';
import { theme } from '../../styled/theme.styled';

const SectionLabel = ({ title, badge }: { title: string; badge?: string }) => (
  <View style={prescriptionsStyles.detailSectionHeader}>
    <Text style={prescriptionsStyles.detailSectionLabel}>{title}</Text>
    {badge ? (
      <View style={prescriptionsStyles.countBadge}>
        <Text style={prescriptionsStyles.countBadgeText}>{badge}</Text>
      </View>
    ) : null}
  </View>
);

export const PrescriptionDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const paramItem = route.params?.prescription;
  const paramId = route.params?.prescriptionId;

  const item: PrescriptionDetailData =
    paramItem ||
    MOCK_PRESCRIPTIONS.find(p => p.id === paramId) ||
    MOCK_PRESCRIPTIONS[0];

  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      Alert.alert(
        'PDF Saved',
        `Prescription ${item.rx_number} saved to your device Downloads folder.`,
        [{ text: 'OK' }],
      );
    }, 800);
  };

  const getInitials = (name: string) => {
    if (!name) return 'P';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name[0].toUpperCase();
  };

  const displayDoctorName = (name: string) => {
    if (!name) return 'Doctor';
    return /^dr\.?\s/i.test(name) ? name : `Dr. ${name}`;
  };

  const ageLabel = item.patient_age ? `${item.patient_age} Years` : '';
  const genderLabel = item.patient_gender
    ? item.patient_gender.charAt(0).toUpperCase() + item.patient_gender.slice(1)
    : '';

  const hasHistory = !!item.drug_allergies || !!item.chronic_conditions;

  return (
    <SafeAreaView style={prescriptionsStyles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />

      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.surfaceBorder,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={{ padding: 4 }}
        >
          <BackIcon size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary }}>
          Prescription Details
        </Text>
        <TouchableOpacity onPress={handleDownloadPdf} activeOpacity={0.7} style={{ padding: 4 }}>
          <UploadIcon size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={prescriptionsStyles.detailScroll}
        contentContainerStyle={prescriptionsStyles.detailContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Prescription ID Bar */}
        <View style={prescriptionsStyles.rxIdBar}>
          <Text style={prescriptionsStyles.rxIdLabel}>PRESCRIPTION ID</Text>
          <View style={prescriptionsStyles.rxIdValueWrap}>
            <Text style={prescriptionsStyles.rxIdValue}>{item.rx_number}</Text>
          </View>
        </View>

        {/* Patient Card */}
        <View style={prescriptionsStyles.detailCard}>
          <View style={prescriptionsStyles.patientRow}>
            <View style={prescriptionsStyles.avatarCircle}>
              <Text style={prescriptionsStyles.avatarText}>{getInitials(item.patient_name)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={prescriptionsStyles.patientName}>{item.patient_name}</Text>
              <View style={prescriptionsStyles.badgeRow}>
                {ageLabel ? (
                  <View style={prescriptionsStyles.metaBadge}>
                    <Text style={prescriptionsStyles.metaBadgeText}>{ageLabel}</Text>
                  </View>
                ) : null}
                {genderLabel ? (
                  <View style={prescriptionsStyles.metaBadge}>
                    <Text style={prescriptionsStyles.metaBadgeText}>{genderLabel}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </View>

        {/* Doctor Card */}
        <View style={prescriptionsStyles.detailCard}>
          <View style={prescriptionsStyles.doctorRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={prescriptionsStyles.doctorName}>
                {displayDoctorName(item.doctor_name)}
              </Text>
              {!!item.specialization && (
                <Text style={prescriptionsStyles.doctorSpec}>{item.specialization}</Text>
              )}
              {!!item.clinic_name && (
                <Text style={prescriptionsStyles.clinicName}>{item.clinic_name.toUpperCase()}</Text>
              )}
            </View>
            <View style={prescriptionsStyles.dateBadge}>
              <Text style={prescriptionsStyles.dateBadgeLabel}>DATE</Text>
              <Text style={prescriptionsStyles.dateBadgeValue}>
                {item.consultation_date_label}
              </Text>
            </View>
          </View>
        </View>

        {/* Patient History Section */}
        {hasHistory && (
          <>
            <SectionLabel title="PATIENT HISTORY" />
            {item.drug_allergies ? (
              <View style={prescriptionsStyles.detailCard}>
                <Text style={prescriptionsStyles.vitalLabel}>DRUG ALLERGIES</Text>
                <Text style={prescriptionsStyles.diagnosisText}>{item.drug_allergies}</Text>
              </View>
            ) : null}
            {item.chronic_conditions ? (
              <View style={prescriptionsStyles.detailCard}>
                <Text style={prescriptionsStyles.vitalLabel}>CHRONIC CONDITIONS</Text>
                <Text style={prescriptionsStyles.diagnosisText}>{item.chronic_conditions}</Text>
              </View>
            ) : null}
          </>
        )}

        {/* Symptoms / Chief Complaints Section */}
        <SectionLabel title="SYMPTOMS / CHIEF COMPLAINTS" />
        <View style={prescriptionsStyles.detailCard}>
          <Text style={prescriptionsStyles.diagnosisText}>{item.diagnosis}</Text>
          {item.symptoms ? (
            <Text style={[prescriptionsStyles.bodyText, { marginTop: 6 }]}>
              Symptoms: {item.symptoms}
            </Text>
          ) : null}
        </View>

        {/* Vital Signs Section */}
        {item.vitals && item.vitals.length > 0 && (
          <>
            <SectionLabel title="VITAL SIGNS" />
            <View style={prescriptionsStyles.vitalsGrid}>
              {item.vitals.map((v, i) => (
                <View key={i} style={prescriptionsStyles.vitalCard}>
                  <Text style={prescriptionsStyles.vitalLabel}>{v.label}</Text>
                  <Text
                    style={[
                      prescriptionsStyles.vitalValue,
                      v.isDanger && prescriptionsStyles.vitalValueDanger,
                    ]}
                  >
                    {v.value} <Text style={prescriptionsStyles.vitalUnit}>{v.unit}</Text>
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Prescribed Medications Section */}
        <SectionLabel
          title="MEDICATIONS"
          badge={`${item.medications.length} ITEM${item.medications.length > 1 ? 'S' : ''}`}
        />
        {item.medications.map(med => (
          <View key={med.id} style={prescriptionsStyles.detailCard}>
            <View style={prescriptionsStyles.medTop}>
              <View style={{ flex: 1 }}>
                <Text style={prescriptionsStyles.medName}>{med.name}</Text>
                <Text style={{ fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 }}>
                  {med.dosage}
                </Text>
              </View>
              <View style={prescriptionsStyles.medScheduleWrap}>
                <Text style={prescriptionsStyles.medSchedule}>{med.schedule}</Text>
                <Text style={prescriptionsStyles.medScheduleSub}>{med.scheduleSub}</Text>
              </View>
            </View>

            {med.isSos ? (
              <View style={prescriptionsStyles.sosRow}>
                <AlertIcon size={14} color={theme.colors.danger} />
                <Text style={prescriptionsStyles.sosText}>
                  {med.notes || 'Max doses as advised'}
                </Text>
              </View>
            ) : (
              <>
                <View style={prescriptionsStyles.medMetaRow}>
                  <CalendarIcon size={14} color={theme.colors.primary} />
                  <Text style={prescriptionsStyles.medMetaText}>
                    {med.duration} • {med.timing}
                  </Text>
                </View>
                {med.notes ? (
                  <Text style={prescriptionsStyles.medNotes}>{med.notes}</Text>
                ) : null}
              </>
            )}
          </View>
        ))}

        {/* Lab Tests Section */}
        {item.lab_tests && item.lab_tests.length > 0 && (
          <>
            <SectionLabel
              title="LAB TESTS"
              badge={`${item.lab_tests.length} ITEM${item.lab_tests.length > 1 ? 'S' : ''}`}
            />
            {item.lab_tests.map(lab => (
              <View key={lab.id} style={prescriptionsStyles.detailCard}>
                <Text style={prescriptionsStyles.medName}>{lab.name}</Text>
                {lab.instructions ? (
                  <Text style={prescriptionsStyles.medNotes}>
                    Instructions: {lab.instructions}
                  </Text>
                ) : null}
              </View>
            ))}
          </>
        )}

        {/* Doctor's Advice */}
        {item.advice ? (
          <View style={prescriptionsStyles.adviceCard}>
            <View style={prescriptionsStyles.adviceHeader}>
              <StethoscopeIcon size={18} color={theme.colors.primary} />
              <Text style={prescriptionsStyles.adviceLabel}>DOCTOR'S ADVICE</Text>
            </View>
            <Text style={prescriptionsStyles.adviceText}>{item.advice}</Text>
          </View>
        ) : null}

        {/* Follow-Up Date */}
        {item.follow_up_date ? (
          <View style={prescriptionsStyles.followUpCard}>
            <View style={prescriptionsStyles.followUpLeft}>
              <View style={prescriptionsStyles.followUpIcon}>
                <CalendarIcon size={20} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={prescriptionsStyles.followUpLabel}>FOLLOW-UP DATE</Text>
                <Text style={prescriptionsStyles.followUpValue}>{item.follow_up_date}</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Referral Specialist Card */}
        {item.referral_specialist ? (
          <>
            <SectionLabel title="REFERRAL SPECIALIST" />
            <View style={prescriptionsStyles.detailCard}>
              <Text style={prescriptionsStyles.doctorName}>{item.referral_specialist}</Text>
              {item.referral_doctor_hospital && (
                <Text style={prescriptionsStyles.clinicName}>
                  {item.referral_doctor_hospital.toUpperCase()}
                </Text>
              )}
            </View>
          </>
        ) : null}

        {/* Save / Open PDF Action */}
        <TouchableOpacity
          style={prescriptionsStyles.pdfBtn}
          onPress={handleDownloadPdf}
          activeOpacity={0.85}
        >
          <Text style={prescriptionsStyles.pdfBtnText}>
            {downloading ? 'Preparing PDF...' : 'Open / Save PDF'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrescriptionDetailScreen;
