import React from 'react';
import Svg, { Rect, SvgProps } from 'react-native-svg';

export interface PipIconProps extends SvgProps {
  size?: number;
  color?: string;
}

export const PipIcon: React.FC<PipIconProps> = ({ size = 20, color = '#FFFFFF', ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="2"
      ry="2"
      stroke={color}
      strokeWidth="2"
    />
    <Rect
      x="12"
      y="12"
      width="7"
      height="7"
      rx="1"
      fill={color}
    />
  </Svg>
);

export default PipIcon;
