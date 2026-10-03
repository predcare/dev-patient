import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconProps } from '../../../typescripts/types/types';

export const RxIcon: React.FC<IconProps> = ({ size = 22, color = '#94A3B8' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 2v6h6"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M8 12h3M8 16h6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export default RxIcon;
