import { StyleSheet } from 'react-native';
import { theme } from './theme.styled';

export const safeAreaStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  innerContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerWrapper: {
    width: '100%',
    zIndex: 10,
  },
  paddedContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
});
