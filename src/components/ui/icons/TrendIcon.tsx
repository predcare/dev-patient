import React from 'react';
import Svg, { Polyline } from 'react-native-svg';
import { theme } from '../../../styled/theme.styled';
import { IconProps } from '../../../typescripts/types/types';

export interface TrendIconProps extends IconProps {
  isUp?: boolean;
}

export const TrendIcon: React.FC<TrendIconProps> = ({
  size = 11,
  width,
  height,
  isUp = true,
  color,
  strokeWidth = 2.5,
  style,
}) => {
  const iconWidth = width ?? size;
  const iconHeight = height ?? size;
  const trendColor = color ?? (isUp ? theme.colors.success : theme.colors.danger);

  return (
    <Svg width={iconWidth} height={iconHeight} viewBox="0 0 24 24" fill="none" style={style}>
      {isUp ? (
        <Polyline
          points="23 6 13.5 15.5 8.5 10.5 1 18"
          stroke={trendColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <Polyline
          points="23 18 13.5 8.5 8.5 13.5 1 6"
          stroke={trendColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </Svg>
  );
};

export default TrendIcon;
