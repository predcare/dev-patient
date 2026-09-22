import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconProps } from '../../../typescripts/types/types';

export const CameraOffIcon: React.FC<IconProps> = ({ size = 22, color = '#EF4444' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 16v1a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2h2m4 0h4a2 2 0 012 2v4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 8l-6 4 6 4V8z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M3 3l18 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export default CameraOffIcon;
