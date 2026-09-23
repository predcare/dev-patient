import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import FileViewer from 'react-native-file-viewer';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import PrescriptionDetailSkeleton from '../../components/Skeletons/PrescriptionDetailSkeleton';
import CommonErrorCard from '../../components/commons/CommonErrorCard/CommonErrorCard';
import { BackIcon, CalendarIcon, StethoscopeIcon, UploadIcon } from '../../components/ui/icons';
import {
  useDownloadPrescriptionPdf,
  useGetPrescriptionInfo,
} from '../../hooks/react-query/prescriptions/prescriptions.hooks';
import { capitalize, formatDate, getInitials } from '../../lib/common/common.utils';
import { showErrorToast } from '../../lib/common/toast.utils';
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
  const navigation = useNavigation();
  const route = useRoute<any>();
  const paramId = route.params?.prescriptionId || '';
  const [downloadProgress, setDownloadProgress] = useState(0);
  const { mutate: downloadPdfMutation, isPending: downloadPdfLoading } =
    useDownloadPrescriptionPdf();

  const {
    data: rxInfo,
    isFetching: isRxPending,
    error,
    refetch,
  } = useGetPrescriptionInfo({
    id: Number(paramId),
  });

  const vitalsList = useMemo(
    () =>
      [
        rxInfo?.blood_pressure && {
          label: 'BLOOD PRESSURE',
          value: rxInfo.blood_pressure,
          unit: 'mmHg',
        },
        rxInfo?.pulse && { label: 'PULSE', value: rxInfo.pulse, unit: 'bpm' },
        rxInfo?.temperature && { label: 'TEMPERATURE', value: rxInfo.temperature, unit: '°C' },
        rxInfo?.spo2 && { label: 'SPO2', value: rxInfo.spo2, unit: '%' },
        rxInfo?.weight && { label: 'WEIGHT', value: String(rxInfo.weight), unit: 'kg' },
        rxInfo?.height && { label: 'HEIGHT', value: String(rxInfo.height), unit: 'cm' },
        rxInfo?.bmi && { label: 'BMI', value: String(rxInfo.bmi), unit: 'kg/m²' },
      ].filter(Boolean) as { label: string; value: string; unit: string }[],
    [rxInfo]
  );

  const handleDownloadPDF = useCallback(() => {
    if (!rxInfo?.id) {
      showErrorToast('Prescription ID is missing', 'Download Failed');
      return;
    }
    setDownloadProgress(0);
    downloadPdfMutation(
      {
        id: rxInfo.id,
        onProgress: setDownloadProgress,
      },
      {
        onSuccess: async localPath => {
          if (localPath) {
            try {
              await FileViewer.open(localPath, {
                showOpenWithDialog: true,
                showAppsSuggestions: true,
              });
            } catch (error) {
              console.error(error);
              showErrorToast('Failed to open PDF viewer');
            }
          }
          setDownloadProgress(0);
        },
        onError: () => {
          setDownloadProgress(0);
        },
      }
    );
  }, [rxInfo?.id, downloadPdfMutation]);

  return (
    <SafeAreaWrapper style={prescriptionsStyles.screen} showBottomBar isPathClear>
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
        <TouchableOpacity
          onPress={handleDownloadPDF}
          activeOpacity={0.7}
          style={{ padding: 4, minWidth: 36, alignItems: 'center', justifyContent: 'center' }}
          disabled={downloadPdfLoading}
        >
          {downloadPdfLoading ? (
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.colors.primary }}>
              {downloadProgress > 0 ? `${downloadProgress}%` : '0%'}
            </Text>
          ) : (
            <UploadIcon size={20} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {isRxPending ? (
        <ScrollView
          style={prescriptionsStyles.detailScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <PrescriptionDetailSkeleton />
        </ScrollView>
      ) : !rxInfo || error ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <CommonErrorCard
            title="Unable to Load Prescription"
            message="We couldn't retrieve the prescription details. Please try again."
            onRetry={async () => await refetch()}
          />
        </View>
      ) : (
        <ScrollView
          style={prescriptionsStyles.detailScroll}
          contentContainerStyle={prescriptionsStyles.detailContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={prescriptionsStyles.rxIdBar}>
            <View>
              <Text style={prescriptionsStyles.rxIdLabel}>PRESCRIPTION ID</Text>
              <Text style={[prescriptionsStyles.rxIdValue, { marginTop: 2 }]}>
                {rxInfo.prescription_id}
              </Text>
            </View>
            {rxInfo.status ? (
              <View style={prescriptionsStyles.statusBadge}>
                <Text style={prescriptionsStyles.statusBadgeText}>{rxInfo.status}</Text>
              </View>
            ) : null}
          </View>
          <View style={prescriptionsStyles.detailCard}>
            <View style={prescriptionsStyles.patientRow}>
              <View style={prescriptionsStyles.avatarCircle}>
                <Text style={prescriptionsStyles.avatarText}>
                  {getInitials(rxInfo.patient_name || 'Patient')}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={prescriptionsStyles.patientName}>{rxInfo.patient_name || 'N/A'}</Text>
                <View style={prescriptionsStyles.badgeRow}>
                  {rxInfo.patient_display_id ? (
                    <View style={prescriptionsStyles.metaBadge}>
                      <Text style={prescriptionsStyles.metaBadgeText}>
                        {rxInfo.patient_display_id}
                      </Text>
                    </View>
                  ) : null}
                  {rxInfo.patient_age ? (
                    <View style={prescriptionsStyles.metaBadge}>
                      <Text style={prescriptionsStyles.metaBadgeText}>
                        {rxInfo.patient_age} Years
                      </Text>
                    </View>
                  ) : null}
                  {rxInfo.patient_gender ? (
                    <View style={prescriptionsStyles.metaBadge}>
                      <Text style={prescriptionsStyles.metaBadgeText}>
                        {capitalize(rxInfo.patient_gender)}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          </View>
          <View style={prescriptionsStyles.detailCard}>
            <View style={prescriptionsStyles.doctorRow}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={prescriptionsStyles.doctorName}>Dr. {rxInfo.doctor_name}</Text>
                {!!rxInfo.doctor_specialization && (
                  <Text style={prescriptionsStyles.doctorSpec}>{rxInfo.doctor_specialization}</Text>
                )}
                <View style={prescriptionsStyles.doctorMetaRow}>
                  {!!rxInfo.doctor_qualifications && (
                    <Text style={prescriptionsStyles.doctorMetaText}>
                      {rxInfo.doctor_qualifications}
                    </Text>
                  )}
                  {!!rxInfo.doctor_experience_years && (
                    <Text style={prescriptionsStyles.doctorMetaText}>
                      • {rxInfo.doctor_experience_years} Yrs Exp
                    </Text>
                  )}
                  {!!rxInfo.doctor_license_number && (
                    <Text style={prescriptionsStyles.doctorMetaText}>
                      • Lic: {rxInfo.doctor_license_number}
                    </Text>
                  )}
                </View>
              </View>
              <View style={prescriptionsStyles.dateBadge}>
                <Text style={prescriptionsStyles.dateBadgeLabel}>DATE</Text>
                <Text style={prescriptionsStyles.dateBadgeValue}>
                  {formatDate(rxInfo.consultation_date || rxInfo.created_at)}
                </Text>
              </View>
            </View>
            {(rxInfo.clinic_name || rxInfo.clinic_address) && (
              <View style={prescriptionsStyles.clinicInfoBlock}>
                {!!rxInfo.clinic_name && (
                  <Text style={prescriptionsStyles.clinicName}>
                    {rxInfo.clinic_name.toUpperCase()}
                  </Text>
                )}
                {!!rxInfo.clinic_address && (
                  <Text style={prescriptionsStyles.clinicAddressText}>{rxInfo.clinic_address}</Text>
                )}
                {!!(rxInfo.clinic_phone || rxInfo.clinic_email) && (
                  <Text style={prescriptionsStyles.clinicContactText}>
                    {[rxInfo.clinic_phone, rxInfo.clinic_email].filter(Boolean).join(' • ')}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Patient Medical History */}
          {Boolean(rxInfo?.drug_allergies || rxInfo?.chronic_conditions) && (
            <>
              <SectionLabel title="PATIENT HISTORY" />
              {rxInfo.drug_allergies ? (
                <View style={prescriptionsStyles.detailCard}>
                  <Text style={prescriptionsStyles.vitalLabel}>DRUG ALLERGIES</Text>
                  <Text style={prescriptionsStyles.diagnosisText}>{rxInfo.drug_allergies}</Text>
                </View>
              ) : null}
              {rxInfo.chronic_conditions ? (
                <View style={prescriptionsStyles.detailCard}>
                  <Text style={prescriptionsStyles.vitalLabel}>CHRONIC CONDITIONS</Text>
                  <Text style={prescriptionsStyles.diagnosisText}>{rxInfo.chronic_conditions}</Text>
                </View>
              ) : null}
            </>
          )}
          {/* Clinical Assessment / Complaints / Diagnosis */}
          {Boolean(
            rxInfo.diagnosis ||
              rxInfo.chief_complaints ||
              rxInfo.symptoms ||
              rxInfo.examination_notes ||
              rxInfo.treatment_plan
          ) && (
            <>
              <SectionLabel title="CLINICAL NOTES & DIAGNOSIS" />
              <View style={prescriptionsStyles.detailCard}>
                {rxInfo.diagnosis ? (
                  <View>
                    <Text style={prescriptionsStyles.vitalLabel}>DIAGNOSIS</Text>
                    <Text style={prescriptionsStyles.diagnosisText}>{rxInfo.diagnosis}</Text>
                  </View>
                ) : null}

                {rxInfo.chief_complaints ? (
                  <View style={prescriptionsStyles.sectionSubBlock}>
                    <Text style={prescriptionsStyles.sectionSubTitle}>Chief Complaints</Text>
                    <Text style={prescriptionsStyles.sectionSubValue}>
                      {rxInfo.chief_complaints}
                    </Text>
                  </View>
                ) : null}

                {rxInfo.symptoms ? (
                  <View style={prescriptionsStyles.sectionSubBlock}>
                    <Text style={prescriptionsStyles.sectionSubTitle}>Symptoms</Text>
                    <Text style={prescriptionsStyles.sectionSubValue}>{rxInfo.symptoms}</Text>
                  </View>
                ) : null}

                {rxInfo.examination_notes ? (
                  <View style={prescriptionsStyles.sectionSubBlock}>
                    <Text style={prescriptionsStyles.sectionSubTitle}>Examination Notes</Text>
                    <Text style={prescriptionsStyles.sectionSubValue}>
                      {rxInfo.examination_notes}
                    </Text>
                  </View>
                ) : null}

                {rxInfo.treatment_plan ? (
                  <View style={prescriptionsStyles.sectionSubBlock}>
                    <Text style={prescriptionsStyles.sectionSubTitle}>Treatment Plan</Text>
                    <Text style={prescriptionsStyles.sectionSubValue}>{rxInfo.treatment_plan}</Text>
                  </View>
                ) : null}
              </View>
            </>
          )}

          {/* Vital Signs Section */}
          {(vitalsList.length > 0 || Boolean(rxInfo.custom_vitals?.length)) && (
            <>
              <SectionLabel title="VITAL SIGNS" />
              <View style={prescriptionsStyles.vitalsGrid}>
                {vitalsList.map((v, i) => (
                  <View key={`std-vital-${i}`} style={prescriptionsStyles.vitalCard}>
                    <Text style={prescriptionsStyles.vitalLabel}>{v.label}</Text>
                    <Text style={prescriptionsStyles.vitalValue}>
                      {v.value} <Text style={prescriptionsStyles.vitalUnit}>{v.unit}</Text>
                    </Text>
                  </View>
                ))}
                {rxInfo.custom_vitals?.map((cv, i) => (
                  <View key={`custom-vital-${i}`} style={prescriptionsStyles.vitalCard}>
                    <Text style={prescriptionsStyles.vitalLabel}>
                      {(cv.name || 'CUSTOM').toUpperCase()}
                    </Text>
                    <Text style={prescriptionsStyles.vitalValue}>{cv.value}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Prescribed Medications Section */}
          {Boolean(rxInfo.medications?.length) && (
            <>
              <SectionLabel
                title="MEDICATIONS"
                badge={`${rxInfo.medications.length} ITEM${
                  rxInfo.medications.length > 1 ? 'S' : ''
                }`}
              />
              {rxInfo.medications.map((med, index) => {
                const strengthText = [med.strength, med.strengthUnit].filter(Boolean).join(' ');
                const durationText = [med.durationNum, med.durationUnit].filter(Boolean).join(' ');

                return (
                  <View key={`med-${index}`} style={prescriptionsStyles.detailCard}>
                    <View style={prescriptionsStyles.medTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={prescriptionsStyles.medName}>{med.name}</Text>
                        {!!strengthText && (
                          <Text
                            style={{
                              fontSize: 13,
                              color: theme.colors.textSecondary,
                              marginTop: 2,
                            }}
                          >
                            Strength: {strengthText}
                          </Text>
                        )}
                      </View>
                      {!!med.dosage && (
                        <View style={prescriptionsStyles.medScheduleWrap}>
                          <Text style={prescriptionsStyles.medSchedule}>{med.dosage}</Text>
                        </View>
                      )}
                    </View>

                    {(med.timing || durationText) && (
                      <View style={prescriptionsStyles.medMetaRow}>
                        <CalendarIcon size={14} color={theme.colors.primary} />
                        <Text style={prescriptionsStyles.medMetaText}>
                          {[durationText, med.timing].filter(Boolean).join(' • ')}
                        </Text>
                      </View>
                    )}

                    {med.instructions ? (
                      <Text style={prescriptionsStyles.medNotes}>
                        Instructions: {med.instructions}
                      </Text>
                    ) : null}
                  </View>
                );
              })}
            </>
          )}

          {/* Lab Tests Section */}
          {Boolean(rxInfo.lab_tests?.length) && (
            <>
              <SectionLabel
                title="LAB TESTS"
                badge={`${rxInfo.lab_tests.length} ITEM${rxInfo.lab_tests.length > 1 ? 'S' : ''}`}
              />
              {rxInfo.lab_tests.map((lab, index) => (
                <View key={`lab-${index}`} style={prescriptionsStyles.detailCard}>
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

          {/* Doctor's Advice & General Notes */}
          {(rxInfo.general_advice || rxInfo.notes) && (
            <View style={prescriptionsStyles.adviceCard}>
              <View style={prescriptionsStyles.adviceHeader}>
                <StethoscopeIcon size={18} color={theme.colors.primary} />
                <Text style={prescriptionsStyles.adviceLabel}>DOCTOR'S ADVICE</Text>
              </View>
              {rxInfo.general_advice ? (
                <Text style={prescriptionsStyles.adviceText}>{rxInfo.general_advice}</Text>
              ) : null}
              {rxInfo.notes ? (
                <Text style={[prescriptionsStyles.adviceText, { marginTop: 6 }]}>
                  {rxInfo.notes}
                </Text>
              ) : null}
            </View>
          )}

          {/* Follow-Up Date */}
          {rxInfo?.follow_up_date ? (
            <View style={prescriptionsStyles.followUpCard}>
              <View style={prescriptionsStyles.followUpLeft}>
                <View style={prescriptionsStyles.followUpIcon}>
                  <CalendarIcon size={20} color={theme.colors.primary} />
                </View>
                <View>
                  <Text style={prescriptionsStyles.followUpLabel}>FOLLOW-UP DATE</Text>
                  <Text style={prescriptionsStyles.followUpValue}>
                    {formatDate(rxInfo?.follow_up_date, 'DD-MMM-YYYY') || ''}
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          {/* Referral Specialist Card */}
          {Boolean(
            rxInfo.referral_specialist || rxInfo.referral_doctor_hospital || rxInfo.referral_reason
          ) && (
            <>
              <SectionLabel title="REFERRAL SPECIALIST" />
              <View style={prescriptionsStyles.detailCard}>
                {rxInfo.referral_specialist ? (
                  <Text style={prescriptionsStyles.doctorName}>{rxInfo.referral_specialist}</Text>
                ) : null}
                {rxInfo.referral_doctor_hospital ? (
                  <Text style={prescriptionsStyles.clinicName}>
                    {rxInfo.referral_doctor_hospital.toUpperCase()}
                  </Text>
                ) : null}
                {rxInfo.referral_reason ? (
                  <Text style={[prescriptionsStyles.bodyText, { marginTop: 6 }]}>
                    Reason: {rxInfo.referral_reason}
                  </Text>
                ) : null}
              </View>
            </>
          )}
          <TouchableOpacity
            style={[prescriptionsStyles.pdfBtn, downloadPdfLoading && { opacity: 0.85 }]}
            onPress={handleDownloadPDF}
            activeOpacity={0.85}
            disabled={downloadPdfLoading}
          >
            {downloadPdfLoading ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}
              >
                <ActivityIndicator size="small" color={theme.colors.surface} />
                <Text style={prescriptionsStyles.pdfBtnText}>
                  {downloadProgress > 0
                    ? `Downloading... ${downloadProgress}%`
                    : 'Preparing PDF...'}
                </Text>
              </View>
            ) : (
              <Text style={prescriptionsStyles.pdfBtnText}>Open / Save PDF</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaWrapper>
  );
};

export default PrescriptionDetailScreen;
