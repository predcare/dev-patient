import React from 'react';
import { StatusBar, StyleProp, View, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { safeAreaStyles } from '../styled/SafeAreaWrapper.styled';
import { theme } from '../styled/theme.styled';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  barStyle?: 'light-content' | 'dark-content';
  edges?: Array<'top' | 'right' | 'bottom' | 'left'>;
}

export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  style,
  backgroundColor = theme.colors.background,
  barStyle = 'dark-content',
  edges = ['top', 'right', 'bottom', 'left'],
}) => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[safeAreaStyles.container, { backgroundColor }, style]} edges={edges}>
      <StatusBar barStyle={barStyle} backgroundColor={backgroundColor} translucent={false} />
      <View style={[safeAreaStyles.innerContainer, { backgroundColor }]}>{children}</View>
    </SafeAreaView>
  );
};

export default SafeAreaWrapper;
