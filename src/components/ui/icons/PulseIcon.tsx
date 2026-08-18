import React from 'react';
import Svg, { Polyline } from 'react-native-svg';
import { theme } from '../../../styled/theme.styled';
import { IconProps } from '../../../typescripts/types/types';

export const PulseIcon: React.FC<IconProps> = ({
  size = 20,
  width,
  height,
  color = theme.colors.primary,
  strokeWidth = 2,
  style,
}) => {
  const iconWidth = width ?? size;
  const iconHeight = height ?? size;

  return (
    <Svg width={iconWidth} height={iconHeight} viewBox="0 0 24 24" fill="none" style={style}>
      <Polyline
        points="22 12 18 12 15 21 9 3 6 12 2 12"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default PulseIcon;
