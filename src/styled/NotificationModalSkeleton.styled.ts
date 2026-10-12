import { StyleSheet } from 'react-native';
import { theme } from './theme.styled';

export const notificationModalSkeletonStyles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.background,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceSecondary,
    marginRight: 12,
  },
  body: {
    flex: 1,
    gap: 8,
  },
  title: {
    width: '55%',
    height: 14,
    borderRadius: 6,
    backgroundColor: theme.colors.surfaceSecondary,
  },
  line: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.surfaceSecondary,
  },
  shortLine: {
    width: '72%',
  },
  time: {
    width: 64,
    height: 10,
    borderRadius: 6,
    backgroundColor: theme.colors.surfaceSecondary,
  },
});

export default notificationModalSkeletonStyles;
