import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../styled/theme.styled';

export interface SectionHeaderProps {
  color?: string;
  title: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = React.memo(
  ({ color = theme.colors.primary, title }) => (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionDot, { backgroundColor: color }]} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  )
);

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionDot: {
    width: 4,
    height: 18,
    borderRadius: 2,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.dark,
  },
});

export default SectionHeader;
