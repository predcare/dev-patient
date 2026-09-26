import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../../styled/theme.styled';

export const InvoicesSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Search Bar Skeleton */}
      <View style={styles.searchBar} />

      {/* Filter Pills Skeleton */}
      <View style={styles.pillsRow}>
        {[1, 2, 3, 4].map(i => (
          <View key={i} style={styles.pill} />
        ))}
      </View>

      {/* Cards Skeleton */}
      {[1, 2, 3].map(i => (
        <View key={i} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.invoiceId} />
            <View style={styles.statusBadge} />
          </View>
          <View style={styles.doctorLine} />
          <View style={styles.clinicLine} />
          <View style={styles.divider} />
          <View style={styles.buttonsRow}>
            <View style={styles.button} />
            <View style={styles.button} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchBar: {
    height: 48,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  pill: {
    width: 70,
    height: 34,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  invoiceId: {
    width: 120,
    height: 18,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
  statusBadge: {
    width: 60,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  doctorLine: {
    width: '60%',
    height: 16,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    marginBottom: 6,
  },
  clinicLine: {
    width: '40%',
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
});

export default InvoicesSkeleton;
