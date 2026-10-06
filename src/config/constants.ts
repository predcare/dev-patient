export const EMR_Record_Category = [
  'Lab Report',
  'X-Ray',
  'MRI Scan',
  'CT Scan',
  'Ultrasound',
  'ECG Report',
  'Blood Test',
  'Prescription',
  'Discharge Summary',
  'Medical Certificate',
  'Vaccination Record',
  'Other',
];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// App Version Details (Synced with iOS project.pbxproj & Android build.gradle)
export const APP_VERSION = '1.0.0';
export const APP_BUILD = '1';
export const APP_DISPLAY_VERSION = `VERSION ${APP_VERSION} (BUILD ${APP_BUILD})`;

export const FamilyRelations = [
  { label: 'Father', value: 'father' },
  { label: 'Mother', value: 'mother' },
  { label: 'Spouse', value: 'spouse' },
  { label: 'Son', value: 'son' },
  { label: 'Daughter', value: 'daughter' },
  { label: 'Sibling', value: 'sibling' },
  { label: 'Other', value: 'other' },
];

export const GenderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Others', value: 'others' },
];

export const SlotGroups = [
  { title: 'MORNING', key: 'morning' },
  { title: 'AFTERNOON', key: 'afternoon' },
  { title: 'EVENING', key: 'evening' },
] as const;
