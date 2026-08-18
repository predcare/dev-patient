import React, { useEffect, useRef } from 'react';
import { Animated, SafeAreaView, StyleSheet, View } from 'react-native';

export const NotificationSkeleton: React.FC = () => {
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
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.backBtnCircle} />
          <View style={styles.headerTitleSkeleton} />
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        <View style={styles.groupLabelSkeleton} />
        {[1, 2, 3, 4, 5].map(key => (
          <Animated.View key={key} style={[styles.cardSkeleton, { opacity: pulseAnim }]}>
            <View style={styles.iconBoxSkeleton} />
            <View style={styles.bodySkeleton}>
              <View style={styles.titleRowSkeleton}>
                <View style={styles.titleSkeleton} />
                <View style={styles.timeSkeleton} />
              </View>
              <View style={styles.descLine1} />
              <View style={styles.descLine2} />
            </View>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  backBtnCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  headerTitleSkeleton: {
    width: 140,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  groupLabelSkeleton: {
    width: 60,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginBottom: 14,
  },
  cardSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconBoxSkeleton: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    marginRight: 12,
  },
  bodySkeleton: {
    flex: 1,
    gap: 8,
  },
  titleRowSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleSkeleton: {
    width: 130,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  timeSkeleton: {
    width: 50,
    height: 10,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  descLine1: {
    width: '90%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  descLine2: {
    width: '60%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
});

export default NotificationSkeleton;
