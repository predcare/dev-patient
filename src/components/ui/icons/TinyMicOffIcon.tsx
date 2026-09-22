import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const TinyMicOffIcon: React.FC = () => (
  <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z" stroke="#FFFFFF" strokeWidth="2.5" />
    <Path d="M19 10v2a7 7 0 01-14 0v-2" stroke="#FFFFFF" strokeWidth="2.5" />
    <Path d="M3 3l18 18" stroke="#FFFFFF" strokeWidth="2.5" />
  </Svg>
);

export default TinyMicOffIcon;
