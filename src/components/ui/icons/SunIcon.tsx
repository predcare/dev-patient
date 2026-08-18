import React from 'react';
import Svg, { Circle, Path, SvgProps } from 'react-native-svg';

export interface SunIconProps extends SvgProps {
  size?: number;
  color?: string;
  solid?: boolean;
}

export const SunIcon: React.FC<SunIconProps> = ({
  size = 14,
  color = '#64748B',
  solid = false,
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={solid ? color : 'none'} {...props}>
    <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth="2" fill={solid ? color : 'none'} />
    <Path
      d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

export default SunIcon;
