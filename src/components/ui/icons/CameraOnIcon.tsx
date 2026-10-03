import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import type { IconProps } from '../../../typescripts/types/types';

export const CameraOnIcon: React.FC<IconProps> = ({ size = 22, color = '#2DD4BF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23 7l-7 5 7 5V7z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Rect
      x="1"
      y="5"
      width="15"
      height="14"
      rx="2"
      ry="2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default CameraOnIcon;
