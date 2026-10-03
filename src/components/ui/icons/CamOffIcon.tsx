import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export interface CamOffIconProps extends SvgProps {
  size?: number;
  color?: string;
}

export const CamOffIcon: React.FC<CamOffIconProps> = ({ size = 20, color = '#FFFFFF', ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l7-4.34v10l-3.5-2.19M2 2l20 20"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default CamOffIcon;
