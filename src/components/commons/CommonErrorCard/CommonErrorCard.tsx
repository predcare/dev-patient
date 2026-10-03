import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface CommonErrorCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
}

const ErrorIcon = () => (
  <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke="#DC2626" strokeWidth="2" />

    <Path d="M12 8V12" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />

    <Path d="M12 16H12.01" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

const RefreshIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 11A8.1 8.1 0 0 0 5.5 6.5L4 8"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <Path
      d="M4 4V8H8"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <Path
      d="M4 13A8.1 8.1 0 0 0 18.5 17.5L20 16"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <Path
      d="M20 20V16H16"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function CommonErrorCard({
  title = 'Error Occurred',
  message = 'We encountered an unexpected problem. Please try again.',
  onRetry,
  retryText = 'Try Again',
}: CommonErrorCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <ErrorIcon />
      </View>

      <Text style={styles.titleText}>{title}</Text>

      <Text style={styles.messageText}>{message}</Text>

      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.8}>
          <RefreshIcon />

          <Text style={styles.retryText}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    margin: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  titleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
    textAlign: 'center',
  },

  messageText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 20,
  },

  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#0F766E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
