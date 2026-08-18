import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { theme } from '../../../styled/theme.styled';
import { IconProps } from '../../../typescripts/types/types';

export const PhoneIcon: React.FC<IconProps> = ({
  size = 20,
  width,
  height,
  color = theme.colors.textMuted,
  strokeWidth = 2,
  style,
}) => {
  const iconWidth = width ?? size;
  const iconHeight = height ?? size;

  return (
    <Svg width={iconWidth} height={iconHeight} viewBox="0 0 24 24" fill="none" style={style}>
      <Rect
        x="6"
        y="2"
        width="12"
        height="20"
        rx="3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11 18h2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default PhoneIcon;
