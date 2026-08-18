export interface PrescriptionMedication {
  id: string;
  name: string;
  dosage: string;
  schedule: string;
  scheduleSub: string;
  duration: string;
  timing: string;
  notes?: string;
  isSos?: boolean;
}

export interface PrescriptionVital {
  label: string;
  value: string;
  unit: string;
  isDanger?: boolean;
}

export interface PrescriptionLabTest {
  id: string;
  name: string;
  instructions?: string;
}

export interface PrescriptionDetailData {
  id: number;
  prescription_unique_id: string;
  rx_number: string;
  doctor_name: string;
  specialization: string;
  clinic_name: string;
  patient_name: string;
  patient_gender: string;
  patient_age: string;
  consultation_date: string;
  consultation_date_label: string;
  day: string;
  month: string;
  diagnosis: string;
  symptoms: string;
  drug_allergies?: string;
  chronic_conditions?: string;
  vitals: PrescriptionVital[];
  medications: PrescriptionMedication[];
  lab_tests?: PrescriptionLabTest[];
  advice: string;
  follow_up_date: string;
  referral_specialist?: string;
  referral_doctor_hospital?: string;
  pdf_path?: string;
}

export const MOCK_PRESCRIPTIONS: PrescriptionDetailData[] = [
  {
    id: 8821,
    prescription_unique_id: 'RX-8821',
    rx_number: '#RX-8821',
    doctor_name: 'Dr. Sarah Jenkins',
    specialization: 'Cardiologist • MD',
    clinic_name: 'ST. JUDE MEDICAL CENTER',
    patient_name: 'John Doe',
    patient_gender: 'Male',
    patient_age: '34',
    consultation_date: '2026-08-18',
    consultation_date_label: '18 Aug 2026',
    day: '18',
    month: 'AUG',
    diagnosis: 'Mild Angina & Essential Hypertension',
    symptoms: 'Chest tightness, fatigue, elevated blood pressure',
    drug_allergies: 'Penicillin (Mild Rash)',
    chronic_conditions: 'Hypertension (Diagnosed 2024)',
    vitals: [
      { label: 'BP', value: '142/92', unit: 'mmHg', isDanger: true },
      { label: 'PULSE', value: '78', unit: 'bpm', isDanger: false },
      { label: 'TEMPERATURE', value: '98.6', unit: '°F', isDanger: false },
      { label: 'SPO2', value: '98', unit: '%', isDanger: false },
      { label: 'WEIGHT', value: '74', unit: 'kg', isDanger: false },
      { label: 'HEIGHT', value: '178', unit: 'cm', isDanger: false },
    ],
    medications: [
      {
        id: 'm1',
        name: 'Amlodipine Besylate 5 mg',
        dosage: '1 - 0 - 0',
        schedule: '1 - 0 - 0',
        scheduleSub: 'Morning',
        duration: '14 Days',
        timing: 'After Food',
        notes: 'Take early morning with plain water.',
      },
      {
        id: 'm2',
        name: 'Atorvastatin Calcium 10 mg',
        dosage: '0 - 0 - 1',
        schedule: '0 - 0 - 1',
        scheduleSub: 'Night',
        duration: '30 Days',
        timing: 'After Food',
        notes: 'Take before sleep.',
      },
      {
        id: 'm3',
        name: 'Sorbitrate 5 mg Sublingual',
        dosage: 'SOS',
        schedule: 'SOS',
        scheduleSub: 'As Needed',
        duration: '5 Days',
        timing: 'Sublingual',
        notes: 'Place under tongue immediately if chest pain occurs.',
        isSos: true,
      },
    ],
    lab_tests: [
      { id: 'l1', name: 'Lipid Profile (Fasting)', instructions: 'Overnight 10-12 hours fasting required.' },
      { id: 'l2', name: 'ECG 12 Lead', instructions: 'Routine resting ECG.' },
    ],
    advice: 'Follow a low sodium diet. Avoid heavy physical exertion for 1 week. Walk 30 minutes daily.',
    follow_up_date: '25 Aug 2026',
    referral_specialist: 'Dr. Michael Chang (Cardiac Rehabilitation)',
    referral_doctor_hospital: 'City Heart Institute',
    pdf_path: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 8822,
    prescription_unique_id: 'RX-8822',
    rx_number: '#RX-8822',
    doctor_name: 'Dr. Rajesh Kumar',
    specialization: 'Neurologist • MBBS, DM',
    clinic_name: 'APOLLO HEALTHCARE CLINIC',
    patient_name: 'John Doe',
    patient_gender: 'Male',
    patient_age: '34',
    consultation_date: '2026-07-30',
    consultation_date_label: '30 Jul 2026',
    day: '30',
    month: 'JUL',
    diagnosis: 'Tension Headache & Cervical Muscle Spasm',
    symptoms: 'Throbbing head ache, neck stiffness',
    vitals: [
      { label: 'BP', value: '120/80', unit: 'mmHg', isDanger: false },
      { label: 'PULSE', value: '72', unit: 'bpm', isDanger: false },
      { label: 'TEMPERATURE', value: '98.4', unit: '°F', isDanger: false },
      { label: 'SPO2', value: '99', unit: '%', isDanger: false },
    ],
    medications: [
      {
        id: 'm4',
        name: 'Naproxen Sodium 250 mg',
        dosage: '1 - 0 - 1',
        schedule: '1 - 0 - 1',
        scheduleSub: 'Twice Daily',
        duration: '5 Days',
        timing: 'After Food',
        notes: 'Take with full glass of water after food.',
      },
      {
        id: 'm5',
        name: 'Pantoprazole Sodium 40 mg',
        dosage: '1 - 0 - 0',
        schedule: '1 - 0 - 0',
        scheduleSub: 'Morning',
        duration: '7 Days',
        timing: 'Before Food',
        notes: 'Take 30 minutes before breakfast.',
      },
    ],
    advice: 'Maintain good neck posture during work. Take screen breaks every 45 minutes.',
    follow_up_date: '10 Aug 2026',
    pdf_path: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 8823,
    prescription_unique_id: 'RX-8823',
    rx_number: '#RX-8823',
    doctor_name: 'Dr. Emily Chen',
    specialization: 'Pediatrician • MD',
    clinic_name: 'SUNSHINE CHILDREN HOSPITAL',
    patient_name: 'Tommy Doe',
    patient_gender: 'Male',
    patient_age: '6',
    consultation_date: '2026-06-15',
    consultation_date_label: '15 Jun 2026',
    day: '15',
    month: 'JUN',
    diagnosis: 'Acute Upper Respiratory Tract Infection',
    symptoms: 'Fever, runny nose, dry cough',
    vitals: [
      { label: 'TEMPERATURE', value: '101.2', unit: '°F', isDanger: true },
      { label: 'WEIGHT', value: '20', unit: 'kg', isDanger: false },
      { label: 'PULSE', value: '90', unit: 'bpm', isDanger: false },
      { label: 'SPO2', value: '97', unit: '%', isDanger: false },
    ],
    medications: [
      {
        id: 'm6',
        name: 'Paracetamol Oral Suspension 250 mg / 5 mL',
        dosage: '1 - 1 - 1',
        schedule: '1 - 1 - 1',
        scheduleSub: 'Three Times Daily',
        duration: '3 Days',
        timing: 'After Food',
        notes: 'Give 5 mL every 8 hours as needed for fever.',
      },
      {
        id: 'm7',
        name: 'Amoxicillin Oral Suspension 125 mg / 5 mL',
        dosage: '1 - 0 - 1',
        schedule: '1 - 0 - 1',
        scheduleSub: 'Twice Daily',
        duration: '5 Days',
        timing: 'After Food',
        notes: 'Complete full course of antibiotics.',
      },
    ],
    advice: 'Ensure adequate warm fluids. Rest for 3 days.',
    follow_up_date: '22 Jun 2026',
    pdf_path: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
];
