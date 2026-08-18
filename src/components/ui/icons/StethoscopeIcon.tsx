import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { IconProps } from '../../../typescripts/types/types';

export const StethoscopeIcon: React.FC<IconProps> = ({
  size = 54,
  width,
  height,
  color = '#FFFFFF',
  strokeWidth = 2,
  style,
}) => {
  const iconWidth = width ?? size;
  const iconHeight = height ?? size;

  return (
    <Svg width={iconWidth} height={iconHeight} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M19 14C19 16.7614 16.7614 19 14 19M19 14C20.1046 14 21 13.1046 21 12C21 10.8954 20.1046 10 19 10C17.8954 10 17 10.8954 17 12C17 13.1046 17.8954 14 19 14ZM14 19C12.8954 19 12 19.8954 12 21C12 22.1046 12.8954 23 14 23C15.1046 23 16 22.1046 16 21C16 19.8954 15.1046 19 14 19ZM14 19C14 11 11 8 8 8H5C3.34315 8 2 9.34315 2 11V15C2 16.6569 3.34315 18 5 18H8C11 18 14 19 14 19Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="8" cy="4" r="2" stroke="#06B6D4" strokeWidth={2} fill="#06B6D4" />
    </Svg>
  );
};

export default StethoscopeIcon;
