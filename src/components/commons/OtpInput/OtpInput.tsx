import React, { ElementRef, useEffect, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import theme from '../../../styled/theme.styled';

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  numInputs?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  value = '',
  onChange,
  numInputs = 6,
  disabled = false,
  autoFocus = true,
}) => {
  const inputRef = useRef<ElementRef<typeof TextInput>>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [cursorIndex, setCursorIndex] = useState<number>(value.length);
  const [showCursor, setShowCursor] = useState(true);

  const handleChangeText = (text: string) => {
    if (disabled) return;

    // Filter to only numeric digits and enforce max length
    const cleanDigits = text.replace(/\D/g, '').slice(0, numInputs);
    onChange(cleanDigits);
  };

  const handleSelectionChange = (e: any) => {
    if (e?.nativeEvent?.selection?.start !== undefined) {
      setCursorIndex(e.nativeEvent.selection.start);
    }
  };

  const handleBoxPress = (index: number) => {
    if (disabled) return;
    inputRef.current?.focus();

    // Position cursor at clicked box or end of input
    const target = Math.min(index, value.length);
    setCursorIndex(target);
  };

  const handleContainerPress = () => {
    if (disabled) return;
    inputRef.current?.focus();
  };

  // Determine which box should show active cursor/border
  const activeFocusIndex = isFocused
    ? Math.min(cursorIndex, numInputs - 1)
    : -1;

  const digits = Array.from({ length: numInputs }, (_, i) => value[i] || '');

  // Handle auto-focus on mount
  useEffect(() => {
    if (autoFocus && !disabled) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [autoFocus, disabled]);

  // Sync cursor index when value changes
  useEffect(() => {
    setCursorIndex(value.length);
  }, [value]);

  // Blinking cursor animation when focused
  useEffect(() => {
    if (!isFocused || disabled) {
      setShowCursor(false);
      return;
    }
    setShowCursor(true);
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, [isFocused, disabled]);
  return (
    <Pressable
      onPress={handleContainerPress}
      style={styles.container}
      accessibilityRole="none"
      accessible={false}
    >
      {/* Hidden real TextInput that catches all keyboard, paste, and SMS auto-fill events */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChangeText}
        onSelectionChange={handleSelectionChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={numInputs}
        editable={!disabled}
        caretHidden={true}
        style={styles.hiddenInput}
        accessibilityLabel="One time password input"
        importantForAutofill="yes"
      />

      {/* Visual OTP Boxes */}
      <View style={styles.boxesRow} pointerEvents="box-none">
        {digits.map((digit, index) => {
          const isCellFilled = Boolean(digit);
          const isCellFocused = isFocused && activeFocusIndex === index;
          const isCursorHere = isCellFocused && !digit && showCursor;

          return (
            <Pressable
              key={index}
              onPress={() => handleBoxPress(index)}
              style={[
                styles.input,
                isCellFilled && styles.inputFilled,
                isCellFocused && styles.inputFocused,
                disabled && styles.inputDisabled,
              ]}
              accessibilityRole="text"
              accessibilityLabel={`OTP digit ${index + 1}`}
            >
              {digit ? (
                <Text style={styles.inputText}>{digit}</Text>
              ) : isCursorHere ? (
                <View style={styles.cursor} />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </Pressable>
  );
};

export default OtpInput;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    marginBottom: 14,
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.01,
    color: 'transparent',
    zIndex: 1,
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    width: 44,
    height: 52,
    borderWidth: 2,
    borderColor: theme.colors.inputBorder,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBg,
  },
  inputFilled: {
    borderColor: theme.colors.brandBlue,
    backgroundColor: theme.colors.brandBlueSoft,
  },
  inputFocused: {
    borderColor: theme.colors.brandBlue,
    backgroundColor: theme.colors.inputBg,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.brandBlue,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputDisabled: {
    backgroundColor: theme.colors.disableBg,
    borderColor: theme.colors.inputBorder,
    opacity: 0.6,
  },
  inputText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
  },
  cursor: {
    width: 2,
    height: 22,
    backgroundColor: theme.colors.brandBlue,
    borderRadius: 1,
  },
});
