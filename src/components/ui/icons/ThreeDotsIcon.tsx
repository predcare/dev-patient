import React from 'react';
import Svg, { Circle } from 'react-native-svg';
import { IconProps } from '../../../typescripts/types/types';

export const ThreeDotsIcon: React.FC<IconProps> = ({
  size = 18,
  width,
  height,
  color = '#64748B',
  style,
}) => {
  const iconWidth = width ?? size;
  const iconHeight = height ?? size;

  return (
    <Svg width={iconWidth} height={iconHeight} viewBox="0 0 24 24" fill="none" style={style}>
      <Circle cx="12" cy="5" r="2" fill={color} />
      <Circle cx="12" cy="12" r="2" fill={color} />
      <Circle cx="12" cy="19" r="2" fill={color} />
    </Svg>
  );
};

export default ThreeDotsIcon;
