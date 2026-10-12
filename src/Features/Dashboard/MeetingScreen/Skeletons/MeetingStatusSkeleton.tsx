import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import theme from '../../../../styled/theme.styled';

const Bar = ({
  width,
  height = 12,
  color = theme.colors.surfaceSecondary,
}: {
  width: number | `${number}%`;
  height?: number;
  color?: string;
}) => (
  <View
    style={{
      width,
      height,
      borderRadius: 6,
      backgroundColor: color,
    }}
  />
);

export const MeetingStatusSkeleton: React.FC = () => {
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
    <View>
      <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
        <View style={styles.doctorRow}>
          <View style={styles.doctorText}>
            <Bar width={140} height={14} />
            <Bar width="70%" />
            <Bar width="50%" />
          </View>
          <Bar width={72} height={22} />
        </View>
        <View style={styles.divider} />
        <View style={styles.metaRow}>
          <Bar width={130} height={26} />
          <Bar width={80} />
        </View>
      </Animated.View>

      {[0, 1].map(row => (
        <View key={row} style={styles.gridRow}>
          {[0, 1].map(cell => (
            <Animated.View key={cell} style={[styles.gridCell, { opacity: pulseAnim }]}>
              <Bar width={70} height={10} color={theme.colors.surface} />
              <Bar width="80%" height={14} color={theme.colors.surface} />
            </Animated.View>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    padding: 16,
    marginBottom: 14,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  doctorText: {
    flex: 1,
    gap: 8,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.surfaceBorder,
    marginVertical: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  gridCell: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    gap: 8,
  },
});

export default MeetingStatusSkeleton;
