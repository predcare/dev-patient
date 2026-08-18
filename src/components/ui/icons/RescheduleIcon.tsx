import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';
import { IconProps } from '../../../typescripts/types/types';

export const RescheduleIcon: React.FC<IconProps> = ({
  size = 18,
  width,
  height,
  color = '#64748B',
  strokeWidth = 1.8,
  style,
}) => {
  const iconWidth = width ?? size;
  const iconHeight = height ?? size;

  return (
    <Svg width={iconWidth} height={iconHeight} viewBox="0 0 24 24" fill="none" style={style}>
      <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
};

export default RescheduleIcon;
