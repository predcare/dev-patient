import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { theme } from '../../../styled/theme.styled';
import { IconProps } from '../../../typescripts/types/types';

export const HelpIcon: React.FC<IconProps> = ({
  size = 18,
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
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Circle cx="12" cy="17" r=".5" fill={color} stroke={color} strokeWidth={1} />
    </Svg>
  );
};

export default HelpIcon;
