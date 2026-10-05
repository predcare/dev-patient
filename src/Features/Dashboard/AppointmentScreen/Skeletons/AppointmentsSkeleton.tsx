import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export const AppointmentsSkeleton: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      {[1, 2, 3].map(key => (
        <Animated.View key={key} style={[styles.card, { opacity: pulseAnim }]}>
          <View style={styles.cardTop}>
            <View style={styles.avatarSkeleton} />
            <View style={styles.doctorInfoSkeleton}>
              <View style={styles.nameLineSkeleton} />
              <View style={styles.clinicLineSkeleton} />
              <View style={styles.idLineSkeleton} />
            </View>
            <View style={styles.pillSkeleton} />
          </View>
          <View style={styles.grid}>
            <View style={styles.gridCell}>
              <View style={styles.gridIconSkeleton} />
              <View style={styles.gridTextSkeleton}>
                <View style={styles.gridLabelSkeleton} />
                <View style={styles.gridValueSkeleton} />
              </View>
            </View>
            <View style={styles.gridCell}>
              <View style={styles.gridIconSkeleton} />
              <View style={styles.gridTextSkeleton}>
                <View style={styles.gridLabelSkeleton} />
                <View style={styles.gridValueSkeleton} />
              </View>
            </View>
            <View style={styles.gridCell}>
              <View style={styles.gridIconSkeleton} />
              <View style={styles.gridTextSkeleton}>
                <View style={styles.gridLabelSkeleton} />
                <View style={styles.gridValueSkeleton} />
              </View>
            </View>
            <View style={styles.gridCell}>
              <View style={styles.gridIconSkeleton} />
              <View style={styles.gridTextSkeleton}>
                <View style={styles.gridLabelSkeleton} />
                <View style={styles.gridValueSkeleton} />
              </View>
            </View>
          </View>
          <View style={styles.actionRow}>
            <View style={styles.buttonSkeleton} />
            <View style={styles.buttonSkeleton} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatarSkeleton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
  },
  doctorInfoSkeleton: {
    flex: 1,
    gap: 6,
  },
  nameLineSkeleton: {
    width: '65%',
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  clinicLineSkeleton: {
    width: '50%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  idLineSkeleton: {
    width: '35%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  pillSkeleton: {
    width: 76,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridCell: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gridIconSkeleton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  gridTextSkeleton: {
    flex: 1,
    gap: 4,
  },
  gridLabelSkeleton: {
    width: '60%',
    height: 10,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },
  gridValueSkeleton: {
    width: '80%',
    height: 12,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  buttonSkeleton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
});

export default AppointmentsSkeleton;
