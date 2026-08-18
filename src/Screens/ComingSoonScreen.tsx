import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Header } from '../Layout/Header';
import { SafeAreaWrapper } from '../Layout/SafeAreaWrapper';
import { comingSoonStyles } from '../styled/ComingSoonScreen.styled';
import { theme } from '../styled/theme.styled';

interface ComingSoonScreenProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export const ComingSoonScreen: React.FC<ComingSoonScreenProps> = ({
  title = 'Module Coming Soon',
  description = 'We are working hard to bring you advanced clinical workflow tools. Stay tuned for upcoming updates!',
  icon,
}) => {
  return (
    <SafeAreaWrapper backgroundColor={theme.colors.background} barStyle="dark-content">
      <Header />
      <View style={comingSoonStyles.container}>
        <View style={comingSoonStyles.content}>
          <View style={comingSoonStyles.card}>
            <View style={comingSoonStyles.iconBadge}>
              {icon || (
                <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="10" stroke={theme.colors.primary} strokeWidth={2} />
                  <Path
                    d="M12 6V12L16 14"
                    stroke={theme.colors.primary}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              )}
            </View>

            <Text style={comingSoonStyles.title}>{title}</Text>
            <Text style={comingSoonStyles.subtitle}>Under Active Development</Text>
            <Text style={comingSoonStyles.description}>{description}</Text>

            <View style={comingSoonStyles.badge}>
              <Text style={comingSoonStyles.badgeText}>🚀 Coming in Next Release</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaWrapper>
  );
};

export default ComingSoonScreen;
