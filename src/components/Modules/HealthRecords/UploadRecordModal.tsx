import React, { useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  BackIcon,
  BrainIcon,
  CameraIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleXIcon,
  DropletIcon,
  EditIcon,
  FileTextIcon,
  FolderIcon,
  GalleryIcon,
  HeartIcon,
  LabFlaskIcon,
  MicroscopeIcon,
  PrescriptionIcon,
  ShieldIcon,
  UltrasoundIcon,
  XRayIcon,
} from '../../ui/icons';
import { showSuccessToast } from '../../../lib/common/toast.utils';
import { healthRecordsStyles } from '../../../styled/HealthRecordsScreen.styled';
import { theme } from '../../../styled/theme.styled';

export interface UploadRecordModalProps {
  visible: boolean;
  onClose: () => void;
  initialCategory?: string;
}

interface CategoryOption {
  id: string;
  name: string;
  iconBg: string;
  renderIcon: () => React.ReactNode;
}

interface DoctorVisibilityItem {
  id: string;
  name: string;
  specialty: string;
  initial: string;
  initialBg?: string;
  initialColor?: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: 'lab-report',
    name: 'Lab Report',
    iconBg: '#CCFBF1',
    renderIcon: () => <LabFlaskIcon size={22} color={theme.colors.primary} />,
  },
  {
    id: 'x-ray',
    name: 'X-Ray',
    iconBg: '#CCFBF1',
    renderIcon: () => <XRayIcon size={22} color={theme.colors.primary} />,
  },
  {
    id: 'mri-scan',
    name: 'MRI Scan',
    iconBg: '#CCFBF1',
    renderIcon: () => <BrainIcon size={22} color={theme.colors.primary} />,
  },
  {
    id: 'ct-scan',
    name: 'CT Scan',
    iconBg: '#CCFBF1',
    renderIcon: () => <MicroscopeIcon size={22} color={theme.colors.primary} />,
  },
  {
    id: 'ultrasound',
    name: 'Ultrasound',
    iconBg: '#CCFBF1',
    renderIcon: () => <UltrasoundIcon size={22} color={theme.colors.primary} />,
  },
  {
    id: 'ecg-report',
    name: 'ECG Report',
    iconBg: '#CCFBF1',
    renderIcon: () => <HeartIcon size={22} color={theme.colors.primary} />,
  },
  {
    id: 'blood-test',
    name: 'Blood Test',
    iconBg: '#CCFBF1',
    renderIcon: () => <DropletIcon size={22} color={theme.colors.primary} />,
  },
  {
    id: 'prescription',
    name: 'Prescription',
    iconBg: '#CCFBF1',
    renderIcon: () => <PrescriptionIcon size={22} color={theme.colors.primary} />,
  },
];

const DOCTOR_LIST: DoctorVisibilityItem[] = [
  {
    id: '1',
    name: 'Samir Mallick',
    specialty: 'Allergy & Immunology',
    initial: 'S',
  },
  {
    id: '2',
    name: 'Anusri Gupta',
    specialty: 'Cardiothoracic Surgery',
    initial: 'A',
  },
  {
    id: '3',
    name: 'Anusri Gupta Patient',
    specialty: 'Allergy & Immunology, Ayurveda',
    initial: 'A',
  },
];

export const UploadRecordModal: React.FC<UploadRecordModalProps> = ({
  visible,
  onClose,
  initialCategory = 'Lab Report',
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [documentTitle, setDocumentTitle] = useState<string>(initialCategory);
  const [notes, setNotes] = useState<string>('');
  const [doctorVisibility, setDoctorVisibility] = useState<Record<string, boolean>>({
    '1': false,
    '2': false,
    '3': false,
  });

  const handleSelectCategory = (cat: CategoryOption) => {
    setSelectedCategory(cat.name);
    setDocumentTitle(cat.name);
    setCurrentStep(2);
  };

  const handleSelectUploadMethod = () => {
    setCurrentStep(3);
  };

  const handleToggleDoctor = (id: string) => {
    setDoctorVisibility(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleHeaderBack = () => {
    if (currentStep === 1) {
      onClose();
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      setCurrentStep(2);
    }
  };

  const handleSubmit = () => {
    showSuccessToast('Health Record uploaded successfully');
    onClose();
    // Reset state after slight delay
    setTimeout(() => {
      setCurrentStep(1);
      setNotes('');
    }, 300);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={healthRecordsStyles.modalOverlay}>
        <SafeAreaView style={healthRecordsStyles.modalContainer}>
          {/* Header */}
          <View style={healthRecordsStyles.modalHeader}>
            <TouchableOpacity
              style={healthRecordsStyles.modalHeaderBackBtn}
              onPress={handleHeaderBack}
              activeOpacity={0.7}
            >
              <ChevronLeftIcon size={24} color={theme.colors.primary} />
            </TouchableOpacity>

            <Text style={healthRecordsStyles.modalHeaderTitle}>
              {currentStep === 1
                ? 'Select Category'
                : currentStep === 2
                ? 'File Upload'
                : 'Document Upload'}
            </Text>

            {currentStep === 1 ? (
              <TouchableOpacity
                style={healthRecordsStyles.modalHeaderBackBtn}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <CircleXIcon size={22} color={theme.colors.primary} />
              </TouchableOpacity>
            ) : (
              <View style={healthRecordsStyles.modalHeaderStepBadge}>
                <Text style={healthRecordsStyles.modalHeaderStepBadgeText}>
                  Step {currentStep} of 3
                </Text>
              </View>
            )}
          </View>

          {/* Stepper Progress Bar */}
          <View style={healthRecordsStyles.stepperContainer}>
            {/* Step 1 Node */}
            <View style={healthRecordsStyles.stepItem}>
              <View
                style={[
                  healthRecordsStyles.stepCircle,
                  currentStep > 1
                    ? healthRecordsStyles.stepCircleCompleted
                    : currentStep === 1
                    ? healthRecordsStyles.stepCircleActive
                    : healthRecordsStyles.stepCircleInactive,
                ]}
              >
                {currentStep > 1 ? (
                  <CheckIcon size={14} color="#FFFFFF" />
                ) : (
                  <Text
                    style={[
                      healthRecordsStyles.stepCircleText,
                      healthRecordsStyles.stepCircleTextActive,
                    ]}
                  >
                    1
                  </Text>
                )}
              </View>
              <Text
                style={[
                  healthRecordsStyles.stepLabel,
                  currentStep >= 1
                    ? healthRecordsStyles.stepLabelActive
                    : healthRecordsStyles.stepLabelInactive,
                ]}
              >
                Category
              </Text>
            </View>

            {/* Line 1-2 */}
            <View
              style={[
                healthRecordsStyles.stepLine,
                currentStep >= 2
                  ? healthRecordsStyles.stepLineActive
                  : healthRecordsStyles.stepLineInactive,
              ]}
            />

            {/* Step 2 Node */}
            <View style={healthRecordsStyles.stepItem}>
              <View
                style={[
                  healthRecordsStyles.stepCircle,
                  currentStep > 2
                    ? healthRecordsStyles.stepCircleCompleted
                    : currentStep === 2
                    ? healthRecordsStyles.stepCircleActive
                    : healthRecordsStyles.stepCircleInactive,
                ]}
              >
                {currentStep > 2 ? (
                  <CheckIcon size={14} color="#FFFFFF" />
                ) : (
                  <Text
                    style={[
                      healthRecordsStyles.stepCircleText,
                      currentStep >= 2
                        ? healthRecordsStyles.stepCircleTextActive
                        : healthRecordsStyles.stepCircleTextInactive,
                    ]}
                  >
                    2
                  </Text>
                )}
              </View>
              <Text
                style={[
                  healthRecordsStyles.stepLabel,
                  currentStep >= 2
                    ? healthRecordsStyles.stepLabelActive
                    : healthRecordsStyles.stepLabelInactive,
                ]}
              >
                File
              </Text>
            </View>

            {/* Line 2-3 */}
            <View
              style={[
                healthRecordsStyles.stepLine,
                currentStep >= 3
                  ? healthRecordsStyles.stepLineActive
                  : healthRecordsStyles.stepLineInactive,
              ]}
            />

            {/* Step 3 Node */}
            <View style={healthRecordsStyles.stepItem}>
              <View
                style={[
                  healthRecordsStyles.stepCircle,
                  currentStep === 3
                    ? healthRecordsStyles.stepCircleActive
                    : healthRecordsStyles.stepCircleInactive,
                ]}
              >
                <Text
                  style={[
                    healthRecordsStyles.stepCircleText,
                    currentStep === 3
                      ? healthRecordsStyles.stepCircleTextActive
                      : healthRecordsStyles.stepCircleTextInactive,
                  ]}
                >
                  3
                </Text>
              </View>
              <Text
                style={[
                  healthRecordsStyles.stepLabel,
                  currentStep === 3
                    ? healthRecordsStyles.stepLabelActive
                    : healthRecordsStyles.stepLabelInactive,
                ]}
              >
                Details
              </Text>
            </View>
          </View>

          {/* STEP 1: Select Category */}
          {currentStep === 1 && (
            <ScrollView
              contentContainerStyle={healthRecordsStyles.categoryListScroll}
              showsVerticalScrollIndicator={false}
            >
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={healthRecordsStyles.categoryOptionCard}
                  onPress={() => handleSelectCategory(cat)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      healthRecordsStyles.categoryOptionIconWrap,
                      { backgroundColor: cat.iconBg },
                    ]}
                  >
                    {cat.renderIcon()}
                  </View>
                  <Text style={healthRecordsStyles.categoryOptionTitle}>{cat.name}</Text>
                  <ChevronRightIcon size={20} color="#CBD5E1" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* STEP 2: Choose Upload Method */}
          {currentStep === 2 && (
            <View style={healthRecordsStyles.step2Body}>
              <Text style={healthRecordsStyles.step2Title}>Choose Upload Method</Text>
              <Text style={healthRecordsStyles.step2Subtitle}>
                How would you like to add your health records?
              </Text>

              {/* Photo Gallery */}
              <TouchableOpacity
                style={healthRecordsStyles.methodCard}
                onPress={handleSelectUploadMethod}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    healthRecordsStyles.methodIconBox,
                    { backgroundColor: '#E0F2FE' },
                  ]}
                >
                  <GalleryIcon size={24} color="#0284C7" />
                </View>
                <View style={healthRecordsStyles.methodInfo}>
                  <Text style={healthRecordsStyles.methodName}>Photo Gallery</Text>
                  <Text style={healthRecordsStyles.methodDesc}>Choose from photos</Text>
                </View>
                <ChevronRightIcon size={20} color="#CBD5E1" />
              </TouchableOpacity>

              {/* Use your camera */}
              <TouchableOpacity
                style={healthRecordsStyles.methodCard}
                onPress={handleSelectUploadMethod}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    healthRecordsStyles.methodIconBox,
                    { backgroundColor: '#DCFCE7' },
                  ]}
                >
                  <CameraIcon size={24} color="#16A34A" />
                </View>
                <View style={healthRecordsStyles.methodInfo}>
                  <Text style={healthRecordsStyles.methodName}>Use your camera</Text>
                  <Text style={healthRecordsStyles.methodDesc}>Take a Photo</Text>
                </View>
                <ChevronRightIcon size={20} color="#CBD5E1" />
              </TouchableOpacity>

              {/* Browse files */}
              <TouchableOpacity
                style={healthRecordsStyles.methodCard}
                onPress={handleSelectUploadMethod}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    healthRecordsStyles.methodIconBox,
                    { backgroundColor: '#F1F5F9' },
                  ]}
                >
                  <FolderIcon size={24} color="#475569" />
                </View>
                <View style={healthRecordsStyles.methodInfo}>
                  <Text style={healthRecordsStyles.methodName}>Browse files</Text>
                  <Text style={healthRecordsStyles.methodDesc}>PDF, Word & more</Text>
                </View>
                <ChevronRightIcon size={20} color="#CBD5E1" />
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 3: Document Details & Doctor Visibility */}
          {currentStep === 3 && (
            <ScrollView
              contentContainerStyle={healthRecordsStyles.step3Scroll}
              showsVerticalScrollIndicator={false}
            >
              {/* File Preview Card */}
              <View style={healthRecordsStyles.filePreviewCard}>
                <View style={healthRecordsStyles.filePreviewIconBox}>
                  <FileTextIcon size={22} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={healthRecordsStyles.filePreviewName}>1000080015.png</Text>
                  <Text style={healthRecordsStyles.filePreviewMeta}>
                    112.6 KB • Uploaded successfully
                  </Text>
                </View>
                <View style={healthRecordsStyles.fileSuccessCheck}>
                  <CheckIcon size={14} color="#FFFFFF" strokeWidth={3} />
                </View>
              </View>

              {/* Document Category Field */}
              <View style={healthRecordsStyles.formGroup}>
                <Text style={healthRecordsStyles.fieldLabel}>DOCUMENT CATEGORY</Text>
                <View style={healthRecordsStyles.categoryValueCard}>
                  <View style={healthRecordsStyles.categoryValueLeft}>
                    <LabFlaskIcon size={20} color={theme.colors.primary} />
                    <Text style={healthRecordsStyles.categoryValueText}>
                      {selectedCategory}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={healthRecordsStyles.categoryChangeBtn}
                    onPress={() => setCurrentStep(1)}
                    activeOpacity={0.7}
                  >
                    <EditIcon size={16} color={theme.colors.primary} />
                    <Text style={healthRecordsStyles.categoryChangeText}>Change</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Document Title Field */}
              <View style={healthRecordsStyles.formGroup}>
                <Text style={healthRecordsStyles.fieldLabel}>DOCUMENT TITLE *</Text>
                <TextInput
                  style={healthRecordsStyles.inputBox}
                  value={documentTitle}
                  onChangeText={setDocumentTitle}
                  placeholder="Enter document title"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Notes Field */}
              <View style={healthRecordsStyles.formGroup}>
                <Text style={healthRecordsStyles.fieldLabel}>NOTES (OPTIONAL)</Text>
                <TextInput
                  style={healthRecordsStyles.textAreaBox}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Any additional details..."
                  placeholderTextColor="#94A3B8"
                  multiline={true}
                  numberOfLines={3}
                />
              </View>

              {/* Doctor Visibility */}
              <View style={healthRecordsStyles.formGroup}>
                <Text style={healthRecordsStyles.fieldLabel}>DOCTOR VISIBILITY</Text>
                <View style={healthRecordsStyles.doctorVisibilityCard}>
                  {DOCTOR_LIST.map((doc, idx) => {
                    const isShared = !!doctorVisibility[doc.id];
                    return (
                      <View
                        key={doc.id}
                        style={[
                          healthRecordsStyles.doctorRow,
                          idx === DOCTOR_LIST.length - 1 && healthRecordsStyles.doctorRowLast,
                        ]}
                      >
                        <View style={healthRecordsStyles.doctorAvatar}>
                          <Text style={healthRecordsStyles.doctorAvatarText}>
                            {doc.initial}
                          </Text>
                        </View>
                        <View style={healthRecordsStyles.doctorInfo}>
                          <Text style={healthRecordsStyles.doctorName}>{doc.name}</Text>
                          <Text style={healthRecordsStyles.doctorSpecialty}>
                            {doc.specialty}
                          </Text>
                          <View
                            style={
                              isShared
                                ? healthRecordsStyles.doctorSharedBadge
                                : healthRecordsStyles.doctorHiddenBadge
                            }
                          >
                            <Text
                              style={
                                isShared
                                  ? healthRecordsStyles.doctorSharedBadgeText
                                  : healthRecordsStyles.doctorHiddenBadgeText
                              }
                            >
                              {isShared ? 'SHARED' : 'HIDDEN'}
                            </Text>
                          </View>
                        </View>
                        <Switch
                          value={isShared}
                          onValueChange={() => handleToggleDoctor(doc.id)}
                          trackColor={{ false: '#E2E8F0', true: theme.colors.primaryLight }}
                          thumbColor={isShared ? theme.colors.primary : '#FFFFFF'}
                        />
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Security note */}
              <View style={healthRecordsStyles.securityNoteRow}>
                <ShieldIcon size={16} color="#64748B" />
                <Text style={healthRecordsStyles.securityNoteText}>
                  Shared documents are encrypted and only accessible to authorized medical staff
                </Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={healthRecordsStyles.submitBtn}
                onPress={handleSubmit}
                activeOpacity={0.85}
              >
                <Text style={healthRecordsStyles.submitBtnText}>Submit</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default UploadRecordModal;
