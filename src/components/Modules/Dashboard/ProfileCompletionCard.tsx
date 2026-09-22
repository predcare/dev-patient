import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../../styled/theme.styled';
import { ChevronRightIcon } from '../../ui/icons';

export interface ProfileCompletionCardProps {
  percent?: number;
  onPress: () => void;
}

export const ProfileCompletionCard: React.FC<ProfileCompletionCardProps> = ({
  percent = 83,
  onPress,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.percent}>{percent}%</Text>
      </View>
      <Text style={styles.subtitle}>Help us personalize your care experience.</Text>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>

      <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.85}>
        <Text style={styles.buttonText}>Finish Setup</Text>
        <ChevronRightIcon size={18} color={theme.colors.surface} style={{ marginLeft: 6 }} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    width: '100%',
    padding: 18,
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  percent: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 14,
    lineHeight: 18,
  },
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceSecondary,
    overflow: 'hidden',
    marginBottom: 16,
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  button: {
    backgroundColor: theme.colors.primary,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.surface,
  },
});

export default ProfileCompletionCard;
