import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { theme } from '../../styled/theme.styled';

export const AppointmentDetailsSkeleton: React.FC = () => {
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
      <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
        <View style={styles.rowBetween}>
          <View
            style={{
              width: 120,
              height: 16,
              backgroundColor: theme.colors.surfaceSecondary,
              borderRadius: 6,
            }}
          />
          <View
            style={{
              width: 80,
              height: 24,
              backgroundColor: theme.colors.surfaceSecondary,
              borderRadius: 12,
            }}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.rowBetween}>
          <View
            style={{
              width: 140,
              height: 14,
              backgroundColor: theme.colors.surfaceSecondary,
              borderRadius: 4,
            }}
          />
          <View
            style={{
              width: 110,
              height: 14,
              backgroundColor: theme.colors.surfaceSecondary,
              borderRadius: 4,
            }}
          />
        </View>
      </Animated.View>

      {/* 2. Doctor Info Card Skeleton */}
      <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
        <View style={styles.row}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: theme.colors.surfaceSecondary,
            }}
          />
          <View style={{ flex: 1, gap: 8, marginLeft: 14 }}>
            <View
              style={{
                width: '70%',
                height: 18,
                backgroundColor: theme.colors.surfaceSecondary,
                borderRadius: 4,
              }}
            />
            <View
              style={{
                width: '90%',
                height: 14,
                backgroundColor: theme.colors.surfaceSecondary,
                borderRadius: 4,
              }}
            />
            <View
              style={{
                width: '50%',
                height: 12,
                backgroundColor: theme.colors.surfaceSecondary,
                borderRadius: 4,
              }}
            />
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.rowBetween}>
          <View
            style={{
              width: 70,
              height: 26,
              backgroundColor: theme.colors.surfaceSecondary,
              borderRadius: 6,
            }}
          />
          <View
            style={{
              width: 70,
              height: 26,
              backgroundColor: theme.colors.surfaceSecondary,
              borderRadius: 6,
            }}
          />
          <View
            style={{
              width: 70,
              height: 26,
              backgroundColor: theme.colors.surfaceSecondary,
              borderRadius: 6,
            }}
          />
        </View>
      </Animated.View>

      {/* 3. Date & Time Slot Skeleton */}
      <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
        <View
          style={{
            width: 130,
            height: 16,
            backgroundColor: theme.colors.surfaceSecondary,
            borderRadius: 4,
            marginBottom: 12,
          }}
        />
        <View
          style={{
            height: 64,
            backgroundColor: theme.colors.surfaceSecondary,
            borderRadius: 12,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: theme.colors.surface,
            }}
          />
          <View style={{ flex: 1, gap: 6 }}>
            <View
              style={{
                width: '40%',
                height: 12,
                backgroundColor: theme.colors.surface,
                borderRadius: 4,
              }}
            />
            <View
              style={{
                width: '70%',
                height: 14,
                backgroundColor: theme.colors.surface,
                borderRadius: 4,
              }}
            />
          </View>
        </View>
      </Animated.View>

      {/* 4. Clinic / Channel Skeleton */}
      <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
        <View
          style={{
            width: 140,
            height: 16,
            backgroundColor: theme.colors.surfaceSecondary,
            borderRadius: 4,
            marginBottom: 12,
          }}
        />
        <View
          style={{
            height: 72,
            backgroundColor: theme.colors.surfaceSecondary,
            borderRadius: 12,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: theme.colors.surface,
            }}
          />
          <View style={{ flex: 1, gap: 6 }}>
            <View
              style={{
                width: '50%',
                height: 14,
                backgroundColor: theme.colors.surface,
                borderRadius: 4,
              }}
            />
            <View
              style={{
                width: '90%',
                height: 12,
                backgroundColor: theme.colors.surface,
                borderRadius: 4,
              }}
            />
          </View>
        </View>
      </Animated.View>

      {/* 5. Patient Details Skeleton */}
      <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
        <View
          style={{
            width: 120,
            height: 16,
            backgroundColor: theme.colors.surfaceSecondary,
            borderRadius: 4,
            marginBottom: 14,
          }}
        />
        <View style={{ gap: 12 }}>
          <View style={styles.rowBetween}>
            <View
              style={{
                width: 80,
                height: 14,
                backgroundColor: theme.colors.surfaceSecondary,
                borderRadius: 4,
              }}
            />
            <View
              style={{
                width: 120,
                height: 14,
                backgroundColor: theme.colors.surfaceSecondary,
                borderRadius: 4,
              }}
            />
          </View>
          <View style={styles.rowBetween}>
            <View
              style={{
                width: 80,
                height: 14,
                backgroundColor: theme.colors.surfaceSecondary,
                borderRadius: 4,
              }}
            />
            <View
              style={{
                width: 90,
                height: 14,
                backgroundColor: theme.colors.surfaceSecondary,
                borderRadius: 4,
              }}
            />
          </View>
          <View style={styles.rowBetween}>
            <View
              style={{
                width: 80,
                height: 14,
                backgroundColor: theme.colors.surfaceSecondary,
                borderRadius: 4,
              }}
            />
            <View
              style={{
                width: 100,
                height: 14,
                backgroundColor: theme.colors.surfaceSecondary,
                borderRadius: 4,
              }}
            />
          </View>
        </View>
      </Animated.View>

      {/* 6. Payment Skeleton */}
      <Animated.View style={[styles.card, { opacity: pulseAnim }]}>
        <View
          style={{
            width: 130,
            height: 16,
            backgroundColor: theme.colors.surfaceSecondary,
            borderRadius: 4,
            marginBottom: 14,
          }}
        />
        <View style={styles.rowBetween}>
          <View
            style={{
              width: 110,
              height: 14,
              backgroundColor: theme.colors.surfaceSecondary,
              borderRadius: 4,
            }}
          />
          <View
            style={{
              width: 60,
              height: 14,
              backgroundColor: theme.colors.surfaceSecondary,
              borderRadius: 4,
            }}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.rowBetween}>
          <View
            style={{
              width: 130,
              height: 18,
              backgroundColor: theme.colors.surfaceSecondary,
              borderRadius: 4,
            }}
          />
          <View
            style={{
              width: 70,
              height: 20,
              backgroundColor: theme.colors.surfaceSecondary,
              borderRadius: 4,
            }}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 14,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.surfaceSecondary,
    marginVertical: 12,
  },
});

export default AppointmentDetailsSkeleton;
