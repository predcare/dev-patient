import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { theme } from '../../../styled/theme.styled';
import { IconProps } from '../../../typescripts/types/types';

export const PatientsIcon: React.FC<IconProps> = ({
  size = 22,
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
      <Path
        d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M16 3.13A4 4 0 0 1 16 10.87"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default PatientsIcon;
