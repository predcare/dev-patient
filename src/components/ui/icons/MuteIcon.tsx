import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export interface MuteIconProps extends SvgProps {
  size?: number;
  color?: string;
}

export const MuteIcon: React.FC<MuteIconProps> = ({ size = 20, color = '#FFFFFF', ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8M2 2l20 20"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default MuteIcon;
