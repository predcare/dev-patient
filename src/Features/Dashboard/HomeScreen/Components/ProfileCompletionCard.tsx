import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRightIcon } from '../../../../components/ui/icons';
import theme from '../../../../styled/theme.styled';

export interface ProfileCompletionCardProps {
  percent?: number;
  onPress: () => void;
}

export const ProfileCompletionCard: React.FC<ProfileCompletionCardProps> = ({
  percent = 83,
  onPress,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t('dashboard.completeProfileTitle')}</Text>
        <Text style={styles.percent}>{percent}%</Text>
      </View>
      <Text style={styles.subtitle}>{t('dashboard.completeProfileSubtitle')}</Text>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>

      <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.85}>
        <Text style={styles.buttonText}>{t('dashboard.finishSetup')}</Text>
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
    padding: 15,
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
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  percent: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: 12.5,
    color: theme.colors.textSecondary,
    marginBottom: 14,
    lineHeight: 17,
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
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.surface,
  },
});

export default ProfileCompletionCard;
