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
  contentContainerStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  header?: React.ReactNode;
  headerBackgroundColor?: string;
  edges?: Array<'top' | 'right' | 'bottom' | 'left'>;
  fullBleed?: boolean;
  showBottomBar?: boolean;
  activeBottomTab?: TabKey;
  visibleBottomTabs?: TabKey[];
  onBottomTabPress?: (tabKey: TabKey) => void;
  isPathClear?: boolean;
}

export const isColorDark = (hexColor?: string): boolean => {
  if (!hexColor || typeof hexColor !== 'string') return false;
  const clean = hexColor.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 150;
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 150;
  }
  return false;
};

export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  style,
  contentContainerStyle,
  backgroundColor = theme.colors.background,
  header,
  headerBackgroundColor = theme.colors.surface,
  edges = ['top', 'right', 'bottom', 'left'],
  fullBleed = false,
  showBottomBar = false,
  activeBottomTab,
  visibleBottomTabs,
  onBottomTabPress,
  isPathClear,
}) => {
  const insets = useSafeAreaInsets();
  const topInset = fullBleed
    ? 0
    : edges.includes('top')
      ? Platform.OS === 'android'
        ? Math.max(insets.top, StatusBar.currentHeight || 0)
        : insets.top
      : 0;
  const rightInset = fullBleed ? 0 : edges.includes('right') ? insets.right : 0;
  const leftInset = fullBleed ? 0 : edges.includes('left') ? insets.left : 0;
  const bottomInset = fullBleed ? 0 : edges.includes('bottom') ? insets.bottom : 0;
  const bottomBarHeight = showBottomBar ? getBottomBarHeight(bottomInset) : 0;

  return (
    <View
      style={[
        safeAreaStyles.container,
        {
          backgroundColor,
          paddingRight: rightInset,
          paddingLeft: leftInset,
        },
        style,
      ]}
    >
      {header ? (
        <View
          style={[
            safeAreaStyles.headerWrapper,
            {
              backgroundColor: headerBackgroundColor,
              paddingTop: topInset,
            },
          ]}
        >
          {header}
        </View>
      ) : null}

      <View
        style={[
          safeAreaStyles.innerContainer,
          {
            paddingTop: Boolean(header) ? 0 : topInset,
            paddingBottom: showBottomBar ? bottomBarHeight : bottomInset,
          },
          contentContainerStyle,
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
