import React from 'react';
import Svg, { Circle, Path, SvgProps } from 'react-native-svg';

export interface AlertIconProps extends SvgProps {
  size?: number;
  color?: string;
}

export const AlertIcon: React.FC<AlertIconProps> = ({
  size = 24,
  color = '#EF4444',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M12 8v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="12" cy="16" r="1" fill={color} />
  </Svg>
);

export default AlertIcon;
