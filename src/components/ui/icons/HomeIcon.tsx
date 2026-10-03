import React from 'react';
import Svg, { Rect } from 'react-native-svg';
import { theme } from '../../../styled/theme.styled';
import { IconProps } from '../../../typescripts/types/types';

export const HomeIcon: React.FC<IconProps> = ({
  size = 22,
  width,
  height,
  color = theme.colors.textMuted,
  style,
}) => {
  const iconWidth = width ?? size;
  const iconHeight = height ?? size;

  return (
    <Svg width={iconWidth} height={iconHeight} viewBox="0 0 24 24" fill="none" style={style}>
      <Rect x="3" y="3" width="7.5" height="7.5" rx="1.5" fill={color} />
      <Rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" fill={color} />
      <Rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" fill={color} />
      <Rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" fill={color} />
    </Svg>
  );
};

export default HomeIcon;
