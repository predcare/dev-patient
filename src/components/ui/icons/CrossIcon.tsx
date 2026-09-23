// CrossIcon
import React from 'react';
import { Path, Svg } from 'react-native-svg';
import { theme } from '../../../styled/theme.styled';

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const CrossIcon: React.FC<Props> = ({
  size = 16,
  color = theme.colors.textInverted,
  strokeWidth = 2,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M18 18L6 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default CrossIcon;
