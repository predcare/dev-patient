import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useGetHealthCareTips } from '../../../hooks/react-query/common/common.hooks';
import { theme } from '../../../styled/theme.styled';
import DailyHealthTipsSkeleton from '../../Skeletons/DailyHealthTipsSkeleton';
import { HeartIcon, PillIcon, PulseIcon, ShieldIcon, StarIcon } from '../../ui/icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.72;

const THEMES = [
  { bg: '#E0F2FE', border: '#BAE6FD', iconColor: '#0284C7', Icon: ShieldIcon },
  { bg: '#DCFCE7', border: '#BBF7D0', iconColor: '#16A34A', Icon: StarIcon },
  { bg: '#FEF3C7', border: '#FDE68A', iconColor: '#D97706', Icon: PulseIcon },
  { bg: '#F3E8FF', border: '#DDD6FE', iconColor: '#7C3AED', Icon: PillIcon },
  { bg: '#FFE4E6', border: '#FECDD3', iconColor: '#E11D48', Icon: HeartIcon },
];

export const DailyHealthTipsSection: React.FC = () => {
  const { t } = useTranslation();
  const { data: healthCareTips = [], isPending, isError, refetch } = useGetHealthCareTips();

  if (isError) {
    return (
      <View style={styles.section}>
        <View style={styles.headerWrap}>
          <Text style={styles.headerTitle}>{t('dailyHealthTips.title')}</Text>
        </View>
        <TouchableOpacity style={styles.errorBox} onPress={() => refetch()} activeOpacity={0.7}>
          <Text style={styles.errorText}>{t('dailyHealthTips.errorText')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.headerWrap}>
        <Text style={styles.headerTitle}>{t('dailyHealthTips.title')}</Text>
      </View>

      {isPending ? (
        <DailyHealthTipsSkeleton />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + 12}
          snapToAlignment="start"
        >
          {healthCareTips.map((tip: any, index: number) => {
            const themeItem = THEMES[index % THEMES.length];
            const TipIcon = themeItem.Icon;

            return (
              <View
                key={tip.id?.toString() || index.toString()}
                style={[
                  styles.card,
                  { backgroundColor: themeItem.bg, borderColor: themeItem.border },
                ]}
              >
                <View style={[styles.iconCircle, { backgroundColor: themeItem.iconColor }]}>
                  {tip.icon_url ? (
                    <Image
                      source={{ uri: tip.icon_url }}
                      style={styles.customIcon}
                      resizeMode="contain"
                    />
                  ) : (
                    <TipIcon size={20} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {tip.title}
                </Text>
                <Text style={styles.cardDescription} numberOfLines={3}>
                  {tip.short_description}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  headerWrap: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  customIcon: {
    width: 22,
    height: 22,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  errorBox: {
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500',
  },
});

export default DailyHealthTipsSection;
