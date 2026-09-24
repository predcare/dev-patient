import Svg, { Path } from 'react-native-svg';
import theme from '../../../styled/theme.styled';

export const CloseIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke={theme.colors.textMuted}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
