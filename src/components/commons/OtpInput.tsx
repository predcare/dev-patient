import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import { theme } from '../../styled/theme.styled';

interface OtpInputProps {
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
  const inputsRef = useRef<Array<TextInput | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
  const digits = Array.from({ length: numInputs }, (_, i) => value[i] || '');

  useEffect(() => {
    if (autoFocus && !disabled) {
      const timer = setTimeout(() => {
        const firstEmpty = digits.findIndex(d => !d);
        const focusTarget = firstEmpty !== -1 ? firstEmpty : 0;
        inputsRef.current[focusTarget]?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [autoFocus, disabled]);

  const handleChangeText = (text: string, index: number) => {
    const cleanText = text.replace(/\D/g, '');

    if (cleanText.length > 1) {
      const pasted = cleanText.slice(0, numInputs);
      onChange(pasted);
      const nextIndex = Math.min(pasted.length, numInputs - 1);
      inputsRef.current[nextIndex]?.focus();
      setFocusedIndex(nextIndex);
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleanText;
    const newOtpStr = newDigits.join('');
    onChange(newOtpStr);

    if (cleanText && index < numInputs - 1) {
      inputsRef.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
      }
    }
  };

  const handleContainerPress = () => {
    if (disabled) return;
    const firstEmptyIndex = digits.findIndex(d => !d);
    const targetIndex = firstEmptyIndex !== -1 ? firstEmptyIndex : numInputs - 1;
    inputsRef.current[targetIndex]?.focus();
  };

  return (
    <Pressable onPress={handleContainerPress} style={styles.container}>
      {Array.from({ length: numInputs }).map((_, index) => {
        const isFocused = focusedIndex === index;
        const isFilled = Boolean(digits[index]);

        return (
          <TextInput
            key={index}
            ref={ref => {
              inputsRef.current[index] = ref;
            }}
            style={[
              styles.input,
              isFilled && styles.inputFilled,
              isFocused && styles.inputFocused,
            ]}
            keyboardType="number-pad"
            maxLength={index === 0 ? numInputs : 1}
            value={digits[index]}
            onChangeText={text => handleChangeText(text, index)}
            onKeyPress={e => handleKeyPress(e, index)}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            editable={!disabled}
            selectTextOnFocus
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
          />
        );
      })}
    </Pressable>
  );
};

export default OtpInput;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    width: '100%',
  },
  input: {
    width: 44,
    height: 52,
    borderWidth: 2,
    borderColor: theme.colors.inputBorder,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: theme.colors.inputBg,
    color: '#000000',
  },
  inputFilled: {
    borderColor: theme.colors.brandBlue,
    backgroundColor: theme.colors.brandBlueSoft,
  },
  inputFocused: {
    borderColor: theme.colors.brandBlue,
    borderWidth: 2.5,
    backgroundColor: theme.colors.brandBlueSoft,
  },
});

