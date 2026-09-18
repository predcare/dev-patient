import React from 'react';
import { Platform, StatusBar, StyleProp, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

  const topInset = edges.includes('top')
    ? Platform.OS === 'android'
      ? Math.max(insets.top, StatusBar.currentHeight || 0)
      : insets.top
    : 0;

  const rightInset = edges.includes('right') ? insets.right : 0;
  const bottomInset = edges.includes('bottom') ? insets.bottom : 0;
  const leftInset = edges.includes('left') ? insets.left : 0;

  return (
    <View
      style={[
        safeAreaStyles.container,
        {
          backgroundColor,
          paddingTop: topInset,
          paddingRight: rightInset,
          paddingBottom: bottomInset,
          paddingLeft: leftInset,
        },
        style,
      ]}
    >
      <StatusBar barStyle={barStyle} backgroundColor={backgroundColor} translucent={true} />
      <View style={[safeAreaStyles.innerContainer, { backgroundColor }]}>{children}</View>
    </View>
  );
};

export default SafeAreaWrapper;
