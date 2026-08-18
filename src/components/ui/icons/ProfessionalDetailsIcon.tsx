import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { theme } from '../../../styled/theme.styled';
import { IconProps } from '../../../typescripts/types/types';

export const ProfessionalDetailsIcon: React.FC<IconProps> = ({
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
      <Rect x="3" y="7" width="18" height="14" rx="2" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path d="M12 12v4M10 14h4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
};

export default ProfessionalDetailsIcon;
