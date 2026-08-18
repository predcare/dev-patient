import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { theme } from '../../../styled/theme.styled';
import { IconProps } from '../../../typescripts/types/types';

export const ClinicIcon: React.FC<IconProps> = ({
  size = 16,
  width,
  height,
  color = theme.colors.primary,
  strokeWidth = 1.8,
  style,
}) => {
  const iconWidth = width ?? size;
  const iconHeight = height ?? size;

  return (
    <Svg width={iconWidth} height={iconHeight} viewBox="0 0 24 24" fill="none" style={style}>
      <Rect
        x="2"
        y="7"
        width="20"
        height="14"
        rx="2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default ClinicIcon;
