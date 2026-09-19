import React from 'react';
import Svg, { Path } from 'react-native-svg';

export interface MapPinIconProps {
  size?: number;
  color?: string;
}

export const MapPinIcon: React.FC<MapPinIconProps> = ({ size = 20, color = '#0f766e' }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <Path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
  </Svg>
);

export default MapPinIcon;
