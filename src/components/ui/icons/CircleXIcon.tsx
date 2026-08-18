import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { IconProps } from '../../../typescripts/types/types';

export const CircleXIcon: React.FC<IconProps> = ({
  size = 18,
  width,
  height,
  color = '#EF4444',
  strokeWidth = 1.8,
  style,
}) => {
  const iconWidth = width ?? size;
  const iconHeight = height ?? size;

  return (
    <Svg width={iconWidth} height={iconHeight} viewBox="0 0 24 24" fill="none" style={style}>
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M15 9l-6 6M9 9l6 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
};

export default CircleXIcon;
