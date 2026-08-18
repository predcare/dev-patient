import React, { useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { theme } from '../../styled/theme.styled';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  numInputs?: number;
  disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  value = '',
  onChange,
  numInputs = 6,
  disabled = false,
}) => {
  const inputsRef = useRef<Array<TextInput | null>>([]);
  const digits = Array.from({ length: numInputs }, (_, i) => value[i] || '');

  const handleChangeText = (text: string, index: number) => {
    const cleanText = text.replace(/\D/g, '');
    const newDigits = [...digits];

    if (cleanText.length > 1) {
      const pasted = cleanText.slice(0, numInputs);
      onChange(pasted);
      const nextIndex = Math.min(pasted.length, numInputs - 1);
      inputsRef.current[nextIndex]?.focus();
      return;
    }

    newDigits[index] = cleanText;
    const newOtpStr = newDigits.join('');
    onChange(newOtpStr);

    if (cleanText && index < numInputs - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: numInputs }).map((_, index) => (
        <TextInput
          key={index}
          ref={ref => {
            inputsRef.current[index] = ref;
          }}
          style={[styles.input, digits[index] ? styles.inputFilled : null]}
          keyboardType="number-pad"
          maxLength={1}
          value={digits[index]}
          onChangeText={text => handleChangeText(text, index)}
          onKeyPress={e => handleKeyPress(e, index)}
          editable={!disabled}
          selectTextOnFocus
        />
      ))}
    </View>
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
});
