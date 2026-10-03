import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { IconProps } from '../../../typescripts/types/types';

export const PlayCircleIcon: React.FC<IconProps> = ({
  size = 20,
  width,
  height,
  color = '#FFFFFF',
  strokeWidth = 1.8,
  style,
}) => {
  const iconWidth = width ?? size;
  const iconHeight = height ?? size;

  return (
    <Svg width={iconWidth} height={iconHeight} viewBox="0 0 24 24" fill="none" style={style}>
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M10 8l6 4-6 4V8z" fill={color} stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    </Svg>
  );
};

export default PlayCircleIcon;
