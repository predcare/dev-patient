import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export interface FlipCameraIconProps extends SvgProps {
  size?: number;
  color?: string;
}

export const FlipCameraIcon: React.FC<FlipCameraIconProps> = ({ size = 20, color = '#FFFFFF', ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M20 4v5h-5M4 20v-5h5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M20 9A9 9 0 0 0 5.64 5.64L4 7m0 10a9 9 0 0 0 14.36 1.36L20 17"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default FlipCameraIcon;
