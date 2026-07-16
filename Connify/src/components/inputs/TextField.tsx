import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../../theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  error?: string;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  containerStyle,
  inputStyle,
  error,
  placeholderTextColor = '#a0a0a0',
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label in Space Grotesk and All-Caps */}
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, error ? styles.inputError : null, inputStyle]}
          placeholderTextColor={placeholderTextColor}
          {...props}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.stackGap,
    width: '100%',
  },
  label: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 12,
    color: theme.colors.onBackground,
    marginBottom: theme.spacing.base,
    letterSpacing: 0.8,
  },
  inputWrapper: {
    backgroundColor: theme.colors.surfaceContainerLow, // slightly darker soft beige
    borderBottomWidth: theme.spacing.borderWidthLight,
    borderBottomColor: theme.colors.onBackground, // 1px black bottom-border only
  },
  input: {
    height: 52,
    paddingHorizontal: theme.spacing.inlineGap,
    color: theme.colors.onBackground,
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 16,
  },
  inputError: {
    borderBottomColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    fontFamily: theme.fontFamilies.secondary.regular,
    marginTop: 4,
  },
});
