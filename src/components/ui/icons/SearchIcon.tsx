import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { theme } from '../../../styled/theme.styled';
import { IconProps } from '../../../typescripts/types/types';

export const SearchIcon: React.FC<IconProps> = ({
  size = 20,
  color = theme.colors.textMuted,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="11"
      cy="11"
      r="7"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M20 20l-4.35-4.35"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SearchIcon;
