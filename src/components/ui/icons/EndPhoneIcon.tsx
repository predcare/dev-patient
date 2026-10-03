import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconProps } from '../../../typescripts/types/types';

export const EndPhoneIcon: React.FC<IconProps> = ({ size = 22, color = '#EF4444' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M10.68 13.31a16 16 0 003.41 3.41l2.2-2.2a1 1 0 011.05-.24 11.53 11.53 0 003.59.57 1 1 0 011 1V19a1 1 0 01-1 1A17 17 0 013 3a1 1 0 011-1h3.1a1 1 0 011 1 11.53 11.53 0 00.57 3.59 1 1 0 01-.25 1.05l-2.24 2.21z"
      fill={color}
      transform="rotate(135 12 12)"
    />
  </Svg>
);

export default EndPhoneIcon;
