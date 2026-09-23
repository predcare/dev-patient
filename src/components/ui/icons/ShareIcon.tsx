import React from 'react';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { theme } from '../../../styled/theme.styled';
import { IconProps } from '../../../typescripts/types/types';

export const ShareIcon: React.FC<IconProps> = ({
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
      <Circle cx="18" cy="5" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="6" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="18" cy="19" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Line
        x1="8.59"
        y1="13.51"
        x2="15.42"
        y2="17.49"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Line
        x1="15.41"
        y1="6.51"
        x2="8.59"
        y2="10.49"
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default ShareIcon;
