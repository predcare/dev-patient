import React from 'react';
import Svg, { Circle, Line, SvgProps } from 'react-native-svg';

export interface FilterIconProps extends SvgProps {
  size?: number;
  color?: string;
}

export const FilterIcon: React.FC<FilterIconProps> = ({
  size = 18,
  color = '#374151',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 18 18" fill="none" {...props}>
    <Line x1={2} y1={5} x2={16} y2={5} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Line x1={2} y1={9} x2={16} y2={9} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Line x1={2} y1={13} x2={16} y2={13} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Circle cx={6} cy={5} r={2} fill="#FFFFFF" stroke={color} strokeWidth={1.5} />
    <Circle cx={12} cy={9} r={2} fill="#FFFFFF" stroke={color} strokeWidth={1.5} />
    <Circle cx={8} cy={13} r={2} fill="#FFFFFF" stroke={color} strokeWidth={1.5} />
  </Svg>
);

export default FilterIcon;
