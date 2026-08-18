import React from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  HeartIcon,
  PillIcon,
  PulseIcon,
  ShieldIcon,
  StarIcon,
} from '../../ui/icons';
import { theme } from '../../../styled/theme.styled';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.72;

export interface HealthTipItem {
  key: string;
  title: string;
  description: string;
  iconName: 'water' | 'sun' | 'heart' | 'moon' | 'pulse';
  iconColor: string;
  backgroundColor: string;
  borderColor: string;
}

export const MOCK_HEALTH_TIPS_EXACT: HealthTipItem[] = [
  {
    key: '1',
    title: 'Stay Hydrated',
    description: 'Drink at least 8-10 glasses of water daily to maintain kidney function and boost energy levels.',
    iconName: 'water',
    iconColor: '#0284C7',
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
  },
  {
    key: '2',
    title: 'Morning Sun & Vitamin D',
    description: 'Get 15 minutes of early morning sunlight to support bone density, mood, and immune health.',
    iconName: 'sun',
    iconColor: '#16A34A',
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
  },
  {
    key: '3',
    title: '30 Mins Daily Movement',
    description: 'Brisk walking or cardiovascular exercise daily regulates blood pressure and cardiovascular fitness.',
    iconName: 'pulse',
    iconColor: '#D97706',
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  {
    key: '4',
    title: '7-8 Hours Restful Sleep',
    description: 'Maintain a consistent sleep schedule to promote cellular recovery, memory, and stress control.',
    iconName: 'moon',
    iconColor: '#7C3AED',
    backgroundColor: '#F3E8FF',
    borderColor: '#DDD6FE',
  },
];

interface DailyHealthTipsSectionProps {
  title?: string;
  tips?: HealthTipItem[];
}

export const DailyHealthTipsSection: React.FC<DailyHealthTipsSectionProps> = ({
  title = 'Daily Health Tips',
  tips = MOCK_HEALTH_TIPS_EXACT,
}) => {
  const renderTipIcon = (iconName: string, color: string) => {
    switch (iconName) {
      case 'water':
        return <ShieldIcon size={20} color="#FFFFFF" />;
      case 'sun':
        return <StarIcon size={20} color="#FFFFFF" />;
      case 'heart':
        return <HeartIcon size={20} color="#FFFFFF" />;
      case 'pulse':
        return <PulseIcon size={20} color="#FFFFFF" />;
      default:
        return <PillIcon size={20} color="#FFFFFF" />;
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.headerWrap}>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 12}
        snapToAlignment="start"
      >
        {tips.map(tip => (
          <View
            key={tip.key}
            style={[
              styles.card,
              {
                backgroundColor: tip.backgroundColor,
                borderColor: tip.borderColor,
              },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: tip.iconColor }]}>
              {renderTipIcon(tip.iconName, tip.iconColor)}
            </View>
            <Text style={styles.cardTitle}>{tip.title}</Text>
            <Text style={styles.cardDescription}>{tip.description}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    marginBottom: 16,
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
});

export default DailyHealthTipsSection;
