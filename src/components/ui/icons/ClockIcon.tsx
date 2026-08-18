import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { theme } from '../../../styled/theme.styled';
import { IconProps } from '../../../typescripts/types/types';

export const ClockIcon: React.FC<IconProps> = ({
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
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M12 7v5l3 3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default ClockIcon;
