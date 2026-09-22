import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconProps } from '../../../typescripts/types/types';

export const MicOnIcon: React.FC<IconProps> = ({ size = 22, color = '#2DD4BF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19 10v2a7 7 0 01-14 0v-2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 19v3M8 22h8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default MicOnIcon;
