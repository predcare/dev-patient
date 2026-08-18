import React from 'react';
import Svg, { Path, Rect, SvgProps } from 'react-native-svg';

export interface CamOnIconProps extends SvgProps {
  size?: number;
  color?: string;
}

export const CamOnIcon: React.FC<CamOnIconProps> = ({ size = 20, color = '#FFFFFF', ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
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

export default CamOnIcon;
