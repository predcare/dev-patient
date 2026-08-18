import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MyDoctorData } from '../../../resources/mockData';
import { theme } from '../../../styled/theme.styled';

export interface MyDoctorsSectionProps {
  doctors: MyDoctorData[];
  loading?: boolean;
  emptyMessage?: string;
  emptyActionLabel?: string;
  onEmptyActionPress: () => void;
  onSeeAllPress: () => void;
  onDoctorPress: (doctor: MyDoctorData) => void;
  onBookPress?: (doctor: MyDoctorData) => void;
}

export const MyDoctorsSection: React.FC<MyDoctorsSectionProps> = ({
  doctors,
  emptyMessage = "You haven't added any doctors yet.",
  emptyActionLabel = 'Find a Doctor',
  onEmptyActionPress,
  onSeeAllPress,
  onDoctorPress,
}) => {
  const preview = doctors.slice(0, 3);
  const showSeeAllHeader = doctors.length > 3;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Doctors</Text>
        {showSeeAllHeader && (
          <TouchableOpacity onPress={onSeeAllPress} activeOpacity={0.7}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        )}
      </View>

      {preview.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={onEmptyActionPress}
            activeOpacity={0.85}
          >
            <Text style={styles.emptyBtnText}>{emptyActionLabel}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          {preview.map((doc, idx) => {
            const displayName = /^dr\.?\s/i.test(doc.doctor_name)
              ? doc.doctor_name
              : `Dr. ${doc.doctor_name}`;
            const initials =
              doc.initials ||
              (doc.doctor_name
                ? doc.doctor_name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'DR');
            const showDivider = idx < preview.length - 1;

            return (
              <View
                key={String(doc.doctor_user_id || idx)}
                style={[styles.docRow, showDivider && styles.divider]}
              >
                {doc.profile_image ? (
                  <Image source={{ uri: doc.profile_image }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                )}

                <View style={styles.docInfo}>
                  <Text style={styles.docName} numberOfLines={1}>
                    {displayName}
                  </Text>
                  <Text style={styles.docSpec} numberOfLines={1}>
                    {doc.specialization}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.consultBtn}
                  onPress={() => onDoctorPress(doc)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.consultBtnText}>Consult</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
    marginBottom: 8,
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  card: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    overflow: 'hidden',
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#D97706',
  },
  docInfo: {
    flex: 1,
    marginRight: 12,
  },
  docName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 3,
  },
  docSpec: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  consultBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consultBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.surface,
  },
  emptyCard: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSlate,
    marginBottom: 12,
  },
  emptyBtn: {
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 12,
  },
  emptyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
});

export default MyDoctorsSection;
