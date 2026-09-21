import React from 'react';
import { Platform, StatusBar, StyleProp, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomBottomBar, {
  getBottomBarHeight,
  TabKey,
} from '../components/commons/CustomBottomBar/CustomBottomBar';
import { safeAreaStyles } from '../styled/SafeAreaWrapper.styled';
import { theme } from '../styled/theme.styled';

export interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  barStyle?: 'light-content' | 'dark-content';
  edges?: Array<'top' | 'right' | 'bottom' | 'left'>;
  showBottomBar?: boolean;
  activeBottomTab?: TabKey;
  visibleBottomTabs?: TabKey[];
  onBottomTabPress?: (tabKey: TabKey) => void;
  isPathClear?: boolean;
}

export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  style,
  backgroundColor = theme.colors.background,
  barStyle = 'dark-content',
  edges = ['top', 'right', 'bottom', 'left'],
  showBottomBar = false,
  activeBottomTab,
  visibleBottomTabs,
  onBottomTabPress,
  isPathClear,
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

  const bottomBarHeight = showBottomBar ? getBottomBarHeight(bottomInset) : 0;

  return (
    <View
      style={[
        safeAreaStyles.container,
        {
          backgroundColor,
          paddingTop: topInset,
          paddingRight: rightInset,
          paddingBottom: showBottomBar ? 0 : bottomInset,
          paddingLeft: leftInset,
        },
        style,
      ]}
    >
      <StatusBar barStyle={barStyle} backgroundColor={backgroundColor} translucent={true} />
      <View
        style={[
          safeAreaStyles.innerContainer,
          {
            backgroundColor,
            paddingBottom: showBottomBar ? bottomBarHeight : 0,
          },
        ]}
      >
        {children}
      </View>
      {showBottomBar && (
        <CustomBottomBar
          activeTab={activeBottomTab}
          visibleTabs={visibleBottomTabs}
          onTabPress={onBottomTabPress}
          isPathClear={isPathClear}
        />
      )}
    </View>
  );
};

export default SafeAreaWrapper;
